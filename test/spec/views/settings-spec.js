'use strict';

describe('Controller: SettingsCtrl', function() {

    beforeEach(module('mobApp'));

    var SettingsCtrl,
    scope;

    beforeEach(inject(function($controller) {
        scope = {};
        SettingsCtrl = $controller('SettingsCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of awesomeThings to the scope', function() {
        expect(scope.awesomeThings.length).toBe(3);
    });
});
