///<reference path="./types/types.d.ts" />
var Config = require('./Config');
var Environment = require('./Environment');
var EventBus = require('./EventBus');
var SQLiteDB = require('./SQLiteDB');
var HTTPRouter = require('./HTTPRouter');

var express = require('express');
var http = require('http');
var socketIO = require('socket.io');

var Server = (function () {
    function Server(configData, env) {
        this._config = new Config(configData);
        this.env = env || 'development';
        this.expressApp = express();
        this.httpServer = http.createServer(this.expressApp);
        this.socket = socketIO.listen(this.httpServer);
        this.eventBus = new EventBus();
        this.db = new SQLiteDB(this.eventBus, this.config);
        this.httpRouter = new HTTPRouter(this.expressApp, this.db, this.config);
        this.eventBus.on('SQLiteDB.error', this.onError);
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
    // Public methods
    //
    // -----------------------------------------------------
    Server.prototype.listen = function () {
        this.eventBus.emit('Server.listenRequest');

        this.eventBus.once('SQLiteDB.ready', function () {
            this.expressApp.listen(this.config.port, function () {
                this.eventBus.emit('listen');
            }.bind(this));
        }.bind(this));
    };

    Server.prototype.on = function (eventType, callback) {
        this.eventBus.on(eventType, callback);
    };
    return Server;
})();

module.exports = Server;