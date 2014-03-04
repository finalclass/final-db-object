///<reference path="../types/types-server.d.ts"/>
var SocketRouter = (function () {
    function SocketRouter(eioApp, dataStore, config) {
        this.eioApp = eioApp;
        this.dataStore = dataStore;
        this.config = config;
        this.eioApp.io.route('get', this.getAction);
    }
    SocketRouter.prototype.filterPath = function (path) {
        return path.replace(this.config.serverAddress, '');
    };

    SocketRouter.prototype.getAction = function (req) {
        this.dataStore.get(this.filterPath(req.data))(function (v) {
            if (v) {
                req.io.emit('value', v.raw);
            } else {
                req.io.emit('value', { path: req.data });
            }
        });
    };
    return SocketRouter;
})();

module.exports = SocketRouter;
