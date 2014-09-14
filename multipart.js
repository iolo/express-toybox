'use strict';

var
    multiparty = require('multiparty'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:multipart'),
    DEBUG = debug.enabled;

/**
 * multipart middleware using "multiparty".
 *
 * @param {*} [options]
 * @param {String} [encoding='utf8']
 * @param {String} [uploadDir=os.tmpdir()]
 * @param {String} [keepExtensions=false]
 * @param {Number} [maxFields=2*1024*1024]
 * @param {Number} [maxFieldsSize=1000]
 * @param {Number} [maxFilesSize=Infinity]
 * @param {String} [hash=false] 'sha1' or 'md5'
 * @param {boolean} [autoFields]
 * @param {boolean} [autoFiles]

 * @returns {Function} connect/express middleware function
 * @see https://github.com/andrewrk/node-multiparty
 */

function multipart(options) {
    options = options || {};
    DEBUG && debug('configure http multipart middleware', options);
    return function (req, res, next) {
        if (req._body || !req.is('multipart/form-data') || 'POST' !== req.method) {
            return next();
        }

        DEBUG && debug('got multipart request', req.path);
        req.form = new multiparty.Form(options);
        req.form.parse(req, function(err, fields, files) {
            if (err) {
                DEBUG && debug('err', err);
                return next(err);
            }
            DEBUG && debug('fields', fields);
            DEBUG && debug('files', files);
            req._body = true;
            req.body = fields;
            req.files = files;
            return next();
        });
    };
}

module.exports = multipart;
