///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEventEmitter.ts"/>
///<reference path="FDBOConnection.ts"/>
///<reference path="FDBOUtils.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FinalDBObject = (function (_super) {
    __extends(FinalDBObject, _super);
    function FinalDBObject(url) {
        _super.call(this);
        this.url = new URI(url);
        this.connection.registerObject(this);
    }
    Object.defineProperty(FinalDBObject.prototype, "connection", {
        get: function () {
            return FDBOConnection.getConnection(this.url);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FinalDBObject.prototype, "uri", {
        get: function () {
            return this.url;
        },
        enumerable: true,
        configurable: true
    });

    FinalDBObject.prototype.child = function (name) {
        return this.connection.hash.getOrCreate([this.url.toString(), name].join('/'));
    };

    FinalDBObject.prototype.set = function (value) {
        this.connection.set(this.uri, value);
    };

    Object.defineProperty(FinalDBObject.prototype, "parent", {
        get: function () {
            return this.connection.hash.get(FDBOUtils.getParentPath(this.url.toString()));
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
