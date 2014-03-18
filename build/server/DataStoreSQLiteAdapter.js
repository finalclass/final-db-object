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
        this.sqlite.run('CREATE TABLE IF NOT EXISTS variable(' + 'path TEXT PRIMERY KEY NOT NULL,' + 'parent TEXT NOT NULL,' + 'type TEXT NOT NULL,' + 'value TEXT NULL' + ')', function (err) {
            _this.prepareStmts();
            callback(err);
        });
    };

    DataStoreSQLiteAdapter.prototype.prepareStmts = function () {
        this.insertStmt = this.sqlite.prepare('INSERT INTO ' + 'variable(path, parent, type, value) ' + 'values(?, ?, ?, ?)');
        this.getChildrenStmt = this.sqlite.prepare('SELECT * FROM variable WHERE parent=?');
        this.getStmt = this.sqlite.prepare('SELECT * FROM variable WHERE path=?');
        this.delStmt = this.sqlite.prepare('DELETE FROM variable WHERE path LIKE ?');
    };

    DataStoreSQLiteAdapter.prototype.get = function (path, callback) {
        var _this = this;
        this.getStmt.get(path, function (err, raw) {
            callback.call(_this, err, new Variable(raw));
        });
    };

    DataStoreSQLiteAdapter.prototype.getChildren = function (parent, callback) {
        this.getChildrenStmt.all(parent, function (err, records) {
            callback.call(null, err, new VariablesCollection(records));
        });
    };

    DataStoreSQLiteAdapter.prototype.del = function (path, callback) {
        this.delStmt.run(path + '%', callback);
    };

    DataStoreSQLiteAdapter.prototype.set = function (v, callback) {
        this.insertStmt.run(v.path, v.parent, v.type, v.value, callback);
    };

    DataStoreSQLiteAdapter.prototype.close = function (done) {
        this.sqlite.close();
        done(null);
    };
    return DataStoreSQLiteAdapter;
})();

module.exports = DataStoreSQLiteAdapter;
