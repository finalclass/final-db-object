///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOHash.ts"/>
///<reference path="FDBOEvent.ts"/>

class FDBOConnection {

  private _socket:ISocketIO;
  private _hash:FDBOHash;
  private static connections:HashTable<FDBOConnection> = {};

  constructor(private serverURL:string) {
    this._hash = new FDBOHash(this);
    this._socket = io.connect(this.serverURL);
    this.socket.on('value', this.onValue.bind(this));
    this.socket.on('child_added', this.onChildAdded.bind(this));
    this.socket.on('child_removed', this.onChildRemoved.bind(this));
    this.socket.on('del', this.onDel.bind(this));
  }

  public static getConnection(uri:string);
  public static getConnection(uri:URI);
  public static getConnection(uri:any) {
    var serverURL:string = new URI(uri).hash('').path('').query('').toString();

    if (!this.connections[serverURL]) {
      this.connections[serverURL] = new FDBOConnection(serverURL);
    }
    return this.connections[serverURL];
  }

  public get hash() : FDBOHash {
    return this._hash;
  }

  public get socket() : ISocketIO {
    return this._socket;
  }

  public get(url:string) : void;
  public get(url:URI) : void;
  public get(url:any) : void {
    this.socket.emit('get', new URI(url).toString());
  }

  public set(url:string, value:any) : void;
  public set(url:URI, value:any) : void;
  public set(url:any, value:any) : void {
    this.socket.emit('set', {
      path: new URI(url).toString(),
      value: value
    });
  }

  public del(url:string) : void;
  public del(url:URI) : void;
  public del(url:any) : void {
    this.socket.emit('del', {path: new URI(url).toString()});
  }

  public registerObject(object:FinalDBObject) : void {
    if (!this.hash.has(object)) {
      this.hash.add(object);
    }
  }

  // ---------------------------
  // Socket responders
  // ---------------------------

  private onValue(data:any) : void {
    var obj = this.hash.get(data.path);
    if (obj) {
      obj.silentSetValue(data.value);
      obj.emit(new FDBOEvent(FDBOEvent.VALUE, obj));
    }
  }

  private onChildAdded(data:any) : void {
    var child:FinalDBObject = new FinalDBObject(this.serverURL + '/' + data.path, data.value);
    var parent = child.parent;
    if (parent) {
      parent.emit(new FDBOEvent(FDBOEvent.CHILD_ADDED, child));
    }
  }

  private onChildRemoved(data:any) : void {
    if (this.hash.has(data.path)) {
      this.delAndEmitDeleted(data.path);
    }
  }

  private delAndEmitDeleted(path:string) : void {
    var child = this.hash.get(path);
    if (child.parent) {
      child.parent.emit(new FDBOEvent(FDBOEvent.CHILD_REMOVED, child));
    }
    child.emit(new FDBOEvent(FDBOEvent.DELETED, child));
    this.hash.del(path);
  }

  private onDel(data:any) : void {
    if (this.hash.has(data.path)) {
      this.delAndEmitDeleted(data.path);
    }
  }

}