var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FinalDBObject = (function (_super) {
    __extends(FinalDBObject, _super);
    function FinalDBObject(url, initialValue) {
        _super.call(this);
        this.url = new URI(url);
        this.connection.registerObject(this);
        this._value = initialValue;
    }
    FinalDBObject.generateRandomId = function () {
        var d = new Date().getTime().toString(36);
        var r = Math.floor(Math.random() * 1e8).toString(36);
        return d + r;
    };

    Object.defineProperty(FinalDBObject.prototype, "connection", {
        get: function () {
            return FDBOConnection.getConnection(this.url);
        },
        enumerable: true,
        configurable: true
    });

    FinalDBObject.prototype.on = function (message, callback) {
        _super.prototype.on.call(this, message, callback);
        if (message === 'value' || message === 'child_added') {
            this.connection.get(this.uri);
        }
    };

    FinalDBObject.prototype.once = function (message, callback) {
        _super.prototype.once.call(this, message, callback);
        if (message === 'value' || message === 'child_added') {
            this.connection.get(this.uri);
        }
    };

    Object.defineProperty(FinalDBObject.prototype, "uri", {
        get: function () {
            return this.url;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FinalDBObject.prototype, "name", {
        get: function () {
            var seg = this.url.segment();
            return seg[seg.length - 1];
        },
        enumerable: true,
        configurable: true
    });

    FinalDBObject.prototype.child = function (name) {
        return this.connection.hash.getOrCreate([this.url.toString(), name].join('/'));
    };

    Object.defineProperty(FinalDBObject.prototype, "children", {
        get: function () {
            return this.connection.hash.getChildren(this);
        },
        enumerable: true,
        configurable: true
    });

    FinalDBObject.prototype.set = function (value) {
        this.connection.set(this.uri, value);
    };

    FinalDBObject.prototype.del = function () {
        this.connection.del(this.uri);
    };

    Object.defineProperty(FinalDBObject.prototype, "parent", {
        get: function () {
            return this.connection.hash.get(FDBOUtils.getParentPath(this.url));
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FinalDBObject.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });

    FinalDBObject.prototype.silentSetValue = function (value) {
        this._value = value;
    };
    return FinalDBObject;
})(FDBOEventEmitter);
