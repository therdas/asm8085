var tokenizer = {};

/* expects stringlist, array[] of structure [[lineNo, string], ...]
 *
 */
tokenizer.tokenizer () = function (stringList) {

    var isParen = (ch) => ['[','(','{','}',')',']'].includes(ch);
    var isOpeningParen = (ch) => ['[','(','{'].includes(ch);
    var isClosingParen = (ch) => ['}',')',']'].includes(ch);
    var isOperator = (ch) => ['+','-','*','/'].includes(ch);
    var isWhitespace = (ch) => [' ', '\t'].includes(ch);
    var inParen   = 0;
    var waitForOp = 0;
    var tokenList = [];

    for(var i = 0; i < stringList.length; ++i) {
        var s = stringList[i][1];
        stringList[i][1] = [];
        var current = "";
        var token = 0;
        var o = 0;    
        while(o < s.len) {
            if(isOpeningParen(s[o])) {
                
            }
        }
    }
};
