//Directly augment assembler namespace.

assembler.stateObject = {
    document: [],
    rawDocument: "",
    macroTable: [],
    macroLookupTable: {},
    symbolTable: {
        decimal: [],
        hexadecimal: []
    },
    referenceTable: [],
    errors: [],
    warnings: []
};

assembler.stateObject.addError = (message, line) => assembler.stateObject.errors.push({body: message, at: line});
assembler.stateObject.addWarning = (message, line) => assembler.stateObject.warnings.push({body: message, at: line});


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
    try {
        assembler.macro.populateMacroTables();
        assembler.macro.removeMacrosFromDoc();
    } catch (err) {
        if(err == 'CMMACRO_NOEND') {

        }
    }
}

/*Pass 2: Process IF/ELIF/ELSE/ENDIF, MACRO calls, DUP/ENDD, EQU*/
assembler.processExtensions = function() {
    var doc = assembler.stateObject.rawDocument;
    var line = 0;
    var tokens = 1;

    while(line < doc.length) {
        var hasLabel = false;
        var args = [];

        if(doc[line][tokens][0].slice(-1) == ':')
            hasLabel = true;

        var primary = hasLabel ? doc[line][tokens][1] : doc[line][tokens][0];
        if(primary)
    }
}