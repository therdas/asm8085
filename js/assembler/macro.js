assembler.macro = {}

assembler.macro.isMacro = function(at) {
	var doc = assembler.stateObject.document;
	var tokens = 1;
	if(doc[at][tokens][0].slice(-1) == ':')
		return doc[at][tokens][1] == 'macro' || doc[at][tokens][1] == 'MACRO';
	else 
		return doc[at][tokens][0] == 'macro' || doc[at][tokens][0] == 'MACRO';
}
assembler.macro.getMacroEndLine = function(at, lines) {
	at = parseInt(at);
	var tokens = 1;

	var doc;

	if(lines == undefined){ 
		doc = assembler.stateObject.document;
	} else {
		doc = lines;
	}

	var i = at + 1;
	var sp = 1;

	while(i < doc.length && sp != 0) {
		if(doc[i][tokens].includes('MACRO') || doc[i][tokens].includes('macro'))
			++sp;
		if(doc[i][tokens].includes('ENDM') || doc[i][tokens].includes('endm'))
			--sp;
		if(sp == 0)
			return i;
		++i;
	}

	if(sp != 0) assembler.stateObject.addError('AMMACRO_NOEND', at);
	return false;
}
//@FALSES AT: AMMACRO_NONAME, 
assembler.macro.getMacroFromLine = function(at) {
	at = parseInt(at);
	var tokens = 1;
	var end = assembler.macro.getMacroEndLine(at);

	if(end == false)
		return false;

	var doc = assembler.stateObject.document;
	var body = [];
	var localsDirectory = [];

	var i = parseInt(at) + 1;
	while(i < end) {
		if(doc[i][tokens][0][0] == '/')	
			localsDirectory.push(doc[i][tokens][0].slice(0,-1));
		if(doc[i][tokens][0] == 'LOCAL'){
			localsDirectory.push.apply(localsDirectory, doc[i][tokens].slice(1));
			++i;
			continue;
		}
		body.push(doc[i]); 		//Append line to body.
        console.log("APPENDED ", doc[i], "TO MACRO");
		++i;
	}

	var definition = doc[at];

	if(definition[tokens][0].slice(-1) != ':'){
		assembler.stateObject.addError('AMMACRO_NONAME', at);
		return false;
	}

	var macroObject = {
		definition: definition,
		name: definition[tokens][0].slice(0, -1),
		args: definition[tokens].slice(2),
		body: body,
		locals: localsDirectory,
		index: 0
	};
    console.log("IT IS", macroObject);

	assembler.stateObject.macroTable.push(macroObject);
	assembler.stateObject.macroLookupTable[definition[tokens][0].slice(0, -1)] = assembler.stateObject.macroTable.length - 1;
	return true;
}

assembler.macro.cleanMacros = function() {
	var tokens = 1;
	var macroTable = assembler.stateObject.macroTable;
	for(var macro in macroTable) {
		var line = 0;
		while(line < macroTable[macro].body.length) {
			if(
				macroTable[macro].body[line][tokens].includes('macro') ||
				macroTable[macro].body[line][tokens].includes('MACRO')
			  ) {
				var end = assembler.macro.getMacroEndLine(line, macroTable[macro].body);

				if(end == false)
					return false;

				var cleaned = macroTable[macro].body.slice(0, line);
				cleaned.push.apply(cleaned, macroTable[macro].body.slice(end + 1));

				macroTable[macro].body = cleaned;
			}
			++line;
		}
	}
	return true;
}

assembler.macro.populateMacroTables = function() {
	var doc = assembler.stateObject.document;
	var tokens = 1;
	var ok = true;

	//Clean Macro Table
	assembler.stateObject.macroTable = [];
	assembler.stateObject.macroLookupTable = {	};

	//Create macros
	for(var line in doc)
		if(doc[line][tokens].includes('MACRO') || doc[line][tokens].includes('macro')){
			var current = assembler.macro.getMacroFromLine(line);
            console.log("GATHERED", current);
			ok = ok ? current: false;
		}

	if(ok){
		assembler.macro.cleanMacros();
		return true;
	}
	else
		return false;
}

assembler.macro.removeSingleMacro = function(at) {
	at = parseInt(at);
	var doc = assembler.stateObject.document;

	var final = doc.slice(0, at);
	var end = assembler.macro.getMacroEndLine(at);

	if(end == false) {
		return false;
	}

	final.push.apply(final, doc.slice(end + 1));

	assembler.stateObject.document = final;
}

assembler.macro.removeMacrosFromDoc = function() {
	var i = 0;
	var tokens = 1;
	while(i < assembler.stateObject.document.length) {
		if(
			assembler.stateObject.document[i][tokens].includes('macro') ||
			assembler.stateObject.document[i][tokens].includes('MACRO')
		  )
			assembler.macro.removeSingleMacro(i);
		else
			++i;
	}
}

assembler.macro.mangleLocal = function(local, index) {
	return local + "_indLocInstNo" + index;
}

assembler.macro.mangleLocals = function(body, locals, index) {
	var modlines = [];
	var tokens = 1;

	for(var i in body) {
		var line = body[i].slice();
		//First check if the line is labelled,
		if(line[tokens][0].slice(-1) == ':') {
			//and if label is the same as any of the locals,
			if(locals.includes(line[tokens][0].slice(0,-1))) {
				//mangle it.
				line[tokens][0] = assembler.macro.mangleLocal(line[tokens][0].slice(0,-1), index) + ":";
			}
		}

		for(var token in line[tokens]) {
			if(locals.includes(line[tokens][token])) {
				line[tokens][token] = assembler.macro.mangleLocal(line[tokens][token], index);
			}
		}
		modlines.push(line);
	}
	return modlines;
}

assembler.macro.expandArgs = function(body, arglist, values) {
	if(arglist.length != values.length){
		assembler.stateObject.addError('AMMACRO_ARGMISMATCH', body[0][0]);
		return false;
	}

	var modlines = [];
	var tokens = 1;
	for(var lines in body) {
		var line = body[lines].slice();
		for(var arg in arglist) {
			var index = line[tokens].indexOf(arglist[arg]);
			while(index != -1){
				
				if(line[tokens][index] == values[arg])
					break;

				line[tokens][index] = values[arg];
				var index = line[tokens].indexOf(arglist[arg]);
			}

			if(line[tokens][0].slice(0,-1) == arglist[arg])
				line[tokens][0] = values[arg] + ':';
		}
		modlines.push(line);
	}

	return modlines;
}

assembler.macro.expandMacro = function(macro, arglist, index) {
	var body = macro.body;
	var afterMangling = assembler.macro.mangleLocals(body, macro.locals, index);
	var afterExpansion = assembler.macro.expandArgs(afterMangling, macro.args, arglist);
	return afterExpansion;
}
