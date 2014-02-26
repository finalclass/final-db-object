///<reference path="types/types.d.ts"/>
var sqlite3 = require('sqlite3');

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
            sqlite.run('CREATE TABLE IF NOT EXISTS variable(' + 'id INTEGER PRIMERY KEY,' + 'path TEXT NOT NULL,' + 'value TEXT NOT NULL' + ')', callback);
        });
    };

    SQLiteDB.prototype.onProcessExit = function () {
        this.sqlite.close();
    };
    return SQLiteDB;
})();

module.exports = SQLiteDB;
