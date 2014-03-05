///<reference path="../types/types-server.d.ts"/>

import Environment = require('./Environment');

class Config implements IEnvironmentConfig {

  private _env:Environment;
  private realConfig:IEnvironmentConfig;
 
  constructor(private data:IConfig) {
    
  }

  // -----------------------------------------------------
  // 
  // Properties
  // 
  // -----------------------------------------------------

  // ---------------------------
  // serverAddress
  // ---------------------------
  public get serverAddress() : string {
    return this.protocol + '://' + this.host + ':' + this.port + '/' + this.routesPrefix;
  }

  // ---------------------------
  // protocol
  // ---------------------------
  public get protocol() : string {
    return this.realConfig.protocol || 'http://';
  }

  // ---------------------------
  // host
  // ---------------------------
  public get host() : string {
    return this.realConfig.host;
  }  

  // ---------------------------
  // env
  // ---------------------------
  public get env() : Environment {
    return this._env;
  }

  public set env(env:Environment) {
    this._env = env;
    this.updateRealConfig();
  }

  // ---------------------------
  // port
  // ---------------------------
  public get port() : number {
    return this.realConfig.port || 8181;
  }

  // ---------------------------
  // dataStoreAdapter
  // ---------------------------
  public get dataStoreAdapter() : string {
    return this.realConfig.dataStoreAdapter;
  }

  // ---------------------------
  // routesPrefix
  // ---------------------------
  public get routesPrefix() : string {
    return this.realConfig.routesPrefix || 'fdbo';
  }

  // ---------------------------
  // dataStore
  // ---------------------------
  public get dataStore() : IDataStoreConfig {
    return this.realConfig.dataStore || {};
  }
  
  // -----------------------------------------------------
  // 
  // Private methods
  //
  // -----------------------------------------------------

  private updateRealConfig() : void {
    this.realConfig = {};
    this.copyConfig(Environment.DEVELOPMENT, this.realConfig);
    if (this.env !== Environment.DEVELOPMENT) {
      this.copyConfig(this.env, this.realConfig);
    }
  }

  private copyConfig(env:Environment, target:IEnvironmentConfig) : IEnvironmentConfig {
    var envConfig = this.data[env.toString()];

    Object.keys(envConfig).forEach(function (key:string) : void {
      target[key] = envConfig[key];
    }, this);

    return target;
  }

}

export = Config;