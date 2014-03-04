///<reference path="../types/types-client.d.ts"/>
///<reference path="IFDBOEvent.ts"/>
var FDBOEvent = (function () {
    function FDBOEvent(_type) {
        this._type = _type;
    }
    Object.defineProperty(FDBOEvent.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    return FDBOEvent;
})();
