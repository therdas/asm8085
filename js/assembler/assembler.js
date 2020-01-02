//Directly augment assembler namespace.
//To Do! Fix RST's accessors

assembler.stateObject = {
    document: [],
    rawDocument: "",
    macroTable: [],
    macroLookupTable: {},
    symbolTable: {
        decimal: {},
        hexadecimal: {}
    },
    referenceTable: {},
    codePointTable: {},
	listing: {},
    errors: [],
    warnings: []
};

assembler.stateObject.addError = (message, line, info) => assembler.stateObject.errors.push({body: message, at: line, context: info == undefined ? false : info});
assembler.stateObject.addWarning = (message, line, info) => assembler.stateObject.warnings.push({body: message, at: line, context: info == undefined ? false: info});
assembler.stateObject.isMacro = (token) => assembler.stateObject.macroLookupTable.hasOwnProperty(token);
assembler.stateObject.isDup = (token) => (token == 'dup' || token == 'DUP');
assembler.stateObject.isCond = (token) => (token == 'if' || token == 'IF');
assembler.stateObject.isEqu = (token) => (token == 'equ' || token == 'EQU');


assembler.tokenize = function() {
    assembler.stateObject.document = assembler.parser.tokenize(assembler.stateObject.rawDocument);
}

/*
    The assembler has three prepasses:
        1) Remove comments from code and tokenize
    The assembler has four passes:
        1) Macro Gathering and definition cleanup
        3) Processing of conditional statements, expansion of macros, expansion of DUPs, symbol gathering
        4) Gathering of references
        5) Assembling
*/

/*Preprocessing Pass*/
assembler.preprocess = function() {
    assembler.comment.removeCommentsFromRaw();
    assembler.tokenize();
}

/*Pass 1: Get and Delete from raw Macro definitions*/
assembler.getMacrosAndClean = function() {
    if(assembler.macro.populateMacroTables()){
        assembler.macro.removeMacrosFromDoc();
        return true;
    }
    return false;
}

/*Pass 2: Process IF/ELIF/ELSE/ENDIF, MACRO calls, DUP/ENDD, EQU, EQU replacement*/
assembler.processExtensions = function() {
    var doc = assembler.stateObject.document;
    var line = 0;
    var tokens = 1;

    while(line < doc.length) {
        var hasLabel = false;

        if(doc[line][tokens][0].slice(-1) == ':')
            hasLabel = true;

        var primary = hasLabel ? doc[line][tokens][1] : doc[line][tokens][0];
        
        if(primary == undefined){
            ++line;
            continue;
        }

        for(var token = hasLabel ? 2 : 1; token < doc[line][tokens].length; ++token) {
            if(
                doc[line][tokens][token][0] == '{' &&
                doc[line][tokens][token].slice(-1) == '}'
              )
                doc[line][tokens][token] = doc[line][tokens][token].slice(1,-1);
		doc[line][tokens][token] = assembler.symbol.processToken(doc[line][tokens][token]);
        }

        if (assembler.stateObject.isMacro(primary)) {
                var expanded = assembler.macro.expandMacro(
                assembler.stateObject.macroTable[assembler.stateObject.macroLookupTable[primary]],
                hasLabel ? doc[line][tokens].slice(2) : doc[line][tokens].slice(1),
                assembler.stateObject.macroTable[assembler.stateObject.macroLookupTable[primary]].index++
            )

            if(expanded == false){
                assembler.stateObject.addError('ASM_PE_CANTEXPANDMACRO', line);
                ++line; continue;
            }

            if(hasLabel)
                expanded[0][1].unshift(doc[line][tokens][0]);

            var temp = doc.slice(0, line);
            temp.push.apply(temp, expanded);
            temp.push.apply(temp, doc.slice(line+1));
            assembler.stateObject.document = temp;
            doc = assembler.stateObject.document;
        } else if (assembler.stateObject.isCond(primary)) {
            var dtree = assembler.conditional.constructDTree(line);

            if(dtree == false) {
                assembler.stateObject.addError('ASM_PE_CANTRESOLVECOND', line);
                ++line; continue;
            }

            var end = assembler.conditional.getIfEndLine(line);
            if(end == false) {
                assembler.stateObject.addError('ASM_PE_CANTRESOLVECOND', line);
                ++line; continue;
            }

            var resolved = assembler.conditional.processDTree(dtree, assembler.stateObject.symbolTable.decimal);
        if(resolved == false) {
                assembler.stateObject.addWarning('ASM_PE_EMPTYBODY', line);
                ++line; continue;
            }
            var temp = doc.slice(0, line);
            temp.push.apply(temp, resolved);
            temp.push.apply(temp, doc.slice(end + 1));
            assembler.stateObject.document = temp;
            doc = assembler.stateObject.document;
        } else if (assembler.stateObject.isDup(primary)) {
            var end = assembler.dup.getEndLine(line);
            var toReplace = assembler.dup.expand(line, assembler.stateObject.symbolTable.decimal);
            
            if(end == false || toReplace == false)  {
                assembler.stateObject.addWarning('ASM_PE_CANTEXPANDDUP', line);
                ++line; continue;
            }

            var temp = doc.slice(0, line);
            temp.push.apply(temp, toReplace);
            temp.push.apply(temp, doc.slice(end + 1));
            assembler.stateObject.document = temp;
            doc = assembler.stateObject.document;
        } else if (assembler.stateObject.isEqu(primary)) {
            assembler.symbol.registerSymbol(line, assembler.stateObject.symbolTable.decimal);
            var temp = doc.slice(0,line);
            temp.push.apply(temp, doc.slice(line+1));
            assembler.stateObject.document = temp;
            doc = assembler.stateObject.document;
        } else 
            ++line;
    }
}

