'use strict';

var
    _ = require('lodash'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:cors'),
    DEBUG = debug.enabled;

var
    DEF_CONFIG = {
        origin: '*',
        methods: 'GET,PUT,POST,DELETE',
        headers: 'Accept,Authorization,Content-Type,Origin,Referer,User-Agent,X-Requested-With',
        credentials: false,
        maxAge: 24 * 60 * 60
    };

/**
 * CORS middleware.
 *
 * @param {*} options
 * @param {String} [options.origin='*']
 * @param {String} [options.methods]
 * @param {String} [options.headers]
 * @param {String} [options.credentials=false]
 * @param {String} [options.maxAge=24*60*60]
 * @returns {Function} connect/express middleware function
 * @see https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
 */
function cors(options) {
    options = _.merge({}, DEF_CONFIG, options);
    DEBUG && debug('configure http cors middleware', options);
    return function (req, res, next) {
        if (req.headers.origin) {
            res.header('Access-Control-Allow-Origin', options.origin === '*' ? req.headers.origin : options.origin);
            res.header('Access-Control-Allow-Methods', options.methods);
            res.header('Access-Control-Allow-Headers', options.headers);
            res.header('Access-Control-Allow-Credentials', options.credentials);
            res.header('Access-Control-Max-Age', options.maxAge);
            if ('OPTIONS' === req.method) {
                // CORS pre-flight request -> no content
                return res.send(errors.StatusCode.NO_CONTENT);
            }
        }
        return next();
    };
}

module.exports = cors;
