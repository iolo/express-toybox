'use strict';

var
    path = require('path'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:logger'),
    DEBUG = debug.enabled;

/**
 * logger middleware using "morgan".
 *
 * @param {*} options
 * @param {*} [options.stream]
 * @param {String} [options.stream.file]
 * @returns {Function} connect/express middleware function
 */

function logger(options) {
    options = options || {};
    DEBUG && debug('configure http logger middleware', options);
    if (options.stream) {
        try {
            var loggerFile = path.resolve(process.cwd(), options.stream.file || options.stream);
            // replace stream options with stream object
            options.stream = require('fs').createWriteStream(loggerFile, {flags: 'a'});
            return require('morgan')(options);
        } catch (e) {
            console.error('failed to configure http logger stream', e);
            //process.exit(1);
        }
    }
    console.warn('**fallback** use default logger middleware');
    return require('morgan')(options);
}

module.exports = logger;
