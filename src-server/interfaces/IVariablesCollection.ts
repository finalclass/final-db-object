import IVariable = require('./IVariable');

interface IVariablesCollection {
  raw:IVariable[];
  length:number;
  add(variable:IVariable) : void;
  each(callback:(v:IVariable) => void, thisArg?:any) : void;
  map(callback:(v:IVariable) => void, thisArg?:any) : any;
}

export = IVariablesCollection;