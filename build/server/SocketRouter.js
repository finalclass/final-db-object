///<reference path="../types/types-server.d.ts"/>
var SocketRouter = (function () {
    function SocketRouter(eioApp, dataStore, config) {
        this.eioApp = eioApp;
        this.dataStore = dataStore;
        this.config = config;
        this.eioApp.io.route('get', this.getAction.bind(this));
    }
    SocketRouter.prototype.filterPath = function (path) {
        return path.replace(this.config.serverAddress, '');
    };

    SocketRouter.prototype.getAction = function (req) {
        var path = this.filterPath(req.data);
        this.dataStore.get(path)(function (v) {
            return req.io.emit('value', v ? v.raw : { path: path });
        });
    };
    return SocketRouter;
})();

module.exports = SocketRouter;
