'use strict';

var
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    errors = require('./errors'),
    io = require('node-toybox/io'),
    debug = require('debug')('express-toybox:assets'),
    DEBUG = debug.enabled;

var
    DEF_CONFIG = {
        dst: undefined,
        src: undefined,
        layers: [], //['bower_components', 'node_modules'],
        helpers: {},
        filters: {
            html: 'jade', // ['jade', 'ejs', 'handlebar', 'mustache'],
            jade: function (src, dst, helpers, callback) {
                var jade;
                try {
                    jade = require('jade');
                } catch (e) {
                    return callback(e);
                }
                DEBUG && debug('render jade file', src);
                return fs.readFile(src, 'utf8', function (err, srcData) {
                    if (err) {
                        return callback(err);
                    }
                    var opts = _.merge({}, helpers);
                    jade.render(srcData, opts, function (err, dstData) {
                        if (err) {
                            return callback(err);
                        }
                        return fs.writeFile(dst, dstData, 'utf8', function (err) {
                            return callback(err, !err && dst);
                        });
                    });
                });
            },
            css: 'less',//, ['less', 'sass', 'stylus', 'compass']
            less: function (src, dst, helpers, callback) {
                var less;
                try {
                    less = require('less');
                } catch (e) {
                    return callback(e);
                }
                return fs.readFile(src, 'utf8', function (err, srcData) {
                    if (err) {
                        return callback(err);
                    }
                    var opts = _.merge({}, helpers);
                    less.render(srcData, opts, function (err, dstData) {
                        if (err) {
                            return callback(err);
                        }
                        return fs.writeFile(dst, dstData, 'utf8', function (err) {
                            return callback(err, !err && dst);
                        });
                    });
                });
            },
            js: 'coffee', //['coffee', 'typescript, 'dart'],
            coffee: function (src, dst, helpers, callback) {
                var coffee;
                try {
                    coffee = require('coffee');
                } catch (e) {
                    return callback(e);
                }
                return fs.readFile(src, 'utf8', function (err, srcData) {
                    if (err) {
                        return callback(err);
                    }
                    try {
                        var opts = _.merge({filename: src}, helpers);
                        var compiled = coffee.compile(srcData, opts);
                        DEBUG && debug('*** coffee compiled', compiled);
                        var dstData = compiled.js;
                        return fs.writeFile(dst, dstData, 'utf8', function (err) {
                            return callback(err, !err && dst);
                        });
                    } catch (e) {
                        return callback(e);
                    }
                });
            }
        },
        encoding: 'utf8'
    };

/**
 * assets middleware.
 *
 * @param {*} options
 * @param {string} options.src
 * @param {string} options.dst
 * @param {Array.<string>} [options.layers]
 * @param {*} [options.helpers]
 * @param {*} [options.filters]
 * @param {string} [options.encoding='utf8']
 * @returns {Function} connect/express middleware function
 */
module.exports = function (options) {
    options = _.merge({}, DEF_CONFIG, options);
    DEBUG && debug('assets middleware...', options);

    function copyAsset(src, dst, callback) {
        if (typeof src === 'string') {
            DEBUG && debug('check asset file', src);
            DEBUG && debug('cache miss', dst);
            return io.copyFile(src, dst, callback);
            //return isFileNewer(src, dst, function (newer) {
            //    if (newer) {
            //        DEBUG && debug('cache miss', dst);
            //        return copyFile(src, dst, callback);
            //    }
            //    DEBUG && debug('cache hit', dst);
            //    return callback(null, dst);
            //});
        }
        if (!src.length) {
            DEBUG && debug('no asset to copy', src);
            return callback(new errors.NotFound());
        }
        return copyAsset(src[0], dst, function (err) {
            if (err) {
                // NOTE: async recursion!!!
                return copyAsset(src.slice(1), dst, callback);
            }
            return callback(null, dst);
        });
    }

    function filterAsset(src, dst, callback) {
        if (typeof src === 'string') {
            var ext = path.extname(src).substring(1); // without '.'
            var filter = options.filters[ext];
            if (typeof filter === 'function') {
                DEBUG && debug('filter file', src, '-->', dst);
                return filter(src, dst, options.helpers, function (err) {
                    return callback(err, !err && dst);
                });
            } else {
                // {html: 'jade'} --or-- {html: ['jade', 'ejs']}
                var aliases = [].concat(filter);
                var candidates = [];
                for (var i = 0; i < aliases.length; i += 1) {
                    // *.html.jade --> *.html
                    candidates.push(src + '.' + aliases[i]);
                    // *.jade --> *.html
                    candidates.push(src.replace('.' + ext, '.' + aliases[i]));
                }
                DEBUG && debug('filter alias', filter, '-->', candidates);
                return filterAsset(candidates, dst, callback);
            }
        }
        if (!src.length) {
            DEBUG && debug('no asset to filter', src);
            return callback(new errors.NotFound());
        }
        return filterAsset(src[0], dst, function (err) {
            if (err) {
                // NOTE: async recursion!!!
                return filterAsset(src.slice(1), dst, callback);
            }
            return callback(null, dst);
        });
    }

    // single line comment:
    // //= require file
    //
    // multi line comment:
    // /*
    //  *= require file
    //  */
    //
    // single line comment:
    // #= require file
    var DIRECTIVE_REGEXP = /^(\/\/|\s*\/?\*|#)=\s*(\S+)\s+(\S+)\s+$/;

    function metaAsset(src, dst, callback) {
        DEBUG && debug('check meta file', src);
        src += '.meta';
        return fs.readFile(src, options.encoding, function (err, data) {
            if (err) {
                return callback(err);
            }
            var files = data.split('\n').reduce(function (result, line) {
                var matches = DIRECTIVE_REGEXP.exec(line);
                if (matches) {
                    DEBUG && debug('**********directive', matches[2], matches[3]);
                    switch (matches[2]) {
                        case 'require':
                            result.push(matches[3]);
                            break;
                        case 'require_tree':
                            break;
                    }
                }
                return result;
            }, []);
            DEBUG && debug('meta file', src, '-->', files, '-->', dst);
            if (files.length) {
                // TODO: concat...
                return copyAsset(files[0], dst, callback);
                //return resolveAsset(files[0], function (err, dst1) {
                //    io.copyFile(dst1, dst, callback);
                //});
            }
            return callback(new Error('invalid meta file'));
        });
    }

    function resolveAsset(name, callback) {
        DEBUG && debug('resolve asset', name);
        var src = path.join(options.src, name);
        var dst = path.join(options.dst, name);
        copyAsset(src, dst, function (err) {
            if (!err) {
                return callback(null, dst);
            }
            filterAsset(src, dst, function (err) {
                if (!err) {
                    return callback(null, dst);
                }
                metaAsset(src, dst, function (err) {
                    if (!err) {
                        return callback(null, dst);
                    }
                    if (options.layers.length === 0) {
                        return callback(new errors.NotFound());
                    }
                    copyAsset(options.layers.map(function (layer) {
                        return path.join(layer, name);
                    }), dst, callback);
                });
            });
        });
    }

    return function (req, res, next) {
        resolveAsset(req.path, function (err, file) {
            return err ? next(err) : res.sendFile(file);
        });
    };
};
