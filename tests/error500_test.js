'use strict';

var
    fs = require('fs'),
    path = require('path'),
    superagent = require('superagent'),
    express = require('express'),
    error500 = require('../libs/error500'),
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
    test_error500: function (test) {
        this.app.all('/500', function (req, res, next) {
            throw new Error("error");
        });

        this.app.use(error500());

        var req = superagent.agent().get('http://localhost:3000/500');
        req.set('Accept', 'application/json')
        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            debug('***response', res.body);
            test.equal(res.status, 500);
            test.ok(res.body);
            test.ok(res.body instanceof Object);
            test.equal(res.body.status, 500);
            test.equal(res.body.code, 0);
            test.equal(res.body.message, 'error');
            test.done();
        });
    },
    test_error501: function (test) {
        this.app.all('/501', function (req, res) {
            var HttpError = require('../libs/errors').HttpError;
            throw new HttpError('ERROR501', 501, 'CAUSE501');
        });

        this.app.use(error500());

        var req = superagent.agent().get('http://localhost:3000/501');
        req.set('Accept', 'application/json')
        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            debug('***response', res.body);
            test.equal(res.status, 501);
            test.ok(res.body);
            test.ok(res.body instanceof Object);
            test.equal(res.body.status, 501);
            test.equal(res.body.code, 8501);
            test.equal(res.body.message, 'ERROR501');
            test.equal(res.body.cause, 'CAUSE501');
            test.done();
        });
    },
    test_error502: function (test) {
        this.app.all('/502', function (req, res) {
            throw {status: 502, code: 1502, message: 'ERROR502', cause: 'CAUSE502'};
        });

        this.app.use(error500());

        var req = superagent.agent().get('http://localhost:3000/502');
        req.set('Accept', 'application/json')
        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            debug('***response', res.body);
            test.equal(res.status, 502);
            test.ok(res.body);
            test.ok(res.body instanceof Object);
            test.equal(res.body.status, 502);
            test.equal(res.body.code, 1502);
            test.equal(res.body.message, 'ERROR502');
            test.equal(res.body.cause, 'CAUSE502');
            test.done();
        });
    }
};