assembler.gatherReferences = () => {
    var doc = assembler.stateObject.document;
    var tokens = 1;
    for(var line in doc) {
        if(doc[line][tokens][0].slice(-1) != ':')
            continue;

        var label = doc[line][tokens][0].slice(0,-1);
        
        assembler.stateObject.referenceTable[label] = line;
    }
}

assembler.assembleCode = () => {
	var current = '0000';
	var doc = assembler.stateObject.document;
	var tokens = 1;
	for(var line in doc) {
		assembler.stateObject.codePointTable[line] = current;

		var hasLabel = false;

		if(doc[line][tokens][0].slice(-1) == ':')
			hasLabel = true;

		var keyword = doc[line][tokens][hasLabel ? 1 : 0];
		var fmt = assembler.format[keyword];

		if(fmt == undefined) {
			assembler.stateObject.addError('ASM_ASM_INVALIDKEYWORD', line, {key: keyword});
			continue;
		}

		var args = doc[line][tokens].slice(hasLabel ? 2 : 1);
		if(args.length != fmt.length) {
			assembler.stateObject.addError('ASM_ASM_WRONGNOOFARGS', line, {needs: fmt.length, has: args.length});
			continue;
		}
		console.log("original", args);

		var accessors = [];

        //Type upgrading 
        for(var i in args)
            if(fmt[i] == '8-bit' || fmt[i] == '16-bit') {
                var res = assembler.parser.parseVal(args[i], assembler.stateObject.symbolTable.decimal);
                console.log("RESULT", res, "of", args[i]);
                args[i] = res == false ? args[i] : res;
                console.log(args);
            }

        //Padding and width checking
        for(var i in args) {
            if(fmt[i] == '8-bit' && assembler.parser.isHex(args[i])){
                if(args[i].length > 2) {
                    assembler.stateObject.addWarning('ASM_ASM_TOOLONG8', line, {value: args[i]});
                    args[i] = args[i].slice(-2);
                } else {
                    args[i] = assembler.parser.pad(args[i], 2);
                }
            } else if(fmt[i] == '16-bit' && assembler.parser.isHex(args[i])) {
                if(args[i].length > 4) {
                    assembler.stateObject.addWarning('ASM_ASM_TOOLONG16', line, {value: args[i]});
                    args[i] = args[i].slice(-4);
                } else {
                    args[i] = assembler.parser.pad(args[i], 4);
                }
            }
        }

		for(var arg in args) 
			accessors.push(assembler.parser.getAccessor(args[arg]));
		console.log(">>::", accessors);

	}
}
