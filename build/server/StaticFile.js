///<reference path="../types/types-server.d.ts"/>
var path = require('path');

var StaticFile = (function () {
    function StaticFile(_name, _path) {
        this._name = _name;
        this._path = _path;
    }
    Object.defineProperty(StaticFile.prototype, "fullPath", {
        get: function () {
            return path.resolve(__dirname, '..', '..', this._path);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(StaticFile.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    return StaticFile;
})();

module.exports = StaticFile;
