///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEventEmitter.ts"/>
///<reference path="FDBOConnection.ts"/>
 
class FinalDBObject extends FDBOEventEmitter {

  private children:HashTable<FinalDBObject>;
  private _connection:FDBOConnection;
  private _value:any;
  private _path:string;

  constructor(
    private _uri:string,
    private _parent?:FinalDBObject
  ) {
    super();
    if (!this.connection) {
      this.connection = new FDBOConnection(this.path);
    }
    this._path = new URI(this.uri).path();
    this.children = Object.create(null);
    this.get();
  }

  public get connection() : FDBOConnection {
    return this._connection;
  }

  public set connection(conn:FDBOConnection) {
    this._connection = conn;
    conn.registerObject(this);
  }

  private get() : void {
    this.connection.get(this.path);
  }

  public child(name:string) : FinalDBObject {
    var childPath:string = this.path + '.' + name;
    if (!this.children[childPath]) {
      this.children[childPath] = new FinalDBObject(childPath);
    }
    return this.children[childPath];
  }

  public get path() : string {
    return this._path;
  }

  public get uri() : string {
    return this._uri;
  }

  public get parent() : FinalDBObject {
    return this._parent;
  }

  public get value() : string {
    return this._value;
  }

  public silentSetValue(value:any) : void {
    this._value = value;
  }

}