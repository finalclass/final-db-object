///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEvent.ts"/>
///<reference path="FinalDBObject.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FDBOChildAddedEvent = (function (_super) {
    __extends(FDBOChildAddedEvent, _super);
    function FDBOChildAddedEvent(t, child) {
        _super.call(this, t);
        this.child = child;
    }
    return FDBOChildAddedEvent;
})(FDBOEvent);
