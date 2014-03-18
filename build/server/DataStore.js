///<reference path="../types/types-server.d.ts"/>
var DataStoreSQLiteAdapter = require('./DataStoreSQLiteAdapter');

var Try = require('try');
var Variable = require('./Variable');
var VariablesCollection = require('./VariablesCollection');

var DataStore = (function () {
    function DataStore(eventBus, config) {
        var _this = this;
        this.eventBus = eventBus;
        this.config = config;
        if (config.dataStoreAdapter === 'sqlite') {
            this.adapter = new DataStoreSQLiteAdapter(config.dataStore.sqlite);
        } else {
            throw new Error('Wrong adapter type');
        }

        process.on('exit', function () {
            return _this.onProcessExit();
        });
    }
    DataStore.prototype.handleErrorAndProceed = function (err, possibleArgument) {
        if (err) {
            this.eventBus.emit('DataStore.error', err);
            throw err;
        }
        return possibleArgument;
    };

    DataStore.prototype.init = function () {
        var _this = this;
        return Try(function () {
            return _this.adapter.init(Try.pause());
        })(function (err) {
            return _this.handleErrorAndProceed(err);
        })(function () {
            return _this.eventBus.emit('DataStore.initComplete');
        });
    };

    DataStore.prototype.getChildren = function (path) {
        var _this = this;
        return Try(function () {
            return _this.adapter.getChildren(path, Try.pause());
        })(function (err, vars) {
            return _this.handleErrorAndProceed(err, vars);
        });
    };

    DataStore.prototype.get = function (path) {
        var _this = this;
        return Try(function () {
            return _this.adapter.get(path, Try.pause());
        })(function (err, v) {
            return _this.handleErrorAndProceed(err, v);
        })(function (v) {
            return _this.normalizeVariable(v, path);
        });
    };

    DataStore.prototype.normalizeVariable = function (v, path) {
        v.raw.path = v.path || path;
        v.raw.parent = v.parent || this.findParentPath(v.path);
        v.raw.type = v.type || 'object';
        return v;
    };

    DataStore.prototype.findParentPath = function (path) {
        var parts = (path || '').split('/');
        parts.pop();
        return parts.join('/');
    };

    DataStore.prototype.del = function (path) {
        var _this = this;
        return Try(function () {
            return _this.adapter.del(path, Try.pause());
        })(function (err) {
            return _this.handleErrorAndProceed(err);
        })(function () {
            return _this.eventBus.emit('DataStore.variableDel', _this.normalizeVariable(new Variable(), path));
        });
    };

    DataStore.prototype.set = function (path, value) {
        var _this = this;
        var collection = this.objectToVarCollection(value, path);

        return Try(function () {
            return _this.adapter.del(path, Try.pause());
        })(Try.throwFirstArgument)(function () {
            return collection.each(function (v) {
                var resume = Try.pause();
                _this.adapter.set(v, function (err) {
                    _this.eventBus.emit('DataStore.variableSet', v);
                    resume(err);
                });
            });
        })([Try.throwFirstArgumentInArray]).catch(function (err) {
            return _this.handleErrorAndProceed(err);
        })(function () {
            return collection;
        });
    };

    DataStore.prototype.close = function () {
        var _this = this;
        return Try(function () {
            return _this.adapter.close(Try.pause());
        })(function (err) {
            return _this.handleErrorAndProceed(err);
        });
    };

    DataStore.prototype.onProcessExit = function () {
        var _this = this;
        this.close()(function () {
            return _this.eventBus.emit('DataStore.closeComplete');
        });
    };

    DataStore.prototype.objectToVarCollection = function (data, path, collection) {
        var _this = this;
        collection = collection || new VariablesCollection();
        var typeofData = typeof data;

        if (typeofData === 'string' || typeofData === 'number' || typeofData === 'boolean') {
            collection.add(new Variable(data, path));
        }

        if (typeofData === 'object') {
            collection.add(new Variable({ path: path, type: 'object' }));
            Object.keys(data).forEach(function (key) {
                _this.objectToVarCollection(data[key], path + '/' + key, collection);
            }, this);
        }

        return collection;
    };
    return DataStore;
})();

module.exports = DataStore;
