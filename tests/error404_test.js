'use strict';

var
    supertest = require('supertest'),
    express = require('express'),
    error404 = require('../libs/error404'),
    debug = require('debug')('test');

describe('error404 middeware', function () {
    it('should handle 404 error', function (done) {
        supertest(express().use(error404()))
            .get('/404')
            .expect(404, done);
    });
});
