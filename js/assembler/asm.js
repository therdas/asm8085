/*
*/

var assembler = {
    codeOf: {"LXI":{"length":3,"H":{"16-bit":{"code":"21"}},"SP":{"16-bit":{"code":"31"}},"B":{"16-bit":{"code":"01"}},"D":{"16-bit":{"code":"11"}}},"STAX":{"length":2,"D":{"code":"12"},"B":{"code":"02"}},"INX":{"length":2,"D":{"code":"13"},"H":{"code":"23"},"SP":{"code":"33"},"B":{"code":"03"}},"INR":{"length":2,"D":{"code":"14"},"H":{"code":"24"},"M":{"code":"34"},"A":{"code":"3C"},"B":{"code":"04"},"C":{"code":"0C"},"E":{"code":"1C"},"L":{"code":"2C"}},"DCR":{"length":2,"D":{"code":"15"},"H":{"code":"25"},"M":{"code":"35"},"A":{"code":"3D"},"B":{"code":"05"},"C":{"code":"0D"},"E":{"code":"1D"},"L":{"code":"2D"}},"MVI":{"length":3,"D":{"8-bit":{"code":"16"}},"H":{"8-bit":{"code":"26"}},"M":{"8-bit":{"code":"36"}},"A":{"8-bit":{"code":"3E"}},"B":{"8-bit":{"code":"06"}},"C":{"8-bit":{"code":"0E"}},"E":{"8-bit":{"code":"1E"}},"L":{"8-bit":{"code":"2E"}}},"RAL":{"length":1,"code":"17"},"DAD":{"length":2,"D":{"code":"19"},"H":{"code":"29"},"SP":{"code":"39"},"B":{"code":"09"}},"RIM":{"length":1,"code":"20"},"SHLD":{"length":2,"16-bit":{"code":"22"}},"DAA":{"length":1,"code":"27"},"SIM":{"length":1,"code":"30"},"STA":{"length":2,"16-bit":{"code":"32"}},"STC":{"length":1,"code":"37"},"MOV":{"length":3,"B":{"A":{"code":"47"},"B":{"code":"40"},"C":{"code":"41"},"D":{"code":"42"},"E":{"code":"43"},"H":{"code":"44"},"L":{"code":"45"},"M":{"code":"46"}},"C":{"M":{"code":"4E"},"B":{"code":"48"},"C":{"code":"49"},"A":{"code":"4F"},"D":{"code":"4A"},"E":{"code":"4B"},"H":{"code":"4C"},"L":{"code":"4D"}},"D":{"A":{"code":"57"},"B":{"code":"50"},"C":{"code":"51"},"D":{"code":"52"},"E":{"code":"53"},"H":{"code":"54"},"L":{"code":"55"},"M":{"code":"56"}},"E":{"M":{"code":"5E"},"B":{"code":"58"},"C":{"code":"59"},"A":{"code":"5F"},"D":{"code":"5A"},"E":{"code":"5B"},"H":{"code":"5C"},"L":{"code":"5D"}},"H":{"A":{"code":"67"},"B":{"code":"60"},"C":{"code":"61"},"D":{"code":"62"},"E":{"code":"63"},"H":{"code":"64"},"L":{"code":"65"},"M":{"code":"66"}},"L":{"M":{"code":"6E"},"B":{"code":"68"},"C":{"code":"69"},"A":{"code":"6F"},"D":{"code":"6A"},"E":{"code":"6B"},"H":{"code":"6C"},"L":{"code":"6D"}},"M":{"A":{"code":"77"},"B":{"code":"70"},"C":{"code":"71"},"D":{"code":"72"},"E":{"code":"73"},"H":{"code":"74"},"L":{"code":"75"}},"A":{"M":{"code":"7E"},"B":{"code":"78"},"C":{"code":"79"},"A":{"code":"7F"},"D":{"code":"7A"},"E":{"code":"7B"},"H":{"code":"7C"},"L":{"code":"7D"}}},"HLT":{"length":1,"code":"76"},"ADD":{"length":2,"B":{"code":"80"},"C":{"code":"81"},"D":{"code":"82"},"E":{"code":"83"},"H":{"code":"84"},"L":{"code":"85"},"M":{"code":"86"},"A":{"code":"87"}},"ADC":{"length":2,"B":{"code":"88"},"C":{"code":"89"},"A":{"code":"8F"},"D":{"code":"8A"},"E":{"code":"8B"},"H":{"code":"8C"},"L":{"code":"8D"},"M":{"code":"8E"}},"SUB":{"length":2,"B":{"code":"90"},"C":{"code":"91"},"D":{"code":"92"},"E":{"code":"93"},"H":{"code":"94"},"L":{"code":"95"},"M":{"code":"96"},"A":{"code":"97"}},"SBB":{"length":2,"B":{"code":"98"},"C":{"code":"99"},"A":{"code":"9F"},"D":{"code":"9A"},"E":{"code":"9B"},"H":{"code":"9C"},"L":{"code":"9D"},"M":{"code":"9E"}},"ACI":{"length":2,"8-bit":{"code":"CE"}},"ADI":{"length":2,"8-bit":{"code":"C6"}},"ANA":{"length":2,"A":{"code":"A7"},"B":{"code":"A0"},"C":{"code":"A1"},"D":{"code":"A2"},"E":{"code":"A3"},"H":{"code":"A4"},"L":{"code":"A5"},"M":{"code":"A6"}},"ANI":{"length":2,"8-bit":{"code":"E6"}},"CALL":{"length":2,"16-bit":{"code":"CD"}},"CC":{"length":2,"16-bit":{"code":"DC"}},"CM":{"length":2,"16-bit":{"code":"FC"}},"CMA":{"length":1,"code":"2F"},"CMC":{"length":1,"code":"3F"},"CMP":{"length":2,"A":{"code":"BF"},"B":{"code":"B8"},"C":{"code":"B9"},"D":{"code":"BA"},"E":{"code":"BB"},"H":{"code":"BC"}, "L":{"code":"BD"},"M":{"code":"BE"}},"CNC":{"length":2,"16-bit":{"code":"D4"}},"CNZ":{"length":2,"16-bit":{"code":"C4"}},"CP":{"length":2,"16-bit":{"code":"F4"}},"CPE":{"length":2,"16-bit":{"code":"EC"}},"CPI":{"length":2,"8-bit":{"code":"FE"}},"CPO":{"length":2,"16-bit":{"code":"E4"}},"CZ":{"length":2,"16-bit":{"code":"CC"}},"DCX":{"length":2,"B":{"code":"0B"},"D":{"code":"1B"},"H":{"code":"2B"},"SP":{"code":"3B"}},"DI":{"length":1,"code":"F3"},"EI":{"length":1,"code":"FB"},"IN":{"length":2,"8-bit":{"code":"DB"}},"JC":{"length":2,"16-bit":{"code":"DA"}},"JM":{"length":2,"16-bit":{"code":"FA"}},"JMP":{"length":2,"16-bit":{"code":"C3"}},"JNC":{"length":2,"16-bit":{"code":"D2"}},"JNZ":{"length":2,"16-bit":{"code":"C2"}},"JP":{"length":2,"16-bit":{"code":"F2"}},"JPE":{"length":2,"16-bit":{"code":"EA"}},"JPO":{"length":2,"16-bit":{"code":"E2"}},"JZ":{"length":2,"16-bit":{"code":"CA"}},"LDA":{"length":2,"16-bit":{"code":"3A"}},"LDAX":{"length":2,"B":{"code":"0A"},"D":{"code":"1A"}},"LHLD":{"length":2,"16-bit":{"code":"2A"}},"NOP":{"length":1,"code":"00"},"ORA":{"length":2,"A":{"code":"B7"},"B":{"code":"B0"},"C":{"code":"B1"},"D":{"code":"B2"},"E":{"code":"B3"},"H":{"code":"B4"},"L":{"code":"B5"},"M":{"code":"B6"}},"ORI":{"length":2,"8-bit":{"code":"F6"}},"OUT":{"length":2,"8-bit":{"code":"D3"}},"PCHL":{"length":1,"code":"E9"},"POP":{"length":2,"B":{"code":"C1"},"D":{"code":"D1"},"H":{"code":"E1"},"PSW":{"code":"F1"}},"PUSH":{"length":2,"B":{"code":"C5"},"D":{"code":"D5"},"H":{"code":"E5"},"PSW":{"code":"F5"}},"RAR":{"length":1,"code":"1F"},"RC":{"length":1,"code":"D8"},"RET":{"length":1,"code":"C9"},"RLC":{"length":1,"code":"07"},"RM":{"length":1,"code":"F8"},"RNC":{"length":1,"code":"D0"},"RNZ":{"length":1,"code":"C0"},"RP":{"length":1,"code":"F0"},"RPE":{"length":1,"code":"E8"},"RPO":{"length":1,"code":"E0"},"RRC":{"length":1,"code":"0F"},"RST":{"0":{"code":"C7"},"1":{"code":"CF"},"2":{"code":"D7"},"3":{"code":"DF"},"4":{"code":"E7"},"5":{"code":"EF"},"6":{"code":"F7"},"7":{"code":"FF"},"length":2},"RZ":{"length":1,"code":"C8"},"SBI":{"length":2,"8-bit":{"code":"DE"}},"SPHL":{"length":1,"code":"F9"},"SUI":{"length":2,"8-bit":{"code":"D6"}},"XCHG":{"length":1,"code":"EB"},"XRA":{"length":2,"A":{"code":"AF"},"B":{"code":"A8"},"C":{"code":"A9"},"D":{"code":"AA"},"E":{"code":"AB"},"H":{"code":"AC"},"L":{"code":"AD"},"M":{"code":"AE"}},"XRI":{"length":2,"8-bit":{"code":"EE"}},"XTHL":{"length":1,"code":"E3"}},
	format: {"LXI":["name","16-bit"],"STAX":["name"],"INX":["name"],"INR":["name"],"DCR":["name"],"MVI":["name","8-bit"],"RAL":[],"DAD":["name"],"RIM":[],"SHLD":["16-bit"],"DAA":[],"SIM":[],"STA":["16-bit"],"STC":[],"MOV":["name","name"],"HLT":[],"ADD":["name"],"ADC":["name"],"SUB":["name"],"SBB":["name"],"ACI":["8-bit"],"ADI":["8-bit"],"ANA":["name"],"ANI":["8-bit"],"CALL":["16-bit"],"CC":["16-bit"],"CM":["16-bit"],"CMA":[],"CMC":[],"CMP":["name"],"CNC":["16-bit"],"CNZ":["16-bit"],"CP":["16-bit"],"CPE":["16-bit"],"CPI":["8-bit"],"CPO":["16-bit"],"CZ":["16-bit"],"DCX":["name"],"DI":[],"EI":[],"IN":["8-bit"],"JC":["16-bit"],"JM":["16-bit"],"JMP":["16-bit"],"JNC":["16-bit"],"JNZ":["16-bit"],"JP":["16-bit"],"JPE":["16-bit"],"JPO":["16-bit"],"JZ":["16-bit"],"LDA":["16-bit"],"LDAX":["name"],"LHLD":["16-bit"],"NOP":[],"ORA":["name"],"ORI":["8-bit"],"OUT":["8-bit"],"PCHL":[],"POP":["name"],"PUSH":["name"],"RAR":[],"RC":[],"RET":[],"RLC":[],"RM":[],"RNC":[],"RNZ":[],"RP":[],"RPE":[],"RPO":[],"RRC":[],"RST":["integer"],"RZ":[],"SBI":["8-bit"],"SPHL":[],"SUI":["8-bit"],"XCHG":[],"XRA":["name"],"XRI":["8-bit"],"XTHL":[]}
}

function AssemblerException(code, at) {
    const error = new Error('');
    error.code = code;
    error.at = at;
    return error;
}

AssemblerException.prototype = Object.create(Error.prototype);