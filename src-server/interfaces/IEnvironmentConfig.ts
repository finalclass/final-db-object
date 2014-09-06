import IDataStoreConfig = require('./IDataStoreConfig');

interface IEnvironmentConfig {
  dbPath?:string;
  port?:number;
  routesPrefix?:string;
  dataStoreAdapter?:string;
  dataStore?:IDataStoreConfig;
  protocol?:string;
  host?:string;
}

export = IEnvironmentConfig;