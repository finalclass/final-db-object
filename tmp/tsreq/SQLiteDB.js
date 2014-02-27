///<reference path="types/types.d.ts"/>
var sqlite3 = require('sqlite3');
var Variable = require('./Variable');
var VariablesCollection = require('./VariablesCollection');

var SQLiteDB = (function () {
    function SQLiteDB(eventBus, config) {
        this.eventBus = eventBus;
        this.config = config;
        process.on('exit', this.onProcessExit.bind(this));
        this.eventBus.on('Server.listenRequest', this.init.bind(this));
    }
    SQLiteDB.prototype.init = function () {
        var eventBus = this.eventBus;
        this.sqlite = new sqlite3.Database(this.config.dbPath);
        this.initTables(function (err) {
            if (err) {
                eventBus.emit('SQLiteDB.error', err);
            } else {
                eventBus.emit('SQLiteDB.ready');
            }
        });
    };

    SQLiteDB.prototype.initTables = function (callback) {
        var sqlite = this.sqlite;

        sqlite.serialize(function () {
            sqlite.run('CREATE TABLE IF NOT EXISTS variable(' + 'path TEXT PRIMERY KEY NOT NULL,' + 'parent TEXT NOT NULL,' + 'type TEXT NOT NULL,' + 'value TEXT NULL' + ')', callback);
        });
    };

    SQLiteDB.prototype.del = function (path, callback, thisArg) {
        this.sqlite.run('DELETE FROM variable WHERE path LIKE ?', path + '%', this.handleError(function (err) {
            callback.call(thisArg, err);
        }));
    };

    SQLiteDB.prototype.get = function (path, callback, thisArg) {
        this.sqlite.get('SELECT * FROM variable WHERE path=?', path, this.handleError(function (err, row) {
            var v = row ? new Variable(row) : null;
            callback.call(thisArg, err, v);
        }));
    };

    SQLiteDB.prototype.set = function (path, data, callback, thisArg) {
        var _this = this;
        var collection = this.objectToVarCollection(data, path);
        var insertStmt = this.sqlite.prepare('INSERT INTO ' + 'variable(path, parent, type, value) ' + 'values(?, ?, ?, ?)');
        var savedQueries = 0;
        var that = this;

        collection.each(function (v) {
            _this.get(v.path, function (err, result) {
                that.sqlite.serialize(function () {
                    if (result) {
                        that.del(v.path, function (err) {
                            if (err) {
                                callback.call(thisArg, err);
                            }
                        });
                    }
                    insertStmt.run(v.path, v.parent, v.type, v.value, function (err) {
                        if (err) {
                            callback.call(thisArg, err);
                        }
                        savedQueries += 1;
                        if (savedQueries === collection.length) {
                            callback.call(thisArg, null);
                        }
                    });
                });
            });
        }, this);
    };

    SQLiteDB.prototype.objectToVarCollection = function (data, path, collection) {
        var _this = this;
        collection = collection || new VariablesCollection();
        var typeofData = typeof data;

        if (typeofData === 'string' || typeofData === 'number' || typeofData === 'boolean') {
            collection.add(new Variable(data, path));
        }

        if (typeofData === 'object') {
            collection.add(new Variable({ path: path, type: 'Object' }));
            Object.keys(data).forEach(function (key) {
                _this.objectToVarCollection(data[key], path + '.' + key, collection);
            }, this);
        }

        return collection;
    };

    SQLiteDB.prototype.handleError = function (callback) {
        var that = this;

        return function (err) {
            if (err) {
                that.eventBus.emit('SQLiteDB.error', err);
            }
            callback.apply(that, arguments);
        };
    };

    SQLiteDB.prototype.onProcessExit = function () {
        this.sqlite.close();
    };
    return SQLiteDB;
})();

module.exports = SQLiteDB;
