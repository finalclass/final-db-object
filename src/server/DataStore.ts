///<reference path="../types/types.d.ts" />

import DataStoreSQLiteAdapter = require('./DataStoreSQLiteAdapter');
import EventBus = require('./EventBus');
import Config = require('./Config');
import Try = require('try');
import Variable = require('../common/Variable');

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

  private getErrorEmitterFunction() : (err?:Error)=>void {
    return (err?:Error) => {
      if (err) {
        this.eventBus.emit('DataStore.initError', err)
        throw err;
      }
    };
  }

  public init() : Try.ITry {
    return Try
    (() => this.adapter.init(Try.pause()))
    ((err?:Error) => {if (err) throw err;})
    (() => this.eventBus.emit('DataStore.initComplete'))
    .catch(this.getErrorEmitterFunction())
    .run();
  }

  public get(path:string) : Try.ITry {
    return Try
    (() => this.adapter.get(path, Try.pause()))
    ((err:Error, v:IVariable) => {
      this.getErrorEmitterFunction()(err);
      return v
    })
    .run();
  }

  public del(path:string) : Try.ITry {
    return Try
    (() => this.adapter.del(path, Try.pause()))
    (this.getErrorEmitterFunction())
    .run();
  }

  public set(path:string, value:any) : Try.ITry {
    return Try
    (() => this.adapter.set(path, value, Try.pause()))
    (this.getErrorEmitterFunction())
    .run();
  }

  public close() : Try.ITry {
    return Try
    (() => this.adapter.close(Try.pause()))
    (this.getErrorEmitterFunction())
    .run();
  }

  public onProcessExit() : void {
    this.close()
    (() => this.eventBus.emit('DataStore.closeComplete'));
  }

}

export = DataStore;