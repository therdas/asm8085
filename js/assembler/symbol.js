assembler.symbol = {}

assembler.symbol.registerSymbol = (at, symtab)=> {
    var line = assembler.stateObject.document[at];
    var tokens = 1;
    if(line[tokens][0].slice(-1) != ':') {
        assembler.stateObject.addWarning('AMSYM_NOLABEL', at);
        return false;
    }

    var label = line[tokens][0].slice(0,-1);
    var arg = line[tokens].slice(2).join(' ');
    var value = assembler.parser.parseVal(arg, symtab);
    console.log(arg, symtab, value);
    if(value == false) {
        assembler.stateObject.addError('AMSYM_INVALIDVALUE', at);
        return false;
    } else {
        assembler.stateObject.symbolTable.hexadecimal[label] = value;
        assembler.stateObject.symbolTable.decimal[label] = assembler.parser.decFromHex(value);
        return true;
    }
}

/* Parses an token with the help of the symbol table, replacing
** all instances of symbols in arg field with the corresponding values.

    USES SYMTAB FROM STATEOBJ AS IS CALLED MULTIPLE TIMES.
*/
assembler.symbol.processToken = (token) => {
    console.log(token);
    try {
        var val = assembler.parser.exprParser.parse(token).simplify(assembler.stateObject.symbolTable.decimal).evaluate();
        return val;
    } catch(err) {
        return token;
    }
}
