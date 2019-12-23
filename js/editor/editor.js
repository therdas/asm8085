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
		{regex: /(?:ORG|EQU|DEFMEM|DEFMEMWS|MACRO|DUP|ENDM|ENDD|PIF|PENDIF|PELSE|BRK|brk)\b/, token:"variable"},
		{regex: /(?:LXI|STAX|INX|INR|DCR|MVI|RAL|DAD|RIM|SHLD|DAA|SIM|STA|STC|MOV|HLT|ADD|ADC|SUB|SBB|ACI|ADI|ANA|ANI|CALL|CC|CM|CMA|CMC|CMP|CNC|CNZ|CP|CPE|CPI|CPO|CZ|DCX|DI|EI|IN|JC|JM|JMP|JNC|JNZ|JP|JPE|JPO|JZ|LDA|LDAX|LHLD|NOP|ORA|ORI|OUT|PCHL|POP|PUSH|RAR|RC|RET|RLC|RM|RNC|RNZ|RP|RPE|RPO|RRC|RST|RZ|SBI|SPHL|SUI|XCHG|XRA|XRI|XTHL)\b/, token:"keyword"},
		{regex: /\b[0-9A-F]+H\b/, token:"number"},
		{regex: /\b[A-EH-LM]|SP\b/, token: "number"},
		{regex: /\b[0-9A-F]+\b/, token:"number"},
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

function compileCode(onlyPreprocess) {
	clearLogs();

	var retVal = false;
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

	/*Logs for preprocessor*/
	if(afterMacro.hasOwnProperty('logs') && afterMacro.logs.length > 0) {
		for(var i = 0; i < afterMacro.logs.length; ++i){
			if(afterMacro.logs[i].type == 'warning') {
				addWarning(afterMacro.logs[i].body, afterMacro.logs[i].line);
			} else if(afterMacro.logs[i].type == 'fatal error') {
				addError(afterMacro.logs[i].body, afterMacro.logs[i].line);
			} else if(afterMacro.logs[i].type == 'log') {
				addLog(afterMacro.logs[i].body, afterMacro.logs[i].line);
			}
		}
	}

	if(afterMacro.hasOwnProperty('success') && afterMacro.success == false) {
		addWarning('Compilation halted due to preprocessor errors.');
		return;
	}

	if(afterMacro.logs.length > 0) {
		for(var i = 0; i < total.logs.length; ++i) {
			if(total.logs[i].type == 'warning') {
				addWarning(total.logs[i].body, total.logs[i].line);
			} else if(total.logs[i].type == 'fatal error') {
				addError(total.logs[i].body, total.logs[i].line);
			} else if(total.logs[i].type == 'log') {
				addLog(total.logs[i].body, total.logs[i].line);
			}
		}
	}

	if(!onlyPreprocess){
		if(total.logs.length > 0) {
			for(var i = 0; i < total.logs.length; ++i) {
				if(total.logs[i].type == 'warning') {
					addWarning(total.logs[i].body, total.logs[i].line);
				} else if(total.logs[i].type == 'fatal error') {
					addError(total.logs[i].body, total.logs[i].line);
				} else if(total.logs[i].type == 'log') {
					addLog(total.logs[i].body, total.logs[i].line);
				}
			}
		}

		var colors = ["rgba(255,0,0,0.25)","rgba(0,255,0,0.25)","rgba(0,0,255,0.25)","rgba(255,255,0,0.25)","rgba(0,255,255,0.25)","rgba(255,0,255,0.25)"];
		var colorI = 0;
		var totalListing = "<tr><th>Address</th><th>Data</th><th>Instruction</th></tr>";
		for(var i = 0; i < total.debug.listing.length; ++i) {
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
		}
		document.querySelector('#listing-table').innerHTML = totalListing;

		/*References*/
		var totalListing = "<tr><th>Line</th><th>Label</th><th>Assembled Address</th></tr>";
		for(var label in total.debug.references) {
			var str = "<tr><td>"+total.debug.referencesLines[total.debug.references[label]]+"</td>";
			str += "<td>"+label+"</td><td>"+total.debug.references[label]+"</td></tr>";
			totalListing += str;
		}

		document.querySelector('#references-listing').innerHTML = totalListing;

		/*Forward References*/
		var totalListing = "<tr><th>Line(s)</th><th>Label</th><th>Found</th><th>Resolved at</th></tr>";
		for(var label in total.debug.forwardReferencesListing) {
			var str = "<tr><td>"+total.debug.forwardReferencesListing[label].at.join(", ")+"</td>";
			str += "<td>"+label+"</td>";
			str += "<td>"+(total.debug.forwardReferencesListing[label].foundAt === false ? "🗙":"✅")+"</td>";
			str += "<td>"+(total.debug.forwardReferencesListing[label].foundAt === false ? "-":total.debug.forwardReferencesListing[label].foundAt)+"</td></tr>";
			totalListing += str;
		}
		document.querySelector('#forward-references-listing').innerHTML = totalListing;

		/*Symbol Table*/
		var totalListing = "<tr><th>Symbol</th><th>Value</th><th>Replaced in lines</th></tr>";
		for(var symbol in total.debug.symbolTable) {
			var str = "<tr><td>"+symbol+"</td>";
			str += "<td>"+total.debug.symbolTable[symbol]+"</td>";
			str += "<td>"+(total.debug.equReplaces.hasOwnProperty(symbol) ? total.debug.equReplaces[symbol].join(", "): "-");
			str += "</td></tr>";
			totalListing += str;
		}
		document.querySelector('#symbol-table').innerHTML = totalListing;

		/*Breakpoint table*/
		var totalListing = '<tr><th>Breakpoint at address</th><th class="disabled">After Instruction</th></tr>';
		for(var line in total.debug.breakpoints) {
			var str = '<tr><td>' + total.debug.breakpoints[line] + '</td><td class="disabled"></td>';
			totalListing += str;
		}
		document.querySelector('#breakpts-table').innerHTML = totalListing;
	}

	return retVal;
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