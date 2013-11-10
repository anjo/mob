'use strict';

function MainCtrl($scope, engine, data) {
    $scope.data = data;
    $scope.engine = engine(data);
}

angular.module('mobApp').controller('MainCtrl', MainCtrl);
