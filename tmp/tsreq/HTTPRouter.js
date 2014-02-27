///<reference path="./types/types.d.ts" />
var HTTPRouter = (function () {
    function HTTPRouter(expressApp, db, config) {
        this.expressApp = expressApp;
        this.db = db;
        this.config = config;
        this.expressApp.get('/' + this.config.routesPrefix + '/:path', this.findByPathMiddleware.bind(this), this.getAction.bind(this));

        this.expressApp.put('/' + this.config.routesPrefix + '/:path', this.setAction.bind(this));

        this.expressApp.del('/' + this.config.routesPrefix + '/:path', this.findByPathMiddleware.bind(this), this.delAction.bind(this));
    }
    HTTPRouter.prototype.findByPathMiddleware = function (req, res, next) {
        this.db.get(req.params.path, this.handleError(req, res, function (v) {
            if (!v) {
                res.json(404, { status: 'error', reason: 'not_found' });
                next(new Error('not_found'));
            } else {
                req.params.variable = v;
                next();
            }
        }), this);
    };

    HTTPRouter.prototype.delAction = function (req, res) {
        this.db.del(req.params.path, this.handleError(req, res, function () {
            res.send(204);
        }), this);
    };

    HTTPRouter.prototype.getAction = function (req, res) {
        res.json(200, req.params.variable.raw);
    };

    HTTPRouter.prototype.setAction = function (req, res) {
        this.db.set(req.params.path, req.body, this.handleError(req, res, function () {
            res.send(204);
        }), this);
    };

    HTTPRouter.prototype.handleError = function (req, res, callback) {
        var thisArg = this;

        return function (err) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (err) {
                console.log('HTTPRouter ERROR', err, err.stack);
                res.json(500, { status: 'error', reason: 'internal_server_error' });
            } else {
                callback.apply(thisArg, args);
            }
        };
    };
    return HTTPRouter;
})();

module.exports = HTTPRouter;
