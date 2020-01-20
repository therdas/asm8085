assembler.parser = {
	exprParser: new exprEval.Parser({
		operators: {
			logical: true,
			comparison: true,
			'in': true,
			assignment: false
		}
	})
}

assembler.parser.exprParser.consts = {};

/*
	functions in this module:
		isHexWithoutSuffix(string)		without H suffix
		isHex(string)					with H suffix
		isDec(string)
		type(string)
		isPreprocessorDirective(string)
		incrementHex(string)
		tokenize(documentString)
		parseExpr(string: expression, dictionary: decSymTab)	<-- Don't use this
		hexFromDec(string)
		decFromHex(string)
		parseVal(string: value, dictionary: decSymTab)  <-- Always use this
		getAccessor(string)
*/

assembler.parser.isHexWithoutSuffix = function (token) {
	return /^[A-Fa-f0-9]+$/.test(token);
}

assembler.parser.isHex = function(token) {
	return assembler.parser.isHexWithoutSuffix(token) || 
		   (assembler.parser.isHexWithoutSuffix(token.slice(0,-1)) && (token.slice(-1) == 'H'));
}

assembler.parser.isDec = function (token) {
	return /^[0-9]+$/.test(token);
}

assembler.parser.type = function(token) {
    token = token + '';

	if(token.slice(-1) == 'H' && token.length > 1)
		token = token.slice(0,-1);

	if(['A', 'B', 'C', 'D', 'E', 'H', 'L', 'SP', 'PC', 'M'].includes(token))
		return('name');
	else if(token.length == 4 && assembler.parser.isHex(token, 16))
		return '16-bit';
	else if(token.length == 2 && assembler.parser.isHex(token, 16))
		return '8-bit';
	else
		return 'label';
}

assembler.parser.isPreprocessorDirective = function(token) {
	if(['ORG', 'EQU', 'DEFMEM', 'DEFMEMWS', 'BRK'].includes(token))
		return true;
	return false;
}

assembler.parser.incrementHex = function (hex){
	if(hex == 'FFFF')
		return '0000';

	return assembler.parser.pad((parseInt(hex, 16) + 1).toString(16), 4).toUpperCase();
}

/*NO SPLIT AT {...} for evaluation purposes.*/
assembler.parser.tokenize = function(string) {
	var lines = string.split('\n');
	var tokens = [];
	for(var i in lines) {
		tokens[i] = [];
		tokens[i][1] = lines[i].trim().split(/[\s,]+(?![^{]*})/);
		tokens[i][1] = tokens[i][1].filter(n => n);
		tokens[i][0] = i;
	}

	tokens = tokens.filter(n => n[1].length == 0 ? false : true);	
	return tokens;
}

assembler.parser.parseExpr = function(string, decimalNamespace) {
	try {
		var result = assembler.parser.exprParser.evaluate(string, decimalNamespace);
		return result;
	} catch (err) {
		return false;
	}
}

assembler.parser.hexFromDec = function(value) {
	return parseInt(value, 10).toString(16).toUpperCase();
}

assembler.parser.decFromHex = function(value) {
	return parseInt(value, 16);
}

/*Returns the hexadecimal value of a string as per following rules:
	If value is like '%h' or '%H', returns is as is without suffix. Otherwise:
		If value can be decimal, convert to hex and return
		If value can be hex, return
		If value can be a expression, parse, then return
		If value is none of the above, return false.
	Always returns either a hex value or false.
*/
assembler.parser.parseVal = function(value, decSymbolTable) {
    if(value == undefined) return false;
	var isHex = false;
	if (value.slice(-1) == 'H' || value.slice(-1) == 'h') {
		isHex = true;
		value = value.slice(0,-1);
	}

	if(!isHex) {
		if(assembler.parser.isDec(value))
			return assembler.parser.hexFromDec(value);
		else if(assembler.parser.isHex(value))
			return value;
		else {
			var res = assembler.parser.parseExpr(value, decSymbolTable).toString(16).toUpperCase();
            return res == 'FALSE' ? false : res;
        }
	} else {
		if(assembler.parser.isHexWithoutSuffix(value))
			return value;
		else
			return false;
	}
}

assembler.parser.getAccessor = function(value) {
	var type = assembler.parser.type(value);
	
	if(value == 'M')
		return 'M'; 										//EG MOV A, M 
	else if(type == 'integer')
		return value;										//EG RST 1 
	else if(type == 'name')
		return value;										//EG MOV A, B
	else if(type == '16-bit' || type == 'label')
		return '16-bit';									//EG LXI F500H
	else if(type == '8-bit')	
		return '8-bit';										//EG MVI A, F5H
	
	return false;
}

//Pad a number with `z`
/* If less than width
//   Create a new array of length of missing number of padding elements
//   Join that with `z`
//		Since array contained `undefined` joining results in only `z`'s
//	 Append n to it
*/
assembler.parser.pad = function (n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
