'use strict';

module.exports = require('express').toybox = {
    errors: require('./errors'),
    common: require('./common'),
    utils: require('./utils'),
    resource: require('./resource'),
    cors: require('./cors'),
    session: require('./session'),
    logger: require('./logger'),
    error500: require('./error500'),
    error404: require('./error404'),
    server: require('./server')
};
