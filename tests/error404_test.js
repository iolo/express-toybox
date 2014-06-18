'use strict';

var
    fs = require('fs'),
    path = require('path'),
    superagent = require('superagent'),
    express = require('express'),
    error404 = require('../libs/error404'),
    debug = require('debug')('test');

module.exports = {
    setUp: function (callback) {
        this.app = express();
        this.server = require('http').createServer(this.app).listen(3000, callback);
    },
    tearDown: function (callback) {
        this.server.close();
        callback();
    },
    test_error404: function (test) {
        this.app.use(error404());

        var req = superagent.agent().get('http://localhost:3000/404');
        req.set('Accept', 'application/json')
        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            debug('***response', res.body);
            test.equal(res.status, 404);
            test.done();
        });
    }
};
