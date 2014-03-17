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
    new StaticFile('URI.js', 'node_modules/URIjs/src/URI.js'),
    new StaticFile('FDBOUtils.js', 'build/client/FDBOUtils.js'),
    new StaticFile('FDBOEvent.js', 'build/client/FDBOEvent.js'),
    new StaticFile('FDBOChildAddedEvent.js', 'build/client/FDBOChildAddedEvent.js'),
    new StaticFile('FDBOEventEmitter.js', 'build/client/FDBOEventEmitter.js'),
    new StaticFile('FDBOHash.js', 'build/client/FDBOHash.js'),
    new StaticFile('FDBOConnection.js', 'build/client/FDBOConnection.js'),
    new StaticFile('FinalDBObject.js', 'build/client/FinalDBObject.js'),
  ];

  constructor(
    private config:Config, 
    private eioApp:expressIO.Application
  ) {
    this.eioApp.get('/' + this.config.routesPrefix + '/dev/fdbo.js', this.getScriptLoaderAction.bind(this));
    this.eioApp.get('/' + this.config.routesPrefix + '/fdbo.js', this.getFDBOScriptAction.bind(this));
    this.eioApp.get('/' + this.config.routesPrefix + '/js/:scriptName', this.getScriptAction.bind(this));
  }

  private findStaticFileByName(name:string) : StaticFile {
    for (var i = this.clientScripts.length; i--;) {
      if (this.clientScripts[i].name === name) {
        return <StaticFile>this.clientScripts[i];
      }
    }
    return null;
  }

  private getScriptAction(req:expressIO.Request, res:expressIO.Response, next:(err?:Error)=>void) : void {
    var staticFile:StaticFile = this.findStaticFileByName(req.params.scriptName);
    if (!staticFile) {
      res.status(500).end();
    } else {
      res.setHeader('Content-type', 'application/javascript');
      fs.createReadStream(staticFile.fullPath).pipe(res);
    }
  }

  private getDocWriteForStaticFile(staticFile:StaticFile) : string {
    return 'document.write(\'<script src="/' 
      + this.config.routesPrefix + '/js/' + staticFile.name + '"></script>\')';
  }

  private getScriptLoaderAction(req:expressIO.Request, res:expressIO.Response, next:(err?:Error)=>void) : void {
    res.setHeader('Content-type', 'application/javascript');
    var docWrites:string[] = this.clientScripts
      .map((staticFile:StaticFile) => this.getDocWriteForStaticFile(staticFile));
    res.write(docWrites.join('\n'));
    res.end();
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