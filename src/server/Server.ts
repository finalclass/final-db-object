///<reference path="../types/types-server.d.ts"/>

import Config = require('./Config');
import Environment = require('./Environment');
import EventBus = require('./EventBus');
import DataStore = require('./DataStore');
import HTTPRouter = require('./HTTPRouter');
import SocketRouter = require('./SocketRouter');
import Try = require('try');
import expressIO = require('express.io');
import http = require('http');
import domain = require('domain');

class Server {

  private _config:Config;
  private eventBus:EventBus;
  private _eioApp:expressIO.Application;
  private dataStore:DataStore;
  private httpRouter:HTTPRouter;
  private socketRouter:SocketRouter;

  constructor(configData:IConfig, env?:string) {
    this._config = new Config(configData);
    this.env = env || 'development';
    this._eioApp = expressIO();
    this.configureExpressApp();
    this.eioApp.http().io();
    this.eventBus = new EventBus();
    this.dataStore = new DataStore(this.eventBus, this.config);
    this.httpRouter = new HTTPRouter(this.eioApp, this.dataStore, this.config);
    this.socketRouter = new SocketRouter(this.eioApp, this.dataStore, this.config);
    this.eventBus.on('DataStore.initError', this.onError);
  }

  // -----------------------------------------------------
  // 
  // Properties
  //
  // -----------------------------------------------------

  public get eioApp() : expressIO.Application {
    return this._eioApp;
  }

  public get config() : Config {
    return this._config;
  }
  
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
    this.eioApp.use(this.domainSupportMiddleware.bind(this));
    this.eioApp.use(this.httpErrorHandler.bind(this));
  }

  private httpErrorHandler(err:Error, req:expressIO.Request, res:expressIO.Response, next:(err?:Error)=>void) : void {
    console.log('HTTP_ERROR', err, (<any>err).stack);
    res.json(500, {status: 'error', reason: 'internal_server_error'});
  }

  private domainSupportMiddleware(req:expressIO.Request, res:expressIO.Response, next:(err?:Error)=>void) : void {
    var d = domain.create();
    d.add(<any>req);
    d.add(res);
    d.on('error', next);
    d.run(next);
  }

  // -----------------------------------------------------
  // 
  // Public methods
  //
  // -----------------------------------------------------
  
  public listen() : void {
    this.eventBus.emit('Server.listenRequest');

    this.dataStore.init()
    (() => this.eioApp.listen(this.config.port, Try.pause()))
    (() => this.eventBus.emit('listen'));
  }

  public on(eventType:string, callback:(...args)=>void) {
    this.eventBus.on(eventType, callback);
  }

}

export = Server;