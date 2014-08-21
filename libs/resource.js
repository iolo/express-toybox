'use strict';

var
    Q = require('q'),
    _ = require('lodash'),
    express = require('express'),
    lingo = require('lingo'),
    errors = require('./errors'),
    debug = require('debug')('express-toybox:resource'),
    DEBUG = debug.enabled;

var HANDLERS = {
    index: {
        method: 'get'
    },
    create: {
        method: 'post'
    },
    show: {
        method: 'get',
        usePathParam: true
    },
    update: {
        method: 'put',
        usePathParam: true
    },
    destroy: {
        method: 'delete',
        usePathParam: true
    }
};

// TODO: more clean & flexible configurations
function configureResource(app, name, module) {
    var path = lingo.en.pluralize(name);
    var pathWithParam = path + '/:' + name;
    DEBUG && debug('configure RESTful resources...', name, '-->', path, '&', pathWithParam);

    Object.keys(HANDLERS).forEach(function (handlerName) {
        var handlerFunc = module[handlerName];
        if (typeof handlerFunc === 'function') {
            var handlerInfo = HANDLERS[handlerName];
            app[handlerInfo.method](handlerInfo.usePathParam ? pathWithParam : path, handlerFunc);
        }
    });
    return app;
}

//
// mixin to express proto.
//

express.application.useResource = express.Router.useResource = function (name, module, opts) {
    return configureResource(this, name, module, opts);
};

module.exports = {
    configureResource: configureResource
};