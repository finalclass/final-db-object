interface IEventEmitter {
    emit(name: string, ...data: any[]): any;
    on(ns: string, fn: Function): IEventEmitter;
    addListener(ns: string, fn: Function): IEventEmitter;
    removeListener(ns: string, fn: Function): IEventEmitter;
    removeAllListeners(ns: string): IEventEmitter;
    once(ns: string, fn: Function): IEventEmitter;
    listeners(ns: string): Function[];
}

interface ISocketIONamespace extends IEventEmitter {
    of(name: string): ISocketIONamespace;
    send(data: any, fn: Function): ISocketIONamespace;
    emit(name: string): ISocketIONamespace;
}

interface ISocketIO extends IEventEmitter {
    of(name: string): ISocketIONamespace;
    connect(fn: Function): ISocketIO;
    packet(data: any): ISocketIO;
    flushBuffer(): void;
    disconnect(): ISocketIO;
}

interface ISocketModule {
    connect(host: string, details?: any): ISocketIO;
}

declare module "socket.io-client" {
    export = io;
}

declare var io:ISocketModule;