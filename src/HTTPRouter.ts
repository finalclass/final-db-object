///<reference path="./types/types.d.ts" />

import SQLiteDB = require('./SQLiteDB');
import express = require('express');
import Config = require('./Config');
import Variable = require('./Variable');

class HTTPRouter {

  constructor(
    private expressApp:express.Application,
    private db:SQLiteDB,
    private config:Config
  ) {
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
    this.db.get(req.params.path, this.handleError(req, res, (v:Variable) : void => {
      if (!v) {
        res.json(404, {status: 'error', reason: 'not_found'});
        next(new Error('not_found'));
      } else {
        req.params.variable = v;
        next();
      }
    }), this);
  }

  private delAction(req:express.Request, res:express.Response) : void {
    this.db.del(req.params.path, this.handleError(req, res, () : void => {
      res.send(204);
    }), this);
  }

  private getAction(req:express.Request, res:express.Response) : void {
    res.json(200, req.params.variable.raw);
  }

  private setAction(req:express.Request, res:express.Response) : void {
    this.db.set(req.params.path, req.body, this.handleError(req, res, () : void => {
      res.send(204);
    }), this);
  }

  private handleError(req:express.Request, res:express.Response, callback:(...args)=>void) : ()=>void {
    var thisArg:HTTPRouter = this;

    return (err?:Error, ...args) => {
      if (err) {
        console.log('HTTPRouter ERROR', err, (<any>err).stack);
        res.json(500, {status: 'error', reason: 'internal_server_error'});
      } else {
        callback.apply(thisArg, args);
      }
    };
  }

}

export = HTTPRouter;