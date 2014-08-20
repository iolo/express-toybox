'use strict';

var
    fs = require('fs'),
    path = require('path'),
    superagent = require('superagent'),
    express = require('express'),
    common = require('../libs/common'),
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
    test_statics: function (test) {
        common.configureMiddlewares(this.app, {logger: 'combined', statics: {'/test': __dirname}});

        var req = superagent.agent().get('http://localhost:3000/test/foo.txt');
        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            //debug('***response', res);
            test.equal(res.status, 200);
            test.equal(res.text, 'FOO');
            test.done();
        });
    },
    test_statics2: function (test) {
        this.app.useCommonMiddlewares({logger: 'combined', statics: {'/test': __dirname}});

        var req = superagent.agent().get('http://localhost:3000/test/foo.txt');
        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            //debug('***response', res);
            test.equal(res.status, 200);
            test.equal(res.text, 'FOO');
            test.done();
        });
    }
};
