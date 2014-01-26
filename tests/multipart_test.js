'use strict';

var
    fs = require('fs'),
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

            var foo = req.files.foo;
            test.ok(foo);
            test.equal(foo.name, 'foo.txt');
            test.equal(foo.size, 3);
            test.equal(fs.readFileSync(foo.path, 'utf8'), 'FOO');

            var bar = req.files.bar;
            test.ok(bar);
            test.equal(bar.name, 'bar.txt');
            test.equal(bar.size, 3);
            test.equal(fs.readFileSync(bar.path, 'utf8'), 'BAR');

            test.equal(req.body.baz, 'BAZ');
            test.equal(req.param('baz'), 'BAZ');
            test.equal(req.body.qux, 'QUX');
            test.equal(req.param('qux'), 'QUX');

            res.send(200);
        });

        var req = superagent.agent().post('http://localhost:3000/test');
        req.part()
            .set('Content-Disposition', 'form-data; name="foo"; filename="foo.txt"')
            .set('Content-Type', 'text/plain')
            .set('Content-Transfer-Encoding', 'binary')
            .write('FOO');

        req.part()
            .set('Content-Disposition', 'form-data; name="bar"; filename="bar.txt"')
            .set('Content-Type', 'text/plain')
            .set('Content-Transfer-Encoding', 'binary')
            .write('BAR');

        req.part()
            .set('Content-Disposition', 'form-data; name="baz"')
            .write('BAZ');

        req.part()
            .set('Content-Disposition', 'form-data; name="qux"')
            .write('QUX');

        req.end(function (err, res) {
            debug('***error', err);
            //debug('***request', req);
            //debug('***response', res);
            test.equal(res.status, 200);
            test.done();
        });
    }
};
