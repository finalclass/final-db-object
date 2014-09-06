import IVariablesCollection = require('./IVariablesCollection');
import IVariable = require('./IVariable');

interface IDataStoreAdapter {
  init(callback:(err?:Error)=>void) : void;
  get(path:string, callback:(err:Error, v:IVariable)=>void) : void;
  getChildren(path:string, callback:(err:Error, vars?:IVariablesCollection)=>void) : void;
  del(path:string, callback:(err:Error)=>void) : void;
  set(v:IVariable, callback:(err:Error)=>void) : void;
  close(done:(err?:Error)=>void) : void;
}

export = IDataStoreAdapter;