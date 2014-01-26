'use strict';

var
    util = require('util'),
    _ = require('lodash'),
    Q = require('q'),
    mongoose = require('mongoose'),
    express = require('express'),
    common = require('./common'),
    errors = require('./errors'),
    debug = require('debug')('mongoose-resource'),
    DEBUG = debug.enabled;

//
//
//

/**
 * create an tuple object with the key/value pair.
 *
 * @param {String} key
 * @param {*} value
 * @returns {*}
 */
function tuple(key, value) {
    var result = {};
    result[key] = value;
    return result;
}

//
//
//

/**
 * @name ResourceOptions
 * @type {*} ResourceOptions
 * @property {String} [id] - resource id for url param name
 * @property {String} [path] - resource path for url base path
 * @property {String} [key] - key to set/get loaded document into/from req/res context
 * @property {String} [singular] - singular resource name for show/create/update response
 * @property {String} [plural] - plural resource name for list response
 * @property {Array.<String>} [queryFields]
 * @property {Array.<String>} [listFields]
 * @property {Array.<String>} [loadFields]
 * @property {Array.<String>} [createFields]
 * @property {Array.<String>} [updateFields]
 */

/**
 *
 * @param {mongooseDao.Dao} dao
 * @param {ResourceOptions} [options={}]
 * @constructor
 */
function Resource(dao, options) {
    /** @type mongooseDao.Dao */
    this.dao = dao;

    /** @type {ResourceOptions} */
    this.options = options || {};

    /** @type {String} */
    this.id = this.options.id || this.dao.Model.modelName.toLowerCase();

    /** @type {String} */
    this.path = this.options.path || (this.id + 's'); // TODO: apply lingo

    /** @type {String} */
    this.key = this.options.key || this.id;

    /** @type {String} */
    this.singular = this.options.singular || this.id;

    /** @type {String} */
    this.plural = this.options.plural || this.path;

    if (this.options.children) {
        var self = this;
        this.children = {};
        this.options.children.forEach(function (child) {
            var childDao = dao[child.path];
            if (childDao) {
                DEBUG && debug('create child mongoose resource:', self.path, '/', child.path);
                self[child.path] = new EmbeddedResource(self, childDao, child);
            } else {
                DEBUG && debug('invalid child path:' + child.path);
            }
        });
    }
}

Resource.prototype._collectListQueryParams = function (req, res) {
    if (this.options.queryFields) {
        return common.collectQueryParams(req, this.options.queryFields);
    }
    return {query: {}, fields: {}, options: {}, params: {}};
};

Resource.prototype._transformListResult = function (docs) {
    if (!docs) {
        return [];
    }
    var self = this;
    return docs.map(function (doc) {
        return _.pick(doc, self.options.listFields);
    });
};

/**
 *
 * express route to get 'plural' resources.
 *
 * @param {express.request} req
 * @param {express.response} res
 * @param {function} [next]
 * @returns {Promise|*} result
 */
Resource.prototype.index = function (req, res, next) {
    var data = this._collectListQueryParams(req, res);

    var result = {meta: data.params};
    var self = this;
    return this.dao.list(data.query, data.fields, data.options)
        .then(function (docs) {
            result[self.plural] = self._transformListResult(docs);
            return self.dao.count(data.query);
        })
        .then(function (count) {
            result.meta.count = count;
            result.meta.pages = common.pagination(data.options.skip, data.options.limit, count);
            return result;
        });
};

Resource.prototype._collectCreateParams = function (req, res) {
    if (this.options.createFields) {
        return common.collectParams(req, this.options.createFields);
    }
    return req.body || {};
};

Resource.prototype._transformCreateResult = function (doc) {
    if (!doc) {
        return {};
    }
    if (this.options.loadFields) {
        return _.pick(doc, this.options.loadFields);
    }
    return doc;
};

/**
 * express route to create a new resource.
 *
 * @param {express.request} req
 * @param {express.response} res
 * @param {function} [next]
 * @returns {Promise|*} result
 */
Resource.prototype.create = function (req, res, next) {
    var data = this._collectCreateParams(req, res);

    var self = this;
    return this.dao.create(data).then(function (doc) {
        return tuple(self.singular, self._transformCreateResult(doc));
    });
};

Resource.prototype._transformLoadResult = function (doc) {
    if (!doc) {
        return {};
    }
    if (this.options.loadFields) {
        return _.pick(doc, this.options.loadFields);
    }
    return doc;
};

/**
 * express route to get a 'singular' resource by id.
 *
 * @param {express.request} req
 * @param {express.response} res
 * @returns {Promise|*} response body
 */
