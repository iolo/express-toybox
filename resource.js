'use strict';

var
    Q = require('q'),
    _ = require('lodash'),
    express = require('express'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:resource'),
    DEBUG = debug.enabled;

var
    PARAM_REGEXP = new RegExp('/:[^/]+$'),
    HANDLERS = {
        index: {
            method: 'get'
        },
        create: {
            method: 'post'
        },
        show: {
            method: 'get',
            param: true
        },
        update: {
            method: 'put',
            param: true
        },
        destroy: {
            method: 'delete',
            param: true
        }
    };

function configureResource(app, path, module) {
    DEBUG && debug('configure RESTful resource on ', path);

    Object.keys(HANDLERS).forEach(function (handlerName) {
        var handlerFunc = module[handlerName];
        if (typeof handlerFunc === 'function') {
            var handlerInfo = HANDLERS[handlerName];
            app[handlerInfo.method](handlerInfo.param ? path : path.replace(PARAM_REGEXP, ''), handlerFunc);
        }
    });
    return app;
}

//
// mixin to express proto.
//

express.application.useResource = express.Router.useResource = function (name, module) {
    return configureResource(this, name, module);
};

module.exports = {
    configureResource: configureResource
};
