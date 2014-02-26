///<reference path="./types/types.d.ts" />
var HTTPRouter = (function () {
    function HTTPRouter(expressApp, db, config) {
        this.expressApp = expressApp;
        this.db = db;
        this.config = config;
        this.expressApp.get('/' + this.config.routesPrefix + '/:path', this.getAction.bind(this));
    }
    HTTPRouter.prototype.getAction = function (req, res) {
        console.log(req.params.path);
        res.json(200, { status: 'ok' });
    };
    return HTTPRouter;
})();

module.exports = HTTPRouter;
