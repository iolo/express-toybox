'use strict';

var
    assert = require('assert'),
    superagent = require('superagent'),
    express = require('express'),
    server = require('../libs/server'),
    debug = require('debug')('test');

describe('server', function () {
    it('should start/stop', function (done) {
        var app = express()
            .get('/test', function (req, res) {
                res.status(200).send('ok').end();
            });

        server.start(app, {port: 3000}, function (err) {
            assert.ifError(err);
            superagent.agent()
                .get('http://localhost:3000/test')
                .end(function (err, res) {
                    //debug('***error', err);
                    assert.ifError(err);
                    //debug('***request', req);
                    //debug('***response', res);
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'ok');
                    server.stop(function (err) {
                        assert.ifError(err);
                        done();
                    });
                });
        });
    });
});
