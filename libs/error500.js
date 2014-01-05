'use strict';

var
  util = require('util'),
  path = require('path'),
  _ = require('lodash'),
  Q = require('q'),
  express = require('express'),
  errors = require('./errors'),
  debug = require('debug')('express-toybox:error500'),
  DEBUG = debug.enabled;

/**
 * express uncaught error handler.
 *
 * @param {*} options
 * @param {string} [options.view='errors/500']
 * @param {boolean} [options.stack=false]
 * @returns {function} express error handler
 */
function error500(options) {
  options = options || {};
  var htmlView = options.view || 'errors/500';

  return function (err, req, res, next) {
    console.error('uncaught express error:', err);

    var error = {
      status: err.status || 500,
      code: err.code || 0,
      message: err.message || String(err)
    };
    if (options.stack) {
      error.stack = (err.stack && err.stack.split('\n')) || [];
    }

    res.status(error.status);

    switch (req.accepts('html,json')) {
      case 'html':
        return res.render(htmlView, {error: error});
      case 'json':
        return res.json(error);
    }
    return res.send(util.inspect(error));
  };
}

module.exports = error500;
