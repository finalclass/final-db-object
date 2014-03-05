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
    this.eioApp.io.route('get', this.getAction.bind(this));
  }

  private filterPath(path:string) : string {
    return path.replace(this.config.serverAddress, '');
  }

  private getAction(req:expressIO.SocketRequest) : void {
    var path = this.filterPath(req.data);
    this.dataStore.get(path)
      ((v:IVariable) => req.io.emit('value', v ? v.raw : {path: path}));
  }

}

export = SocketRouter;