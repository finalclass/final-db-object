///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>

class FDBOHash {

  private data:HashTable<FinalDBObject>;

  constructor() {
    this.data = Object.create(null);
  }

  public add(obj:FinalDBObject) : void {
    this.data[obj.path || ''] = obj;
  } 

  public get(path:string) : FinalDBObject {
    return this.data[path || ''];
  }

}