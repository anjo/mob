'use strict';

function HelpCtrl($scope) {
    $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Testacular'
    ];
}

angular.module('mobApp').controller('HelpCtrl', HelpCtrl);
