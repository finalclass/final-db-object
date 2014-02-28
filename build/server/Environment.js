var Environment = (function () {
    function Environment(value) {
        this.value = value;
    }
    Environment.prototype.toString = function () {
        return this.value;
    };

    Environment.fromString = function (env) {
        if (env === 'development') {
            return Environment.DEVELOPMENT;
        }
        if (env === 'staging') {
            return Environment.STAGING;
        }
        if (env === 'production') {
            return Environment.PRODUCTION;
        }
        throw new TypeError('Invalid environment string');
    };
    Environment.DEVELOPMENT = new Environment('development');
    Environment.STAGING = new Environment('staging');
    Environment.PRODUCTION = new Environment('production');
    return Environment;
})();

module.exports = Environment;
