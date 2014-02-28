///<reference path="../types/types.d.ts" />

import Config = require('./Config');
import Environment = require('./Environment');
import EventBus = require('./EventBus');
import DataStore = require('./DataStore');
import HTTPRouter = require('./HTTPRouter');

import expressIO = require('express.io');
import http = require('http');
 
class Server {

  private _config:Config;
  private eventBus:EventBus;
  private eioApp:expressIO.Application;
  private dataStore:DataStore;
  private httpRouter:HTTPRouter;

  constructor(configData:IConfig, env?:string) {
    this._config = new Config(configData);
    this.env = env || 'development';
    this.eioApp = expressIO();
    this.configureExpressApp();
    this.eioApp.http().io();
    this.eventBus = new EventBus();
    this.dataStore = new DataStore(this.eventBus, this.config);
    this.httpRouter = new HTTPRouter(this.eioApp, this.dataStore, this.config);
    this.eventBus.on('DataStore.initError', this.onError);
    this.dataStore.init();
  }

  // -----------------------------------------------------
  // 
  // Properties
  //
  // -----------------------------------------------------

  public get config() : Config {
    return this._config;
  }

  // ---------------------------
  // env
  // ---------------------------
  public get env() : string {
    return this.config.env.toString();
  }

  public set env(env:string) {
    this.config.env = Environment.fromString(env);
  }

  // -----------------------------------------------------
  // 
  // Event Handlers
  //
  // -----------------------------------------------------
  
  private onError(err:Error) : void {
    console.log('FinalDBObject error', err, (<any>err).stack);
  }

  // -----------------------------------------------------
  // 
  // Private methods
  //
  // -----------------------------------------------------
  
  private configureExpressApp() : void {
    this.eioApp.use(expressIO.bodyParser({
      keepExtensions: true, 
      uploadDir: __dirname + '/var/files',
      strict: false
    }));
  }

  // -----------------------------------------------------
  // 
  // Public methods
  //
  // -----------------------------------------------------
  
  public listen() : void {
    this.eventBus.emit('Server.listenRequest');

    this.eventBus.once('SQLiteDB.ready', function () {
      this.eioApp.listen(this.config.port, function () : void {
        this.eventBus.emit('listen');
      }.bind(this));
    }.bind(this));

  }

  public on(eventType:string, callback:(...args)=>void) {
    this.eventBus.on(eventType, callback);
  }

}

export = Server;