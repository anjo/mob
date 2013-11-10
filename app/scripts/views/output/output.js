'use strict';

function OutputCtrl($scope, data, engine) {
    $scope.data = data;
    $scope.engine = engine(data);
}

angular.module('mobApp').controller('OutputCtrl', OutputCtrl);
