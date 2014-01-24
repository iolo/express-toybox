'use strict';

var
    util = require('util'),
    path = require('path'),
    _ = require('lodash'),
    Q = require('q'),
    express = require('express'),
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
            return express.session(options);
        } catch (e) {
            console.error('failed to configure http session store', e);
            //process.exit(1);
        }
    }
    console.warn('**fallback** use default session middleware');
    return express.session(options);
}

module.exports = session;
