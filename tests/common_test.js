'use strict';

var
    supertest = require('supertest'),
    express = require('express'),
    common = require('../libs/common'),
    debug = require('debug')('test');

describe('common middlewares', function () {
    it('should support configureMiddlewares() function', function (done) {
        var app = common.configureMiddlewares(express(), {logger: 'combined', statics: {'/test': __dirname}});
        supertest(app)
            .get('/test/foo.txt')
            .expect(200)
            .expect('FOO', done);
    });
    it('should support useCommonMiddlewares() method', function (done) {
        var app = express().useCommonMiddlewares({logger: 'combined', statics: {'/test': __dirname}});
        supertest(app)
            .get('/test/foo.txt')
            .expect(200)
            .expect('FOO', done);
    });
});
