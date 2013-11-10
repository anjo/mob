'use strict';

describe('Factory: engine', function () {

    beforeEach(module('mobApp'));

    var engine;
    beforeEach(inject(function(_engine_) {
        engine = _engine_;
    }));

    it('should do something', function () {
        expect(!!engine).toBe(true);
    });

    it('should have reasonable data', function () {
        expect(!!data).toBe(true);
        expect(data.B6).toBe(50);
    });

    it('should have create refs', function () {
        var refs = engine({C5:10});
        expect(refs.F14()).toBe(10);
    });

    it('should have update changed refs', function () {
        var data = {C5:10};
        var refs = engine(data);
        data.C5 = 11;
        expect(refs.F14()).toBe(11);
    });
});
