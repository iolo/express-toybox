'use strict';

var
    path = require('path'),
    express = require('express'),
    errors = require('./errors'),
    utils = require('./utils'),
    logger = require('./logger'),
    session = require('./session'),
    cors = require('./cors'),
    error404 = require('./error404'),
    error500 = require('./error500'),
    debug = require('debug')('express-toybox:common'),
    DEBUG = debug.enabled;

function configureMiddlewares(app, config) {
    utils.extendHttpRequest();

    // NOTE: this should be the first middleware
    if (config.logger && !config.logger.disabled) {
        app.use(logger(config.logger));
    }

    if (config.cookieParser && !config.cookieParser.disabled) {
        app.use(express.cookieParser(config.cookieParser));
    }

    if (config.bodyParser && !config.bodyParser.disabled) {
        app.use(express.bodyParser(config.bodyParser));
    }

    //app.use(express.methodOverride());

    // allow cors request
    if (config.cors && !config.cors.disabled) {
        app.use(cors(config.cors));
    }

    // NOTE: this should be prior to passport middlewares
    if (config.session && !config.session.disabled) {
        app.use(session(config.session));
    }

    if (config.root) {
        var root = path.resolve(process.cwd(), config.root);
        DEBUG && debug('configure http static root:', root);
        app.use(express.favicon(path.join(root, 'favicon.ico')));
        app.use(express.static(root));
    }

    if (config.statics) {
        Object.keys(config.statics).forEach(function (urlPrefix) {
            var docRoot = path.resolve(process.cwd(), config.statics[urlPrefix]);
            DEBUG && debug('configure http static route: ', urlPrefix, '--->', docRoot);
            app.use(urlPrefix, express.static(docRoot));
        });
    }
}

function configureRoutes(app, config) {
    DEBUG && debug('configure error routes', config.errors);
    if (config.errors) {
        var config404 = config.errors['404'];
        if (config404) {
            app.use(error404(config404));
        }
        var config500 = config.errors['500'];
        if (config500) {
            app.use(error500(config500));
        }
    } else {
        console.warn('**fallback** use default error route');
        app.use(express.errorHandler({dumpException: true, showStack: true}));
    }
}

module.exports = {
    configureMiddlewares: configureMiddlewares,
    configureRoutes: configureRoutes
};
