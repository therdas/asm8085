var fileAtInput;
var isReadyForInput;
var autoIndent = true;
var undos = 0;
var revertCopy = '';

var finalCode = false;

var saveSettings = {
	dups: document.querySelector('#save-file--unroll-dup'),
	macros: document.querySelector('#save-file--expand-macro')
}

var preprocessorSettings = {
	master: document.querySelector('#preprocessor-view--isEnabled'),
	dup: document.querySelector('#preprocessor-view--isDup'),
	macro: document.querySelector('#preprocessor-view--isMacro'),
	macroMangle: document.querySelector('#preprocessor-view--isMangle'),
	detectLoop: document.querySelector('#preprocessor-view--isDetectLoop'),
	experimental: document.querySelector('#preprocessor-view--isExperimental'),
	controlProcess: document.querySelector('#preprocessor-view--doPreprocess'),
	controlRevert: document.querySelector('#preprocessor-view--doRevert')
};

var target = document.querySelector('#code-editor');

CodeMirror.defineSimpleMode("asm8085", {
	start: [
		{regex: /\b(org|equ|=|def|ddef|defarr|macro|dup|endm|endd|if|endif|else|elif|brk|ORG|EQU|=|DEF|DDEF|DEFARR|MACRO|DUP|ENDM|ENDD|IF|ENDIF|ELSE|ELIF|BRK)\b/, token:"variable"},
		{regex: /\b(LXI|STAX|INX|INR|DCR|MVI|RAL|DAD|RIM|SHLD|DAA|SIM|STA|STC|MOV|HLT|ADD|ADC|SUB|SBB|ACI|ADI|ANA|ANI|CALL|CC|CM|CMA|CMC|CMP|CNC|CNZ|CP|CPE|CPI|CPO|CZ|DCX|DI|EI|IN|JC|JM|JMP|JNC|JNZ|JP|JPE|JPO|JZ|LDA|LDAX|LHLD|NOP|ORA|ORI|OUT|PCHL|POP|PUSH|RAR|RC|RET|RLC|RM|RNC|RNZ|RP|RPE|RPO|RRC|RST|RZ|SBI|SPHL|SUI|XCHG|XRA|XRI|XTHL|lxi|stax|inx|inr|dcr|mvi|ral|dad|rim|shld|daa|sim|sta|stc|mov|hlt|add|adc|sub|sbb|aci|adi|ana|ani|call|cc|cm|cma|cmc|cmp|cnc|cnz|cp|cpe|cpi|cpo|cz|dcx|di|ei|in|jc|jm|jmp|jnc|jnz|jp|jpe|jpo|jz|lda|ldax|lhld|nop|ora|ori|out|pchl|pop|push|rar|rc|ret|rlc|rm|rnc|rnz|rp|rpe|rpo|rrc|rst|rz|sbi|sphl|sui|xchg|xra|xri|xthl)\b/, token:"keyword"},
		{regex: /\b[0-9a-fA-F]+(H|h)?\b/, token:"number"},
		{regex: /\b([A-Ea-eHLhlMm]|SP|sp|PSW|psw)\b/, token: "number"},
		{regex: /\b[0-9A-F]+\b/, token:"number"},
		{regex: /\".*\"/, token: "variable"},
		{regex: /\'.*\'/, token: "variable"},
		{regex: /\b\w+\b/, token:"normal"},
		{regex: /[\s\S]*:/, token:"string", dedent:true},
		{regex: /;[\s\S]*/, token: "comment"}
	],
	meta: {
		lineComment: ";",
	}
});

var editor = CodeMirror.fromTextArea(target, {
	indentUnit: 8,
	lineNumbers: true,
	firstLineNumber: 0,
	mode: "asm8085",
	theme: "material-darker",
	scrollbarStyle: "overlay"
});

editor.on("keydown", function(editorInstance) {
	var cursor = editor.getCursor();

	var currentLineNumber = cursor.line;
	var line = editor.getLine(currentLineNumber);
	var tokens = line.trim().split(/[\s,]+/);

	if(tokens.length <= 0 || !autoIndent)
		return;

	if(tokens[0].slice(-1) == ':'){
		length = tokens[0].slice(0,-1).length;
		editor.indentLine(currentLineNumber, -80);
		editor.indentLine(currentLineNumber, (8-length) < 0 ? 0 : (8-length));
	} else {
		editor.indentLine(currentLineNumber, -80);
		editor.indentLine(currentLineNumber, 10);

	}
});

function correctIndentation() {
	for(var i = 0; i < editor.doc.lineCount(); ++i) {
		var line = editor.getLine(i);
		var tokens = line.trim().split(/[\s,]+/);

		if(tokens.length <= 0)
			return;

		if(tokens[0].slice(-1) == ':'){
			length = tokens[0].slice(0,-1).length;
			editor.indentLine(i, -80);
			editor.indentLine(i, (8-length) < 0 ? 0 : (8-length));
		} else {
			editor.indentLine(i, -80);
			editor.indentLine(i, 10);
		}
	}
}

function showMenu(event) {
	document.querySelector('#more-menu').classList.remove('hidden');
	document.getElementById('modal-shade').classList.remove('hidden');
	document.getElementById('modal-shade').style.opacity = '0';


	var wrapperHM = function (e) {
		hideMenu();
		document.getElementById('modal-shade').classList.add('hidden');
		document.getElementById('modal-shade').style.opacity = '';
		document.querySelector('#modal-shade').removeEventListener('click', wrapperHM);
	}

	document.querySelector('#modal-shade').addEventListener('click', wrapperHM);
}

function hideMenu(event) {
	document.querySelector('#more-menu').classList.add('hidden');
}

function hideModal(name) {
	console.log('hiding'+name);
	document.getElementById(name).classList.add('hidden');

}

function showModal(name) {
	console.log(name);
	document.getElementById(name).classList.remove('hidden');
	document.getElementById('modal-shade').classList.remove('hidden');

	if(name == 'open-file')
		readFile();

	if(name == 'save-file')
		document.querySelector('#save-file--warn').textContent = '';

	var wrapperHM = function(event) {
		hideModal(name);
		document.querySelector('#modal-shade').removeEventListener('click', wrapperHM);
		document.getElementById('modal-shade').classList.add('hidden');

		document.getElementById(name)
				.querySelector('.buttons > button:first-child')
				.removeEventListener('click', wrapperHM);

		document.getElementById(name)
				.querySelector('.header > span')
				.removeEventListener('click', wrapperHM);
	}

	document.querySelector('#modal-shade').addEventListener('click', wrapperHM);

	document.getElementById(name)
			.querySelector('.buttons > button:first-child')
			.addEventListener('click', wrapperHM);

	document.getElementById(name)
			.querySelector('.header > span')
			.addEventListener('click', wrapperHM);
}

function readFile(event) {
	if(event === undefined) {
		if(isReadyForInput) {
			editor.setValue(fileAtInput);
			document.querySelector('#modal-shade').click();
		}
		isReadyForInput = false;
		document.querySelector('#open-file--submit-button').disabled = true;
	} else {
		document.querySelector('#open-file--warn').textContent = '';
		var file = event.target.files[0];
		var ext = file.name.split('.').slice(-1)[0];

		if(!['txt', 'asm', 'test', 'a85'].includes(ext)){
			file = undefined;
			document.querySelector('#open-file--warn').textContent = "Invalid file extension! Choose a file with .txt or .a85 extension."
			document.querySelector('#open-file--submit-button').disabled = true;
			isReadyForInput = false;
			return;
		}

		var reader = new FileReader;
		reader.addEventListener('load', () => {
			fileAtInput = reader.result;
			console.log(fileAtInput, 'enabling...');
			document.querySelector('#open-file--submit-button').disabled = false;
			isReadyForInput = true;
		})

		reader.readAsText(file, 'UTF-8');
	}
}

function initSearch(){
	editor.execCommand('find');
}

function goto(){
	editor.execCommand('jumpToLine');
}

function getSaverSettings() {
	return {
		dups: saveSettings.dups.checked,
		macros: saveSettings.macros.checked
	}
}

function saveFile() {
	document.querySelector('#save-file--warn').textContent = '';

	var name = document.querySelector('#save-file--filename').value;
	var ext = name.split('.').slice(-1)[0];

	if(!['a85', 'asm', 'test'].includes(ext)) {
		document.querySelector('#save-file--warn').textContent = 'File Extension must be .a85.';
		return;
	}
	var copy = editor.doc.getValue();
	var settings = getPreprocessorSettings();
	var fileSaveSettings = getSaverSettings();

	setPreprocessorSettings({
		dups: fileSaveSettings.dups,
		macros: fileSaveSettings.macros,
		mangle: settings.mangle,
		detectLoop: settings.detectLoop,
		experimental: settings.experimental
	});
	compileCode(true);

	var toSave = editor.doc.getValue();
	setPreprocessorSettings(settings);
	editor.doc.setValue(copy);

	var blob = new Blob([toSave], {type: 'text/plain;charset=utf-8'});
	saveAs(blob, name);
	document.querySelector('title').textContent = name + '| a85 8085 macro assembler';
	document.querySelector('#modal-shade').click();
}

function newFile() {
	editor.doc.clearHistory();
	document.querySelector('#modal-shade').click();
	editor.setValue('');
}

function toggleAutoIndent() {
	document.querySelector('#autoindent-enable--button').classList.toggle('soft-disabled');
	autoIndent = !autoIndent;
}

function insertBreakpoint() {
	//https://stackoverflow.com/questions/22609868/how-to-add-new-line-programmatically-in-codemirror

	var doc = editor.getDoc();
	var cursor = doc.getCursor(); // gets the line number in the cursor position
	var line = doc.getLine(cursor.line); // get the line contents
	var pos = { // create a new object to avoid mutation of the original selection
	    line: cursor.line,
	    ch: line.length // set the character position to the end of the line
	}
	doc.replaceRange('\n          BRK', pos); // adds a new line

}

function undo() {
	++undos;
	editor.doc.undo();
	if(undos > 0)
		document.getElementById('redo--button').classList.remove('disabled');
}

function redo() {
	if(undos == 0)
		return;
	--undos;
	editor.doc.redo();
	if(undos <= 0)
		document.getElementById('redo--button').classList.add('disabled');
}

document.querySelector('#more-menu--button').addEventListener('click', showMenu);
document.querySelector('#open-file--button').addEventListener('click', (e) => showModal('open-file'));
document.querySelector('#save-file--button').addEventListener('click', (e) => showModal('save-file'));
document.querySelector('#new-file--button').addEventListener('click', (e) => showModal('new-file'));
document.querySelector('#open-file--submit-button').addEventListener('click', (e) => readFile());
document.querySelector('#save-file--submit-button').addEventListener('click', (e) => saveFile());
document.querySelector('#new-file--submit-button').addEventListener('click', (e) => newFile());

document.querySelector('#autoindent-enable--button').addEventListener('click', (e) => toggleAutoIndent());
document.querySelector('#indent-now--button').addEventListener('click', (e) => correctIndentation());
document.querySelector('#insert-breakpoint--button').addEventListener('click', (e) => insertBreakpoint());
document.querySelector('#assemble--button').addEventListener('click', (e) => compileCode(false));
document.querySelector('#emulate--button').addEventListener('click', (e) => window.open(goToRunner(encodeDocument()), 'Emulator', 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=1200,height=600,left=100,top=100'))
document.querySelector('#undo--button').addEventListener('click', (e) => undo());
document.querySelector('#redo--button').addEventListener('click', (e) => redo());
document.querySelector('#search--button').addEventListener('click', (e) => initSearch());
document.querySelector('#goto--button').addEventListener('click', (e) => goto());
document.querySelector('#file-uploader').addEventListener('change', readFile);

document.querySelector('#about--button').addEventListener('click', (e)=> {showModal('about'); hideMenu()});
document.querySelector('#bug-report--button').addEventListener('click', (e)=> {showModal('bug-report'); hideMenu()});
/*Panel funcs*/
function tabberShowPanel(panelName) {
	var panels = document.getElementsByClassName('tabber-view');
	for(var i = 0; i < panels.length; ++i)
		panels[i].classList.add('hidden');

	var tabs = document.getElementsByClassName('tabber-tabs--tab');
	for(var i = 0; i < tabs.length; ++i)
		tabs[i].classList.remove('active');

	console.log('tabber-view--'+panelName);
	document.getElementById('tabber-view--'+panelName).classList.remove('hidden');
	document.getElementById('tabber-tabs--'+panelName).classList.add('active');
}

function addError(err, line, hint){
	var lineNoShown = true, hintShown = true;
	if(line === undefined){
		lineNoShown = false;
	}
	if(hint === undefined) {
		hintShown = false;
	}

	var error = document.createElement('span');
	error.classList.add('tabber-view--log-err');
	var img = document.createElement('img');
	img.setAttribute('src', 'img/compiler/small-icons/err.png');
	img.classList.add("tabber-view--log-img", "disable-selection");
	error.appendChild(img);
	var body = document.createElement('span');
	body.classList.add('body');
	if(lineNoShown) {
		var lineNo = document.createElement('i');
		lineNo.textContent = line;
		lineNo.classList.add('tabber-view--log-linelink');
		lineNo.setAttribute('onclick', 'editor.setCursor('+line+',10); editor.focus();');
		body.appendChild(lineNo);
	}
	body.appendChild(document.createTextNode(err));
	if(hintShown) {
		var brk = document.createElement('br');
		body.appendChild(brk);
		body.appendChild(document.createTextNode(hint));
	}
	error.appendChild(body);
	document.querySelector('#tabber-view--logs').appendChild(error);
}

function addWarning(err, line, hint){
	var lineNoShown = true, hintShown = true;
	if(line === undefined){
		lineNoShown = false;
	}
	if(hint === undefined) {
		hintShown = false;
	}

	var error = document.createElement('span');
	error.classList.add('tabber-view--log-warn');
	var img = document.createElement('img');
	img.setAttribute('src', 'img/compiler/small-icons/warn.png');
	img.classList.add("tabber-view--log-img", "disable-selection");
	error.appendChild(img);
	var body = document.createElement('span');
	body.classList.add('body');
	if(lineNoShown) {
		var lineNo = document.createElement('i');
		lineNo.textContent = line;
		lineNo.classList.add('tabber-view--log-linelink');
		lineNo.setAttribute('onclick', 'editor.setCursor('+line+',11); editor.focus();');
		body.appendChild(lineNo);
	}
	body.appendChild(document.createTextNode(err));
	if(hintShown) {
		var brk = document.createElement('br');
		body.appendChild(brk);
		body.appendChild(document.createTextNode(hint));
	}
	error.appendChild(body);
	document.querySelector('#tabber-view--logs').appendChild(error);
}

function addLog(err, line){
	var lineNoShown = true, hintShown = true;
	if(line === undefined){
		lineNoShown = false;
	}

	var error = document.createElement('span');
	error.classList.add('tabber-view--log');

	if(lineNoShown) {
		var lineNo = document.createElement('i');
		lineNo.textContent = line;
		lineNo.classList.add('tabber-view--log-linelink');
		lineNo.setAttribute('onclick', 'editor.setCursor('+line+',11); editor.focus();');
		error.appendChild(lineNo);
	}

	error.appendChild(document.createTextNode(err));
	document.querySelector('#tabber-view--logs').appendChild(error);
}

function clearLogs() {
	document.querySelector('#tabber-view--logs').innerHTML = '';
}

/*Preprocessor Settings*/ 
document.getElementById('preprocessor-view--isEnabled').addEventListener('click', function (e) {
	if(preprocessorSettings.master.checked == false) {
		for(var i in preprocessorSettings) {
			if(!['master', 'experimental', 'controlRevert'].includes(i)) {
				preprocessorSettings[i].disabled = true;
			}
		}
	} else {
		for(var i in preprocessorSettings) {
			if(!['master', 'experimental', 'controlRevert', 'detectLoop'].includes(i)) {
				preprocessorSettings[i].disabled = false;
			}
		}
	}
});

document.getElementById('preprocessor-view--isMacro').addEventListener('click', function (e) {
	if(preprocessorSettings.macro.checked == false) {
		preprocessorSettings.macroMangle.disabled = true;
		preprocessorSettings.detectLoop.disabled = true;
	} else {
		preprocessorSettings.macroMangle.disabled = false;
		preprocessorSettings.detectLoop.disabled = false;
	}
})

function getPreprocessorSettings() {
	return {
		dups: preprocessorSettings.dup.checked,
		macros: preprocessorSettings.macro.checked,
		mangle: preprocessorSettings.macroMangle.checked,
		detectLoop: preprocessorSettings.detectLoop.checked,
		experimental: preprocessorSettings.experimental.checked
	}
}

function setPreprocessorSettings (preprocessorSettingsObject) {
	preprocessorSettings.dup.checked = preprocessorSettingsObject.dups;
	preprocessorSettings.macro.checked = preprocessorSettingsObject.macros;
	preprocessorSettings.macroMangle.checked = preprocessorSettingsObject.mangle;
	preprocessorSettings.detectLoop.checked = preprocessorSettingsObject.detectLoop;
	preprocessorSettings.experimental.checked = preprocessorSettingsObject.experimental;
}

function revert() {
	editor.doc.setValue(revertCopy);
	document.querySelector('#preprocessor-view--doRevert').disabled = true;
}

function compileCode() {
	clearLogs();
	var onlyPreprocess = false;
	/*var retVal = false;
	var errorFlag = false;
 	var preprocessorLogs = [];

	if(onlyPreprocess == undefined)
		onlyPreprocess = false;

	var preSettings = getPreprocessorSettings();
	var text = editor.doc.getValue();
	var afterComments = preprocessor.removeComments(text);
	try {	
		var afterDup = preSettings.dups ? preprocessor.unrollDups(text): text;
	} catch(err) {
		errorFlag = true;
		var afterDup = text;
		preprocessorLogs.push({
			line: err.at, type: 'fatal error',
			body: 'Cannot find matching ENDD. All DUP statements must be followed by a ENDD'
		})
	}

	if(errorFlag == false){
		try {
			var afterMacro = preSettings.macros ? preprocessor.expandMacros(afterDup, {
																						mangleLocals: preSettings.mangle, 
																						detectLoops: preSettings.detectLoop,
																						maxMacroRecur: 10
																					  }): {lines: afterDup, success: true, logs:[]};
		} catch(err) {
			afterMacro = {lines: text};
			errorFlag = true;
			preprocessorLogs.push({
				line: err.at, type: 'fatal error',
				body: 'Cannot find matching ENDM. All MACRO definitions must be terminted by a ENDM'
			})
		}
	} else {
		afterMacro = {lines: text};
	}
	afterMacro.logs = preprocessorLogs;
	afterMacro.success = !errorFlag;

	var total = {success: false, error: true, warning: true};

	if(preSettings.macros && preSettings.dups) {
		addLog((afterMacro.success?'Preprocessed with ': 'Failed preprocessing with ') + (!afterMacro.success?'':'no ')
		+ 'errors and ' + (!afterMacro.warning?'':'no ') + 'warnings.');
	}


	if(!onlyPreprocess && afterMacro.success == true) {
		total = assembler.assemble(afterMacro.lines);
		addLog((total.success?'Assembled with ': 'Failed assembly with ') + (total.error?'':'no ')
		+ 'errors and ' + (total.warning?'':'no ') + 'warnings.');

		if(total.success == true) {
			finalCode = {
				list: total.listing,
				breakpoints: total.debug.breakpoints
			} 
			document.querySelector('#listing--button').classList.remove('disabled');
			document.querySelector('#emulate--button').classList.remove('disabled');
		};

		retVal = total;
	} else if(onlyPreprocess == true) {
		revertCopy =  editor.doc.getValue();
		editor.doc.setValue(preSettings.macros? afterMacro.lines: (preSettings.dups? afterDup: text));
		document.querySelector('#preprocessor-view--doRevert').disabled = false;
	}


*/
	var text = editor.getValue();
	var stateObject = assembler.compile(text);

	if(stateObject.errors.length == 0 && stateObject.warnings.length == 0)
		addLog('Finished assembly without any errors or warnings.');
	else if(stateObject.errors.length == 0 && stateObject.warnings.length != 0)
		addLog('Finished assembly, but with ' + stateObject.warnings.length + ' warning(s).');
	else if(stateObject.errors.length != 0)
		addLog('Could not assemble due to ' + stateObject.errors.length + ' error(s) and ' + stateObject.warnings.length + ' warning(s).');

	for(var i in stateObject.errors) {
		addError(mesg[stateObject.errors[i].body](stateObject.errors[i].at, stateObject.errors[i].context), stateObject.errors[i].at);
	}

	for(var i in stateObject.warnings) {
		addWarning(mesg[stateObject.warnings[i].body](stateObject.warnings[i].at, stateObject.warnings[i].warnings), stateObject.warnings[i].at);
	}


	if(stateObject.errors.length == 0) {
		finalCode = {
			list: stateObject.listing,
			breakpoints: stateObject.breakPointTable
		};
	}

	var cwlisting = stateObject.cwlisting;

	var colors = ["#0DA1FE","#0BCBE6","#00FCD7","#0BE687","#0DFE51","#FC990D"];
	var colorI = 0;
	var totalListing = "<tr><th>Address</th><th>Data</th><th>Instruction</th></tr>";
	for(var i in cwlisting) {
		var str = "<tr><td rowspan=" + Object.keys(cwlisting[i].codes).length +
		" style=\"border-right-color: " + colors[colorI] +
		"; border-right-width: 2px; border-right-style: solid;\">" + cwlisting[i].line + "</td>";
		var first = true;
		for(var j in cwlisting[i].codes) {
			if(first) {
				first = !first; 
			} else {
				str += '<tr>';
			}
			str += '<td>' + j + '</td><td>' + cwlisting[i].codes[j] + '</td></tr>';
		}
		totalListing += str;
		colorI = (colorI + 1) % colors.length;
	}
	document.querySelector('#listing-table').innerHTML = totalListing;

	/*for(var i = 0; i < total.debug.listing.length; ++i) {
		if(total.debug.listing[i] == undefined)
			continue;
		var str = "<tr><td>"+total.debug.listing[i].code[0].location+"</td>" +
				  "<td>"+total.debug.listing[i].code[0].code+"</td>" +
				  "<td style=\"border-left-color: "+colors[colorI]+"\" rowspan="+ total.debug.listing[i].code.length +">"+total.debug.listing[i].instr+"</td></tr>";
	    colorI = (colorI + 1) % colors.length;
	    for(var j = 1; j < total.debug.listing[i].code.length; ++j) {
	    	var innerstr = "<tr><td>"+total.debug.listing[i].code[j].location + "</td>" +
	    				   "<td>" + total.debug.listing[i].code[j].code + "</td></tr>"
	    	str += innerstr;
	    }
	    totalListing += str;
	}*/

	/*References*/
	var totalListing = "<tr><th>Line</th><th>Label</th><th>Assembled Address</th></tr>";
	for(var label in stateObject.referenceTable) {
		var str = "<tr><td>"+stateObject.referenceTable[label]+"</td>";
		str += "<td>"+label+"</td><td>"+stateObject.codePointTable[stateObject.referenceTable[label]]+"</td></tr>";
		totalListing += str;
	}

	document.querySelector('#references-listing').innerHTML = totalListing;

	/*Symbol Table*/
	var totalListing = "<tr><th>Symbol</th><th>Value</th></tr>";
	for(var symbol in stateObject.symbolTable.hexadecimal) {
		var str = "<tr><td>"+symbol+"</td>";
		str += "<td>"+stateObject.symbolTable.hexadecimal[symbol]+"</td></tr>";
		totalListing += str;
	}
	document.querySelector('#symbol-table').innerHTML = totalListing;

	/*Breakpoint table*/
	var totalListing = '<tr><th>Breakpoint at address</th><th class="disabled">After Instruction</th></tr>';
	for(var hex in stateObject.breakPointTable) {
		var str = '<tr><td>' + stateObject.breakPointTable[hex] + '</td><td class="disabled"></td>';
		totalListing += str;
	}
	document.querySelector('#breakpts-table').innerHTML = totalListing;

	stateObject.errors.length == 0 ? document.querySelector('#listing--button').classList.remove('disabled') : false;
	stateObject.errors.length == 0 ? document.querySelector('#emulate--button').classList.remove('disabled') : false;

	return stateObject.errors.length == 0;
}

document.querySelector('#preprocessor-view--doPreprocess').addEventListener('click', (e) => compileCode(true));
document.querySelector('#preprocessor-view--doRevert').addEventListener('click', (e) => revert());

function showSidebar() {
	document.querySelector('body').classList.add('minned');
	document.querySelector('#sidebar').classList.remove('hidden');
}

function hideSidebar() {
	document.querySelector('body').classList.remove('minned');
	document.querySelector('#sidebar').classList.add('hidden');
}

function toggleSidebar() {
	document.querySelector('body').classList.toggle('minned');
	document.querySelector('#sidebar').classList.toggle('hidden');
}

document.querySelector('#listing--button').addEventListener('click', (e)=> toggleSidebar());
document.querySelector('#sidebar--close-button').addEventListener('click', (e)=> hideSidebar());

function changeTabDebug(name) {
	var tabs = document.getElementsByClassName('debug-tab--tabs');

	for(var i = 0; i < tabs.length; ++i) {
		tabs[i].classList.remove('active');
	}

	var views = document.getElementsByClassName('debug-tab--views');

	for(var i = 0; i < views.length; ++i) {
		views[i].classList.add('hidden');
	}

	document.getElementById('debug-tab--' + name + '-tab').classList.add('active');
	document.getElementById('debug-tab--' + name).classList.remove('hidden');
}

document.querySelector('#debug-tab--references-tab').addEventListener('click', (e) => changeTabDebug('references'));
document.querySelector('#debug-tab--symtab-tab').addEventListener('click', (e) => changeTabDebug('symtab'));
document.querySelector('#debug-tab--breakpts-tab').addEventListener('click', (e) => changeTabDebug('breakpts'));
document.querySelector('#debug-tab--condasm-tab').addEventListener('click', (e) => {;});

function encodeDocument() {
	return encodeURIComponent(JSON.stringify(finalCode));
}

function goToRunner(code) {
	var urlBase = window.location.origin;
	var goto = urlBase + '/?code='+ code;
	return goto;
}

document.addEventListener('load', (e) => {
	var viewheight = $(window).height();
    var viewwidth = $(window).width();
    var viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0");
});