///<reference path="../types/types-server.d.ts"/>
///<reference path="../types/hash-table.d.ts"/>
var HTTPRouter = (function () {
    function HTTPRouter(expressApp, dataStore, config) {
        this.expressApp = expressApp;
        this.dataStore = dataStore;
        this.config = config;
        this.expressApp.get('/' + this.config.routesPrefix + '/:path', this.findByPathMiddleware.bind(this), this.getAction.bind(this));

        this.expressApp.put('/' + this.config.routesPrefix + '/:path', this.setAction.bind(this));

        this.expressApp.del('/' + this.config.routesPrefix + '/:path', this.findByPathMiddleware.bind(this), this.delAction.bind(this));
    }
    HTTPRouter.prototype.findByPathMiddleware = function (req, res, next) {
        this.dataStore.get(this.config.routesPrefix + '/' + req.params.path)(function (v) {
            if (!v) {
                res.json(404, { status: 'error', reason: 'not_found' });
                next(new Error('not_found'));
            } else {
                req.params.variable = v;
                next();
            }
        }).catch(this.getErrorHandlerFunction(req, res));
    };

    HTTPRouter.prototype.delAction = function (req, res) {
        this.dataStore.del(req.params.variable.path)(function () {
            return res.send(204);
        }).catch(this.getErrorHandlerFunction(req, res));
    };

    HTTPRouter.prototype.getAction = function (req, res) {
        res.json(200, req.params.variable.raw);
    };

    HTTPRouter.prototype.setAction = function (req, res) {
        this.dataStore.set(this.config.routesPrefix + '/' + req.params.path, req.body)(function () {
            return res.send(204);
        }).catch(this.getErrorHandlerFunction(req, res));
    };

    HTTPRouter.prototype.getErrorHandlerFunction = function (req, res) {
        return function (err) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (err) {
                console.log('HTTPRouter ERROR', err, err.stack);
                res.json(500, { status: 'error', reason: 'internal_server_error' });
            }
        };
    };
    return HTTPRouter;
})();

module.exports = HTTPRouter;
