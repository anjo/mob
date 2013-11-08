'use strict';

function SettingsCtrl($scope) {
    $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Testacular'
    ];
}

angular.module('mobApp').controller('SettingsCtrl', SettingsCtrl);
