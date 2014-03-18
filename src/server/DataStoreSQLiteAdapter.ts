///<reference path="../types/types-server.d.ts"/>

import sqlite3 = require('sqlite3');
import Variable = require('./Variable');
import Try = require('try');
import VariablesCollection = require('./VariablesCollection');

class DataStoreSQLiteAdapter implements IDataStoreAdapter {

  private sqlite:sqlite3.Database;
  private insertStmt:sqlite3.Statement;
  private getStmt:sqlite3.Statement;
  private delStmt:sqlite3.Statement;
  private getChildrenStmt:sqlite3.Statement;

  constructor(private sqliteConfig:IDataStoreSQLiteConfig) {
    this.sqlite = new sqlite3.Database(this.sqliteConfig.path);
  }

  public init(callback:(err?:Error)=>void) : void {
    this.sqlite.run('CREATE TABLE IF NOT EXISTS variable('
        + 'path TEXT PRIMERY KEY NOT NULL,'
        + 'parent TEXT NOT NULL,'
        + 'type TEXT NOT NULL,'
        + 'value TEXT NULL'
      + ')', (err?:Error) => {
        this.prepareStmts();
        callback(err);
      });
  }

  private prepareStmts() : void {
    this.insertStmt = this.sqlite.prepare('INSERT INTO '
      + 'variable(path, parent, type, value) '
      + 'values(?, ?, ?, ?)');
    this.getChildrenStmt = this.sqlite.prepare('SELECT * FROM variable WHERE parent=?');
    this.getStmt = this.sqlite.prepare('SELECT * FROM variable WHERE path=?');
    this.delStmt = this.sqlite.prepare('DELETE FROM variable WHERE path LIKE ?');
  }

  public get(path:string, callback:(err:Error, v:IVariable)=>void) : void {
    this.getStmt.get(path, (err:Error, raw:IRawData) => {
      callback.call(this, err, new Variable(raw));
    });
  }

  public getChildren(parent:string, callback:(err:Error, vars?:IVariablesCollection)=>void) : void {
    this.getChildrenStmt.all(parent, (err:Error, records:IRawData[]) => {
      callback.call(null, err, new VariablesCollection(records));
    });
  }

  public del(path:string, callback:(err:Error)=>void) : void {
    this.delStmt.run(path + '%', callback);
  }

  public set(v:IVariable, callback:(err:Error)=>void) : void {
    this.insertStmt.run(v.path, v.parent, v.type, v.value, callback);
  }

  public close(done:(err?:Error)=>void) : void {
    this.sqlite.close();
    done(null);
  }

}

export = DataStoreSQLiteAdapter;