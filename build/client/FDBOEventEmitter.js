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
        listeners.push({ listener: listener });
    };

    FDBOEventEmitter.prototype.once = function (eventType, listener) {
        var listeners = this.getAllListeners(eventType);
        listeners.push({ listener: listener, once: true });
    };

    FDBOEventEmitter.prototype.off = function (eventType, listener) {
        var listeners = this.getAllListeners(eventType);
        for (var i = 0; i < listeners.length; i += 1) {
            if (listeners[i].listener === listener) {
                break;
            }
        }
        listeners.splice(i, 1);
    };

    FDBOEventEmitter.prototype.emit = function (event) {
        var _this = this;
        this.getAllListeners(event.type).forEach(function (listener) {
            listener.listener.call(_this, event);
            if (listener.once) {
                _this.off(event.type, listener.listener);
            }
        });
    };

    FDBOEventEmitter.prototype.hashEventListener = function (eventType) {
        return this.getAllListeners(eventType).length > 0;
    };
    return FDBOEventEmitter;
})();
