//Directly augment assembler namespace.

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
    errors: [],
    warnings: []
};

assembler.stateObject.addError = (message, line) => assembler.stateObject.errors.push({body: message, at: line});
assembler.stateObject.addWarning = (message, line) => assembler.stateObject.warnings.push({body: message, at: line});
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

/*Pass 2: Process IF/ELIF/ELSE/ENDIF, MACRO calls, DUP/ENDD, EQU*/
assembler.processExtensions = function() {
    var doc = assembler.stateObject.document;
    var line = 0;
    var tokens = 1;

    while(line < doc.length) {
        if(line > 50) break;

        var hasLabel = false;

        if(doc[line][tokens][0].slice(-1) == ':')
            hasLabel = true;

        var primary = hasLabel ? doc[line][tokens][1] : doc[line][tokens][0];
        
        if(primary == undefined){
            ++line;
            continue;
        }

        if(assembler.stateObject.isMacro(primary)) {
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

        } else if(assembler.stateObject.isCond(primary)) {
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
            console.log(line, end);
            console.log(resolved);
            var temp = doc.slice(0, line);
            temp.push.apply(temp, resolved);
            temp.push.apply(temp, doc.slice(end + 1));
            assembler.stateObject.document = temp;
            doc = assembler.stateObject.document;

        } else if(assembler.stateObject.isDup(primary)) {
            var end = assembler.dup.getEndLine(line);
            var toReplace = assembler.dup.expand(line, assembler.stateObject.symbolTable.decimal);
            
            if(end == false || toReplace == false)  {
                assembler.stateObject.addWarning('ASM_PE_CANTEXPANDDUP', line);
                ++line; continue;
            }

            var temp = doc.slice(0, line);
            temp.push.apply(temp, toReplace);
            temp.push.apply(temp, doc.slice(line + 1));
            assembler.stateObject.document = temp;
            doc = assembler.stateObject.document;

        } else if(assembler.stateObject.isEqu(primary)) {
            assembler.symbol.registerSymbol(line, assembler.stateObject.symbolTable.decimal);
            var temp = doc.slice(line);
            temp.push.apply(temp, doc.slice(line+1));
            assembler.stateObject.document = temp;
            doc = assembler.stateObject.document;
        }
        ++line;
    }
}