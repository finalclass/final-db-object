///<reference path="../types/types-server.d.ts"/>
var Config = require('./Config');
var Environment = require('./Environment');
var EventBus = require('./EventBus');
var DataStore = require('./DataStore');
var HTTPRouter = require('./HTTPRouter');
var SocketRoutesManager = require('./SocketRoutesManager');
var sockRouter = require('socket.io-router');

var express = require('express');
var socketIO = require('socket.io');
var http = require('http');
var domain = require('domain');
var StaticFilesServer = require('./StaticFilesServer');

var Server = (function () {
    function Server(configData, env, expressApp, httpServer, io) {
        this._config = new Config(configData);
        this.env = env || 'development';
        this._expressApp = expressApp || express();
        this.httpServer = httpServer || http.createServer(this._expressApp);
        this.eventBus = new EventBus();
        this.io = io || socketIO.listen(this.httpServer);
        this.configureExpressApp();
        this.dataStore = new DataStore(this.eventBus, this.config);
        this.staticFilesServer = new StaticFilesServer(this.config, this.expressApp);
        this.httpRouter = new HTTPRouter(this.expressApp, this.dataStore, this.config);
        this.socketRouter = new sockRouter.SocketRouter(this.io);
        this.socketRoutesManager = new SocketRoutesManager(this.socketRouter, this.dataStore, this.eventBus, this.config);

        this.eventBus.on('DataStore.initError', this.onError.bind(this));
        this.eventBus.on('DataStore.initComplete', this.onDataStoreInitComplete.bind(this));

        this.dataStore.init();
    }
    Object.defineProperty(Server.prototype, "expressApp", {
        // -----------------------------------------------------
        //
        // Properties
        //
        // -----------------------------------------------------
        get: function () {
            return this._expressApp;
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

    Server.prototype.onDataStoreInitComplete = function () {
        this.eventBus.emit('initComplete');
    };

    // -----------------------------------------------------
    //
    // Private methods
    //
    // -----------------------------------------------------
    Server.prototype.configureExpressApp = function () {
        this.expressApp.use(express.bodyParser({
            keepExtensions: true,
            uploadDir: __dirname + '/var/files',
            strict: false
        }));
        this.expressApp.use(this.domainSupportMiddleware.bind(this));
        this.expressApp.use(this.httpErrorHandler.bind(this));
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
        this.httpServer.listen(this.config.port, function () {
            _this.eventBus.emit('listen');
        });
    };

    Server.prototype.on = function (eventType, callback) {
        this.eventBus.on(eventType, callback);
    };
    return Server;
})();

module.exports = Server;
