///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEventEmitter.ts"/>
///<reference path="FDBOConnection.ts"/>
///<reference path="FDBOUtils.ts"/>


class FinalDBObject extends FDBOEventEmitter {

  private children:HashTable<FinalDBObject>;
  private _value:any;
  private url:URI;
  private selfSetCallback:(err?:Error)=>void;

  constructor(url:string) {
    super();
    this.url = new URI(url);
    this.connection.registerObject(this);
  }

  private get connection() : FDBOConnection {
    return FDBOConnection.getConnection(this.url);
  }

  public get uri() : URI {
    return this.url;
  }

  public child(name:string) : FinalDBObject {
    return this.connection.hash.getOrCreate([this.url.toString(), name].join('/'));
  }

  public set(value:any) : void {
    this.connection.set(this.uri, value);
  }

  public get parent() : FinalDBObject {
    return this.connection.hash.get(FDBOUtils.getParentPath(this.url.toString()));
  }

  public get value() : string {
    return this._value;
  }

  public silentSetValue(value:any) : void {
    this._value = value;
  }

}