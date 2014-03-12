///<reference path="../types/types-server.d.ts"/>

import expressIO = require('express.io');
import DataStore = require('./DataStore');
import Config = require('./Config');
import URI = require('URIjs');
import Try = require('try');

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
    var seg = new URI(url).segment();
    var pref = new URI(this.config.routesPrefix).segment();

    for (var i = 0; i < seg.length; i += 1) {
      if (seg[i] !== pref[i]) {
        break;
      }
    }

    return seg.slice(i).join('/');
  }

  private getAction(req:expressIO.SocketRequest) : void {
    this.dataStore.get(this.filterPath(req.data))
    ((v:IVariable) => req.io.emit('value', v.raw));
  }

  private setAction(req:expressIO.SocketRequest) : void {
    this.dataStore.set(this.filterPath(req.data.path), req.data.value)
    (() => this.dataStore.get(req.data.path))
    ((v:IVariable) => {
      console.log(v);
    });
  }

}

export = SocketRouter;