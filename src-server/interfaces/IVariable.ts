import IRawData = require('./IRawData');

interface IVariable extends IRawData {
  path:string;
  parent:string;
  type:string;
  value:any;
  raw:IRawData;
  toJSONString() : string;
  toString() : string;
}

export = IVariable;