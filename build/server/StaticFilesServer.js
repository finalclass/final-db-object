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
            new StaticFile('FDBOEvent.js', 'build/client/FDBOEvent.js'),
            new StaticFile('FDBOEventEmitter.js', 'build/client/FDBOEventEmitter.js'),
            new StaticFile('FDBOConnection.js', 'build/client/FDBOConnection.js'),
            new StaticFile('FinalDBObject.js', 'build/client/FinalDBObject.js')
        ];
        this.eioApp.get('/' + this.config.routesPrefix + '/fdbo.js', this.getFDBOScriptAction.bind(this));
    }
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
