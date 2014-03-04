///<reference path="../types/types-server.d.ts"/>
var sqlite3 = require('sqlite3');
var Variable = require('./Variable');
var VariablesCollection = require('./VariablesCollection');

var DataStoreSQLiteAdapter = (function () {
    function DataStoreSQLiteAdapter(sqliteConfig) {
        this.sqliteConfig = sqliteConfig;
        this.sqlite = new sqlite3.Database(this.sqliteConfig.path);
    }
    DataStoreSQLiteAdapter.prototype.init = function (callback) {
        var _this = this;
        this.sqlite.serialize(function () {
            _this.sqlite.run('CREATE TABLE IF NOT EXISTS variable(' + 'path TEXT PRIMERY KEY NOT NULL,' + 'parent TEXT NOT NULL,' + 'type TEXT NOT NULL,' + 'value TEXT NULL' + ')', callback);
        });
    };

    DataStoreSQLiteAdapter.prototype.get = function (path, callback) {
        var _this = this;
        this.sqlite.get('SELECT * FROM variable WHERE path=?', path, function (err, raw) {
            callback.call(_this, err, new Variable(raw));
        });
    };

    DataStoreSQLiteAdapter.prototype.del = function (path, callback) {
        this.sqlite.run('DELETE FROM variable WHERE path LIKE ?', path + '%', callback);
    };

    DataStoreSQLiteAdapter.prototype.set = function (path, value, callback) {
        var _this = this;
        var collection = this.objectToVarCollection(value, path);
        var insertStmt = this.sqlite.prepare('INSERT INTO ' + 'variable(path, parent, type, value) ' + 'values(?, ?, ?, ?)');
        var savedQueries = 0;

        var isError = false;

        collection.each(function (v) {
            _this.get(v.path, function (err, v) {
                _this.sqlite.serialize(function () {
                    if (isError) {
                        return;
                    }

                    if (v) {
                        _this.del(v.path, function (err) {
                            if (err) {
                                isError = true;
                                callback.call(_this, err);
                            }
                        });
                    }
                    insertStmt.run(v.path, v.parent, v.type, v.value, function (err) {
                        if (err) {
                            isError = true;
                            callback.call(_this, err);
                        }
                        savedQueries += 1;
                        if (savedQueries === collection.length) {
                            callback.call(_this, null);
                        }
                    });
                });
            });
        }, this);
    };

    DataStoreSQLiteAdapter.prototype.objectToVarCollection = function (data, path, collection) {
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

    DataStoreSQLiteAdapter.prototype.close = function (done) {
        this.sqlite.close();
        done(null);
    };
    return DataStoreSQLiteAdapter;
})();

module.exports = DataStoreSQLiteAdapter;
