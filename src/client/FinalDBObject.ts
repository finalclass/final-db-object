///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEventEmitter.ts"/>
///<reference path="FDBOConnection.ts"/>
 
class FinalDBObject extends FDBOEventEmitter {

  private children:HashTable<FinalDBObject>;
  private _connection:FDBOConnection;
  private _value:any;
  private url:URI;

  constructor(url:string) {
    super();
    this.url = new URI(url);
    this.connection = FDBOConnection.getConnection(this.url);
    this.children = {};
  }

  private get connection() : FDBOConnection {
    return this._connection;
  }

  private set connection(conn:FDBOConnection) {
    this._connection = conn;
    conn.registerObject(this);
  }

  public get uri() : URI {
    return this.url;
  }

  public child(name:string) : FinalDBObject {
    var childPath:string = [this.url.toString(), name].join('/');
    if (!this.children[childPath]) {
      this.children[childPath] = new FinalDBObject(childPath);
    }
    return this.children[childPath];
  }

  public set(value:any, callback?:(err?:Error)=>void) : void {
    this.connection.set(this.uri, value);
  }

  public get parentPath() : string {
    var parts:string[] = this.url.segment();
    parts.pop();
    return parts.join('/');
  }

  public get parent() : FinalDBObject {
    return this.connection.hash.get(this.parentPath);
  }

  public get value() : string {
    return this._value;
  }

  public silentSetValue(value:any) : void {
    this._value = value;
  }

}