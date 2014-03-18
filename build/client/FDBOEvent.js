///<reference path="../types/types-client.d.ts"/>
///<reference path="IFDBOEvent.ts"/>
var FDBOEvent = (function () {
    function FDBOEvent(_type, object) {
        this._type = _type;
        this.object = object;
    }
    Object.defineProperty(FDBOEvent.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    FDBOEvent.VALUE = 'value';
    FDBOEvent.CHILD_ADDED = 'child_added';
    FDBOEvent.CHILD_REMOVED = 'child_removed';
    FDBOEvent.DELETED = 'deleted';
    return FDBOEvent;
})();
