import IEnvironmentConfig = require('./IEnvironmentConfig');

interface IConfig {
  development:IEnvironmentConfig;
  staging:IEnvironmentConfig;
  production:IEnvironmentConfig;
}

export = IConfig;