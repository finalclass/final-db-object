///<reference path="./types/types.d.ts" />

import Config = require('./Config');
import Environment = require('./Environment');
import EventBus = require('./EventBus');
import SQLiteDB = require('./SQLiteDB');
import HTTPRouter = require('./HTTPRouter');

import express = require('express');
import http = require('http');
import socketIO = require('socket.io');

class Server {

  private _config:Config;
  private eventBus:EventBus;
  private expressApp:express.Application;
  private httpServer:http.Server;
  private socket:SocketManager;
  private db:SQLiteDB;
  private httpRouter:HTTPRouter;

  constructor(configData:IConfig, env?:string) {
    this._config = new Config(configData);
    this.env = env || 'development';
    this.expressApp = express();
    this.httpServer = http.createServer(this.expressApp);
    this.socket = socketIO.listen(this.httpServer);
    this.eventBus = new EventBus();
    this.db = new SQLiteDB(this.eventBus, this.config);
    this.httpRouter = new HTTPRouter(this.expressApp, this.db, this.config);
    this.eventBus.on('SQLiteDB.error', this.onError);
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
  // Public methods
  //
  // -----------------------------------------------------
  
  public listen() : void {
    this.eventBus.emit('Server.listenRequest');

    this.eventBus.once('SQLiteDB.ready', function () {
      this.expressApp.listen(this.config.port, function () : void {
        this.eventBus.emit('listen');
      }.bind(this));
    }.bind(this));

  }

  public on(eventType:string, callback:(...args)=>void) {
    this.eventBus.on(eventType, callback);
  }

}

export = Server;