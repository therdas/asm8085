//Directly augment assembler namespace.

assembler.stateObject = {
    document: [],
    rawDocument: "",
    macroTable: [],
    symbolTable: {
        decimal: [],
        hexadecimal: []
    },
    referenceTable: []
};

assembler.tokenize = function() {
    assembler.stateObject.document = assembler.parser.tokenize(assembler.stateObject.rawDocument);
}

/*
    The assembler has five passes:
        1) Macro Gathering and definition cleanup
        2) Symbol Gathering
        3) Processing of conditional statements, expansion of macros, expansion of DUPs
        4) Gathering of references
        5) Assembling
*/

/*First Pass*/
assembler.gatherReferences = {

}