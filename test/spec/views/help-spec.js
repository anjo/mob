'use strict';

describe('Controller: HelpCtrl', function() {

    beforeEach(module('mobApp'));

    var HelpCtrl,
    scope;

    beforeEach(inject(function($controller) {
        scope = {};
        HelpCtrl = $controller('HelpCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of awesomeThings to the scope', function() {
        expect(scope.awesomeThings.length).toBe(3);
    });
});
