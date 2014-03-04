///<reference path="../types/types-server.d.ts"/>
var Environment = require('./Environment');

var Config = (function () {
    function Config(data) {
        this.data = data;
    }
    Object.defineProperty(Config.prototype, "serverAddress", {
        // -----------------------------------------------------
        //
        // Properties
        //
        // -----------------------------------------------------
        // ---------------------------
        // serverAddress
        // ---------------------------
        get: function () {
            return this.protocol + '://' + this.host + ':' + this.port + '/' + this.routesPrefix;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Config.prototype, "protocol", {
        // ---------------------------
        // protocol
        // ---------------------------
        get: function () {
            return this.realConfig.protocol || 'http://';
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Config.prototype, "host", {
        // ---------------------------
        // host
        // ---------------------------
        get: function () {
            return this.realConfig.host;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Config.prototype, "env", {
        // ---------------------------
        // env
        // ---------------------------
        get: function () {
            return this._env;
        },
        set: function (env) {
            this._env = env;
            this.updateRealConfig();
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Config.prototype, "port", {
        // ---------------------------
        // port
        // ---------------------------
        get: function () {
            return this.realConfig.port || 8181;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Config.prototype, "dataStoreAdapter", {
        // ---------------------------
        // dataStoreAdapter
        // ---------------------------
        get: function () {
            return this.realConfig.dataStoreAdapter;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Config.prototype, "routesPrefix", {
        // ---------------------------
        // routesPrefix
        // ---------------------------
        get: function () {
            return this.realConfig.routesPrefix || 'fdbo';
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Config.prototype, "dataStore", {
        // ---------------------------
        // dataStore
        // ---------------------------
        get: function () {
            return this.realConfig.dataStore || {};
        },
        enumerable: true,
        configurable: true
    });

    // -----------------------------------------------------
    //
    // Private methods
    //
    // -----------------------------------------------------
    Config.prototype.updateRealConfig = function () {
        this.realConfig = {};
        this.copyConfig(Environment.DEVELOPMENT, this.realConfig);
        if (this.env !== Environment.DEVELOPMENT) {
            this.copyConfig(this.env, this.realConfig);
        }
    };

    Config.prototype.copyConfig = function (env, target) {
        var envConfig = this.data[env.toString()];

        Object.keys(envConfig).forEach(function (key) {
            target[key] = envConfig[key];
        }, this);

        return target;
    };
    return Config;
})();

module.exports = Config;
