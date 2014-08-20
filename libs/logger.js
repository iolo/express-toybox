'use strict';

var
    path = require('path'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:logger'),
    DEBUG = debug.enabled;

/**
 * logger middleware using "morgan" or "debug".
 *
 * @param {*|String} options or log format.
 * @param {Number|Boolean} [options.buffer]
 * @param {Boolean} [options.immediate]
 * @param {Function} [options.skip]
 * @param {*} [options.stream]
 * @param {String} [options.format] log format. "combined", "common", "dev", "short", "tiny" or "default".
 * @param {String} [options.file] emit log to file.
 * @param {String} [options.debug] emit log to tj's "debug".
 * @returns {Function} connect/express middleware function
 */

function logger(options) {
    DEBUG && debug('configure http logger middleware', options);
    var format;
    if (typeof options === 'string') {
        format = options;
        options = {};
    } else {
        format = 'default';
        options = options || {};
        if (options.debug) {
            try {
                return require('morgan-debug')(options.debug, format, options);
            } catch (e) {
                console.error('failed to configure logger with debug', e);
                //process.exit(1);
            }
        }
        if (options.file) {
            try {
                var loggerFile = path.resolve(process.cwd(), options.file);
                // replace stream options with stream object
                delete options.file;
                options.stream = require('fs').createWriteStream(loggerFile, {flags: 'a'});
                return require('morgan')(format, options);
            } catch (e) {
                console.error('failed to configure logger with file stream', e);
                //process.exit(1);
            }
        }
    }
    console.warn('**fallback** use default logger middleware');
    return require('morgan')(format, options);
}

module.exports = logger;
