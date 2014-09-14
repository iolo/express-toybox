'use strict';

var
    _ = require('lodash'),
    toybox = {
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

function extendExpress(express) {
    express = express || require('express');
    if (!express.toybox) {
        express.toybox = toybox;
    }
    return express;
}

// require('express-toybox'); --> toybox itself
// require('express-toybox')() --> express with toybox property
// require('express-toybox')(something) --> something with toybox property
module.exports = _.extend(extendExpress, toybox);
