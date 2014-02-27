///<reference path="./types/types.d.ts" />

class Variable {

  private _raw:IRawData;

  constructor(data?:Variable, path?:string);
  constructor(data?:IRawData, path?:string);
  constructor(data?:any, path?:string) {
    this.initData(data, path);
  }

  // -----------------------------------------------------
  // 
  // Accesssors
  //
  // -----------------------------------------------------
  
  public get path() : string {
    return this._raw.path;
  }

  public get parent() : string {
    return this._raw.parent;
  }

  public get type() : string {
    return this._raw.type;
  }

  public get value() : any {
    return this._raw.value;
  }

  // -----------------------------------------------------
  // 
  // Private methods
  //
  // -----------------------------------------------------

  private initData(data?:Variable, path?:string);
  private initData(data?:IRawData, path?:string);
  private initData(data?:any, path?:string) : void {
    var typeofData = typeof data;

    if (data instanceof Variable) {
      this._raw = data.raw;
    } else if (data === null) {
      this._raw = {};
    } else if (typeofData === 'object') {
      path = path || data.path;
      this._raw = {
        path: path,
        parent: this.retrieveParentPath(path),
        type: data.type,
        value: data.value
      };
    } else if (typeofData === 'string' && path) {
      this._raw = {
        path: path,
        parent: this.retrieveParentPath(path),
        type: typeofData,
        value: data,
      };
    } else {
      this._raw = {};
    }
  }

  private retrieveParentPath(path:string) : string {
    return path.substr(0, path.lastIndexOf('.'));
  }

  public get raw() : Object {
    return this._raw;
  }

  public toJSONString() : string {
    return JSON.stringify(this.raw);
  }

  public toString() : string {
    return JSON.stringify(this.raw);
  }
  
}

export = Variable;