'use strict';

function OutputCtrl($scope) {
    $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Testacular'
    ];
}

angular.module('mobApp').controller('OutputCtrl', OutputCtrl);
