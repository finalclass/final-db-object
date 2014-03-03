///<reference path="../types/types.d.ts" />
var Config = require('./Config');
var Environment = require('./Environment');
var EventBus = require('./EventBus');
var DataStore = require('./DataStore');
var HTTPRouter = require('./HTTPRouter');
var Try = require('try');
var expressIO = require('express.io');

var Server = (function () {
    function Server(configData, env) {
        this._config = new Config(configData);
        this.env = env || 'development';
        this.eioApp = expressIO();
        this.configureExpressApp();
        this.eioApp.http().io();
        this.eventBus = new EventBus();
        this.dataStore = new DataStore(this.eventBus, this.config);
        this.httpRouter = new HTTPRouter(this.eioApp, this.dataStore, this.config);
        this.eventBus.on('DataStore.initError', this.onError);
    }
    Object.defineProperty(Server.prototype, "config", {
        // -----------------------------------------------------
        //
        // Properties
        //
        // -----------------------------------------------------
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Server.prototype, "env", {
        // ---------------------------
        // env
        // ---------------------------
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
            return _this.eioApp.listen(_this.config.port, Try.pause());
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
