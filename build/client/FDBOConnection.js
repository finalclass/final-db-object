///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOHash.ts"/>
///<reference path="FDBOEvent.ts"/>
var FDBOConnection = (function () {
    function FDBOConnection(serverURL) {
        this.serverURL = serverURL;
        this._hash = new FDBOHash(this);
        this._socket = io.connect(this.serverURL);
        this.socket.on('value', this.onValue.bind(this));
        this.socket.on('child_added', this.onChildAdded.bind(this));
        this.socket.on('child_removed', this.onChildRemoved.bind(this));
        this.socket.on('del', this.onDel.bind(this));
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

    FDBOConnection.prototype.del = function (url) {
        this.socket.emit('del', { path: new URI(url).toString() });
    };

    FDBOConnection.prototype.registerObject = function (object) {
        if (!this.hash.has(object)) {
            this.hash.add(object);
            this.get(object.uri);
        }
    };

    // ---------------------------
    // Socket responders
    // ---------------------------
    FDBOConnection.prototype.onValue = function (data) {
        var obj = this.hash.get(data.path);
        if (obj) {
            obj.silentSetValue(data.value);
            obj.emit(new FDBOEvent(FDBOEvent.VALUE, obj));
        }
    };

    FDBOConnection.prototype.onChildAdded = function (data) {
        var child = new FinalDBObject(this.serverURL + '/' + data.path, data.value);
        var parent = child.parent;
        if (parent) {
            parent.emit(new FDBOEvent(FDBOEvent.CHILD_ADDED, child));
        }
    };

    FDBOConnection.prototype.onChildRemoved = function (data) {
        if (this.hash.has(data.path)) {
            this.delAndEmitDeleted(data.path);
        }
    };

    FDBOConnection.prototype.delAndEmitDeleted = function (path) {
        var child = this.hash.get(path);
        if (child.parent) {
            child.parent.emit(new FDBOEvent(FDBOEvent.CHILD_REMOVED, child));
        }
        child.emit(new FDBOEvent(FDBOEvent.DELETED, child));
        this.hash.del(path);
    };

    FDBOConnection.prototype.onDel = function (data) {
        if (this.hash.has(data.path)) {
            this.delAndEmitDeleted(data.path);
        }
    };
    FDBOConnection.connections = {};
    return FDBOConnection;
})();
