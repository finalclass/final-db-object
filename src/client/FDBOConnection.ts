///<reference path="../types/types-client.d.ts"/>

class FDBOConnection {

  private _socket:ISocketIO;

  constructor(private path:string) {
    this._socket = io.connect(path);
  }

  public get socket() : ISocketIO {
    return this._socket;
  }

}