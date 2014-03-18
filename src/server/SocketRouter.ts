///<reference path="../types/types-server.d.ts"/>

import expressIO = require('express.io');
import DataStore = require('./DataStore');
import EventBus = require('./EventBus');
import Config = require('./Config');
import URI = require('URIjs');
import Try = require('try');
import VariablesCollection = require('./VariablesCollection');
import Variable = require('./Variable');

class SocketRouter {

  constructor(
    private eioApp:expressIO.Application,
    private dataStore:DataStore,
    private eventBus:EventBus,
    private config:Config
  ) {
    this.eioApp.io.route('get', this.getAction.bind(this));
    this.eioApp.io.route('set', this.setAction.bind(this));
    this.eioApp.io.route('del', this.delAction.bind(this));
    this.eventBus.on('DataStore.variableSet', this.onVariableSet.bind(this));
    this.eventBus.on('DataStore.variableDel', this.onVariableDel.bind(this));
  }

  private filterPath(url:string) : string {
    return '/' + new URI(url).segment().filter((a:string) => a !== '').join('/');
  }

  private onVariableDel(v:IVariable) : void {
    this.eioApp.io.broadcast('child_removed', v.raw);
  }

  private onVariableSet(v:IVariable) : void {
    this.eioApp.io.broadcast('value', v.raw);
    this.eioApp.io.broadcast('child_added', v.raw);
  }

  private getAction(req:expressIO.SocketRequest) : void {
    console.log('get', req.data);
    this.dataStore.get(this.filterPath(req.data))
    ((v:IVariable) => {
      req.io.emit('value', v.raw);
      if (v.type === 'object') {
        return this.dataStore.getChildren(v.path);
      }
    })
    ((children?:VariablesCollection) => {
      if (children && children instanceof VariablesCollection) {
        children.each((v:IVariable) => req.io.emit('child_added', v.raw))
      }
    });
  }

  private setAction(req:expressIO.SocketRequest) : void {
    var path = this.filterPath(req.data.path);
    this.dataStore.set(path, req.data.value)
    .catch((err:Error) => {
      console.log(err);
    });
  }

  private delAction(req:expressIO.SocketRequest) : void {
    var path = this.filterPath(req.data.path);
    var child:IVariable;

    this.dataStore.get(path)
    ((v:IVariable) => child = v)
    (() => this.dataStore.del(path))
    (() => {
      this.eioApp.io.broadcast('del', child.raw);
      this.eioApp.io.broadcast('child_removed', child.raw);
    })
    .catch((err:Error) => {
      console.log(err);
    });
  }

}

export = SocketRouter;