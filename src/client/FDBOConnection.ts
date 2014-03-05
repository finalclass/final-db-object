///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOHash.ts"/>
///<reference path="FDBOEvent.ts"/>

class FDBOConnection {

  private _socket:ISocketIO;
  private hash:FDBOHash;

  constructor(private uri:string) {
    this.hash = new FDBOHash();
    this._socket = io.connect(new URI(this.uri).path('').toString());
    this.socket.on('value', this.onValue.bind(this));
  }

  public get socket() : ISocketIO {
    return this._socket;
  }

  public get(path:string) : void {
    this.socket.emit('get', path);
  }

  public onValue(data:any) : void {
    var path:string = data.path || '';
    var obj:FinalDBObject = this.hash.get(path);

    if (obj) {
      obj.silentSetValue(data.value);
      obj.emit(new FDBOEvent('value'));
    }
  }

  public registerObject(object:FinalDBObject) : void {
    this.hash.add(object);
  }

}