///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEventEmitter.ts"/>

document.write('<script src="/socket.io/socket.io.js"></script>');

class FinalDBObject extends FDBOEventEmitter {

  private _socket:ISocketIO;
  private _url:string;
  private children:HashTable<FinalDBObject>;

  constructor(
    private _path:string,
    private _parent?:FinalDBObject
  ) {
    super();
    if (!this.parent) {
      this._socket = io.connect(this.path);
    }
    this.children = Object.create(null);
    this.get();
  }

  private get() : void {
    this.socket.emit('get', this.path);
  }

  private get socket() : ISocketIO {
    if (this.parent) {
      return this.parent.socket;
    }
    return this._socket;
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

  public get root() : FinalDBObject {
    if (!this.parent) {
      return this;
    }
    return this.parent.root;
  }

}