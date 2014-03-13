///<reference path="../types/types-server.d.ts"/>

import sqlite3 = require('sqlite3');
import Variable = require('./Variable');
import Try = require('try');

class DataStoreSQLiteAdapter implements IDataStoreAdapter {

  private sqlite:sqlite3.Database;
  private insertStmt:sqlite3.Statement;

  constructor(private sqliteConfig:IDataStoreSQLiteConfig) {
    this.sqlite = new sqlite3.Database(this.sqliteConfig.path);
    this.insertStmt = this.sqlite.prepare('INSERT INTO '
      + 'variable(path, parent, type, value) '
      + 'values(?, ?, ?, ?)');
  }

  public init(callback:(err?:Error)=>void) : void {
    this.sqlite.serialize(() => {
      this.sqlite.run('CREATE TABLE IF NOT EXISTS variable('
        + 'path TEXT PRIMERY KEY NOT NULL,'
        + 'parent TEXT NOT NULL,'
        + 'type TEXT NOT NULL,'
        + 'value TEXT NULL'
      + ')', callback);
    });
  }

  public get(path:string, callback:(err:Error, v:IVariable)=>void) : void {
    this.sqlite.get('SELECT * FROM variable WHERE path=?', path, (err:Error, raw:IRawData) => {
      callback.call(this, err, new Variable(raw));
    });
  }

  public del(path:string, callback:(err:Error)=>void) : void {
    this.sqlite.run('DELETE FROM variable WHERE path LIKE ?', path + '%', callback);
  }

  public set(v:IVariable, callback:(err:Error)=>void) : void {
    this.insertStmt.run(v.path, v.parent, v.type, v.value, callback);
  }

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

  public close(done:(err?:Error)=>void) : void {
    this.sqlite.close();
    done(null);
  }


}

export = DataStoreSQLiteAdapter;