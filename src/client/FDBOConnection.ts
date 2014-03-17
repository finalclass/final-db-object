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

  public registerObject(object:FinalDBObject) : void {
    this.hash.add(object);
    this.get(object.uri);
  }

  // ---------------------------
  // Socket responders
  // ---------------------------

  public onValue(data:any) : void {
    var obj = this.hash.get(data.path || '');

    if (obj) {
      obj.silentSetValue(data.value);
      obj.emit(new FDBOEvent('value'));
    }
  }

  public onChildAdded(data:any) : void {
    console.log('onChildAdded', data);
  }

}