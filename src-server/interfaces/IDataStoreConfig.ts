import IDataStoreSQLiteConfig = require('./IDataStoreSQLiteConfig');

interface IDataStoreConfig {
  sqlite?:IDataStoreSQLiteConfig;
}

export = IDataStoreConfig;