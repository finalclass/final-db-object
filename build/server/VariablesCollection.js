///<reference path="../types/types-server.d.ts" />
var Variable = require('./Variable');

var VariablesCollection = (function () {
    function VariablesCollection(data) {
        this.initData(data);
    }
    Object.defineProperty(VariablesCollection.prototype, "raw", {
        get: function () {
            return this._raw;
        },
        enumerable: true,
        configurable: true
    });

    VariablesCollection.prototype.add = function (variable) {
        this.raw.push(variable);
    };

    Object.defineProperty(VariablesCollection.prototype, "length", {
        get: function () {
            return this._raw.length;
        },
        enumerable: true,
        configurable: true
    });

    VariablesCollection.prototype.each = function (callback, thisArg) {
        for (var i = 0; i < this._raw.length; i += 1) {
            callback.call(thisArg, this._raw[i]);
        }
    };

    VariablesCollection.prototype.map = function (callback, thisArg) {
        return this._raw.map(callback, thisArg);
    };

    VariablesCollection.prototype.initData = function (data) {
        var _this = this;
        if (data instanceof VariablesCollection) {
            this._raw = data.raw;
        } else if (data instanceof Array) {
            this._raw = [];
            data.forEach(function (record) {
                _this._raw.push(record instanceof Variable ? record : new Variable(record));
            }, this);
        } else if (data instanceof Variable) {
            this._raw = [data];
        } else if (data) {
            this._raw = [new Variable(data)];
        } else {
            this._raw = [];
        }
    };
    return VariablesCollection;
})();

module.exports = VariablesCollection;
