/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    supertest = require('supertest'),
    express = require('express'),
    common = require('../common'),
    debug = require('debug')('test');

describe('common', function () {
    it('should support configureRoutes() function', function (done) {
        var app = common.configureRoutes(express(), {statics: {'/test': __dirname}});
        supertest(app)
            .get('/test/foo.txt')
            .expect(200)
            .expect('FOO', done);
    });
    it('should support useCommonRoutes() method', function (done) {
        var app = express().useCommonRoutes({statics: {'/test': __dirname}});
        supertest(app)
            .get('/test/foo.txt')
            .expect(200)
            .expect('FOO', done);
    });
});
