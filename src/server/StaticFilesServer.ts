import Config = require('./Config');
import expressIO = require('express.io');
import StaticFile = require('./StaticFile');
import fs = require('fs');
import Try = require('try');

class StaticFilesServer {

  private clientScripts:StaticFile[] = [
    new StaticFile('try.js', 'node_modules/try/Try.js'),
    new StaticFile('socket.io.js', 
      'node_modules/express.io/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js'),
    new StaticFile('FDBOEvent.js', 'build/client/FDBOEvent.js'),
    new StaticFile('FDBOEventEmitter.js', 'build/client/FDBOEventEmitter.js'),
    new StaticFile('FDBOConnection.js', 'build/client/FDBOConnection.js'),
    new StaticFile('FinalDBObject.js', 'build/client/FinalDBObject.js'),
  ];

  constructor(
    private config:Config, 
    private eioApp:expressIO.Application
  ) {
    this.eioApp.get('/' + this.config.routesPrefix + '/fdbo.js', this.getFDBOScriptAction.bind(this));
  }

  private getFDBOScriptAction(req:expressIO.Request, res:expressIO.Response, next:(err?:Error)=>void) : void {
    res.setHeader('Content-type', 'application/javascript');

    var t = Try();

    //read the files in order
    this.clientScripts.forEach((file:StaticFile) => t(
      () => {
        var stream:fs.ReadStream = fs.createReadStream(file.fullPath);
        stream.on('end', Try.pause());
        stream.on('error', next);
        stream.pipe(res, {end: false});
      })
      (() => res.write('\n\n'))
    );

    t(() => res.end())
    .catch(next);
  }

}

export = StaticFilesServer;