///<reference path="./types/types.d.ts" />

import Variable = require('./Variable');

class VariablesCollection {

  private _raw:Variable[];

  constructor(data?:VariablesCollection);
  constructor(data?:IRawData[]);
  constructor(data?:Variable);
  constructor(data?:any) {
    this.initData(data);
  }

  public get raw() : Variable[] {
    return this._raw;
  }

  public add(variable:Variable) : void {
    this.raw.push(variable);
  }

  public get length() : number {
    return this._raw.length;
  }

  public each(callback:(v:Variable) => void, thisArg?:any) : void {
    for (var i = 0; i < this._raw.length; i += 1) {
      callback.call(thisArg, this._raw[i]);
    }
  }

  private initData(data?:VariablesCollection);
  private initData(data?:IRawData[]);
  private initData(data?:Variable);
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
    } else if (data) {
      this._raw = [new Variable(data)];
    } else {
      this._raw = [];
    }
  }

}

export = VariablesCollection;