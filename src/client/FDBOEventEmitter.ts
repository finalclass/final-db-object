///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEvent.ts"/>
///<reference path="IFDBOListener.ts"/>
///<reference path="IFDBOEvent.ts"/>

class FDBOEventEmitter {
  
  private _listeners:HashTable<IFDBOListener[]>;

  constructor() {
    this._listeners = Object.create(null);
  }

  private getAllListeners(eventType:string) : IFDBOListener[] {
    if (!this._listeners[eventType]) {
      this._listeners[eventType] = [];
    }
    return this._listeners[eventType];
  }

  public on(eventType:string, listener:IFDBOListener) : void {
    var listeners:IFDBOListener[] = this.getAllListeners(eventType);
    listeners.push(listener);
  }

  public off(eventType:string, listener:IFDBOListener) : void {
    var listeners:IFDBOListener[] = this.getAllListeners(eventType);
    listeners.splice(listeners.indexOf(listener), 1);
  }

  public emit(event:IFDBOEvent) : void {
    this.getAllListeners(event.type)
      .forEach((listener:IFDBOListener) => listener.call(this, event));
  }

  public hashEventListener(eventType:string) : boolean {
    return this.getAllListeners(eventType).length > 0;
  }

}