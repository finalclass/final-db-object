///<reference path="../types/types-server.d.ts"/>

import DataStoreSQLiteAdapter = require('./DataStoreSQLiteAdapter');
import EventBus = require('./EventBus');
import Config = require('./Config');
import Try = require('try');
import Variable = require('./Variable');

class DataStore {

  private adapter:IDataStoreAdapter;

  constructor(
    private eventBus:EventBus,
    private config:Config
  ) {
    if (config.dataStoreAdapter === 'sqlite') {
      this.adapter = new DataStoreSQLiteAdapter(config.dataStore.sqlite);
    } else {
      throw new Error('Wrong adapter type');
    }

    process.on('exit', () => this.onProcessExit());
  }

  private handleErrorAndProceed(err?:Error, possibleArgument?:any) : void {
    if (err) {
      this.eventBus.emit('DataStore.error', err);
      throw err;
    }
    return possibleArgument;
  }

  public init() : Try.ITry {
    return Try
    (() => this.adapter.init(Try.pause()))
    ((err?:Error) => this.handleErrorAndProceed(err))
    (() => this.eventBus.emit('DataStore.initComplete'))
    .catch((err?:Error) => this.handleErrorAndProceed(err));
  }

  public get(path:string) : Try.ITry {
    return Try
    (() => this.adapter.get(path, Try.pause()))
    ((err:Error, v:IVariable) => this.handleErrorAndProceed(err, v))
    ((v:IVariable) => this.normalizeVariable(v, path));
  }

  private normalizeVariable(v:IVariable, path:string) : IVariable {
    v.path = v.path || path;
    v.parent = v.parent || this.findParentPath(v.path);
    return v;
  }

  private findParentPath(path:string) : string {
    var parts:string[] = (path || '').split('/');
    parts.pop();
    return parts.join('/');
  }

  public del(path:string) : Try.ITry {
    return Try
    (() => this.adapter.del(path, Try.pause()))
    ((err?:Error) => this.handleErrorAndProceed(err));
  }

  public set(path:string, value:any) : Try.ITry {
    return Try
    (() => this.adapter.set(path, value, Try.pause()))
    ((err:Error) => this.handleErrorAndProceed(err));
  }

  public close() : Try.ITry {
    return Try
    (() => this.adapter.close(Try.pause()))
    ((err:Error) => this.handleErrorAndProceed(err));
  }

  public onProcessExit() : void {
    this.close()
    (() => this.eventBus.emit('DataStore.closeComplete'));
  }

}

export = DataStore;