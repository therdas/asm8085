assembler.dup = { }

assembler.dup.getEndLine = (at) => {
    var sp = 1;
    var i = parseInt(at);
    var tokens = 1;
	while(i < doc.length && sp != 0){
		if(lines[i].includes('dup')||lines[i].includes('DUP'))
			++sp;
		if(lines[i].includes('endd') || lines[i].includes('ENDD'))
			--sp;
		if(sp == 0){
			end = i;
			break;
		}
		++i;
	}
}