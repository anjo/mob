'use strict';

function engineFactory() {
    return function(data) {
        return excelEngine(data);
    };
}

angular.module('mobApp').factory('engine', engineFactory);
