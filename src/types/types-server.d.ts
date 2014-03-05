/// <reference path="node.d.ts"/>
/// <reference path="sqlite3.d.ts"/>
/// <reference path="express.io.d.ts"/>
/// <reference path="try.d.ts"/>

interface IRawData {
  path?:string;
  parent?:string;
  type?:string;
  value?:any;
}

interface IVariable extends IRawData {
  path:string;
  parent:string;
  type:string;
  value:any;
  raw:IRawData;
  toJSONString() : string;
  toString() : string;
}

interface IDataStoreAdapter {
  init(callback:(err?:Error)=>void) : void;
  get(path:string, callback:(err:Error, v:IVariable)=>void) : void;
  del(path:string, callback:(err:Error)=>void) : void;
  set(path:string, value:any, callback:(err:Error)=>void) : void;
  close(done:(err?:Error)=>void) : void;
}

interface IDataStoreSQLiteConfig {
  path:string;
}

interface IDataStoreConfig {
  sqlite?:IDataStoreSQLiteConfig;
}

interface IEnvironmentConfig {
  dbPath?:string;
  port?:number;
  routesPrefix?:string;
  dataStoreAdapter?:string;
  dataStore?:IDataStoreConfig;
  protocol?:string;
  host?:string;
}

interface IConfig {
  development:IEnvironmentConfig;
  staging:IEnvironmentConfig;
  production:IEnvironmentConfig;
}