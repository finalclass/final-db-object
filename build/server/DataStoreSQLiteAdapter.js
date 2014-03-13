///<reference path="../types/types-server.d.ts"/>
var sqlite3 = require('sqlite3');
var Variable = require('./Variable');

var DataStoreSQLiteAdapter = (function () {
    function DataStoreSQLiteAdapter(sqliteConfig) {
        this.sqliteConfig = sqliteConfig;
        this.sqlite = new sqlite3.Database(this.sqliteConfig.path);
        this.insertStmt = this.sqlite.prepare('INSERT INTO ' + 'variable(path, parent, type, value) ' + 'values(?, ?, ?, ?)');
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

    DataStoreSQLiteAdapter.prototype.set = function (v, callback) {
        this.insertStmt.run(v.path, v.parent, v.type, v.value, callback);
    };

    // public set2(path:string, value:any, callback:(err:Error)=>void) : void {
    //   var collection:VariablesCollection = this.objectToVarCollection(value, path);
    //   var insertStmt:sqlite3.Statement = this.sqlite.prepare('INSERT INTO '
    //     + 'variable(path, parent, type, value) '
    //     + 'values(?, ?, ?, ?)');
    //   var savedQueries:number = 0;
    //   var isError:boolean = false;
    //   Try
    //   (() => this.del(path, Try.pause()))
    //   (Try.throwFirstArgument)
    //   (() => {
    //     var resume = Try.pause(collection.length);
    //     collection.each((v:IVariable) => {
    //       insertStmt.run(v.path, v.parent, v.type, v.value, resume);
    //     });
    //   })
    //   ([Try.throwFirstArgumentInArray, (...args) => callback.call(this, null)])
    //   .catch((err:Error) => {
    //     console.log('ERROR', err, (<any>err).stack);
    //   });
    // }
    DataStoreSQLiteAdapter.prototype.close = function (done) {
        this.sqlite.close();
        done(null);
    };
    return DataStoreSQLiteAdapter;
})();

module.exports = DataStoreSQLiteAdapter;
