///<reference path="../types/types-server.d.ts"/>

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

}

export = StaticFile;