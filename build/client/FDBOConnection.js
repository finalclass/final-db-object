///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOHash.ts"/>
///<reference path="FDBOEvent.ts"/>
var FDBOConnection = (function () {
    function FDBOConnection(uri) {
        this.uri = uri;
        this.hash = new FDBOHash();
        this._socket = io.connect(new URI(this.uri).path('').toString());
        this.socket.on('value', this.onValue.bind(this));
    }
    Object.defineProperty(FDBOConnection.prototype, "socket", {
        get: function () {
            return this._socket;
        },
        enumerable: true,
        configurable: true
    });

    FDBOConnection.prototype.get = function (path) {
        this.socket.emit('get', path);
    };

    FDBOConnection.prototype.onValue = function (data) {
        var path = data.path || '';
        var obj = this.hash.get(path);

        if (obj) {
            obj.silentSetValue(data.value);
            obj.emit(new FDBOEvent('value'));
        }
    };

    FDBOConnection.prototype.registerObject = function (object) {
        this.hash.add(object);
    };
    return FDBOConnection;
})();
