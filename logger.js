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
 * @param {String} [options.format='combined'] log format. "combined", "common", "dev", "short", "tiny" or "default".
 * @param {String} [options.file] file to emit log.
 * @param {String} [options.debug] namespace for tj's debug namespace to emit log.
 * @returns {Function} connect/express middleware function
 */

function logger(options) {
    DEBUG && debug('configure http logger middleware', options);
    var format;
    if (typeof options === 'string') {
        format = options;
        options = {};
    } else {
        format = options.format || 'combined';
        delete options.format;
    }
    if (options.debug) {
        try {
            return require('morgan-debug')(options.debug, format, options);
        } catch (e) {
            console.error('**fatal** failed to configure logger with debug', e);
            return process.exit(2);
        }
    }
    if (options.file) {
        try {
            var file = path.resolve(process.cwd(), options.file);
            // replace stream options with stream object
            delete options.file;
            options.stream = require('fs').createWriteStream(file, {flags: 'a'});
        } catch (e) {
            console.error('**fatal** failed to configure logger with file stream', e);
            return process.exit(2);
        }
    }
    console.warn('**fallback** use default logger middleware');
    return require('morgan')(format, options);
}

module.exports = logger;
