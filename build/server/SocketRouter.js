///<reference path="../types/types-server.d.ts"/>
var URI = require('URIjs');

var VariablesCollection = require('./VariablesCollection');

var SocketRouter = (function () {
    function SocketRouter(eioApp, dataStore, eventBus, config) {
        this.eioApp = eioApp;
        this.dataStore = dataStore;
        this.eventBus = eventBus;
        this.config = config;
        this.eioApp.io.route('get', this.getAction.bind(this));
        this.eioApp.io.route('set', this.setAction.bind(this));
        this.eioApp.io.route('del', this.delAction.bind(this));
        this.eventBus.on('DataStore.variableSet', this.onVariableSet.bind(this));
        this.eventBus.on('DataStore.variableDel', this.onVariableDel.bind(this));
    }
    SocketRouter.prototype.filterPath = function (url) {
        return '/' + new URI(url).segment().filter(function (a) {
            return a !== '';
        }).join('/');
    };

    SocketRouter.prototype.onVariableDel = function (v) {
        this.eioApp.io.broadcast('child_removed', v.raw);
    };

    SocketRouter.prototype.onVariableSet = function (v) {
        this.eioApp.io.broadcast('value', v.raw);
        this.eioApp.io.broadcast('child_added', v.raw);
    };

    SocketRouter.prototype.getAction = function (req) {
        var _this = this;
        console.log('get', req.data);
        this.dataStore.get(this.filterPath(req.data))(function (v) {
            req.io.emit('value', v.raw);
            if (v.type === 'object') {
                return _this.dataStore.getChildren(v.path);
            }
        })(function (children) {
            if (children && children instanceof VariablesCollection) {
                children.each(function (v) {
                    return req.io.emit('child_added', v.raw);
                });
            }
        });
    };

    SocketRouter.prototype.setAction = function (req) {
        var path = this.filterPath(req.data.path);
        this.dataStore.set(path, req.data.value).catch(function (err) {
            console.log(err);
        });
    };

    SocketRouter.prototype.delAction = function (req) {
        var _this = this;
        var path = this.filterPath(req.data.path);
        var child;

        this.dataStore.get(path)(function (v) {
            return child = v;
        })(function () {
            return _this.dataStore.del(path);
        })(function () {
            _this.eioApp.io.broadcast('del', child.raw);
            _this.eioApp.io.broadcast('child_removed', child.raw);
        }).catch(function (err) {
            console.log(err);
        });
    };
    return SocketRouter;
})();

module.exports = SocketRouter;
