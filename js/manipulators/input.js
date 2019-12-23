//require display(*), conversion(*), memory(*), registers(*)

var buttons = {
	inputKeys: document.getElementsByClassName('keypad-button'),
	registers: ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'L', 'PC', 'SP'],
	specialKeys: {
		dcr:  document.getElementById('button-DCR'),
		inr:  document.getElementById('button-INR'),
		go:   document.getElementById('button-GO'),
		exec: document.getElementById('button-EXEC'),
		set:  document.getElementById('button-SET'),
		reg:  document.getElementById('button-REG'),
		res:  document.getElementById('button-RES'),
		step: document.getElementById('button-STEP')
	},
	mode: 'invalid'
}

buttons.reset = function() {
	buttons.setMode('invalid');
}

buttons.setMode = function(str) {
	buttons.mode = str;
	if(str == 'inputData' || str == 'inputAddress')
		displayCells.setArrowMod(true);
	else
		displayCells.setArrowMod(false);
}

buttons.setup = function(e) {
	for(let i = 0; i < buttons.inputKeys.length; ++i){
		buttons.inputKeys[i].addEventListener('click', function(e) {
			if(buttons.mode == 'inputData'){
				console.log('a');
				displayCells.shiftInInputData(buttons.inputKeys[i].textContent.trim());
			} else if(buttons.mode == 'inputAddress'){
				console.log('b');
				displayCells.shiftInInputAddress(buttons.inputKeys[i].textContent.trim());
			} else if(buttons.mode == 'inputAddressExec'){
				console.log('b');
				displayCells.shiftInInputAddress(buttons.inputKeys[i].textContent.trim());
			} else if(buttons.mode == 'seeRegister') {
				console.log('c');
				var tx = buttons.inputKeys[i].textContent.trim();

				if(buttons.registers.indexOf(tx) == -1) {
					buttons.setMode('error');
					displayCells.setData();
					displayCells.setAddress('Err ');
					return;
				}

				displayCells.setAddress(conversion.pad(tx, 4, ' '));
				displayCells.setData(registers.getRegister(tx));
			}

			console.log(buttons.inputKeys[i].textContent.trim());
		});
	}

	buttons.specialKeys.go.addEventListener('click', function(e) {
		buttons.setMode('inputAddressExec');
		displayCells.setAddress('0000');
	})

	buttons.specialKeys.dcr.addEventListener('click', function(e) {
		if(buttons.mode == 'inputAddress') {
			buttons.setMode('inputData');
			displayCells.setDataFromMemoryAtAddr();
			displayCells.changeFocusTo(displayCells.data[0]);
		} else if(buttons.mode == 'inputData') {
			displayCells.decrement();
		} else if(buttons.mode == 'seeRegister') {
			registerCurrent = displayCells.getAddress().trim();
			registerNext = buttons.registers[buttons.registers.indexOf(registerCurrent) > 0 ? buttons.registers.indexOf(registerCurrent) - 1 : 0];
			displayCells.setAddress(conversion.pad(registerNext, 4, ' '));
			displayCells.setData(registers.getRegister(registerNext));
		}else{
			displayCells.setData();
			displayCells.setAddress('Err ');
		}
	});

	buttons.specialKeys.inr.addEventListener('click', function(e) {
		if(buttons.mode == 'inputAddress') {
			buttons. setMode('inputData');
			displayCells.setDataFromMemoryAtAddr();
			displayCells.changeFocusTo(displayCells.data[0]);
		} else if(buttons.mode == 'inputData') {
			displayCells.increment();
		} else if(buttons.mode == 'seeRegister') {
			registerCurrent = displayCells.getAddress().trim();
			registerNext = buttons.registers[buttons.registers.indexOf(registerCurrent) < buttons.registers.length - 1 && buttons.registers.indexOf(registerCurrent) > -1 ? buttons.registers.indexOf(registerCurrent) + 1 : buttons.registers.length - 1];
			displayCells.setAddress(conversion.pad(registerNext, 4, ' '));
			displayCells.setData(registers.getRegister(registerNext));
		} else {
			displayCells.setData();
			displayCells.setAddress('Err ');
		}
	});

	buttons.specialKeys.exec.addEventListener('click', (e) => {
		if(buttons.mode != 'inputAddressExec') {
			displayCells.setData();
			displayCells.setAddress('Err ');
		} else {
			var address = displayCells.getAddress();
			runner.runFrom(address, false);
		}
	})

	buttons.specialKeys.step.addEventListener('click', (e)=> {
		if(buttons.mode != 'inputAddressExec' && buttons.mode != 'stepThrough' && buttons.mode != 'seeRegister') {
			displayCells.setData();
			displayCells.setAddress('Err ');
		} else if(buttons.mode == 'inputAddressExec') {
			runner.at = displayCells.getAddress();
			runner.runSingleLine();
		} else if(buttons.mode == 'stepThrough' || buttons.mode == 'seeRegister') {
			runner.runSingleLine();
		}
	})

	buttons.specialKeys.set.addEventListener('click', function(e) {
		buttons.setMode('inputAddress');
		displayCells.setAddress('0000');
		displayCells.setData();
	});

	buttons.specialKeys.reg.addEventListener('click', function(e) {
		buttons.setMode('seeRegister');
		displayCells.setData();
		displayCells.setAddress('SELR');
	});

	buttons.specialKeys.res.addEventListener('click', function(e) {
		buttons.reset();
		displayCells.reset();
		registers.reset();
	});
}

window.addEventListener('load', buttons.setup);