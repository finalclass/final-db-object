///<reference path="typings/tsd.d.ts"/>
///<reference path="FDBOEvent.ts"/>
///<reference path="IFDBOListener.ts"/>
///<reference path="IFDBOEvent.ts"/>
///<reference path="IFDBOListenerDescription.ts"/>

class FDBOEventEmitter {
  
  private _listeners:HashTable<IFDBOListenerDescription[]>;

  constructor() {
    this._listeners = Object.create(null);
  }

  private getAllListeners(eventType:string) : IFDBOListenerDescription[] {
    if (!this._listeners[eventType]) {
      this._listeners[eventType] = [];
    }
    return this._listeners[eventType];
  }

  public on(eventType:string, listener:IFDBOListener) : void {
    var listeners:IFDBOListenerDescription[] = this.getAllListeners(eventType);
    listeners.push({listener: listener});
  }

  public once(eventType:string, listener:IFDBOListener) : void {
    var listeners:IFDBOListenerDescription[] = this.getAllListeners(eventType);
    listeners.push({listener: listener, once: true});
  }

  public off(eventType:string, listener:IFDBOListener) : void {
    var listeners:IFDBOListenerDescription[] = this.getAllListeners(eventType);
    for (var i:number = 0; i < listeners.length; i += 1) {
      if (listeners[i].listener === listener) {
        break;
      }
    }
    listeners.splice(i, 1);
  }

  public emit(event:IFDBOEvent) : void {
    this.getAllListeners(event.type)
      .forEach((listener:IFDBOListenerDescription) => {
        listener.listener.call(this, event);
        if (listener.once) {
          this.off(event.type, listener.listener);
        }
      });
  }

  public hashEventListener(eventType:string) : boolean {
    return this.getAllListeners(eventType).length > 0;
  }

}