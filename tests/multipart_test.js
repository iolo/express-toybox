'use strict';

var
    fs = require('fs'),
    path = require('path'),
    superagent = require('superagent'),
    express = require('express'),
    multipart = require('../libs/multipart'),
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
    test_multipart: function (test) {
        this.app.use(multipart());
        this.app.post('/test', function (req, res) {
            //debug('***req.form', req.form);
            //debug('***req.files', req.files);
            //debug('***req.body ', req.body);

            test.ok(req.form);
            test.ok(req.files);
            test.ok(req.body);

            test.ok(req.files);
            test.ok(req.files instanceof Object);
            test.ok(req.files.foo);
            test.ok(req.files.foo instanceof Array);
            test.equal(req.files.foo.length, 1);
            test.ok(req.files.bar);
            test.ok(req.files.bar instanceof Array);
            test.equal(req.files.bar.length, 1);

            var foo = req.files.foo[0];
            test.ok(foo);
            test.equal(foo.fieldName, 'foo');
            test.equal(foo.originalFilename, 'foo.txt');
            test.equal(foo.size, 3);
            test.equal(fs.readFileSync(foo.path, 'utf8'), 'FOO');

            var bar = req.files.bar[0];
            test.ok(bar);
            test.equal(bar.fieldName, 'bar');
            test.equal(bar.originalFilename, 'bar.txt');
            test.equal(bar.size, 3);
            test.equal(fs.readFileSync(bar.path, 'utf8'), 'BAR');

            test.equal(req.body.baz, 'BAZ');
            test.equal(req.param('baz'), 'BAZ');
            test.equal(req.body.qux, 'QUX');
            test.equal(req.param('qux'), 'QUX');

            res.send(200);
        });

        var req = superagent.agent().post('http://localhost:3000/test');
        req.attach('foo', path.join(__dirname, '/foo.txt'), 'foo.txt');
        req.attach('bar', path.join(__dirname, '/bar.txt'), 'bar.txt');
        req.field('baz', 'BAZ');
        req.field('qux', 'QUX');
        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            //debug('***response', res);
            test.equal(res.status, 200);
            test.done();
        });
    }
};
