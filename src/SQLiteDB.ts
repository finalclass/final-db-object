///<reference path="types/types.d.ts"/>

import EventBus = require('./EventBus');
import Config = require('./Config');
import sqlite3 = require('sqlite3');

class SQLiteDB {

  private sqlite:sqlite3.Database;

  constructor(
    private eventBus:EventBus, 
    private config:Config
  ) {
    process.on('exit', this.onProcessExit.bind(this));
    this.eventBus.on('Server.listenRequest', this.init.bind(this));
  }

  public init() : void {
    var eventBus = this.eventBus;
    this.sqlite = new sqlite3.Database(this.config.dbPath);
    this.initTables((err) => {
      if (err) {
        eventBus.emit('SQLiteDB.error', err);
      } else {
        eventBus.emit('SQLiteDB.ready');
      }
    });
  }

  private initTables(callback:sqlite3.StandardCallback) {
    var sqlite = this.sqlite;

    sqlite.serialize(() => {
      sqlite.run('CREATE TABLE IF NOT EXISTS variable('
        + 'id INTEGER PRIMERY KEY,'
        + 'path TEXT NOT NULL,'
        + 'value TEXT NOT NULL'
      + ')', callback);
    });
  }

  public get(path:string, callback:(result:any)=>void) : void {
    this.sqlite.get('select * from variable where path=?', path, this.handleError(callback));
  }

  private handleError(callback:(...args)=>void) : void {
    return function (err) : void {
      var args = Array.prototype.slice.call(arguments, 0);
      if (err) {
        this.eventBus.emit('SQLiteDB.error', err);
      } else {
        callback.apply(this, args.slice(1));
      }
    }.bind(this);
  }

  private onProcessExit() {
    this.sqlite.close();
  }

}

export = SQLiteDB;