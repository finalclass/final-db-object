///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEventEmitter.ts"/>
///<reference path="FDBOConnection.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FinalDBObject = (function (_super) {
    __extends(FinalDBObject, _super);
    function FinalDBObject(_path, _parent) {
        _super.call(this);
        this._path = _path;
        this._parent = _parent;
        if (!this.connection) {
            this._connection = new FDBOConnection(this.path);
        }
        this.children = Object.create(null);
        this.get();
    }
    Object.defineProperty(FinalDBObject.prototype, "connection", {
        get: function () {
            return this._connection;
        },
        enumerable: true,
        configurable: true
    });

    FinalDBObject.prototype.get = function () {
        this.connection.socket.emit('get', this.path);
    };

    FinalDBObject.prototype.child = function (name) {
        var childPath = this.path + '.' + name;
        if (!this.children[childPath]) {
            this.children[childPath] = new FinalDBObject(childPath);
        }
        return this.children[childPath];
    };

    Object.defineProperty(FinalDBObject.prototype, "path", {
        get: function () {
            return this._path;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FinalDBObject.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    return FinalDBObject;
})(FDBOEventEmitter);
