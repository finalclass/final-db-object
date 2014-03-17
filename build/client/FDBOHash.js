///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOConnection.ts"/>
///<reference path="FDBOUtils.ts"/>
var FDBOHash = (function () {
    function FDBOHash(connection) {
        this.connection = connection;
        this.data = Object.create(null);
    }
    FDBOHash.prototype.add = function (obj) {
        this.data[obj.uri.path()] = obj;
    };

    FDBOHash.prototype.get = function (url) {
        return this.data[new URI(url).path()];
    };

    FDBOHash.prototype.has = function (obj) {
        if (typeof obj === 'string') {
            return this.data[new URI(obj).path()] !== undefined;
        }
        return this.data[obj.uri.path()] !== undefined;
    };

    FDBOHash.prototype.getOrCreate = function (url) {
        var path = new URI(url).path();
        if (!this.has(path)) {
            this.add(new FinalDBObject(url));
        }
        return this.get(path);
    };
    return FDBOHash;
})();
