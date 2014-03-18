///<reference path="../types/types-client.d.ts"/>
///<reference path="IFDBOEvent.ts"/>

class FDBOEvent implements IFDBOEvent {

  public static VALUE:string = 'value';
  public static CHILD_ADDED:string = 'child_added';
  public static CHILD_REMOVED:string = 'child_removed';
  public static DELETED:string = 'deleted';

  constructor(private _type:string, private object:FinalDBObject) {

  }

  public get type() : string {
    return this._type;
  }

}