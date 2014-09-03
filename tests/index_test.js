'use strict';

var
    assert = require('assert'),
    debug = require('debug')('test');

describe('index', function () {
    it('should be toybox itself', function () {
        var toybox = require('../index');
        assert(toybox);
        assert(toybox.errors.HttpError);
    });
    it('should be express with toybox', function () {
        var expressWithToybox = require('../index')();
        assert(expressWithToybox.toybox);
        assert(expressWithToybox.toybox.errors.HttpError);
    });
    it('should be custom express with toybox', function () {
        var customExpress = require('express');
        customExpress.isCustom = true;
        var expressWithToybox = require('../index')(customExpress);
        assert.equal(customExpress, expressWithToybox);
        assert(expressWithToybox.toybox);
        assert(expressWithToybox.toybox.errors.HttpError);
        assert(expressWithToybox.isCustom);
        assert(customExpress.toybox);
        assert(customExpress.isCustom);
        assert(customExpress.toybox.errors.HttpError);
    });
    it('should be something with toybox', function () {
        var something = {};
        var somethingWithToybox = require('../index')(something);
        assert.equal(something, somethingWithToybox);
        assert(something.toybox);
        assert(something.toybox.errors.HttpError);
        assert(somethingWithToybox.toybox);
        assert(somethingWithToybox.toybox.errors.HttpError);
    });
});
