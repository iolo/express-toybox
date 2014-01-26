'use strict';

var
    _ = require('lodash'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:error404'),
    DEBUG = debug.enabled;

/**
 * express 404 error handler.
 *
 * @param {*} options
 * @param {String} [options.view='errors/404']
 * @returns {Function} express request handler
 */
function error404(options) {
    options = _.merge({view: 'errors/404'}, options);

    return function (req, res, next) {
        res.status(404);

        switch (req.accepts('html,json')) {
            case 'html':
                return res.render(options.view);
            case 'json':
                return res.json({status: 404, code: 8404, error: 'Not Found'});
        }
        return res.send('Not Found');
    };
}

module.exports = error404;
