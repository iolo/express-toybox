'use strict';

var
    express = require('express'),
    expressSession = require('express-session'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:session'),
    DEBUG = debug.enabled;

/**
 * session middleware.
 *
 * @param {*} [options]
 * @param {*} [options.store]
 * @param {String} [options.store.module]
 * @param {*} [options.store.options] store specific options
 * @returns {function} connect/express middleware function
 * @see https://github.com/expressjs/session
 */
function session(options) {
    options = options || {};
    DEBUG && debug('configure http session middleware', options);
    if (options.store) {
        try {
            var storeModule = options.store.module;
            var SessionStore = require(storeModule)(express);
            // replace store options with store object
            options.store = new SessionStore(options.store.options);
            return expressSession(options);
        } catch (e) {
            console.error('failed to configure http session store', e);
            //process.exit(1);
        }
    }
    console.warn('**fallback** use default session middleware');
    return expressSession(options);
}

module.exports = session;
