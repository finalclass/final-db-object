///<reference path="../types/types-server.d.ts" />

import Variable = require('./Variable');

class VariablesCollection {

  private _raw:IVariable[];

  constructor(data?:VariablesCollection);
  constructor(data?:IRawData[]);
  constructor(data?:IVariable);
  constructor(data?:any) {
    this.initData(data);
  }

  public get raw() : IVariable[] {
    return this._raw;
  }

  public add(variable:IVariable) : void {
    this.raw.push(variable);
  }

  public get length() : number {
    return this._raw.length;
  }

  public each(callback:(v:IVariable) => void, thisArg?:any) : void {
    for (var i = 0; i < this._raw.length; i += 1) {
      callback.call(thisArg, this._raw[i]);
    }
  }

  public map(callback:(v:IVariable) => void, thisArg?:any) : any {
    return this._raw.map(callback, thisArg);
  }

  private initData(data?:VariablesCollection);
  private initData(data?:IRawData[]);
  private initData(data?:IVariable);
  private initData(data?:any) {
    if (data instanceof VariablesCollection) {
      this._raw = data.raw;
    } else if (data instanceof Array) {
      this._raw = [];
      data.forEach((record) => {
        this._raw.push(record instanceof Variable ? record : new Variable(record));
      }, this);
    } else if (data instanceof Variable) {
      this._raw = [data];
    } else if (data && data.path) {
      this._raw = [new Variable(data, data.path)];
    } else {
      this._raw = [];
    }
  }

}

export = VariablesCollection;