'use strict';

describe('Service: data', function () {

    beforeEach(module('mobApp'));

    var data;
    beforeEach(inject(function(_data_) {
        data = _data_;
    }));

    it('should do something', function () {
        expect(!!data).toBe(true);
    });

});
