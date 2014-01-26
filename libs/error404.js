'use strict';

var
    _ = require('lodash'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:error404'),
    DEBUG = debug.enabled;

var
    DEF_CONFIG = {
        view: 'errors/404',
        code: 8404,
        method: 'Not Found'
    };

/**
 * express 404 error handler.
 *
 * @param {*} options
 * @param {String} [options.view='errors/404']
 * @param {Number} [options.code=8404]
 * @param {String} [options.message='Not Found']
 * @returns {Function} express request handler
 */
function error404(options) {
    options = _.merge({}, DEF_CONFIG, options);

    return function (req, res, next) {
        res.status(404);

        switch (req.accepts('html,json')) {
            case 'html':
                return res.render(options.view);
            case 'json':
                return res.json({status: 404, code: options.code, message: options.message});
        }
        return res.send(options.message);
    };
}

module.exports = error404;
