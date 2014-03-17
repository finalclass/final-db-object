///<reference path="../types/types-server.d.ts"/>
var Config = require('./Config');
var Environment = require('./Environment');
var EventBus = require('./EventBus');
var DataStore = require('./DataStore');
var HTTPRouter = require('./HTTPRouter');
var SocketRouter = require('./SocketRouter');
var Try = require('try');
var expressIO = require('express.io');

var domain = require('domain');
var StaticFilesServer = require('./StaticFilesServer');

var Server = (function () {
    function Server(configData, env) {
        this._config = new Config(configData);
        this.env = env || 'development';
        this._eioApp = expressIO();
        this.eioApp.http().io();
        this.configureExpressApp();
        this.eventBus = new EventBus();
        this.dataStore = new DataStore(this.eventBus, this.config);
        this.staticFilesServer = new StaticFilesServer(this.config, this.eioApp);
        this.httpRouter = new HTTPRouter(this.eioApp, this.dataStore, this.config);
        this.socketRouter = new SocketRouter(this.eioApp, this.dataStore, this.eventBus, this.config);

        this.eventBus.on('DataStore.initError', this.onError);
    }
    Object.defineProperty(Server.prototype, "eioApp", {
        // -----------------------------------------------------
        //
        // Properties
        //
        // -----------------------------------------------------
        get: function () {
            return this._eioApp;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Server.prototype, "config", {
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Server.prototype, "env", {
        get: function () {
            return this.config.env.toString();
        },
        set: function (env) {
            this.config.env = Environment.fromString(env);
        },
        enumerable: true,
        configurable: true
    });


    // -----------------------------------------------------
    //
    // Event Handlers
    //
    // -----------------------------------------------------
    Server.prototype.onError = function (err) {
        console.log('FinalDBObject error', err, err.stack);
    };

    // -----------------------------------------------------
    //
    // Private methods
    //
    // -----------------------------------------------------
    Server.prototype.configureExpressApp = function () {
        this.eioApp.use(expressIO.bodyParser({
            keepExtensions: true,
            uploadDir: __dirname + '/var/files',
            strict: false
        }));
        this.eioApp.use(this.domainSupportMiddleware.bind(this));
        this.eioApp.use(this.httpErrorHandler.bind(this));
    };

    Server.prototype.httpErrorHandler = function (err, req, res, next) {
        console.log('HTTP_ERROR', err, err.stack);
        res.json(500, { status: 'error', reason: 'internal_server_error' });
    };

    Server.prototype.domainSupportMiddleware = function (req, res, next) {
        var d = domain.create();
        d.add(req);
        d.add(res);
        d.on('error', next);
        d.run(next);
    };

    // -----------------------------------------------------
    //
    // Public methods
    //
    // -----------------------------------------------------
    Server.prototype.listen = function () {
        var _this = this;
        this.eventBus.emit('Server.listenRequest');
        this.dataStore.init()(function () {
            _this.eioApp.listen(_this.config.port, Try.pause());
        })(function () {
            return _this.eventBus.emit('listen');
        });
    };

    Server.prototype.on = function (eventType, callback) {
        this.eventBus.on(eventType, callback);
    };
    return Server;
})();

module.exports = Server;
