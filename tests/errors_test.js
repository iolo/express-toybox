/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    assert = require('assert'),
    errors = require('../errors'),
    debug = require('debug')('test');

describe('errors', function () {
    it('HttpError', function () {
        var e = new errors.HttpError();
        debug(e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.HttpError);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        assert.equal(e.message, errors.StatusLine[errors.StatusCode.UNKNOWN]);
        assert.equal(e.status, errors.StatusCode.UNKNOWN);
        assert.equal(e.code, 8599);
    });
    it('ClientError', function () {
        var e = new errors.ClientError();
        debug(e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.ClientError);
        assert.ok(e instanceof errors.HttpError);
        assert.ok(e instanceof Error);
        assert.equal(e.message, errors.StatusLine[errors.StatusCode.CLIENT_ERROR]);
        assert.equal(e.status, errors.StatusCode.CLIENT_ERROR);
        assert.equal(e.code, 8400);
    });
    it('BadRequest', function () {
        var e = new errors.BadRequest();
        debug(e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.ClientError);
        assert.ok(e instanceof errors.BadRequest);
        assert.ok(e instanceof errors.HttpError);
        assert.ok(e instanceof Error);
        assert.equal(e.message, errors.StatusLine[errors.StatusCode.BAD_REQUEST]);
        assert.equal(e.status, errors.StatusCode.BAD_REQUEST);
        assert.equal(e.code, 8400);
    });
    it('Unauthorized', function () {
        var e = new errors.Unauthorized();
        debug(e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.Unauthorized);
        assert.ok(e instanceof errors.ClientError);
        assert.ok(e instanceof errors.HttpError);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        assert.equal(e.message, errors.StatusLine[errors.StatusCode.UNAUTHORIZED]);
        assert.equal(e.status, errors.StatusCode.UNAUTHORIZED);
        assert.equal(e.code, 8401);
    });
    it('Forbidden', function () {
        var e = new errors.Forbidden();
        debug(e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.Forbidden);
        assert.ok(e instanceof errors.ClientError);
        assert.ok(e instanceof errors.HttpError);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        assert.equal(e.message, errors.StatusLine[errors.StatusCode.FORBIDDEN]);
        assert.equal(e.status, errors.StatusCode.FORBIDDEN);
        assert.equal(e.code, 8403);
    });
    it('NotFound', function () {
        var e = new errors.NotFound();
        debug(e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.NotFound);
        assert.ok(e instanceof errors.ClientError);
        assert.ok(e instanceof errors.HttpError);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        assert.equal(e.message, errors.StatusLine[errors.StatusCode.NOT_FOUND]);
        assert.equal(e.status, errors.StatusCode.NOT_FOUND);
        assert.equal(e.code, 8404);
    });
    it('ServerError', function () {
        var e = new errors.ServerError();
        debug(e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.ServerError);
        assert.ok(e instanceof errors.HttpError);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        assert.equal(e.message, errors.StatusLine[errors.StatusCode.SERVER_ERROR]);
        assert.equal(e.status, errors.StatusCode.SERVER_ERROR);
        assert.equal(e.code, 8500);
    });
    it('InternalServerError', function () {
        var e = new errors.InternalServerError();
        debug(e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.InternalServerError);
        assert.ok(e instanceof errors.ServerError);
        assert.ok(e instanceof errors.HttpError);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        assert.equal(e.message, errors.StatusLine[errors.StatusCode.INTERNAL_SERVER_ERROR]);
        assert.equal(e.status, errors.StatusCode.INTERNAL_SERVER_ERROR);
        assert.equal(e.code, 8500);
    });
});
