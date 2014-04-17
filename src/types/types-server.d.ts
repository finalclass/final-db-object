/// <reference path="node.d.ts"/>
/// <reference path="sqlite3.d.ts"/>
/// <reference path="express.d.ts"/>
/// <reference path="socket.io-server.d.ts"/>
/// <reference path="socket.io-router.d.ts"/>
/// <reference path="try.d.ts"/>
/// <reference path="URI.d.ts"/>

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

interface IVariablesCollection {
  raw:IVariable[];
  length:number;
  add(variable:IVariable) : void;
  each(callback:(v:IVariable) => void, thisArg?:any) : void;
  map(callback:(v:IVariable) => void, thisArg?:any) : any;
}

interface IDataStoreAdapter {
  init(callback:(err?:Error)=>void) : void;
  get(path:string, callback:(err:Error, v:IVariable)=>void) : void;
  getChildren(path:string, callback:(err:Error, vars?:IVariablesCollection)=>void) : void;
  del(path:string, callback:(err:Error)=>void) : void;
  set(v:IVariable, callback:(err:Error)=>void) : void;
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