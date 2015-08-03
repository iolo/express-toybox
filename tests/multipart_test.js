/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    fs = require('fs'),
    path = require('path'),
    assert = require('assert'),
    supertest = require('supertest'),
    express = require('express'),
    multipart = require('../multipart'),
    debug = require('debug')('test');

describe('multipart middleware', function () {
    it('should handle multipart post request', function (done) {
        var app = express()
            .use(multipart())
            .post('/test', function (req, res) {
                //debug('***req.form', req.form);
                //debug('***req.files', req.files);
                //debug('***req.body ', req.body);

                assert.ok(req.form);
                assert.ok(req.files);
                assert.ok(req.body);

                assert.ok(req.files);
                assert.ok(req.files instanceof Object);
                assert.ok(req.files.foo);
                assert.ok(req.files.foo instanceof Array);
                assert.equal(req.files.foo.length, 1);
                assert.ok(req.files.bar);
                assert.ok(req.files.bar instanceof Array);
                assert.equal(req.files.bar.length, 1);

                var foo = req.files.foo[0];
                assert.ok(foo);
                assert.equal(foo.fieldName, 'foo');
                assert.equal(foo.originalFilename, 'foo.txt');
                assert.equal(foo.size, 3);
                assert.equal(fs.readFileSync(foo.path, 'utf8'), 'FOO');

                var bar = req.files.bar[0];
                assert.ok(bar);
                assert.equal(bar.fieldName, 'bar');
                assert.equal(bar.originalFilename, 'bar.txt');
                assert.equal(bar.size, 3);
                assert.equal(fs.readFileSync(bar.path, 'utf8'), 'BAR');

                assert.equal(req.body.baz, 'BAZ');
                assert.equal(req.param('baz'), 'BAZ');
                assert.equal(req.body.qux, 'QUX');
                assert.equal(req.param('qux'), 'QUX');

                res.status(200).end();
            });

        supertest(app)
            .post('/test')
            .attach('foo', path.join(__dirname, '/foo.txt'), 'foo.txt')
            .attach('bar', path.join(__dirname, '/bar.txt'), 'bar.txt')
            .field('baz', 'BAZ')
            .field('qux', 'QUX')
            .expect(200, done);
    });
});
