'use strict';

var
    Q = require('q'),
    _ = require('lodash'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:resource'),
    DEBUG = debug.enabled;
