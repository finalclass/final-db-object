declare module 'try' {
  
  function tryjs(callback?:(...args)=>void) : tryjs.ITry;

  module tryjs {
    function pause(n?:number) : () => ITry;

    interface ITry {
      (callback:(...args)=>void) : ITry;
      then(callback:(...args)=>void) : ITry;
      catch(callback:(err?:Error)=>void) : ITry;
      finally(callback:(...args)=>void) : ITry;
      run(func?:(...args)=>void, args?:any[]) : ITry;    
    }
  }

  export = tryjs;
}