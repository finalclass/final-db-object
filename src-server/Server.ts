///<reference path="typings/tsd.d.ts"/>

import Config = require('./Config');
import Environment = require('./Environment');
import EventBus = require('./EventBus');
import DataStore = require('./DataStore');
import HTTPRouter = require('./HTTPRouter');
import SocketRoutesManager = require('./SocketRoutesManager');
import sockRouter = require('socket.io-router');
import Try = require('try');
import express = require('express');
import socketIO = require('socket.io');
import http = require('http');
import domain = require('domain');
import StaticFilesServer = require('./StaticFilesServer');
import IConfig = require('./interfaces/IConfig');
import bodyParser = require('body-parser');

class Server {

  private _config:Config;
  private eventBus:EventBus;
  private _expressApp:express.Application;
  private io:socketIO.SocketManager;
  private httpServer:http.Server;
  private dataStore:DataStore;
  private httpRouter:HTTPRouter;
  private socketRouter:sockRouter.SocketRouter;
  private socketRoutesManager:SocketRoutesManager;
  private staticFilesServer:StaticFilesServer;

  constructor(
    configData:IConfig, 
    env?:string,
    expressApp?:express.Application, 
    httpServer?:http.Server,
    io?:socketIO.SocketManager
  ) {
    this._config = new Config(configData);
    this.env = env || 'development';
    this._expressApp = expressApp || express();
    this.httpServer = httpServer || http.createServer(this._expressApp);
    this.eventBus = new EventBus();
    this.io = io || socketIO.listen(this.httpServer);
    this.configureExpressApp();
    this.dataStore = new DataStore(this.eventBus, this.config);
    this.staticFilesServer = new StaticFilesServer(this.config, this.expressApp);
    this.httpRouter = new HTTPRouter(this.expressApp, this.dataStore, this.config);
    this.socketRouter = new sockRouter.SocketRouter(this.io);
    this.socketRoutesManager = new SocketRoutesManager(this.socketRouter, this.dataStore, this.eventBus, this.config);
    
    this.eventBus.on('DataStore.initError', this.onError.bind(this));
    this.eventBus.on('DataStore.initComplete', this.onDataStoreInitComplete.bind(this));

    this.dataStore.init();
  }

  // -----------------------------------------------------
  // 
  // Properties
  //
  // -----------------------------------------------------

  public get expressApp() : express.Application {
    return this._expressApp;
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

  private onDataStoreInitComplete() : void {
    this.eventBus.emit('initComplete');
  }

  // -----------------------------------------------------
  // 
  // Private methods
  //
  // -----------------------------------------------------
  
  private configureExpressApp() : void {
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(this.domainSupportMiddleware.bind(this));
    this.expressApp.use(this.httpErrorHandler.bind(this));
  }

  private httpErrorHandler(err:Error, req:express.Request, res:express.Response, next:(err?:Error)=>void) : void {
    console.log('HTTP_ERROR', err, (<any>err).stack);
    res.json(500, {status: 'error', reason: 'internal_server_error'});
  }

  private domainSupportMiddleware(req:express.Request, res:express.Response, next:(err?:Error)=>void) : void {
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
    this.httpServer.listen(this.config.port, () => {
      this.eventBus.emit('listen');
    });
  }

  public on(eventType:string, callback:(...args)=>void) {
    this.eventBus.on(eventType, callback);
  }

}

export = Server;