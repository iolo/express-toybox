'use strict';

var
    supertest = require('supertest'),
    express = require('express'),
    error500 = require('../error500'),
    debug = require('debug')('test');

describe('error500 middleware', function () {
    it('should return 500 for uncaught exception', function (done) {
        var app = express()
            .all('/test', function (req, res, next) {
                throw new Error("error");
            })
            .use(error500());

        supertest(app)
            .get('/test')
            .set('Accept', 'application/json')
            .expect(500)
            .expect({status: 500, code: 8500, message: 'error'}, done);
    });
    it('should return custom status code', function (done) {
        var app = express()
            .all('/test', function (req, res, next) {
                var HttpError = require('../errors').HttpError;
                throw new HttpError('error', 501, 'cause');
            })
            .use(error500());

        supertest(app)
            .get('/test')
            .set('Accept', 'application/json')
            .expect(501)
            .expect({status: 501, code: 8501, message: 'error', cause: 'cause'}, done);
    });
    it('should return custom error response', function (done) {
        var app = express()
            .all('/test', function (req, res, next) {
                throw {status: 502, code: 1502, message: 'error', cause: 'cause'};
            })
            .use(error500());

        supertest(app)
            .get('/test')
            .set('Accept', 'application/json')
            .expect(502)
            .expect({status: 502, code: 1502, message: 'error', cause: 'cause'}, done);
    });
    it('should return mapped-by-err.code error response', function (done) {
        var app = express()
            .all('/test', function (req, res, next) {
                throw {status: 599, code: 8599, message: 'error', cause: 'cause'};
            })
            .use(error500({
                mappings: {
                    8599: {
                        status: 588,
                        message: 'mapped'
                    }
                }
            }));

        supertest(app)
            .get('/test')
            .set('Accept', 'application/json')
            .expect(588)
            .expect({status: 588, code: 8599, message: 'mapped', cause: 'cause'}, done);
    });
    it('should return mapped-by-err.name error response', function (done) {
        var app = express()
            .all('/test', function (req, res, next) {
                // this will throw ENOENT
                require('fs').readFileSync('__not_found__');
            })
            .use(error500({
                mappings: {
                    ENOENT: {status: 404, code: 8404, message: 'MAPPED'}
                }
            }));

        supertest(app)
            .get('/test')
            .set('Accept', 'application/json')
            .expect(404)
            .expect({status: 404, code: 8404, message: 'MAPPED'}, done);
    });
    it('should return html error response with template', function (done) {
        var app = express()
            .all('/test', function (req, res, next) {
                throw {status: 599, code: 8599, message: 'error', cause: 'cause'};
            })
            .use(error500({
                template: '<h1><%=error.status%>:<%=error.code%>:<%=error.message%>:<%=error.cause%></h1>'
            }));

        supertest(app)
            .get('/test')
            .set('Accept', 'text/html')
            .expect(599)
            .expect('<h1>599:8599:error:cause</h1>', done);
    });
});
