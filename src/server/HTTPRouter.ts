///<reference path="../types/types-server.d.ts"/>
///<reference path="../types/hash-table.d.ts"/>

import DataStore = require('./DataStore');
import expressIO = require('express.io');
import Config = require('./Config');
import Variable = require('./Variable');

class HTTPRouter {

  constructor(
    private expressApp:expressIO.Application,
    private dataStore:DataStore,
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

  private findByPathMiddleware(req:expressIO.Request, res:expressIO.Response, next:(err?:Error)=>void) : void {
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
    .catch(this.getErrorHandlerFunction(req, res));
  }

  private delAction(req:expressIO.Request, res:expressIO.Response) : void {
    this.dataStore.del(<string>req.params.path)
    (()=> res.send(204))
    .catch(this.getErrorHandlerFunction(req, res));
  }

  private getAction(req:expressIO.Request, res:expressIO.Response) : void {
    res.json(200, req.params.variable.raw);
  }

  private setAction(req:expressIO.Request, res:expressIO.Response) : void {
    this.dataStore.set(<string>req.params.path, req.body)
    (() => res.send(204))
    .catch(this.getErrorHandlerFunction(req, res));
  }

  private getErrorHandlerFunction(req:expressIO.Request, res:expressIO.Response) : ()=>void {
    return (err?:Error, ...args) => {
      if (err) {
        console.log('HTTPRouter ERROR', err, (<any>err).stack);
        res.json(500, {status: 'error', reason: 'internal_server_error'});
      }
    };
  }

}

export = HTTPRouter;