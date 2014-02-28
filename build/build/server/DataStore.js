///<reference path="../types/types.d.ts" />
var DataStoreSQLiteAdapter = require('./DataStoreSQLiteAdapter');

var Try = require('try');

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
    DataStore.prototype.getErrorEmitterFunction = function () {
        var _this = this;
        return function (err) {
            if (err) {
                _this.eventBus.emit('DataStore.initError', err);
                throw err;
            }
        };
    };

    DataStore.prototype.init = function () {
        var _this = this;
        return Try(function () {
            return _this.adapter.init(Try.pause());
        })(function (err) {
            if (err)
                throw err;
        })(function () {
            return _this.eventBus.emit('DataStore.initComplete');
        }).catch(this.getErrorEmitterFunction()).run();
    };

    DataStore.prototype.get = function (path) {
        var _this = this;
        return Try(function () {
            return _this.adapter.get(path, Try.pause());
        })(function (err, v) {
            _this.getErrorEmitterFunction()(err);
            return v;
        }).run();
    };

    DataStore.prototype.del = function (path) {
        var _this = this;
        return Try(function () {
            return _this.adapter.del(path, Try.pause());
        })(this.getErrorEmitterFunction()).run();
    };

    DataStore.prototype.set = function (path, value) {
        var _this = this;
        return Try(function () {
            return _this.adapter.set(path, value, Try.pause());
        })(this.getErrorEmitterFunction()).run();
    };

    DataStore.prototype.close = function () {
        var _this = this;
        return Try(function () {
            return _this.adapter.close(Try.pause());
        })(this.getErrorEmitterFunction()).run();
    };

    DataStore.prototype.onProcessExit = function () {
        var _this = this;
        this.close()(function () {
            return _this.eventBus.emit('DataStore.closeComplete');
        });
    };
    return DataStore;
})();

module.exports = DataStore;
