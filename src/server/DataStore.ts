///<reference path="../types/types-server.d.ts"/>

import DataStoreSQLiteAdapter = require('./DataStoreSQLiteAdapter');
import EventBus = require('./EventBus');
import Config = require('./Config');
import Try = require('try');
import Variable = require('./Variable');
import VariablesCollection = require('./VariablesCollection');

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
    (() => this.eventBus.emit('DataStore.initComplete'));
  }

  public getChildren(path:string) : Try.ITry {
    return Try
    (() => this.adapter.getChildren(path, Try.pause()))
    ((err:Error, vars:IVariablesCollection) => this.handleErrorAndProceed(err, vars));
  }

  public get(path:string) : Try.ITry {
    return Try
    (() => this.adapter.get(path, Try.pause()))
    ((err:Error, v:IVariable) => this.handleErrorAndProceed(err, v))
    ((v:IVariable) => this.normalizeVariable(v, path));
  }

  private normalizeVariable(v:IVariable, path:string) : IVariable {
    v.raw.path = v.path || path;
    v.raw.parent = v.parent || this.findParentPath(v.path);
    v.raw.type = v.type || 'object';
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
    ((err?:Error) => this.handleErrorAndProceed(err))
    (() => this.eventBus.emit('DataStore.variableDel', this.normalizeVariable(new Variable(), path)));
  }

  public set(path:string, value:any) : Try.ITry {
    var collection:VariablesCollection = this.objectToVarCollection(value, path);

    return Try
    (() => this.adapter.del(path, Try.pause()))
    (Try.throwFirstArgument)
    (() => collection.each((v:IVariable) => {
      var resume:(err?:Error)=>void = Try.pause();
      this.adapter.set(v, (err?:Error) => {
        this.eventBus.emit('DataStore.variableSet', v);
        resume(err)
      });
    }))
    ([Try.throwFirstArgumentInArray])
    .catch((err:Error) => this.handleErrorAndProceed(err))
    (() => collection);
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

  private objectToVarCollection(data:any, path:string, collection?:VariablesCollection) : VariablesCollection {
    collection = collection || new VariablesCollection();
    var typeofData = typeof data;

    if (typeofData === 'string' || typeofData === 'number' || typeofData === 'boolean') {
      collection.add(new Variable(data, path));
    }

    if (typeofData === 'object') {
      collection.add(new Variable({path: path, type: 'object'}));
      Object.keys(data).forEach((key:string) => {
        this.objectToVarCollection(data[key], path + '/' + key, collection);
      }, this);
    }

    return collection;
  }

}

export = DataStore;