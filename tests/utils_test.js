'use strict';

var
    Q = require('q'),
    assert = require('assert'),
    supertest = require('supertest'),
    express = require('express'),
    utils = require('../utils'),
    debug = require('debug')('test');

describe('utils', function () {

    describe('extendHttpRequest', function () {

        utils.extendHttpRequest();

        var query = {
            str: 'hello',
            int: 123,
            num: 123.456,
            bool: true,
            bool_false: false,
            bool_yes: 'yes',
            bool_no: 'no',
            bool_y: 'y',
            bool_n: 'n',
            bool_on: 'on',
            bool_off: 'off',
            bool_zero: 0,
            bool_one: 1,
            date: new Date()
        };

        it('strParam', function (done) {
            var app = express().get('/', function (req, res) {

                assert(typeof req.strParam('str') === 'string');
                assert(req.strParam('str') === query.str);
                assert(req.strParam('str', '***whatever***') === query.str);
                assert(req.strParam('**whatever***', 'world') === 'world');

                assert(typeof req.strParam('int') === 'string');
                assert(req.strParam('int') === String(query.int));

                res.send('index');
            });
            supertest(app)
                .get('/')
                .query(query)
                .expect(200)
                .expect('index', done);
        });

        it('intParam', function (done) {
            var app = express().get('/', function (req, res) {

                assert(typeof req.intParam('int') === 'number');
                assert(req.intParam('int') === query.int);
                assert(req.intParam('int', '***whatever***') === query.int);
                assert(req.intParam('**whatever***', 'world') === 'world');

                assert(typeof req.intParam('num') === 'number');
                assert(req.intParam('num') === parseInt(query.num, 10));

                try {
                    req.numberParam('str');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.numberParam('bool');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.numberParam('date');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                res.send('index');
            });
            supertest(app)
                .get('/')
                .query(query)
                .expect(200)
                .expect('index', done);
        });

        it('numParam', function (done) {
            utils.extendHttpRequest();
            var app = express().get('/', function (req, res) {

                assert(typeof req.numberParam('num') === 'number');
                assert(req.numberParam('num') === query.num);
                assert(req.numberParam('num', '***whatever***') === query.num);
                assert(req.numberParam('**whatever***', 'world') === 'world');

                assert(typeof req.numberParam('int') === 'number');
                assert(req.numberParam('int') === query.int);

                try {
                    req.numberParam('str');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.numberParam('bool');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.numberParam('date');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                res.send('index');
            });
            supertest(app)
                .get('/')
                .query(query)
                .expect(200)
                .expect('index', done);
        });

        it('boolParam', function (done) {
            var app = express().get('/', function (req, res) {

                assert(typeof req.boolParam('bool') === 'boolean');
                assert(req.boolParam('bool') === query.bool);
                assert(req.boolParam('bool', '***whatever***') === query.bool);
                assert(req.boolParam('**whatever***', 'world') === 'world');

                assert(typeof req.boolParam('bool_false') === 'boolean');
                assert(req.boolParam('bool_false') === query.bool_false);

                assert(typeof req.boolParam('bool_yes') === 'boolean');
                assert(req.boolParam('bool_yes') === true);

                assert(typeof req.boolParam('bool_no') === 'boolean');
                assert(req.boolParam('bool_no') === false);

                assert(typeof req.boolParam('bool_on') === 'boolean');
                assert(req.boolParam('bool_on') === true);

                assert(typeof req.boolParam('bool_off') === 'boolean');
                assert(req.boolParam('bool_off') === false);

                assert(typeof req.boolParam('bool_y') === 'boolean');
                assert(req.boolParam('bool_y') === true);

                assert(typeof req.boolParam('bool_n') === 'boolean');
                assert(req.boolParam('bool_n') === false);

                assert(typeof req.boolParam('bool_one') === 'boolean');
                assert(req.boolParam('bool_one') === true);

                assert(typeof req.boolParam('bool_zero') === 'boolean');
                assert(req.boolParam('bool_zero') === false);

                try {
                    req.boolParam('str');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.boolParam('int');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.boolParam('num');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.boolParam('date');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                res.send('index');
            });
            supertest(app)
                .get('/')
                .query(query)
                .expect(200)
                .expect('index', done);
        });

        it('dateParam', function (done) {
            var app = express().get('/', function (req, res) {

                assert(typeof req.dateParam('date') === 'object');
                assert(req.dateParam('date') instanceof Date);
                assert(req.dateParam('date').toString() === query.date.toString());
                assert(req.dateParam('date', '***whatever***').toString() === query.date.toString());
                assert(req.dateParam('**whatever***', 'world') === 'world');

                assert(typeof req.dateParam('int') === 'object');
                assert(req.dateParam('int') instanceof Date);
                assert(req.dateParam('int').toString() === new Date(Date.parse(query.int)).toString());

                try {
                    req.dateParam('str');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.dateParam('bool');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                try {
                    req.dateParam('num');
                    assert(false);
                } catch (e) {
                    assert(e.status, 400);
                }

                res.send('index');
            });
            supertest(app)
                .get('/')
                .query(query)
                .expect(200)
                .expect('index', done);
        });
    });

    describe('extendHttpResponse', function () {

        utils.extendHttpResponse();

        function asyncFunc(expected, callback) {
            setTimeout(function () {
                callback(null, expected);
            }, 10);
        }

        function promiseFunc(expected) {
            var d = Q.defer();
            setTimeout(function () {
                d.resolve(expected);
            }, 10);
            return d.promise;
        }

        it('sendCallbackFn', function (done) {
            var app = express().get('/', function (req, res, next) {
                asyncFunc('index', res.sendCallbackFn(next));
            });
            supertest(app)
                .get('/')
                .expect(200)
                .expect('index', done);
        });

        it('jsonCallbackFn', function (done) {
            var app = express().get('/', function (req, res, next) {
                asyncFunc({foo: 'hello'}, res.jsonCallbackFn(next));
            });
            supertest(app)
                .get('/')
                .expect(200)
                .expect({foo: 'hello'}, done);
        });

        it('jsonpCallbackFn', function (done) {
            var app = express().get('/', function (req, res, next) {
                asyncFunc({foo: 'hello'}, res.jsonpCallbackFn(next));
            });
            supertest(app)
                .get('/')
                .query({callback: 'world'})
                .expect(200)
                .expect('/**/ typeof world === \'function\' && world({"foo":"hello"});', done);
        });

        it('sendFileCallbackFn', function (done) {
            var app = express().get('/', function (req, res, next) {
                asyncFunc('foo.txt', res.sendFileCallbackFn(next));
            });
            supertest(app)
                .get('/')
                .expect(200)
                .expect('FOO', done);
        });

        it('redirectCallbackFn', function (done) {
            var app = express().get('/', function (req, res, next) {
                asyncFunc('/another', res.redirectCallbackFn(next));
            });
            supertest(app)
                .get('/')
                .expect(302)
                .expect('Location', '/another', done);
        });

        it('sendLater', function (done) {
            var app = express().get('/', function (req, res, next) {
                res.sendLater(promiseFunc('index'));
            });
            supertest(app)
                .get('/')
                .expect(200)
                .expect('index', done);
        });

        it('jsonLater', function (done) {
            var app = express().get('/', function (req, res, next) {
                res.jsonLater(promiseFunc({foo: 'bar'}));
            });
            supertest(app)
                .get('/')
                .expect(200)
                .expect({foo: 'bar'}, done);
        });

        it('jsonpLater', function (done) {
            var app = express().get('/', function (req, res, next) {
                res.jsonpLater(promiseFunc({foo: 'hello'}));
            });
            supertest(app)
                .get('/')
                .query({callback: 'world'})
                .expect(200)
                .expect('/**/ typeof world === \'function\' && world({"foo":"hello"});', done);
        });

        it('sendFileLater', function (done) {
            var app = express().get('/', function (req, res, next) {
                res.sendFileLater(promiseFunc('foo.txt'));
            });
            supertest(app)
                .get('/')
                .expect(200)
                .expect('FOO', done);
        });

        it('redirectLater', function (done) {
            var app = express().get('/', function (req, res, next) {
                res.redirectLater(promiseFunc('/another'));
            });
            supertest(app)
                .get('/')
                .expect(302)
                .expect('Location', '/another', done);
        });
    });
});