Resource.prototype['new'] = Resource.prototype.edit = Resource.prototype.show = function (req, res, next) {
    return tuple(this.singular, this._transformLoadResult(this._get(req, res, next)));
};

Resource.prototype._collectUpdateParams = function (req, res) {
    if (this.options.updateFields) {
        return common.collectParams(req, this.options.updateFields);
    }
    return req.body || {};
};

Resource.prototype._transformUpdateResult = function (doc) {
    if (!doc) {
        return {};
    }
    if (this.options.loadFields) {
        return _.pick(doc, this.options.loadFields);
    }
    return doc;
};

/**
 * express route to update the exising resource by id.
 *
 * @param {express.request} req
 * @param {express.response} res
 * @param {function} [next]
 * @returns {Promise|*} response body
 */
Resource.prototype.update = function (req, res, next) {
    var data = this._collectUpdateParams(req, res);

    var self = this;
    return this.dao.update(this._get(req, res, next), data).then(function (result) {
        return tuple(self.singular, self._transformUpdateResult(result));
    });
};

/**
 * express route to destroy(delete) the exising resource by id.
 *
 * @param {express.request} req
 * @param {express.response} res
 * @param {function} [next]
 * @returns {Promise|*} response body
 */
Resource.prototype.destroy = function (req, res, next) {
    return this.dao.destroy(this._get(req, res, next));
};

/**
 * get the loaded resource from req/res context.
 *
 * @param {express.request} [req]
 * @param {express.response} [res]
 * @returns {mongoose.Document|*} the loaded resource
 * @private
 */
Resource.prototype._get = function (req, res) {
    //return req[this.key];
    return res.locals[this.key];
};

/**
 * set the loaded resource into req/res context.
 *
 * @param {mongoose.Document|*} doc - the loaded resource
 * @param {express.request} [req]
 * @param {express.response} [res]
 * @private
 */
Resource.prototype._set = function (doc, req, res) {
    //req[this.key] = doc;
    res.locals[this.key] = doc;
};

/**
 * transform 'id' for a resource.
 *
 * @param id
 * @returns {String|Number} transformed id
 * @param {express.request} [req]
 * @param {express.response} [res]
 * @private
 */
Resource.prototype._transformId = function (id, req, res) {
    return id;
};

/**
 * load a resource into req/res context.
 *
 * called by express to resolve named url param.
 *
 * @param {String} id
 * @param {express.request} [req]
 * @param {express.response} [res]
 * @returns {Promise} the loaded resource
 */
Resource.prototype._load = function (id, req, res) {
    console.log('****************load', id);
    return this.dao.load(this._transformId(id, req, res));
};

/**
 * @name Route
 * @typedef {Object} Route
 * @property {String} name - handler function name
 * @property {String} method - http method(verb)
 * @property {String} path - http path
 * @property {String} [view] - view template for html format
 */

/**
 *
 * @param {express.application} app
 * @param {Route} route
 * @return {Resource} self
 * @private
 */
Resource.prototype.addRoute = function (app, route) {
    var appFunc = app[(route.method || 'all').toLowerCase()];
    var routeFunc = this[route.name];
    if (!appFunc || !routeFunc) {
        console.warn('***skip*** invalid route:', route.method, route.path);
        return this;
    }

    //DEBUG && debug('add route:', route.method, route.path);

    var self = this;
    appFunc.call(app, route.path, function (req, res) {
        // TODO: more sophisticated content negotiation...
        var format = req.param.format || 'json';

        return Q.when(routeFunc.call(self, req, res))
            .then(function (result) {
                if (result === undefined) {
                    return res.send(errors.StatusCode.NO_CONTENT);
                }
                switch (format) {
                    case 'json':
                        return res.json(result);
                    case 'html':
                        return res.render(route.view || route.name, result);
                }
                return res.send(result);
            })
            .fail(function (err) {
                DEBUG && debug('error in route', route.method, route.path, err);
                var status = err.status || errors.StatusCode.INTERNAL_SERVER_ERROR;
                //if (err instanceof mongoose.Error.ValidationError) {
                if (err.name === 'ValidationError') {
                    status = errors.StatusCode.BAD_REQUEST;
                }
                res.status(status);
                switch (format) {
                    case 'json':
                        return res.json({error: err});
                    case 'html':
                        return res.render('errors/' + status, {error: err});
                }
                return res.send(err);
            })
            .done();
    });

    return this;
};

/**
 *
 * @param {express.application} app
 * @param {String} [prefix='/']
 * @return {Resource} self
 */
