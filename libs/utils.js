'use strict';

var
    _ = require('lodash'),
    express = require('express'),
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

function collectDeviceParams(req) {
    return _.merge({}, {uuid: req.ip, model: req.headers['user-agent']}, req.param('device'));
}

// TODO: ...
function generateCaptcha(res) {
}

// TODO: ...
function validateCaptcha(req) {
    // throw new ParamNotMatch('captcha');
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
 * add some utility methods to http request.
 */
function extendHttpRequest() {
    var req = require('http').IncomingMessage.prototype;

    /**
     * get string param from http request.
     *
     * @param {String} paramName
     * @param {String} [fallback]
     * @returns {String} param value
     * @throws {*} no param acquired and no fallback provided
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
     * @throws {ParamRequired} no param acquired and no fallback provided
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
     * @throws {ParamRequired} no param acquired and no fallback provided
     */
    req.numberParam = function (paramName, fallback) {
        var paramValue = parseFloat(this.param(paramName));
        if (isNaN(paramValue)) {
            return paramValue;
        }
        if (fallback !== undefined) {
            return fallback;
        }
        throw new errors.BadRequest('number_param_required:' + paramName);
    };

    /**
     * get bool param from http request.
     *
     * @param {String} paramName
     * @returns {Boolean} [fallback]
     * @returns {Boolean} param value
     * @throws {ParamRequired} no param acquired and no fallback provided
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

module.exports = {
    collectQueryParams: collectQueryParams,
    collectDeviceParams: collectDeviceParams,
    generateCaptcha: generateCaptcha,
    validateCaptcha: validateCaptcha,
    pagination: pagination,
    renderViewOrRedirectToNext: renderViewOrRedirectToNext,
    extendHttpRequest: extendHttpRequest
};
