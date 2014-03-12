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
        this.data[obj.uri.toString()] = obj;
    };

    FDBOHash.prototype.get = function (path) {
        return this.data[path];
    };

    FDBOHash.prototype.has = function (path) {
        return this.data[path] !== undefined;
    };

    FDBOHash.prototype.getOrCreate = function (path) {
        if (!this.has(path)) {
            this.add(new FinalDBObject(path));
        }
        return this.get(path);
    };
    return FDBOHash;
})();