Resource.prototype.mount = function (app, prefix) {
    prefix = prefix || this.options.prefix || '/';
    if (/[^\/]$/.test(prefix)) {
        prefix += '/';
    }
    var pluralPath = prefix + this.path;
    var singularPath = pluralPath + '/:' + this.id;
    var pathSuffix = this.options.format || '.:format?';

    var routes = [
        {name: 'index', method: 'get', path: pluralPath + pathSuffix},
        {name: 'new', method: 'get', path: pluralPath + '/new' + pathSuffix},
        {name: 'create', method: 'post', path: pluralPath + pathSuffix},
        {name: 'create', method: 'put', path: pluralPath + pathSuffix},//extra
        {name: 'show', method: 'get', path: singularPath + pathSuffix},
        {name: 'edit', method: 'get', path: singularPath + '/edit' + pathSuffix},
        {name: 'update', method: 'put', path: singularPath + pathSuffix},
        {name: 'update', method: 'post', path: singularPath + pathSuffix},//extra for angular resource compatibility
        {name: 'destroy', method: 'del', path: singularPath + pathSuffix}
    ];

    if (this.options.customRoutes) {
        routes = routes.concat(this.options.customRoutes);
    }

    // named url param
    var self = this;
    app.param(this.id, function (req, res, next, id) {
        return Q.when(self._load(id, req, res))
            .then(function (result) {
                if (!result) {
                    return next(new errors.NotFound(undefined, id));
                }
                self._set(result, req, res);
                return next();
            })
            .fail(function (err) {
                //if (err instanceof mongoose.Error.CastError) {
                if (err.name === 'CastError') {
                    return next(new errors.NotFound(undefined, err));
                }
                return next(err);
            }).done();
    });

    // add routes...
    routes.forEach(this.addRoute.bind(this, app));

    // mount child resources...
    if (this.options.children) {
        this.options.children.forEach(function (child) {
            var embeddedRes = self[child.path];
            if (embeddedRes) {
                DEBUG && debug('mount child resource:', self.path + '/' + child.path);
                embeddedRes.mount(app, singularPath);
            } else {
                DEBUG && debug('invalid child path:', self.path + '/' + child.path);
            }
        });
    }

    return this;
};

//
//
//

/**
 *
 * @param {Resource} parent
 * @param {mongooseDao.Dao} dao
 * @param {ResourceOptions} [options={}]
 * @constructor
 */
function EmbeddedResource(parent, dao, options) {
    this.parent = parent;
    EmbeddedResource.super_.call(this, dao, options);
}
util.inherits(EmbeddedResource, Resource);

/**
 * @inheritDoc
 */
EmbeddedResource.prototype.index = function (req, res, next) {
    //var data = this._collectListQueryParams(req, res);

    var self = this;
    return this.dao.list(this.parent._get(req, res, next)).then(function (result) {
        return tuple(self.plural, self._transformListResult(result));
    });
};

/**
 * @inheritDoc
 */
EmbeddedResource.prototype.create = function (req, res, next) {
    var data = this._collectCreateParams(req, res);

    var self = this;
    return this.dao.create(this.parent._get(req, res, next), data).then(function (result) {
        return tuple(self.singular, self._transformCreateResult(result));
    });
};

/**
 * @inheritDoc
 */
EmbeddedResource.prototype.show = function (req, res, next) {
    return tuple(this.singular, this._transformLoadResult(this._get(req, res, next)));
};

/**
 * @inheritDoc
 */
EmbeddedResource.prototype.update = function (req, res, next) {
    var data = this._collectUpdateParams(req);

    var self = this;
    return this.dao.update(this.parent._get(req, res, next), this._get(req, res, next), data).then(function (result) {
        return tuple(self.singular, self._transformUpdateResult(result));
    });
};

/**
 * @inheritDoc
 */
EmbeddedResource.prototype.destroy = function (req, res, next) {
    return this.dao.destroy(this.parent._get(req, res, next), this._get(req, res, next));
};

/**
 * @inheritDoc
 */
EmbeddedResource.prototype._load = function (id, req, res) {
    return this.dao.load(this.parent._get(req, res), id);
};

//
//
//

/**
 *
 * @param {mongooseDao.Dao} dao
 * @param {ResourceOptions} [options={}]
 * @returns {Resource}
 */
function createMongooseResource(dao, options) {
    DEBUG && debug('create mongoose resource for', dao.Model.modelName);
    return new Resource(dao, options);
}

module.exports = createMongooseResource;
module.exports.Resource = Resource;
module.exports.EmbeddedResource = EmbeddedResource;
