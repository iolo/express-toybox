'use strict';

var
    Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    express = require('../index')(require('express'));//require('express-toybox')(require('express'));

var config = {
    http: {
        host: '0.0.0.0',
        port: 3333
    },
    middlewares: {
        logger: 'dev',
        //compress: {},
        //cookieParser: {},
        //methodOverride: {},
        //cors: {},
        //session: {},
        //csrf: {},
        json: {},
        urlencoded: {},
        multipart: {}
    },
    routes: {
        root: path.join(__dirname, '/to_be_root'),
        statics: {
            '/static': path.join(__dirname, '/to_be_static'),
            '/source': path.join(__dirname, '../libs')
        },
        errors: {
            404: {},
            500: {
                mappings: {ENOENT: {status: 404, message: 'NOT FOUND'}}
            }
        }
    }
};

function longAsyncEcho(message) {
    var d = Q.defer();
    setTimeout(function () {
        if (message === 'yahoo!') {
            return d.reject(new express.toybox.errors.HttpError('say something!', 999));
        }
        return d.resolve(message);
    }, 3000);
    return d.promise;
}

function noisyMiddleware(req, res, next) {
    console.log('a quick brown silver fox runs over the lazy dog');
    next();
}

var users = {
    index: function (req, res) {
        return res.send('users.index:[' + req.param('id') + ']');
    },
    create: function (req, res) {
        return res.send('users.create:[' + req.param('id') + ']');
    },
    show: function (req, res) {
        return res.send('users.show:[' + req.param('id') + ']');
    },
    update: function (req, res) {
        return res.send('users.update:[' + req.param('id') + ']');
    },
    destroy: function (req, res) {
        return res.send('users.destroy:[' + req.param('id') + ']');
    }
};

var userPosts = {
    index: function (req, res) {
        return res.send('users:[' + req.param('uid') + ']/posts.index:[' + req.param('id') + ']');
    },
    create: function (req, res) {
        return res.send('users:[' + req.param('uid') + ']/posts.create:[' + req.param('id') + ']');
    },
    show: function (req, res) {
        return res.send('users:[' + req.param('uid') + ']/posts.show:[' + req.param('id') + ']');
    },
    update: function (req, res) {
        return res.send('users:[' + req.param('uid') + ']/posts.update:[' + req.param('id') + ']');
    },
    destroy: function (req, res) {
        return res.send('users:[' + req.param('uid') + ']/posts.destroy:[' + req.param('id') + ']');
    }
};

var app = express()
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .useCommonMiddlewares(config.middlewares)
    .use(noisyMiddleware)
    .get('/add', function get(req, res) {
        return res.send(200, req.intParam('a') + req.intParam('b'));
    })
    .get('/echo', function (req, res) {
        return res.sendLater(longAsyncEcho(req.strParam('message', 'yahoo!')));
    })
    .get('/error/400', function (req, res) {
        throw new express.toybox.errors.BadRequest('400 error!');
    })
    .get('/error/500', function (req, res) {
        throw new express.toybox.errors.InternalServerError('500 error!');
    })
    .get('/error/custom', function (req, res) {
        throw {status: 999, message: 'custom error!'};
    })
    .get('/send/callback', function (req, res, next) {
        var file = path.join(__dirname, req.param('file'));
        fs.stat(file, res.sendCallbackFn(next));
    })
    .get('/json/callback', function (req, res, next) {
        var file = path.join(__dirname, req.param('file'));
        fs.stat(file, res.jsonCallbackFn(next));
    })
    .get('/render/callback', function (req, res, next) {
        var file = path.join(__dirname, req.param('file'));
        fs.stat(file, res.renderCallbackFn('render_test', next));
    })
    .get('/send/later', function (req, res, next) {
        var file = path.join(__dirname, req.param('file'));
        res.sendLater(Q.nfcall(fs.stat, file), next);
    })
    .get('/json/later', function (req, res, next) {
        var file = path.join(__dirname, req.param('file'));
        res.jsonLater(Q.nfcall(fs.stat, file), next);
    })
    .get('/render/later', function (req, res, next) {
        var file = path.join(__dirname, req.param('file'));
        res.renderLater('render_test', Q.nfcall(fs.stat, file), next);
    })
    .get('/dont/stop/me/now', function (req, res) {
        express.toybox.server.stop(function () {
            console.log('server stopped!');
        });
    })
    .useResource('/users/:id', users)
    .useResource('/users/:uid/posts/:id', userPosts)
    .useCommonRoutes(config.routes);

console.log('config:', config);

express.toybox.server.start(app, config.http, function () {
    console.log('server started!');
});
