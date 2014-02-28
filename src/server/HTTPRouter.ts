///<reference path="../types/types.d.ts" />

import DataStore = require('./DataStore');
import express = require('express');
import Config = require('./Config');
import Variable = require('../common/Variable');

class HTTPRouter {

  constructor(
    private expressApp:express.Application,
    private dataStore:DataStore,
    private config:Config
  ) {

    this.expressApp.get('/' + this.config.routesPrefix + '/final-db-object.js',
      this.getClientScriptAction.bind(this));
    
    this.expressApp.get(
      '/' + this.config.routesPrefix + '/:path',
      this.findByPathMiddleware.bind(this),
      this.getAction.bind(this));

    this.expressApp.put(
      '/' + this.config.routesPrefix + '/:path',
      this.setAction.bind(this));

    this.expressApp.del(
      '/' + this.config.routesPrefix + '/:path', 
      this.findByPathMiddleware.bind(this),
      this.delAction.bind(this));
  }

  private findByPathMiddleware(req:express.Request, res:express.Response, next:(err?:Error)=>void) : void {
    this.dataStore.get(<string>req.params.path)
    ((v:Variable) => {
      if (!v) {
        res.json(404, {status: 'error', reason: 'not_found'});
        next(new Error('not_found'));
      } else {
        req.params.variable = v;
        next();
      }
    })
    .catch(this.getErrorHandlerFunction(req, res))
    .run();
  }

  private getClientScriptAction(req:express.Request, res:express.Response) : void {
    
  }

  private delAction(req:express.Request, res:express.Response) : void {
    this.dataStore.del(<string>req.params.path)
    (()=> res.send(204))
    .catch(this.getErrorHandlerFunction(req, res))
    .run();
  }

  private getAction(req:express.Request, res:express.Response) : void {
    res.json(200, req.params.variable.raw);
  }

  private setAction(req:express.Request, res:express.Response) : void {
    this.dataStore.set(<string>req.params.path, req.body)
    (() => res.send(204))
    .catch(this.getErrorHandlerFunction(req, res))
    .run();
  }

  private getErrorHandlerFunction(req:express.Request, res:express.Response) : ()=>void {
    return (err?:Error, ...args) => {
      if (err) {
        console.log('HTTPRouter ERROR', err, (<any>err).stack);
        res.json(500, {status: 'error', reason: 'internal_server_error'});
      }
    };
  }

}

export = HTTPRouter;