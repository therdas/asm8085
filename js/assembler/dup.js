/*

** Quirks: All values should be in decimal.
*/

assembler.dup = { }

assembler.dup.getEndLine = (at) => {
    var sp = 1;
    var doc = assembler.stateObject.document;

    var i = parseInt(at) + 1;
    var tokens = 1;
	while(i < doc.length && sp != 0){
		if(doc[i][tokens].includes('dup')||doc[i][tokens].includes('DUP'))
			++sp;
		if(doc[i][tokens].includes('endd') || doc[i][tokens].includes('ENDD'))
			--sp;
		if(sp == 0){
			return i;
		}
		++i;
    }
    
    if(sp != 0) throw new Error;
}

assembler.dup.expand = (from) => {
    from = parseInt(from);
    var to = assembler.dup.getEndLine(from);
    var condition = '';
    var doc = assembler.stateObject.document;
    var tokens = 1;
    var toReturn = [];

    if(doc[from][tokens][0].slice(-1) == ':')
        condition = doc[from][tokens][0].slice(2).join(' ');
    else 
        condition = doc[from][tokens][0].slice(1).join(' ');
    
    times = assembler.parser.parseExpr(condition, symtab);
    if(times == false || assembler.parser.isDec(times) == false)
        throw new Error();
    
    var times = parseInt(times);
    var toCopy = doc.slice(from+1, to);
    for(var i = 0; i < times; ++i)
        toReturn.push.apply(toCopy);

    return toReturn;
}