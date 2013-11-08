'use strict';

describe('Controller: OutputCtrl', function() {

    beforeEach(module('mobApp'));

    var OutputCtrl,
    scope;

    beforeEach(inject(function($controller) {
        scope = {};
        OutputCtrl = $controller('OutputCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of awesomeThings to the scope', function() {
        expect(scope.awesomeThings.length).toBe(3);
    });
});
