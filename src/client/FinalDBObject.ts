///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEventEmitter.ts"/>
///<reference path="FDBOConnection.ts"/>


class FinalDBObject extends FDBOEventEmitter {

  private children:HashTable<FinalDBObject>;
  private _connection:FDBOConnection;

  constructor(
    private _path:string,
    private _parent?:FinalDBObject
  ) {
    super();
    if (!this.connection) {
      this._connection = new FDBOConnection(this.path);
    }
    this.children = Object.create(null);
    this.get();
  }

  public get connection() : FDBOConnection {
    return this._connection;
  }

  private get() : void {
    this.connection.socket.emit('get', this.path);
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

  public get parent() : FinalDBObject {
    return this._parent;
  }

}