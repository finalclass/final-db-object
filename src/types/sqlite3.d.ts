// Type definitions for s3 node module

declare module 'sqlite3' {
  import events = require('events');

  enum Mode {
    OPEN_READONLY = 1,
    OPEN_READWRITE = 2,
    OPEN_CREATE = 4
  }

  interface StandardCallback {
    (err:any, row:Object) : void;
    (err:Error) : void;
  }

  interface ResultCallback {
    (err:any, row:Object) : void;
    (err:Error, row:Object) : void;
  }

  interface ResultsCallback {
    (err:any, row:Object) : void;
    (err:Error, rows:Object[]) : void;
  }

  export function verbose() : any;

  class Statement extends events.EventEmitter {
    bind(callback?:StandardCallback) : Statement;
    bind(arg1:any, callback?:StandardCallback) : Statement;
    bind(arg1:any, arg2:any, callback?:StandardCallback) : Statement;
    bind(...args) : Statement;

    reset(callback?:StandardCallback) : Statement;
    finalize(callback?:StandardCallback) : Statement;

    run(callback?:StandardCallback) : Statement;
    run(arg1:any, callback?:StandardCallback) : Statement;
    run(arg1:any, arg2:any, callback?:StandardCallback) : Statement;
    run(...args) : Statement;

    get(callback?:ResultCallback) : Statement;
    get(arg1:any, callback?:ResultCallback) : Statement;
    get(arg1:any, arg2:any, callback?:ResultCallback) : Statement;
    get(...args) : Statement;

    all(callback?:ResultsCallback) : Statement;
    all(arg1:any, callback?:ResultsCallback) : Statement;
    all(arg1:any, arg2:any, callback?:ResultsCallback) : Statement;
    all(...args) : Statement;

    each(callback?:ResultCallback, complete?:StandardCallback) : Statement;
    each(arg1:any, callback?:ResultCallback, complete?:StandardCallback) : Statement;
    each(arg1:any, arg2:any, callback?:ResultCallback, complete?:StandardCallback) : Statement;
    each(...args) : Statement;
  }

  export class Database extends events.EventEmitter {
    constructor(filename:string, mode?:Mode, callback?:StandardCallback);

    run(sql:string, callback?:StandardCallback) : Database;
    run(sql:string, arg1:any, callback?:StandardCallback) : Database;
    run(sql:string, arg1:any, arg2:any, callback?:StandardCallback) : Database;
    run(sql:string, ...args) : Database;

    get(sql:string, callback?:ResultCallback) : Database;
    get(sql:string, arg1:any, callback?:ResultCallback) : Database;
    get(sql:string, arg1:any, arg2:any, callback?:ResultCallback) : Database;
    get(sql:string, ...args) : Database;

    all(sql:string, callback?:ResultsCallback) : Database;
    all(sql:string, arg1:any, callback?:ResultsCallback) : Database;
    all(sql:string, arg1:any, arg2:any, callback?:ResultsCallback) : Database;
    all(sql:string, ...args) : Database;

    each(sql:string, callback?:ResultCallback, complete?:StandardCallback) : Database;
    each(sql:string, arg1:any, callback?:ResultCallback, complete?:StandardCallback) : Database;
    each(sql:string, arg1:any, arg2:any, callback?:ResultCallback, complete?:StandardCallback) : Database;
    each(sql:string, ...args) : Database;

    exec(sql:string, callback?:StandardCallback) : Database;
    exec(sql:string, arg1:any, callback?:StandardCallback) : Database;
    exec(sql:string, arg1:any, arg2:any, callback?:StandardCallback) : Database;
    exec(sql:string, ...args) : Database;

    prepare(sql:string, callback?:StandardCallback) : Statement;
    prepare(sql:string, arg1:any, callback?:StandardCallback) : Statement;
    prepare(sql:string, arg1:any, arg2:any, callback?:StandardCallback) : Statement;
    prepare(sql:string, ...args) : Statement;

    close() : void;
    serialize(callback:()=>void);
    parallelize(callback:()=>void);
  }

}