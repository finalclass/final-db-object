///<reference path="socket.io-server.d.ts" />

declare module 'socket.io-router' {
  import socketIO = require('socket.io');

  export class SocketRouter {
    constructor(socket:socketIO.SocketManager)
    public route(name:string, callback:(req:SocketRequest)=>any) : void;
    public broadcast(message:string, data:any) : void;
  }

  export class SocketRequest {
    public data:any;
    public socket:socketIO.Socket;
    constructor(data:any, socket:socketIO.Socket);
  }

}