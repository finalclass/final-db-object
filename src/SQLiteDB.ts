///<reference path="types/types.d.ts"/>

import EventBus = require('./EventBus');
import Config = require('./Config');
import sqlite3 = require('sqlite3');
import Variable = require('./Variable');
import VariablesCollection = require('./VariablesCollection');

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
        + 'path TEXT PRIMERY KEY NOT NULL,'
        + 'parent TEXT NOT NULL,'
        + 'type TEXT NOT NULL,'
        + 'value TEXT NULL'
      + ')', callback);
    });
  }

  public del(path:string, callback:(err:Error)=>void, thisArg?:any) : void {
    this.sqlite.run('DELETE FROM variable WHERE path LIKE ?', path + '%', this.handleError((err:Error) => {
      callback.call(thisArg, err);
    }));
  }

  public get(path:string, callback:(err:Error, result:IRawData)=>void, thisArg?:any) : void {
    this.sqlite.get('SELECT * FROM variable WHERE path=?', path, this.handleError((err:Error, row:IRawData) => {
      var v = row ? new Variable(row) : null;
      callback.call(thisArg, err, v);
    }));
  }

  public set(path:string, data:any, callback:(err?:Error)=>void, thisArg?:any) : void {
    var collection:VariablesCollection = this.objectToVarCollection(data, path);
    var insertStmt:sqlite3.Statement = this.sqlite.prepare('INSERT INTO '
      + 'variable(path, parent, type, value) '
      + 'values(?, ?, ?, ?)');
    var savedQueries:number = 0;
    var that:SQLiteDB = this;

    collection.each((v:Variable) => {
      this.get(v.path, (err:Error, result:IRawData) => {
        that.sqlite.serialize(() => {
          if (result) {
            that.del(v.path, (err:Error) => {
              if (err) {
                callback.call(thisArg, err);
              }
            });
          }
          insertStmt.run(v.path, v.parent, v.type, v.value, (err) => {
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
  }

  private objectToVarCollection(data:any, path:string, collection?:VariablesCollection) : VariablesCollection {
    collection = collection || new VariablesCollection();
    var typeofData = typeof data;

    if (typeofData === 'string' || typeofData === 'number' || typeofData === 'boolean') {
      collection.add(new Variable(data, path));
    }

    if (typeofData === 'object') {
      collection.add(new Variable({path: path, type: 'Object'}));
      Object.keys(data).forEach((key:string) => {
        this.objectToVarCollection(data[key], path + '.' + key, collection);
      }, this);
    }

    return collection;
  }

  private handleError(callback:(...args)=>void) : (...args)=>void {
    var that = this;

    return function (err) : void {
      if (err) {
        that.eventBus.emit('SQLiteDB.error', err);
      }
      callback.apply(that, arguments);
    };
  }

  private onProcessExit() {
    this.sqlite.close();
  }

}

export = SQLiteDB;