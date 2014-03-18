///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOConnection.ts"/>
///<reference path="FDBOUtils.ts"/>
var FDBOHash = (function () {
    function FDBOHash(connection) {
        this.connection = connection;
        this.data = {};
        this.byParent = {};
    }
    FDBOHash.prototype.add = function (obj) {
        this.data[this.getPath(obj)] = obj;
        var parentPath = this.getPath(FDBOUtils.getParentPath(obj.uri));

        if (!parentPath) {
            return;
        }

        if (!this.byParent[parentPath]) {
            this.byParent[parentPath] = [];
        }

        if (this.byParent[parentPath].indexOf(obj) === -1) {
            this.byParent[parentPath].push(obj);
        }
    };

    FDBOHash.prototype.get = function (url) {
        return this.data[this.getPath(url)];
    };

    FDBOHash.prototype.getChildren = function (obj) {
        return this.byParent[this.getPath(obj)] || [];
    };

    FDBOHash.prototype.has = function (obj) {
        return this.data[this.getPath(obj)] !== undefined;
    };

    FDBOHash.prototype.del = function (obj) {
        var _this = this;
        var path = this.getPath(obj);
        var parentPath = FDBOUtils.getParentPath(new URI(path));
        var fObject = this.data[path];

        //remove the object
        delete this.data[path];

        //remove from parent's hash
        var index = this.byParent[parentPath].indexOf(fObject);
        if (index !== -1) {
            this.byParent[parentPath].splice(index, 1);
        }

        //remove children
        if (this.byParent[path]) {
            this.byParent[path].forEach(function (v) {
                return _this.del(v);
            });
        }
    };

    FDBOHash.prototype.getPath = function (obj) {
        var uri = typeof obj === 'string' ? new URI(obj) : obj.uri;
        return uri.segment().filter(function (a) {
            return a;
        }).join('/');
    };

    FDBOHash.prototype.getOrCreate = function (url) {
        var path = this.getPath(url);
        if (!this.has(path)) {
            return new FinalDBObject(url);
        }
        return this.data[path];
    };
    return FDBOHash;
})();
