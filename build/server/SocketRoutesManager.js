///<reference path="../types/types-server.d.ts"/>
var URI = require('URIjs');

var VariablesCollection = require('./VariablesCollection');

var SocketRoutesManager = (function () {
    function SocketRoutesManager(socketRouter, dataStore, eventBus, config) {
        this.socketRouter = socketRouter;
        this.dataStore = dataStore;
        this.eventBus = eventBus;
        this.config = config;
        this.socketRouter.route('get', this.getAction.bind(this));
        this.socketRouter.route('set', this.setAction.bind(this));
        this.socketRouter.route('del', this.delAction.bind(this));
        this.eventBus.on('DataStore.variableSet', this.onVariableSet.bind(this));
        this.eventBus.on('DataStore.variableDel', this.onVariableDel.bind(this));
    }
    SocketRoutesManager.prototype.filterPath = function (url) {
        return '/' + new URI(url).segment().filter(function (a) {
            return a !== '';
        }).join('/');
    };

    SocketRoutesManager.prototype.onVariableDel = function (v) {
        this.socketRouter.broadcast('child_removed', v.raw);
    };

    SocketRoutesManager.prototype.onVariableSet = function (v) {
        this.socketRouter.broadcast('value', v.raw);
        this.socketRouter.broadcast('child_added', v.raw);
    };

    SocketRoutesManager.prototype.getAction = function (req) {
        var _this = this;
        console.log('get', req.data);
        this.dataStore.get(this.filterPath(req.data))(function (v) {
            req.socket.emit('value', v.raw);
            if (v.type === 'object') {
                return _this.dataStore.getChildren(v.path);
            }
        })(function (children) {
            if (children && children instanceof VariablesCollection) {
                children.each(function (v) {
                    return req.socket.emit('child_added', v.raw);
                });
            }
        });
    };

    SocketRoutesManager.prototype.setAction = function (req) {
        var path = this.filterPath(req.data.path);
        console.log('set', path, req.data.value);

        this.dataStore.set(path, req.data.value).catch(function (err) {
            console.log(err);
        });
    };

    SocketRoutesManager.prototype.delAction = function (req) {
        var _this = this;
        var path = this.filterPath(req.data.path);
        var child;

        console.log('del', path);

        this.dataStore.get(path)(function (v) {
            return child = v;
        })(function () {
            return _this.dataStore.del(path);
        })(function () {
            _this.socketRouter.broadcast('del', child.raw);
            _this.socketRouter.broadcast('child_removed', child.raw);
        }).catch(function (err) {
            console.log(err);
        });
    };
    return SocketRoutesManager;
})();

module.exports = SocketRoutesManager;
