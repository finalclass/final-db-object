///<reference path="../types/types-server.d.ts"/>

import expressIO = require('express.io');
import DataStore = require('./DataStore');
import Config = require('./Config');
import URI = require('URIjs');
import Try = require('try');
import VariablesCollection = require('./VariablesCollection');

class SocketRouter {

  constructor(
    private eioApp:expressIO.Application,
    private dataStore:DataStore,
    private config:Config
  ) {
    this.eioApp.io.route('get', this.getAction.bind(this));
    this.eioApp.io.route('set', this.setAction.bind(this));
  }

  private filterPath(url:string) : string {
    return new URI(url).path();
  }

  private getAction(req:expressIO.SocketRequest) : void {
    console.log('get', req.data);
    this.dataStore.get(this.filterPath(req.data))
    ((v:IVariable) => req.io.emit('value', v.raw));
  }

  private setAction(req:expressIO.SocketRequest) : void {
    console.log('set');
    var path = this.filterPath(req.data.path);
    this.dataStore.set(path, req.data.value)
    ((collection:VariablesCollection) => {
      collection.each((v:IVariable) => this.eioApp.io.broadcast('value', v.raw));
    })
    .catch((err:Error) => {
      console.log(err);
    });
  }

}

export = SocketRouter;