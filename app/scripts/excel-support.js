    var FALSE = false;
    var TRUE = true;
    function IF(c, a, b) {
        return c ? a : b;
    }
    function F13() { return 0; F20(); };
    function G12() { return 0; G11(); };
    function H12() { return 0; H11(); };
    function SQRT(val) { return Math.sqrt(val); };

    function AVERAGE(args) {
        if(!args.length ) return 0;
        return SUM(args) / args.length;
    };
    function SUM(args) {
        if(!args.length ) return 0;
        var sum = 0;
        for (var i = 0, l = args.length; i < l; i++) {
            sum += args[i];
        }
        return sum;
    };
    function VLOOKUP(val, matrix, idx, appr) {
        for(var i = 0, l = matrix.length / idx; i < l; i++) {
            if(matrix[i * idx] == val) {
                return matrix[i * idx + 1];
            }
        }
        return 0;
    }
    function OR(a, b) {
        return a || b;
    }
    function AND(a, b) {
        return a && b;
    }
    function MAX(args) {
        var vals = args && args.length ? args : arguments;
        return Math.max.apply(null, vals);
    }
    function MIN(args) {
        var vals = args && args.length ? args : arguments;
        return Math.min.apply(null, vals);
    }
    function EXP(a, b) {
        return Math.exp(a, b);
    };
    function MATCH(val, args, type) {
        for (var i = 0, l = args.length; i < l; i++) {
            if(args[i] > val) {
                return i == 0? 0 : i - 1;
            }
        }
        return 0;
    }
    function INDEX(args, val) {
        return args[val];
    }
