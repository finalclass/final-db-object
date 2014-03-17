///<reference path="../types/types-server.d.ts"/>
var URI = require('URIjs');

var SocketRouter = (function () {
    function SocketRouter(eioApp, dataStore, config) {
        this.eioApp = eioApp;
        this.dataStore = dataStore;
        this.config = config;
        this.eioApp.io.route('get', this.getAction.bind(this));
        this.eioApp.io.route('set', this.setAction.bind(this));
    }
    SocketRouter.prototype.filterPath = function (url) {
        return new URI(url).path();
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
            console.log(children);
            if (children) {
                children.each(function (v) {
                    return req.io.emit('child_added', v.raw);
                });
            }
        });
    };

    SocketRouter.prototype.setAction = function (req) {
        var _this = this;
        console.log('set');
        var path = this.filterPath(req.data.path);
        this.dataStore.set(path, req.data.value)(function (collection) {
            collection.each(function (v) {
                return _this.eioApp.io.broadcast('value', v.raw);
            });
        }).catch(function (err) {
            console.log(err);
        });
    };
    return SocketRouter;
})();

module.exports = SocketRouter;
