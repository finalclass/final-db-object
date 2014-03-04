///<reference path="../types/types-client.d.ts"/>
///<reference path="IFDBOEvent.ts"/>

class FDBOEvent implements IFDBOEvent {

  constructor(private _type:string) {

  }

  public get type() : string {
    return this._type;
  }

}