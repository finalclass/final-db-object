///<reference path="../types/types-server.d.ts"/>

import sqlite3 = require('sqlite3');
import Variable = require('./Variable');
import VariablesCollection = require('./VariablesCollection');

class DataStoreSQLiteAdapter implements IDataStoreAdapter {

  private sqlite:sqlite3.Database;

  constructor(private sqliteConfig:IDataStoreSQLiteConfig) {
    this.sqlite = new sqlite3.Database(this.sqliteConfig.path);
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

  public set(path:string, value:any, callback:(err:Error)=>void) : void {
    var collection:VariablesCollection = this.objectToVarCollection(value, path);
    var insertStmt:sqlite3.Statement = this.sqlite.prepare('INSERT INTO '
      + 'variable(path, parent, type, value) '
      + 'values(?, ?, ?, ?)');
    var savedQueries:number = 0;

    var isError:boolean = false;

    collection.each((v:IVariable) => {
      this.get(v.path, (err:Error, v:IVariable) => {
        this.sqlite.serialize(() => {
          if (isError) {
            return;
          }

          if (v) {
            this.del(v.path, (err:Error) => {
              if (err) {
                isError = true;
                callback.call(this, err);
              }
            });
          }
          insertStmt.run(v.path, v.parent, v.type, v.value, (err) => {
            if (err) {
              isError = true;
              callback.call(this, err);
            }
            savedQueries += 1;
            if (savedQueries === collection.length) {
              callback.call(this, null);
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

  public close(done:(err?:Error)=>void) : void {
    this.sqlite.close();
    done(null);
  }


}

export = DataStoreSQLiteAdapter;