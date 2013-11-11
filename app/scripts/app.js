//'use strict';

var app = angular.module('mobApp', []);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'scripts/views/main/main.html',
            controller: 'MainCtrl'
        })
        .when('/input', {
            redirectTo: '/'
        })
        .when('/output', {
            templateUrl: 'scripts/views/output/output.html',
            controller: 'OutputCtrl'
        })
        .when('/settings', {
            templateUrl: 'scripts/views/settings/settings.html',
            controller: 'SettingsCtrl'
        })
        .when('/help', {
            templateUrl: 'scripts/views/help/help.html',
            controller: 'HelpCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

var structural = angular.module('structuralApp', []);

structural.controller('StructuralCtrl', function ($document, $log) {
    var functions;
    var types = excelFormulaUtilities.core.types;
    var core = excelFormulaUtilities.core;

    var node = function(i) {
        var el = document.getElementById(i);
        return el ? {content: el.innerText, type: el.getAttribute('celltype'), element: el}: {};
    }

    var total = {};
    var functions = [];

    var toFunction = function(token, val) {
        var n = node(token);
        switch(n.type) {
            case 'CELL_TYPE_STRING':
            case 'CELL_TYPE_NUMERIC':
                val = "function " + token + "() { return data." + token + "; }";
                break;
            case 'CELL_TYPE_FORMULA':
                val = "function " + token + "() { return " + val + "; }";
                break;

        }
        return val;
    }

    var fixToken = function(token) {
        if(token.match(/^[A-Z]+[0-9]+$/)) {
            token += "()";
        }
        return token;
    }

    var format = function (formula) {
        if(!formula || typeof formula === 'undefined') {
            return;
        }
        if(!formula.replace) {
            $log.error("wrong type", formula);
            return;
        }

        formula = formula.replace(/\$/ig,"");
        //Custom callback to format as c#
        var functionStack = [];

        var tokRender = function (tokenStr, token, indent, linbreak) {
            var outstr = "",
            /*tokenString = (token.value.length === 0) ? "" : token.value.toString(),*/
                tokenString = tokenStr,
                directConversionMap = {
                    "=": "===",
                    "<>": "!=",
                    "xMIN": "Math.min",
                    "xMAX": "Math.max",
                    "xABS": "Math.abs",
                    "&": "+"
                },
                currentFunctionOnStack = functionStack[functionStack.length - 1],
                useTemplate = false;

            switch (token.type.toString()) {

                case types.TOK_TYPE_FUNCTION:

                    switch (token.subtype) {

                        case types.TOK_SUBTYPE_START:

                            functionStack.push({
                                name: tokenString,
                                argumentNumber: 0
                            });
                            outstr = typeof directConversionMap[tokenString.toUpperCase()] === "string" ? directConversionMap[tokenString.toUpperCase()] : tokenString;
                            useTemplate = true;

                            break;

                        case types.TOK_SUBTYPE_STOP:

                            useTemplate = true;
                            switch (currentFunctionOnStack.name.toLowerCase()) {
                                case "xif":
                                    outstr = ")";
                                    useTemplate = false;
                                    break;
                                default:
                                    outstr = typeof directConversionMap[tokenString.toUpperCase()] === "string" ? directConversionMap[tokenString.toUpperCase()] : tokenString;
                                    break
                            }
                            functionStack.pop();
                            break;
                    }

                    break;

                case types.TOK_TYPE_ARGUMENT:
                    if(!currentFunctionOnStack) {
                        break;
                    }
                    switch (currentFunctionOnStack.name.toLowerCase()) {
                        case "xif":
                            switch (currentFunctionOnStack.argumentNumber) {
                                case 0:
                                    outstr = "?";
                                    break;
                                case 1:
                                    outstr = ":";
                                    break;
                            }
                            break;
                        case "xsum":
                            outstr = "+";
                            break;
                        default:
                            outstr = typeof directConversionMap[tokenString.toUpperCase()] === "string" ? directConversionMap[tokenString.toUpperCase()] : tokenString;
                            useTemplate = true;
                            break;
                    }

                    currentFunctionOnStack.argumentNumber += 1;

                    break;

                case types.TOK_TYPE_OPERAND:

                    switch (token.subtype) {

                        case types.TOK_SUBTYPE_RANGE:
                            if (!currentFunctionOnStack) {
                                break;
                            }
                            switch (currentFunctionOnStack.name.toLowerCase()) {
                                // If in the sum function break aout cell names and add
                                case "xsum":
                                    //TODO make sure this is working
                                    if (RegExp(":", "gi").test(tokenString)) {
                                        outstr = core.breakOutRanges(tokenString, "+", fixToken);
                                    } else {
                                        outStr = tokenString;
                                    }

                                    break;
                                // By Default return an array containing all cell names in array
                                default:
                                    // Create array for ranges
                                    if (RegExp(":", "gi").test(tokenString)) {
                                        outstr = "[" + core.breakOutRanges(tokenString, ",", fixToken) + "]";
                                    } else {
                                        outstr = tokenString;
                                    }
                                    //debugger;
                                    break;
                            }

                            break;

                        default:
                            break;
                    }

                default:
                    if (outstr === "") {
                        outstr = typeof directConversionMap[tokenString.toUpperCase()] === "string" ? directConversionMap[tokenString.toUpperCase()] : tokenString;
                    }
                    useTemplate = true;
                    break;
            }

            outstr = fixToken(outstr);

            return {
                tokenString: outstr,
                useTemplate: useTemplate
            };
        };

        var cSharpOutput = excelFormulaUtilities.formatFormula(
            formula, {
                tmplFunctionStart: '{{token}}(',
                tmplFunctionStop: '{{token}})',
                tmplOperandError: '{{token}}',
                tmplOperandRange: '{{token}}',
                tmplOperandLogical: '{{token}}',
                tmplOperandNumber: '{{token}}',
                tmplOperandText: '"{{token}}"',
                tmplArgument: '{{token}}',
                tmplFunctionStartArray: "",
                tmplFunctionStartArrayRow: "{",
                tmplFunctionStopArrayRow: "}",
                tmplFunctionStopArray: "",
                tmplSubexpressionStart: "(",
                tmplSubexpressionStop: ")",
                tmplIndentTab: "\t",
                tmplIndentSpace: " ",
                autoLineBreak: "TOK_SUBTYPE_STOP | TOK_SUBTYPE_START | TOK_TYPE_ARGUMENT",
                trim: true,
                customTokenRender: tokRender
            });
        return cSharpOutput;
    };

    var mode = 3;
    if(mode == 1) {
        var r = new RegExp('([a-z]+)([0-9]+)', "gi");
        var sorter = function(a,b) {
            var x = /([a-z]+)([0-9]+)/gi.exec(a.toString());
            var y = /([a-z]+)([0-9]+)/gi.exec(b.toString());
            return x[1] == y[1] ? parseInt(x[2])-parseInt(y[2]) : x[1].charCodeAt(0) - y[1].charCodeAt(0);
        }
        var funcs = [];
        var refs = {};
        var data = {};

        funcs.push(H12.toString());
        funcs.push(F13.toString());
        funcs.push(G12.toString());

        for(var col = 0; col < 25; col++) {
            for(var row = 1; row < 100; row++) {
                var idx = String.fromCharCode(65 + col) + "" + row;
                var n = node(idx);
                var content = n.content;
                switch(n.type) {
                    case 'CELL_TYPE_FORMULA':
                        total[idx] = toFunction(idx, format(content));
                        funcs.push(total[idx]);
                        refs[idx] = idx;
                        break;
                    case 'CELL_TYPE_NUMERIC':
                        content = parseFloat(content);
                    case 'CELL_TYPE_STRING':
                        data[idx] = content;
                        total[idx] = toFunction(idx);
                        funcs.push(total[idx]);
                        break;
                }
            }
        }
        data = JSON.stringify(data);
        refs = JSON.stringify(refs).replace(/\:\"(.*?)\"/gi, ":$1");
        funcs = funcs.sort(sorter).join("\n");
        var out = "var data = " + data + ";\n\nfunction engine(data) {\n\n"+
            funcs + "\n var refs = " + refs + ";\n return refs;\n" +
        "};\n";
        //$log.info(funcs);
        //$log.info(data);
        //$log.info(refs);
        //$log.info("G5", C5(), F14(), F15());
        alert(out);
    } else if(mode == 2) {
        var n = node('F47');
        $log.info("processing: " + idx + "-> "  + n.content + "-->" + format(n.content))
    } else if(mode == 3) {
        var refs = window.refs = excelEngine(window.data);
        //$log.info(refs);
        for(var col = 0; col < 25; col++) {
            for(var row = 1; row < 100; row++) {
                var idx = String.fromCharCode(65 + col) + "" + row;
                var n = node(idx);
                var func = refs[idx];
                switch(n.type) {
                    case 'CELL_TYPE_FORMULA':
                    //case 'CELL_TYPE_NUMERIC':
                    //case 'CELL_TYPE_STRING':
                        try {
                            total[idx] = func();
                        } catch(e) {
                            total[idx] = e;
                        }
                        n.element.setAttribute('result', n.content);
                        n.element.innerHTML =  total[idx].toFixed ? total[idx].toFixed(5) : total[idx];
                        $log.info(idx, total[idx]);
                        break;
                }
            }
        }
    }
    // alert(res)
    //$log.info(format(node("F29").content));
    //$log.info(format("B6*IF(B6>0,(1-B16),1)"));
    //$log.info(format("F15/((F23-B33)*(B19+B24+IF(B27=1,F43,F44)))"));
    //$log.info(format("AVERAGE(F11:H11)"));
    //$log.info("{\n" + functions.sort(function(a,b) {
    //    return a.toString() == b.toString() ? 0 : a.toString() < b.toString() ? -1 : 1;
    //}).join(",\n") + "\n}");
});