'use strict';

var
    util = require('util'),
    _ = require('lodash'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:error500'),
    DEBUG = debug.enabled;

var
    DEF_CONFIG = {
        view: 'errors/500',
        mappings: {}
    };

/**
 * express uncaught error handler.
 *
 * @param {*} options
 * @param {String} [options.view='errors/500']
 * @param {*} [options.mappings={}]
 * @param {Boolean} [options.stack=false]
 * @returns {Function} express error handler
 */
function error500(options) {
    options = _.merge({}, DEF_CONFIG, options);

    return function (err, req, res, next) {
        console.error('uncaught express error:', err);
        DEBUG && debug(err.stack);

        // TODO: error mappings by err.name, err.code, ...
        var error = {
            status: err.status || options.mappings[err.name] || 500,
            code: err.code || 0,
            message: err.message || String(err),
            cause: err.cause
        };
        if (options.stack) {
            error.stack = (err.stack && err.stack.split('\n')) || [];
        }

        res.status(error.status);

        switch (req.accepts(['json', 'html'])) {
            case 'json':
                return res.json(error);
            case 'html':
                return res.render(options.view, {error: error});
        }
        return res.send(util.inspect(error));
    };
}

module.exports = error500;
