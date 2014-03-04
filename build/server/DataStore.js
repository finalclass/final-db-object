///<reference path="../types/types-server.d.ts"/>
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
        }).catch(function (err) {
            return _this.handleErrorAndProceed(err);
        }).run();
    };

    DataStore.prototype.get = function (path) {
        var _this = this;
        return Try(function () {
            return _this.adapter.get(path, Try.pause());
        })(function (err, v) {
            return _this.handleErrorAndProceed(err, v);
        }).run();
    };

    DataStore.prototype.del = function (path) {
        var _this = this;
        return Try(function () {
            return _this.adapter.del(path, Try.pause());
        })(function (err) {
            return _this.handleErrorAndProceed(err);
        }).run();
    };

    DataStore.prototype.set = function (path, value) {
        var _this = this;
        return Try(function () {
            return _this.adapter.set(path, value, Try.pause());
        })(function (err) {
            return _this.handleErrorAndProceed(err);
        }).run();
    };

    DataStore.prototype.close = function () {
        var _this = this;
        return Try(function () {
            return _this.adapter.close(Try.pause());
        })(function (err) {
            return _this.handleErrorAndProceed(err);
        }).run();
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
