///<reference path="../types/types.d.ts"/>
var Environment = require('./Environment');

var Config = (function () {
    function Config(data) {
        this.data = data;
    }
    Object.defineProperty(Config.prototype, "env", {
        // -----------------------------------------------------
        //
        // Properties
        //
        // -----------------------------------------------------
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

    Object.defineProperty(Config.prototype, "dbPath", {
        // ---------------------------
        // dbPath
        // ---------------------------
        get: function () {
            return this.realConfig.dbPath;
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
