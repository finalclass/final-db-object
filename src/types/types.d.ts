/// <reference path="./node.d.ts"/>
/// <reference path="./socket.io.d.ts"/>
/// <reference path="./express.d.ts"/>
/// <reference path="./sqlite3.d.ts"/>

interface IEnvironmentConfig {
  dbPath?:string;
  port?:number;
  routesPrefix?:string;
}

interface IConfig {
  development:IEnvironmentConfig;
  staging:IEnvironmentConfig;
  production:IEnvironmentConfig;
}

interface IRawData {
  path?:string;
  parent?:string;
  type?:string;
  value?:any;
}