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
    var types = excelFormulaUtilities.core.types;
    var core = excelFormulaUtilities.core;

    var content = function(i) {
        var el = document.getElementById(i);
        return el ? el.innerHTML : "NULL";
    }

    var total = {};

    var fixToken = function(token) {
        if(token.match(/^[A-Z]+[0-9]+$/)) {
            if(!total[token]) {
                total[token] = "";
                total[token] = format(content(token));
            }
            token += "()";
        }
        return token;
    }

    var format = function (formula) {

        //Custom callback to format as c#
        var functionStack = [];

        var tokRender = function (tokenStr, token, indent, linbreak) {
            var outstr = "",
            /*tokenString = (token.value.length === 0) ? "" : token.value.toString(),*/
                tokenString = tokenStr,
                directConversionMap = {
                    "=": "==",
                    "<>": "!=",
                    "MIN": "Math.Min",
                    "MAX": "Math.Max",
                    "ABS": "Math.ABS",
                    "SUM": "",
                    "IF": "IF",
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
                        case "sum":
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
                                case "sum":
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

    $log.info(format(content("F29")));
    $log.info(total);
    //$log.info(format("B6*IF(B6>0,(1-B16),1)"));
    //$log.info(format("F15/((F23-B33)*(B19+B24+IF(B27=1,F43,F44)))"));
    //$log.info(format("AVERAGE(F11:H11)"));
});