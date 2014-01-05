'use strict';

var
  util = require('util'),
  path = require('path'),
  _ = require('lodash'),
  Q = require('q'),
  express = require('express'),
  errors = require('./errors'),
  debug = require('debug')('express-toybox:cors'),
  DEBUG = debug.enabled;


/**
 * CORS middleware.
 *
 * @param {*} options
 * @param {string} [options.origin='*']
 * @param {string} [options.methods]
 * @param {string} [options.headers]
 * @param {string} [options.credentials=false]
 * @param {string} [options.maxAge=24*60*60]
 * @returns {function} connect/express middleware function
 * @see https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
 */
function cors(options) {
  options = _.merge(options || {}, {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE',
    headers: 'Accept,Authorization,Content-Type,Origin,Referer,User-Agent,X-Requested-With',
    credentials: false,
    maxAge: 24 * 60 * 60
  });
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
