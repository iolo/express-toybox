'use strict';

var
    path = require('path'),
    express = require('express'),
    errors = require('./errors'),
    utils = require('./utils'),
    debug = require('debug')('express-toybox:common'),
    DEBUG = debug.enabled;

/**
 * setup common express/connect middlewares including logger, session, cors, ...
 *
 * NOTE: this should be called before your middlewares and routes.
 *
 * @param {*} app express application instance
 * @param {*} config
 * @return {*} app
 */
function configureMiddlewares(app, config) {
    config = config || {};

    // setup request helpers
    utils.extendHttpRequest();

    // setup response helpers
    utils.extendHttpResponse();

    //
    // order is meaningful for some express middlewares
    //

    // NOTE: this should be the first middleware
    if (config.logger) {
        app.use(require('./logger')(config.logger));
    }

    // NOTE: this should be placed "high" within middleware stack
    if (config.compress || config.compression) {
        app.use(require('compression')(config.compress || config.compression));
    }

    // NOTE: this should be before "session" middleware using "cookie store"
    if (config.cookieParser) {
        app.use(require('cookie-parser')(config.cookieParser));
    }

    // "_method" body param or "x-http-method-override' header
    if (config.methodOverride) {
        app.use(require('method-override')(config.methodOverride));
    }

    // "cors" request
    if (config.cors) {
        app.use(require('./cors')(config.cors));
    }

    // NOTE: this should be before "passport" middlewares
    if (config.session) {
        app.use(require('./session')(config.session));
    }

    // this should be after "session" middleware
    if (config.csrf || config.csurf) {
        app.use(require('csurf')(config.csrf || config.csurf));
    }

    // application/json
    if (config.json) {
        app.use(require('body-parser').json(config.json));
    }

    // application/x-www-form-urlencoded
    if (config.urlencoded) {
        app.use(require('body-parser').urlencoded(config.urlencoded));
    }

    // multipart/form-data
    if (config.multipart) {
        app.use(require('./multipart')(config.multipart));
    }

    return app;
}

/**
 * setup common express/connect routes including 404, 500 and errorHandler.
 *
 * NOTE: this should be called after your middlewares and routes.
 *
 * @param {*} app express application instance
 * @param {*} config
 * @return {*} app
 */
function configureRoutes(app, config) {
    config = config || {};

    // TODO: add declarative routes
    // 'GET /foo bar:qux' --> get('/foo', require('bar)['qux']) ???
    // ...

    if (config.resources) {
        Object.keys(config.resources).forEach(function (urlPrefix) {
            DEBUG && debug('configure resource route: ', urlPrefix, '--->', config.resources[urlPrefix]);
            require('./resource').configureResource(app, urlPrefix, require(config.resources[urlPrefix]));
        });
    }

    if (config.statics) {
        Object.keys(config.statics).forEach(function (urlPrefix) {
            var dir = path.resolve(process.cwd(), config.statics[urlPrefix]);
            DEBUG && debug('configure http static route: ', urlPrefix, '--->', dir);
            app.use(urlPrefix, require('serve-static')(dir));
        });
    }

    if (config.root) {
        var root = path.resolve(process.cwd(), config.root);
        DEBUG && debug('configure http static root:', root);
        app.use(require('serve-favicon')(path.join(root, 'favicon.ico')));
        app.use(require('serve-static')(root));
    }

    DEBUG && debug('configure error routes', config.errors);
    if (config.errors) {
        var config404 = config.errors['404'];
        if (config404) {
            app.use(require('./error404')(config404));
        }
        var config500 = config.errors['500'];
        if (config500) {
            app.use(require('./error500')(config500));
        }
    }

    // NOTE: this should be end-of-middleware chain
    app.use(require('errorhandler')({dumpException: true, showStack: true}));

    return app;
}

//
// mixin to express proto.
//

express.application.useCommonMiddlewares = function (config) {
    return configureMiddlewares(this, config);
};

express.application.useCommonRoutes = function (config) {
    return configureRoutes(this, config);
};

module.exports = {
    configureMiddlewares: configureMiddlewares,
    configureRoutes: configureRoutes
};
