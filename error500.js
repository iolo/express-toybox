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
        status: 500,
        code: 8500,
        mappings: {}, // {ENOENT: {status:404, message:'NOT FOUND'}}
        stack: false,
        template: undefined,
        view: 'errors/500'
    };

/**
 * express uncaught error handler.
 *
 * @param {*} options
 * @param {Number} [options.status=500]
 * @param {Number} [options.code=8500]
 * @param {*} [options.mappings={}] map err.name/err.code to error response.
 * @param {Boolean} [options.stack=false]
 * @param {String|Function} [options.template] lodash(underscore) micro template for html error page.
 * @param {String} [options.view='errors/500'] express view path of html error page.
 * @returns {Function} express error handler
 */
function error500(options) {
    options = _.merge({}, DEF_CONFIG, options);

    // pre-compile underscore template if available
    if (typeof options.template === 'string' && options.template.length > 0) {
        options.template = _.template(options.template);
    }

    return function (err, req, res, next) {
        console.error('uncaught express error:', err);
        DEBUG && debug(err.stack);

        var error = _.extend({
            status: err.status || options.status,
            code: err.code || options.code,
            message: err.message || String(err),
            cause: err.cause
        }, options.mappings[err.name], options.mappings[err.code]);

        if (options.stack) {
            error.stack = (err.stack && err.stack.split('\n')) || [];
        }

        res.status(error.status);

        switch (req.accepts(['json', 'html'])) {
            case 'json':
                return res.json(error);
            case 'html':
                if (typeof options.template === 'function') {
                    res.type('html');
                    return res.send(options.template({error: error}));
                }
                return res.render(options.view, {error: error});
        }
        return res.send(util.inspect(error));
    };
}

module.exports = error500;
