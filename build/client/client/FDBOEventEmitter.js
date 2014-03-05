///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEvent.ts"/>
///<reference path="IFDBOListener.ts"/>
///<reference path="IFDBOEvent.ts"/>
var FDBOEventEmitter = (function () {
    function FDBOEventEmitter() {
        this._listeners = Object.create(null);
    }
    FDBOEventEmitter.prototype.getAllListeners = function (eventType) {
        if (!this._listeners[eventType]) {
            this._listeners[eventType] = [];
        }
        return this._listeners[eventType];
    };

    FDBOEventEmitter.prototype.on = function (eventType, listener) {
        var listeners = this.getAllListeners(eventType);
        listeners.push(listener);
    };

    FDBOEventEmitter.prototype.off = function (eventType, listener) {
        var listeners = this.getAllListeners(eventType);
        listeners.splice(listeners.indexOf(listener), 1);
    };

    FDBOEventEmitter.prototype.emit = function (event) {
        var _this = this;
        this.getAllListeners(event.type).forEach(function (listener) {
            return listener.call(_this, event);
        });
        2;
    };

    FDBOEventEmitter.prototype.hashEventListener = function (eventType) {
        return this.getAllListeners(eventType).length > 0;
    };
    return FDBOEventEmitter;
})();
