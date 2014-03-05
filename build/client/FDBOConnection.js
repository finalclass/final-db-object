///<reference path="../types/types-client.d.ts"/>
var FDBOConnection = (function () {
    function FDBOConnection(path) {
        this.path = path;
        this._socket = io.connect(path);
    }
    Object.defineProperty(FDBOConnection.prototype, "socket", {
        get: function () {
            return this._socket;
        },
        enumerable: true,
        configurable: true
    });
    return FDBOConnection;
})();
