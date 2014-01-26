'use strict';

var
    http = require('http'),
    _ = require('lodash'),
    debug = require('debug')('express-toybox:server'),
    DEBUG = debug.enabled;

var
    httpServer,
    DEF_CONFIG = {
        host: 'localhost',
        port: 3000
    };

/**
 * start http server.
 *
 * @param {*} app request listener. might be express(or connect) application instance.
 * @param {*} [config] http server configurations
 * @param {String} [config.host='localhost']
 * @param {Number} [config.port=3000]
 * @param {Function(http.Server)} callback
 * @returns {http.Server} http server instance
 */
function start(app, config, callback) {
    if (httpServer) {
        DEBUG && debug('***ignore*** http server is already running!');
        callback && callback(false);
        return httpServer;
    }

    config = _.merge({}, DEF_CONFIG, config);

    DEBUG && debug('start http server http://' + config.host + ':' + config.port);
    httpServer = http.createServer(app).listen(config.port, config.host, callback);

    httpServer.on('close', function () {
        DEBUG && debug('close http server');
        httpServer = null;
    });

    process.on('exit', function () {
      stop();
    });

    if (process.env.NODE_ENV === 'production') {
        process.on('uncaughtException', function (err) {
            console.error('***uncaughtException***', err);
        });
    }

    return httpServer;
}

/**
 * stop http server
 *
 * @param {Function} callback
 */
function stop(callback) {
    if (httpServer) {
        DEBUG && debug('stop http server');
        try {
            httpServer.close();
        } catch (e) {
        }
        httpServer = null;
    } else {
        DEBUG && debug('***ignore*** http server is not running!');
    }
    callback && callback(false);
}

module.exports.start = start;
module.exports.stop = stop;

