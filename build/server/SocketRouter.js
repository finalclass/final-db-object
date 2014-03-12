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
        var seg = new URI(url).segment();
        var pref = new URI(this.config.routesPrefix).segment();

        for (var i = 0; i < seg.length; i += 1) {
            if (seg[i] !== pref[i]) {
                break;
            }
        }

        return seg.slice(i).join('/');
    };

    SocketRouter.prototype.getAction = function (req) {
        this.dataStore.get(this.filterPath(req.data))(function (v) {
            return req.io.emit('value', v.raw);
        });
    };

    SocketRouter.prototype.setAction = function (req) {
        var _this = this;
        var path = this.filterPath(req.data.path);
        this.dataStore.set(path, req.data.value)(function () {
            return _this.dataStore.get(path);
        })(function (v) {
            _this.eioApp.io.broadcast('value', v.raw);
        });
    };
    return SocketRouter;
})();

module.exports = SocketRouter;
