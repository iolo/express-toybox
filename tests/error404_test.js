'use strict';

var
    supertest = require('supertest'),
    express = require('express'),
    error404 = require('../libs/error404'),
    debug = require('debug')('test');

describe('error404 middeware', function () {
    it('should return 404 error', function (done) {
        supertest(express().use(error404()))
            .get('/test')
            .expect(404, done);
    });
    it('should return html error response with template', function (done) {
        var app = express()
            .use(error404({
                template: '<h1><%=error.status%>:<%=error.code%>:<%=error.message%>:<%=error.cause.path%></h1>'
            }));

        supertest(app)
            .get('/test')
            .set('Accept', 'text/html')
            .expect(404)
            .expect('<h1>404:8404:Not Found:/test</h1>', done);
    });
});
