'use strict';

var
    util = require('util'),
    path = require('path'),
    _ = require('lodash'),
    Q = require('q'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:error500'),
    DEBUG = debug.enabled;

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
    options = _.merge({view: 'errors/500', mappings: {}}, options);

    return function (err, req, res, next) {
        console.error('uncaught express error:', err);

        // TODO: error mappings by err.name, err.code, ...
        var error = {
            status: err.status || options.mappings[err.name] || 500,
            code: err.code || 0,
            message: err.message || String(err)
        };
        if (options.stack) {
            error.stack = (err.stack && err.stack.split('\n')) || [];
        }

        res.status(error.status);

        switch (req.accepts('html,json')) {
            case 'html':
                return res.render(options.view, {error: error});
            case 'json':
                return res.json(error);
        }
        return res.send(util.inspect(error));
    };
}

module.exports = error500;
