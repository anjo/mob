'use strict';

describe('Controller: MainCtrl', function() {

    beforeEach(module('mobApp'));

    var MainCtrl,
    scope;

    beforeEach(inject(function($controller) {
        scope = {};
        MainCtrl = $controller('MainCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of awesomeThings to the scope', function() {
        expect(scope.awesomeThings.length).toBe(3);
    });
});
