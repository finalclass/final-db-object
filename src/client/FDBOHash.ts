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
    this.data[obj.uri.path()] = obj;
  } 

  public get(url:string) : FinalDBObject {
    return this.data[new URI(url).path()];
  }

  public has(object:FinalDBObject) : boolean;
  public has(url:string) : boolean;
  public has(obj:any) : boolean {
    if (typeof obj === 'string') {
      return this.data[new URI(obj).path()] !== undefined;
    }
    return this.data[obj.uri.path()] !== undefined;
  }

  public getOrCreate(url:string) : FinalDBObject {
    var path = new URI(url).path();
    if (!this.has(path)) {
      this.add(new FinalDBObject(url));
    }
    return this.get(path);
  }

}