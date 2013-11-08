//'use strict';

var app = angular.module('mobApp', []);

app.config(['$routeProvider', function($routeProvider) {
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
structural.controller('StructuralCtrl', function($document, $log) {

    $log.info(excelFormulaUtilities.formula2JavaScript("B6*IF(B6>0,(1-B16),1)"));
    $log.info(excelFormulaUtilities.formula2JavaScript("F15/((F23-B33)*(B19+B24+IF(B27=1,F43,F44)))"));
    $log.info(excelFormulaUtilities.formula2JavaScript("AVERAGE(F11:H11)"));
});