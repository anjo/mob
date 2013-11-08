'use strict';

function MainCtrl($scope) {
    $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Testacular'
    ];
}

angular.module('mobApp').controller('MainCtrl', MainCtrl);
