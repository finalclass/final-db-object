///<reference path="../types/types-server.d.ts"/>

import sockRouter = require('socket.io-router');
import DataStore = require('./DataStore');
import EventBus = require('./EventBus');
import Config = require('./Config');
import URI = require('URIjs');
import Try = require('try');
import VariablesCollection = require('./VariablesCollection');
import Variable = require('./Variable');

class SocketRoutesManager {

  constructor(
    private socketRouter:sockRouter.SocketRouter,
    private dataStore:DataStore,
    private eventBus:EventBus,
    private config:Config
  ) {
    this.socketRouter.route('get', this.getAction.bind(this));
    this.socketRouter.route('set', this.setAction.bind(this));
    this.socketRouter.route('del', this.delAction.bind(this));
    this.eventBus.on('DataStore.variableSet', this.onVariableSet.bind(this));
    this.eventBus.on('DataStore.variableDel', this.onVariableDel.bind(this));
  }

  private filterPath(url:string) : string {
    return '/' + new URI(url).segment().filter((a:string) => a !== '').join('/');
  }

  private onVariableDel(v:IVariable) : void {
    this.socketRouter.broadcast('child_removed', v.raw);
  }

  private onVariableSet(v:IVariable) : void {
    this.socketRouter.broadcast('value', v.raw);
    this.socketRouter.broadcast('child_added', v.raw);
  }

  private getAction(req:sockRouter.SocketRequest) : void {
    console.log('get', req.data);
    this.dataStore.get(this.filterPath(req.data))
    ((v:IVariable) => {
      req.socket.emit('value', v.raw);
      if (v.type === 'object') {
        return this.dataStore.getChildren(v.path);
      }
    })
    ((children?:VariablesCollection) => {
      if (children && children instanceof VariablesCollection) {
        children.each((v:IVariable) => req.socket.emit('child_added', v.raw))
      }
    });
  }

  private setAction(req:sockRouter.SocketRequest) : void {
    var path = this.filterPath(req.data.path);
    console.log('set', path, req.data.value);
    
    this.dataStore.set(path, req.data.value)
    .catch((err:Error) => {
      console.log(err);
    });
  }

  private delAction(req:sockRouter.SocketRequest) : void {
    var path = this.filterPath(req.data.path);
    var child:IVariable;

    console.log('del', path);

    this.dataStore.get(path)
    ((v:IVariable) => child = v)
    (() => this.dataStore.del(path))
    (() => {
      this.socketRouter.broadcast('del', child.raw);
      this.socketRouter.broadcast('child_removed', child.raw);
    })
    .catch((err:Error) => {
      console.log(err);
    });
  }

}

export = SocketRoutesManager;