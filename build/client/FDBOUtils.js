///<reference path="../types/types-client.d.ts"/>
var FDBOUtils = (function () {
    function FDBOUtils() {
    }
    FDBOUtils.getParentPath = function (path) {
        var seg = path.segment();
        var clone = path.clone();
        seg.pop();
        clone.segment(seg);
        return clone.toString();
    };
    return FDBOUtils;
})();
