///<reference path="../types/types-server.d.ts"/>

import expressIO = require('express.io');
import DataStore = require('./DataStore');
import Config = require('./Config');

class SocketRouter {

  constructor(
    private eioApp:expressIO.Application,
    private dataStore:DataStore,
    private config:Config
  ) {
    this.eioApp.io.route('get', this.getAction);
  }

  private filterPath(path:string) : string {
    return path.replace(this.config.serverAddress, '');
  }

  private getAction(req:expressIO.SocketRequest) : void {
    this.dataStore.get(this.filterPath(req.data))
    ((v:IVariable) => {
      if (v) {
        req.io.emit('value', v.raw)
      } else {
        req.io.emit('value', {path: req.data});
      }
    });
  }

}

export = SocketRouter;