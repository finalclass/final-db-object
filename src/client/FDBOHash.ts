///<reference path="../types/types-client.d.ts"/>
///<reference path="FinalDBObject.ts"/>
///<reference path="FDBOConnection.ts"/>
///<reference path="FDBOUtils.ts"/>

class FDBOHash {

  private data:HashTable<FinalDBObject>;
  private byParent:HashTable<FinalDBObject[]>;

  constructor(private connection:FDBOConnection) {
    this.data = {};
    this.byParent = {};
  }

  public add(obj:FinalDBObject) : void {
    this.data[this.getPath(obj)] = obj;
    var parentPath = this.getPath(FDBOUtils.getParentPath(obj.uri));

    if (!parentPath) {
      return;
    }

    if (!this.byParent[parentPath]) {
      this.byParent[parentPath] = [];
    }

    if (this.byParent[parentPath].indexOf(obj) === -1) {
      this.byParent[parentPath].push(obj);
    }
  } 

  public get(url:string) : FinalDBObject {
    return this.data[this.getPath(url)];
  }

  public getChildren(obj:FinalDBObject) : FinalDBObject[] {
    return this.byParent[this.getPath(obj)] || [];
  }

  public has(object:FinalDBObject) : boolean;
  public has(url:string) : boolean;
  public has(obj:any) : boolean {
    return this.data[this.getPath(obj)] !== undefined;
  }

  public del(object:FinalDBObject) : void;
  public del(url:string) : void;
  public del(obj:any) : void {
    var path:string = this.getPath(obj);
    var parentPath:string = FDBOUtils.getParentPath(new URI(path));
    var fObject:FinalDBObject = this.data[path];

    //remove the object
    delete this.data[path];

    //remove from parent's hash
    var index = this.byParent[parentPath].indexOf(fObject);
    if (index !== -1) {
      this.byParent[parentPath].splice(index, 1);
    }

    //remove children
    if (this.byParent[path]) {
      this.byParent[path].forEach((v:FinalDBObject) => this.del(v));
    }
  }

  private getPath(object:FinalDBObject) : string;
  private getPath(url:string) : string;
  private getPath(obj:any) : string {
    var uri = typeof obj === 'string' ? new URI(obj) : obj.uri;
    return uri.segment().filter((a:string) => a).join('/');
  }

  public getOrCreate(url:string) : FinalDBObject {
    var path = this.getPath(url);
    if (!this.has(path)) {
      return new FinalDBObject(url);
    }
    return this.get(path);
  }

}