var Variable = (function () {
    function Variable(data, path) {
        this.initData(data, path);
    }
    Object.defineProperty(Variable.prototype, "path", {
        get: function () {
            return this._raw.path;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Variable.prototype, "parent", {
        get: function () {
            return this._raw.parent;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Variable.prototype, "type", {
        get: function () {
            return this._raw.type;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Variable.prototype, "value", {
        get: function () {
            return this._raw.value;
        },
        enumerable: true,
        configurable: true
    });

    Variable.prototype.initData = function (data, path) {
        var typeofData = typeof data;

        if (data instanceof Variable) {
            this._raw = data.raw;
        } else if (data === null) {
            this._raw = {};
        } else if (typeofData === 'object') {
            path = path || data.path;
            this._raw = {
                path: path,
                parent: this.retrieveParentPath(path),
                type: data.type,
                value: data.value
            };
            if (data.type === 'boolean') {
                this._raw.value = this._raw.value !== '0';
            }
            if (data.type === 'number') {
                this._raw.value = parseFloat(this._raw.value);
            }
        } else if (path && (typeofData === 'string' || typeofData === 'boolean' || typeofData === 'number')) {
            this._raw = {
                path: path,
                parent: this.retrieveParentPath(path),
                type: typeofData,
                value: data
            };
        } else {
            this._raw = {};
        }
    };

    Variable.prototype.retrieveParentPath = function (path) {
        return path.substr(0, path.lastIndexOf('/'));
    };

    Object.defineProperty(Variable.prototype, "raw", {
        get: function () {
            return this._raw;
        },
        enumerable: true,
        configurable: true
    });

    Variable.prototype.toJSONString = function () {
        return JSON.stringify(this.raw);
    };

    Variable.prototype.toString = function () {
        return JSON.stringify(this.raw);
    };
    return Variable;
})();

module.exports = Variable;
