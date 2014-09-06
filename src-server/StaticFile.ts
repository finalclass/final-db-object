///<reference path="typings/tsd.d.ts"/>

import path = require('path');

class StaticFile {

  constructor(
    private _name:string, 
    private _path:string
  ) {

  }

  public get fullPath() : string {
    return path.resolve(__dirname, '..', '..', this._path);
  }

  public get name() : string {
    return this._name;
  }

}

export = StaticFile;