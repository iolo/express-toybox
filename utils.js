'use strict';

var
    Q = require('q'),
    _ = require('lodash'),
    express = require('express'),
    utils = require('node-toybox/utils'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:utils'),
    DEBUG = debug.enabled;

/**
 * collect query params from (express) request into object
 *
 * @param {express.request} req
 * @param {Array.<String>} paramNames
 * @returns {{query:{}, fields:{}, options:{}, params:{}}
 */
function collectQueryParams(req, paramNames) {
    var result = {
        query: {},
        fields: {},
        options: {},
        params: {}
    };
    paramNames.forEach(function (paramName) {
        var paramValue = req.param(paramName);
        if (paramValue) {
            paramValue = paramValue.trim();
            if (paramValue && paramValue !== '*') {
                if (paramValue.charAt(paramValue.length - 1) === '*') {
                    // regexp to match prefix
                    paramValue = new RegExp('^' + paramValue.substring(0, paramValue.length - 1));
                }
                result.query[paramName] = paramValue;
            }
            result.params[paramName] = paramValue;
        }
    });
    var fields = req.param('fields');
    if (fields) {
        result.fields = {};
        fields.split(',').forEach(function (field) {
            field = field.trim();
            if (field) {
                var select = 1;
                switch (field.charAt(0)) {
                    case '-':
                        field = field.substring(1);
                        select = 0;
                        break;
                    case '+':
                        field = field.substring(1);
                        break;
                }
                result.fields[field] = select;
            }
        });
    }
    var sort = req.param('sort');
    if (sort) {
        result.options.sort = {};
        sort.split(',').forEach(function (field) {
            field = field.trim();
            if (field) {
                var order = 1;
                switch (field.charAt(0)) {
                    case '-':
                        field = field.substring(1);
                        order = -1;
                        break;
                    case '+':
                        field = field.substring(1);
                        break;
                }
                result.options.sort[field] = order;
            }
        });
        result.params.sort = sort;
    }
    var skip = req.param('skip') || req.param('offset');
    if (skip) {
        result.options.skip = parseInt(skip, 10);
        result.params.skip = skip;
    }
    var limit = req.param('limit');
    if (limit) {
        result.options.limit = parseInt(limit, 10);
        result.params.limit = limit;
    }
    return result;
}

/**
 *
 * @param {int} offset - index of the first item of current page(aka. skip)
 * @param {int} limit - number of items in a page(aka. page size)
 * @param {int} count - total number of items
 * @param {int} [range=5] computation range before/after the current page
 * @returns {Array.<{page:int,skip:int,limit:int,active:boolean}>} pagination infos with computed offset
 */
function pagination(offset, limit, count, range) {
    var pages = [];
    var currentPage = Math.floor(offset / limit);
    var firstPage = Math.max(currentPage - (range || 5), 0);
    var lastPage = Math.min(currentPage + (range || 5), Math.floor(count / limit));
    for (var page = firstPage; page <= lastPage; page += 1) {
        pages.push({page: page, skip: page * limit, limit: limit, active: (page === currentPage)});
    }
    return pages;
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {String} [view]
 * @param {String} [next]
 * @param {*} [vm] view model
 * @returns {*}
 */
function renderViewOrRedirectToNext(req, res, view, next, vm) {
    next = req.param('next') || next;
    if (view) {
        return res.render(view, _.extend({next: next}, vm));
    }
    return res.redirect(next);
}

/**
 * simple echo route(http request handler) to easy test.
 *
 * @param {express.request} req
 * @param {express.response} res
 */
function echo(req, res) {
    // TODO: headers... and so on...
    return res.json({
        method: req.method,
        path: req.baseUrl + req.path,
        query: req.query,
        body: req.body
    });
}

/**
 * add some utility methods to http request.
 *
 * @param {*} [req]
 */
function extendHttpRequest(req) {
    req = req || express.request;

    /**
     * get string param from http request.
     *
     * @param {String} paramName
     * @param {String} [fallback]
     * @returns {String} param value
     * @throws {errors.BadRequest} no string param acquired and no fallback provided
     * @memberOf {express.request}
     */
    req.strParam = function (paramName, fallback) {
        var paramValue = this.param(paramName);
        if (paramValue !== undefined) {
            return paramValue;
        }
        if (fallback !== undefined) {
            return fallback;
        }
        throw new errors.BadRequest('param_required:' + paramName);
    };

    /**
     * get integer param from http request.
     *
     * @param {String} paramName
     * @param {Number} [fallback]
     * @returns {Number} param value
     * @throws {errors.BadRequest} no integer param acquired and no fallback provided
     * @memberOf {express.request}
     */
    req.intParam = function (paramName, fallback) {
        var paramValue = parseInt(this.param(paramName), 10);
        if (!isNaN(paramValue)) {
            return paramValue;
        }
        if (fallback !== undefined) {
            return fallback;
        }
        throw new errors.BadRequest('int_param_required:' + paramName);
    };

    /**
     * get number(float) param from http request.
     *
     * @param {String} paramName
     * @param {Number} [fallback]
     * @returns {Number} param value
     * @throws {errors.BadRequest} no number param acquired and no fallback provided
     * @memberOf {express.request}
     */
    req.numberParam = function (paramName, fallback) {
        var paramValue = parseFloat(this.param(paramName));
        if (!isNaN(paramValue)) {
            return paramValue;
        }
        if (fallback !== undefined) {
            return fallback;
        }
        throw new errors.BadRequest('number_param_required:' + paramName);
    };

    /**
     * get boolean param from http request.
     *
     * @param {String} paramName
     * @returns {Boolean} [fallback]
     * @returns {Boolean} param value
     * @throws {errors.BadRequest} no boolean param acquired and no fallback provided
     * @memberOf {express.request}
     */
    req.boolParam = function (paramName, fallback) {
        var paramValue = String(this.param(paramName)).toLowerCase();
        if (/^(1|y|yes|on|t|true)$/.test(paramValue)) {
            return true;
        }
        if (/^(0|n|no|off|f|false)$/.test(paramValue)) {
            return false;
        }
        if (fallback !== undefined) {
            return fallback;
        }
        throw new errors.BadRequest('bool_param_required:' + paramName);
    };

    /**
     * get date param from http request.
     *
     * @param {String} paramName
     * @param {Date} [fallback]
     * @returns {Date} param value
     * @throws {errors.BadRequest} no date param acquired and no fallback provided
     * @memberOf {express.request}
     */
    req.dateParam = function (paramName, fallback) {
        var paramValue = Date.parse(this.param(paramName));
        if (!isNaN(paramValue)) {
            return new Date(paramValue);
        }
        if (fallback !== undefined) {
            return fallback;
        }
        throw new errors.BadRequest('date_param_required:' + paramName);
    };

    /**
     * collect params from http request.
     *
     * @param {Array.<String>} paramNames
     * @returns {Object.<String,String>}
     */
    req.collectParams = function (paramNames) {
        var self = this;
        return paramNames.reduce(function (params, paramName) {
            var paramValue = self.param(paramName);
            if (paramValue) {
                params[paramName] = paramValue.trim();
            }
            return params;
        }, {});
    };
}

/**
 * add some utility methods to http response.
 *
 * @param {*} [res]
 */
function extendHttpResponse(res) {
    res = res || express.response;

    function callbackFnFn(verbFunc) {
        return function (next, status) {
            var res = this;
            return function (err, result) {
                if (err) {
                    return next(err);
                }
                if (status) {
                    return res.status(status);
                }
                return verbFunc.call(res, result);
            };
        };
    }

    function laterFnFn(verbFunc) {
        return function (promise, next, status) {
            var res = this;
            return Q.when(promise).then(function (result) {
                if (status) {
                    res.status(status);
                }
                return verbFunc.call(res, result);
            }).fail(next).done();
        };
    }

    //
    // callback helpers
    //

    /**
     * create generic node.js callback function to invoke 'express.response.send()'.
     *
     * ex.
     * ```
     * var fs = require('fs');
     * app.get('/foo', function(req, res, next) {
     *   fs.readFile('foo.txt', res.sendCallbackFn(next));
     * });
     * ```
     * @param {function} next
     * @param {number} [status]
     * @returns {function(err, result)} generic node.js callback which send response.
     * @method
     * @memberOf {express.request}
     */
    res.sendCallbackFn = callbackFnFn(res.send);

    /**
     * create generic node.js callback function to invoke 'express.response.json()'.
     *
     * @param {function} next
     * @param {number} [status]
     * @returns {function(err, result)} generic node.js callback which send 'json' response.
     * @method
     * @memberOf {express.request}
     */
    res.jsonCallbackFn = callbackFnFn(res.json);

    /**
     * create generic node.js callback function to invoke 'express.response.jsonp()'.
     *
     * @param {function} next
     * @param {number} [status]
     * @returns {function(err, result)} generic node.js callback which send 'jsonp' response.
     * @method
     * @memberOf {express.request}
     */
    res.jsonpCallbackFn = callbackFnFn(res.jsonp);

    /**
     * create generic node.js callback function to invoke 'express.response.sendFile()'.
     *
     * @param {function} next
     * @param {number} [status]
     * @returns {function(err, result)} generic node.js callback which send 'sendFile' response.
     * @method
     * @memberOf {express.request}
     */
    res.sendFileCallbackFn = callbackFnFn(res.sendFile);

    /**
     * create generic node.js callback function to invoke 'express.response.redirect()'.
     *
     * @param {function} next
     * @param {number} [status]
     * @returns {function(err, result)} generic node.js callback which send 'redirect' response.
     * @method
     * @memberOf {express.request}
     */
    res.redirectCallbackFn = callbackFnFn(res.redirect);

    /**
     * ex.
     * ```
     * fs.stat('foo.txt', res.renderCallbackFn('stat_view', next));
     * ```
     *
     * @param {string} view
     * @param {function} next
     * @param {number} [status]
     * @returns {function(err, result)}
     * @memberOf {express.response}
     */
    res.renderCallbackFn = function (view, next, status) {
        var res = this;
        return function (err, result) {
            if (err) {
                return next(err);
            }
            if (status) {
                res.status(status);
            }
            return res.render(view, result);
        };
    };

    //
    // promise helpers
    //

    /**
     * promise version to invoke `express.response.send()`.
     *
     * ex.
     * ```
     * var FS = require('q-io/fs');
     * app.get('/foo', function (req, res, next) {
     *   res.sendLater(FS.readFile('foo.txt'), next);
     * })
     * ```
     *
     * @param {promise|*} promise of response.
     * @param {function} next
     * @param {number} [status]
     * @method
     * @memberOf {express.request}
     */
    res.sendLater = laterFnFn(res.send);

    /**
     * promise version of `express.response.json()`.
     *
     * @param {promise|*} promise of 'json' response.
     * @param {function} next
     * @param {number} [status]
     * @method
     * @memberOf {express.request}
     */
    res.jsonLater = laterFnFn(res.json);

    /**
     * promise version of `express.response.jsonp()`.
     *
     * @param {promise|*} promise of 'jsonp' response.
     * @param {function} next
     * @param {number} [status]
     * @method
     * @memberOf {express.request}
     */
    res.jsonpLater = laterFnFn(res.jsonp);

    /**
     * promise version of `express.response.sendFile()`.
     *
     * @param {promise|*} promise of 'sendFile' response.
     * @param {function} next
     * @param {number} [status]
     * @method
     * @memberOf {express.request}
     */
    res.sendFileLater = laterFnFn(res.sendFile);

    /**
     * promise version of `express.response.redirect()`.
     *
     * @param {promise|*} promise of 'redirect' response.
     * @param {function} next
     * @param {number} [status]
     * @method
     * @memberOf {express.request}
     */
    res.redirectLater = laterFnFn(res.redirect);

    /**
     *
     * ex.
     * ```
     * var FS = require('q-io/fs');
     * res.renderLater('stat_view', FS.stat('foo.txt'), next);
     * ```
     *
     * @param {string} view
     * @param {promise|*} promise of 'render' model.
     * @param {function} next
     * @param {number} [status]
     * @memberOf {express.response}
     */
    res.renderLater = function (view, promise, next, status) {
        var res = this;
        return Q.when(promise).then(function (result) {
            if (status) {
                res.status(status);
            }
            return res.render(view, result);
        }).fail(next).done();
    };
}

module.exports = {
    collectQueryParams: collectQueryParams,
    pagination: pagination,
    renderViewOrRedirectToNext: renderViewOrRedirectToNext,
    echo: echo,
    extendHttpRequest: extendHttpRequest,
    extendHttpResponse: extendHttpResponse
};
