///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOHash.ts"/>
///<reference path="FDBOEvent.ts"/>
var FDBOConnection = (function () {
    function FDBOConnection(serverURL) {
        this.serverURL = serverURL;
        this._hash = new FDBOHash();
        this._socket = io.connect(this.serverURL);
        this.socket.on('value', this.onValue.bind(this));
    }
    FDBOConnection.getConnection = function (uri) {
        var serverURL = new URI(uri).hash('').path('').query('').toString();

        if (!this.connections[serverURL]) {
            this.connections[serverURL] = new FDBOConnection(serverURL);
        }
        return this.connections[serverURL];
    };

    Object.defineProperty(FDBOConnection.prototype, "hash", {
        get: function () {
            return this._hash;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FDBOConnection.prototype, "socket", {
        get: function () {
            return this._socket;
        },
        enumerable: true,
        configurable: true
    });

    FDBOConnection.prototype.get = function (url) {
        this.socket.emit('get', new URI(url).toString());
    };

    FDBOConnection.prototype.set = function (url, value) {
        this.socket.emit('set', {
            path: new URI(url).toString(),
            value: value
        });
    };

    FDBOConnection.prototype.onValue = function (data) {
        console.log('on value', data);
        var path = data.path || '';
        var obj = this.hash.get(path);

        if (obj) {
            obj.silentSetValue(data.value);
            obj.emit(new FDBOEvent('value'));
        }
    };

    FDBOConnection.prototype.registerObject = function (object) {
        this.hash.add(object);
        this.get(object.uri);
    };
    FDBOConnection.connections = {};
    return FDBOConnection;
})();
