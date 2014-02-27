///<reference path="../types/types.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var events = require('events');

var EventBus = (function (_super) {
    __extends(EventBus, _super);
    function EventBus() {
        _super.call(this);
    }
    return EventBus;
})(events.EventEmitter);

module.exports = EventBus;
