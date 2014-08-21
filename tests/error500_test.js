'use strict';

var
    supertest = require('supertest'),
    express = require('express'),
    error500 = require('../libs/error500'),
    debug = require('debug')('test');

describe('error500 middleware', function () {
    it('should return 500 for uncaught exception', function (done) {
        var app = express()
            .all('/500', function (req, res, next) {
                throw new Error("error");
            })
            .use(error500());

        supertest(app)
            .get('/500')
            .set('Accept', 'application/json')
            .expect(500)
            .expect({status: 500, code: 0, message: 'error'}, done);
    });
    it('should return custom status code', function (done) {
        var app = express()
            .all('/501', function (req, res, next) {
                var HttpError = require('../libs/errors').HttpError;
                throw new HttpError('ERROR501', 501, 'CAUSE501');
            })
            .use(error500());

        supertest(app)
            .get('/501')
            .set('Accept', 'application/json')
            .expect(501)
            .expect({status: 501, code: 8501, message: 'ERROR501', cause: 'CAUSE501'}, done);
    });
    it('should return custom error response', function (done) {
        var app = express()
            .all('/502', function (req, res, next) {
                throw {status: 502, code: 1502, message: 'ERROR502', cause: 'CAUSE502'};
            })
            .use(error500());

        supertest(app)
            .get('/502')
            .set('Accept', 'application/json')
            .expect(502)
            .expect({status: 502, code: 1502, message: 'ERROR502', cause: 'CAUSE502'}, done);
    });
});
