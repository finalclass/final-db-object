///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
var FDBOHash = (function () {
    function FDBOHash() {
        this.data = Object.create(null);
    }
    FDBOHash.prototype.add = function (obj) {
        this.data[obj.uri.toString()] = obj;
    };

    FDBOHash.prototype.get = function (path) {
        return this.data[path];
    };
    return FDBOHash;
})();
