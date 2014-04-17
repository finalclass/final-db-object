///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEventEmitter.ts"/>
///<reference path="FDBOConnection.ts"/>
///<reference path="FDBOUtils.ts"/>


class FinalDBObject extends FDBOEventEmitter {

  private _value:any;
  private url:URI;
  private selfSetCallback:(err?:Error)=>void;

  constructor(url:string, initialValue?:any) {
    super();
    this.url = new URI(url);
    this.connection.registerObject(this);
    this._value = initialValue;
  }

  public static generateRandomId() {
    var d = new Date().getTime().toString(36);
    var r = Math.floor(Math.random() * 1e8).toString(36);
    return d + r;
  }

  private get connection() : FDBOConnection {
    return FDBOConnection.getConnection(this.url);
  }

  public on(message:string, callback:(event:FDBOEvent)=>void) : void {
    super.on(message, callback);
    if (message === 'value' || message === 'child_added') {
      this.connection.get(this.uri);
    }
  }

  public once(message:string, callback:(event:FDBOEvent)=>void) : void {
    super.once(message, callback);
    if (message === 'value' || message === 'child_added') {
      this.connection.get(this.uri);
    }
  }

  public get uri() : URI {
    return this.url;
  }

  public get name() : string {
    var seg = this.url.segment();
    return seg[seg.length - 1];
  }

  public child(name:string) : FinalDBObject {
    return this.connection.hash.getOrCreate([this.url.toString(), name].join('/'));
  }

  public get children() : FinalDBObject[] {
    return this.connection.hash.getChildren(this);
  }

  public set(value:any) : void {
    this.connection.set(this.uri, value);
  }

  public del() : void {
    this.connection.del(this.uri);
  }

  public get parent() : FinalDBObject {
    return this.connection.hash.get(FDBOUtils.getParentPath(this.url));
  }

  public get value() : string {
    return this._value;
  }

  public silentSetValue(value:any) : void {
    this._value = value;
  }

}