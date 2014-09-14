'use strict';

var
    assert = require('assert'),
    supertest = require('supertest'),
    express = require('express'),
    resource = require('../resource'),
    debug = require('debug')('test');

describe('resource', function () {
    it('should route to index', function (done) {
        var app = express().useResource('/posts/:id', {
            index: function (req, res) {
                assert(typeof req.param('id') === 'undefined');
                res.send('index');
            }
        });
        supertest(app)
            .get('/posts')
            .expect(200)
            .expect('index', done);
    });
    it('should route to create', function (done) {
        var app = express().useResource('/posts/:id', {
            create: function (req, res) {
                assert(typeof req.param('id') === 'undefined');
                res.send('create');
            }
        });
        supertest(app)
            .post('/posts')
            .expect(200)
            .expect('create', done);
    });
    it('should route to show', function (done) {
        var app = express().useResource('/posts/:id', {
            show: function (req, res) {
                assert.equal(req.param('id'), 123);
                res.send('show:' + req.param('id'));
            }
        });
        supertest(app)
            .get('/posts/123')
            .expect(200)
            .expect('show:123', done);
    });
    it('should route to update', function (done) {
        var app = express().useResource('/posts/:id', {
            update: function (req, res) {
                assert.equal(req.param('id'), 123);
                res.send('update:' + req.param('id'));
            }
        });
        supertest(app)
            .put('/posts/123')
            .expect(200)
            .expect('update:123', done);
    });
    it('should route to destroy', function (done) {
        var app = express().useResource('/posts/:id', {
            destroy: function (req, res) {
                assert.equal(req.param('id'), 123);
                res.send('destroy:' + req.param('id'));
            }
        });
        supertest(app)
            .del('/posts/123')
            .expect(200)
            .expect('destroy:123', done);
    });

    it('should not route to index with param', function (done) {
        var app = express().useResource('/posts/:id', {
            index: function (req, res) {
                res.send('error');
            }
        });
        supertest(app)
            .get('/posts/123')
            .expect(404, done);
    });
    it('should not route to create with param', function (done) {
        var app = express().useResource('/posts/:id', {
            index: function (req, res) {
                res.send('error');
            }
        });
        supertest(app)
            .post('/posts/123')
            .expect(404, done);
    });
    it('should not route to show without param', function (done) {
        var app = express().useResource('/posts/:id', {
            show: function (req, res) {
                res.send('error');
            }
        });
        supertest(app)
            .get('/posts')
            .expect(404, done);
    });
    it('should not route to update without param', function (done) {
        var app = express().useResource('/posts/:id', {
            update: function (req, res) {
                res.send('error');
            }
        });
        supertest(app)
            .put('/posts')
            .expect(404, done);
    });
    it('should not route to destroy without param', function (done) {
        var app = express().useResource('/posts/:id', {
            destroy: function (req, res) {
                res.send('error');
            }
        });
        supertest(app)
            .del('/posts')
            .expect(404, done);
    });
    it('should route to index with interim param', function (done) {
        var app = express().useResource('/posts/:pid/comments', {
            index: function (req, res) {
                assert.equal(req.param('pid'), 123);
                res.send('index:' + req.param('pid'));
            }
        });
        supertest(app)
            .get('/posts/123/comments')
            .expect(200)
            .expect('index:123', done);
    });
    it('should route to show with interim param and last param', function (done) {
        var app = express().useResource('/posts/:pid/comments/:cid', {
            show: function (req, res) {
                assert.equal(req.param('pid'), 123);
                assert.equal(req.param('cid'), 456);
                res.send('show:' + req.param('pid') + ':' + req.param('cid'));
            }
        });
        supertest(app)
            .get('/posts/123/comments/456')
            .expect(200)
            .expect('show:123:456', done);
    });
});
