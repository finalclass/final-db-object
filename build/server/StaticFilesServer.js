var StaticFile = require('./StaticFile');
var fs = require('fs');
var Try = require('try');

var StaticFilesServer = (function () {
    function StaticFilesServer(config, eioApp) {
        this.config = config;
        this.eioApp = eioApp;
        this.clientScripts = [
            new StaticFile('try.js', 'node_modules/try/Try.js'),
            new StaticFile('socket.io.js', 'node_modules/express.io/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js'),
            new StaticFile('URI.js', 'node_modules/URIjs/src/URI.js'),
            new StaticFile('FDBOUtils.js', 'build/client/FDBOUtils.js'),
            new StaticFile('FDBOEvent.js', 'build/client/FDBOEvent.js'),
            new StaticFile('FDBOChildAddedEvent.js', 'build/client/FDBOChildAddedEvent.js'),
            new StaticFile('FDBOEventEmitter.js', 'build/client/FDBOEventEmitter.js'),
            new StaticFile('FDBOHash.js', 'build/client/FDBOHash.js'),
            new StaticFile('FDBOConnection.js', 'build/client/FDBOConnection.js'),
            new StaticFile('FinalDBObject.js', 'build/client/FinalDBObject.js')
        ];
        this.eioApp.get('/' + this.config.routesPrefix + '/dev/fdbo.js', this.getScriptLoaderAction.bind(this));
        this.eioApp.get('/' + this.config.routesPrefix + '/fdbo.js', this.getFDBOScriptAction.bind(this));
        this.eioApp.get('/' + this.config.routesPrefix + '/js/:scriptName', this.getScriptAction.bind(this));
    }
    StaticFilesServer.prototype.findStaticFileByName = function (name) {
        for (var i = this.clientScripts.length; i--;) {
            if (this.clientScripts[i].name === name) {
                return this.clientScripts[i];
            }
        }
        return null;
    };

    StaticFilesServer.prototype.getScriptAction = function (req, res, next) {
        var staticFile = this.findStaticFileByName(req.params.scriptName);
        if (!staticFile) {
            res.status(500).end();
        } else {
            res.setHeader('Content-type', 'application/javascript');
            fs.createReadStream(staticFile.fullPath).pipe(res);
        }
    };

    StaticFilesServer.prototype.getDocWriteForStaticFile = function (staticFile) {
        return 'document.write(\'<script src="/' + this.config.routesPrefix + '/js/' + staticFile.name + '"></script>\')';
    };

    StaticFilesServer.prototype.getScriptLoaderAction = function (req, res, next) {
        var _this = this;
        res.setHeader('Content-type', 'application/javascript');
        var docWrites = this.clientScripts.map(function (staticFile) {
            return _this.getDocWriteForStaticFile(staticFile);
        });
        res.write(docWrites.join('\n'));
        res.end();
    };

    StaticFilesServer.prototype.getFDBOScriptAction = function (req, res, next) {
        res.setHeader('Content-type', 'application/javascript');

        var t = Try();

        //read the files in order
        this.clientScripts.forEach(function (file) {
            return t(function () {
                var stream = fs.createReadStream(file.fullPath);
                stream.on('end', Try.pause());
                stream.on('error', next);
                stream.pipe(res, { end: false });
            })(function () {
                return res.write('\n\n');
            });
        });

        t(function () {
            return res.end();
        }).catch(next);
    };
    return StaticFilesServer;
})();

module.exports = StaticFilesServer;
