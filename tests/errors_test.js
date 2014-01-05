'use strict';

var
  errors = require('../../libs/errors'),
  debug = require('debug')('test');

module.exports = {
  test_HttpError: function (test) {
    var e = new errors.HttpError();
    debug(e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.HttpError);
    test.ok(e instanceof errors.CustomError);
    test.ok(e instanceof Error);
    test.equal(e.message, errors.StatusLine[errors.StatusCode.UNKNOWN]);
    test.equal(e.status, errors.StatusCode.UNKNOWN);
    test.equal(e.code, 8599);
    test.done();
  },
  test_ClientError: function (test) {
    var e = new errors.ClientError();
    debug(e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.ClientError);
    test.ok(e instanceof errors.HttpError);
    test.ok(e instanceof Error);
    test.equal(e.message, errors.StatusLine[errors.StatusCode.CLIENT_ERROR]);
    test.equal(e.status, errors.StatusCode.CLIENT_ERROR);
    test.equal(e.code, 8400);
    test.done();
  },
  test_BadRequest: function (test) {
    var e = new errors.BadRequest();
    debug(e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.ClientError);
    test.ok(e instanceof errors.BadRequest);
    test.ok(e instanceof errors.HttpError);
    test.ok(e instanceof Error);
    test.equal(e.message, errors.StatusLine[errors.StatusCode.BAD_REQUEST]);
    test.equal(e.status, errors.StatusCode.BAD_REQUEST);
    test.equal(e.code, 8400);
    test.done();
  },
  test_Unauthorized: function (test) {
    var e = new errors.Unauthorized();
    debug(e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.Unauthorized);
    test.ok(e instanceof errors.ClientError);
    test.ok(e instanceof errors.HttpError);
    test.ok(e instanceof errors.CustomError);
    test.ok(e instanceof Error);
    test.equal(e.message, errors.StatusLine[errors.StatusCode.UNAUTHORIZED]);
    test.equal(e.status, errors.StatusCode.UNAUTHORIZED);
    test.equal(e.code, 8401);
    test.done();
  },
  test_Forbidden: function (test) {
    var e = new errors.Forbidden();
    debug(e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.Forbidden);
    test.ok(e instanceof errors.ClientError);
    test.ok(e instanceof errors.HttpError);
    test.ok(e instanceof errors.CustomError);
    test.ok(e instanceof Error);
    test.equal(e.message, errors.StatusLine[errors.StatusCode.FORBIDDEN]);
    test.equal(e.status, errors.StatusCode.FORBIDDEN);
    test.equal(e.code, 8403);
    test.done();
  },
  test_NotFound: function (test) {
    var e = new errors.NotFound();
    debug(e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.NotFound);
    test.ok(e instanceof errors.ClientError);
    test.ok(e instanceof errors.HttpError);
    test.ok(e instanceof errors.CustomError);
    test.ok(e instanceof Error);
    test.equal(e.message, errors.StatusLine[errors.StatusCode.NOT_FOUND]);
    test.equal(e.status, errors.StatusCode.NOT_FOUND);
    test.equal(e.code, 8404);
    test.done();
  },
  test_ServerError: function (test) {
    var e = new errors.ServerError();
    debug(e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.ServerError);
    test.ok(e instanceof errors.HttpError);
    test.ok(e instanceof errors.CustomError);
    test.ok(e instanceof Error);
    test.equal(e.message, errors.StatusLine[errors.StatusCode.SERVER_ERROR]);
    test.equal(e.status, errors.StatusCode.SERVER_ERROR);
    test.equal(e.code, 8500);
    test.done();
  },
  test_InternalServerError: function (test) {
    var e = new errors.InternalServerError();
    debug(e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.InternalServerError);
    test.ok(e instanceof errors.ServerError);
    test.ok(e instanceof errors.HttpError);
    test.ok(e instanceof errors.CustomError);
    test.ok(e instanceof Error);
    test.equal(e.message, errors.StatusLine[errors.StatusCode.INTERNAL_SERVER_ERROR]);
    test.equal(e.status, errors.StatusCode.INTERNAL_SERVER_ERROR);
    test.equal(e.code, 8500);
    test.done();
  }
};
