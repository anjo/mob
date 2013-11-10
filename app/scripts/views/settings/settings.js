'use strict';

function SettingsCtrl($scope, data) {
    $scope.data = data;
}

angular.module('mobApp').controller('SettingsCtrl', SettingsCtrl);
