///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOConnection.ts"/>
///<reference path="FDBOUtils.ts"/>

class FDBOHash {

  private data:HashTable<FinalDBObject>;

  constructor(private connection:FDBOConnection) {
    this.data = Object.create(null);
  }

  public add(obj:FinalDBObject) : void {
    this.data[obj.uri.toString()] = obj;
  } 

  public get(path:string) : FinalDBObject {
    return this.data[path];
  }

  public has(path:string) : boolean {
    return this.data[path] !== undefined;
  }

  public getOrCreate(path:string) : FinalDBObject {
    if (!this.has(path)) {
      this.add(new FinalDBObject(path));
    }
    return this.get(path);
  }

}