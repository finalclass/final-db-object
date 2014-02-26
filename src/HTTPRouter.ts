///<reference path="./types/types.d.ts" />

import SQLiteDB = require('./SQLiteDB');
import express = require('express');
import Config = require('./Config');

class HTTPRouter {

  constructor(
    private expressApp:express.Application, 
    private db:SQLiteDB,
    private config:Config
  ) {
    this.expressApp.get('/' + this.config.routesPrefix + '/:path', this.getAction.bind(this));
  }

  private getAction(req:express.Request, res:express.Response) : void {
    this.db.get(req.params.path, (result:any) {
      res.json(200, result);
    });
  }

}

export = HTTPRouter;