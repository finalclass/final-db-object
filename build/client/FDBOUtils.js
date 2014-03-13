var FDBOUtils = (function () {
    function FDBOUtils() {
    }
    FDBOUtils.getParentPath = function (path) {
        var parts = path.segment();
        parts.pop();
        return parts.join('/');
    };
    return FDBOUtils;
})();
