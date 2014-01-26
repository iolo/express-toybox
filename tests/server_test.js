'use strict';

var
    fs = require('fs'),
    superagent = require('superagent'),
    express = require('express'),
    server = require('../libs/server'),
    debug = require('debug')('test');

module.exports = {
    setUp: function (callback) {
        this.app = express();
        this.server = server.start(this.app, {port:3000}, callback);
    },
    tearDown: function (callback) {
        server.stop(callback);
    },
    test_get: function (test) {
        this.app.get('/test', function (req, res) {
            res.send(200);
        });

        var req = superagent.agent().get('http://localhost:3000/test');
        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            //debug('***response', res);
            test.equal(res.status, 200);
            test.done();
        });
    }
};
