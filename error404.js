'use strict';

var
    _ = require('lodash'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:error404'),
    DEBUG = debug.enabled;

var
    DEF_CONFIG = {
        status: 404,
        code: 8404,
        message: 'Not Found',
        template: undefined,
        view: 'errors/404'
    };

/**
 * express 404 error handler.
 *
 * @param {*} options
 * @param {Number} [options.status=404]
 * @param {Number} [options.code=8404]
 * @param {String} [options.message='Not Found']
 * @param {String|Function} [options.template] lodash(underscore) micro template for html 404 error page.
 * @param {String} [options.view='errors/404'] express view path of html 404 error page.
 * @returns {Function} express request handler
 */
function error404(options) {
    options = _.merge({}, DEF_CONFIG, options);

    // pre-compile underscore template if available
    if (typeof options.template === 'string' && options.template.length > 0) {
        options.template = _.template(options.template);
    }

    return function (req, res, next) {

        var error = {
            status: options.status,
            code: options.code,
            message: options.message,
            cause: {path: req.path, url: req.url, originalUrl: req.originalUrl, baseUrl: req.baseUrl, query: req.query}
        };

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
        return res.send(options.message);
    };
}

module.exports = error404;
