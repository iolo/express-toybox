express-toybox
==============

My Own Extra Stuff for [Express](http://expressjs.com).

## usage

### install module via npm

```
$ npm install express-toybox
```

### install from git and generate documents

```
$ git clone http://github.com/iolo/express-toybox.git
$ cd express-toybox
$ npm install
$ grunt docs
$ open build/doxx/index.html
```

### load express-toybox module over express

```javascript
var express = require('express-toybox')(require('express'));
//var express = require('express-toybox')();
express.toybox.utils.collectQueryParams(req);
```

or

```javascript
var express = require('express'),
    expressToybox = require('express-toybox');
expressToybox.utils.collectQueryParams(req);
//express.toybox.utils.collectQueryParams(req);
```

## features

### errors

* TBW: ...

### commons

* configureMiddlewares(config)
* configureRoutes(config)
* TBW: ...

### server

* start(config, callback)
* stop(callback)
* TBW: ...

### utils

* collectQueryParams()
* pagination()
* renderViewOrRedirectToNext()
* echo()
* extendHttpRequest()
* extendHttpResponse()
* TBW: ...

### cors

* TBW: ...

```javascript
express()
    ...
    .use(express.toybox.cors(config))
    ...
```

### logger

* TBW: ...

```javascript
express()
    ...
    .use(express.toybox.logger(config))
    ...
```

### session

* TBW: ...

```javascript
express()
    ...
    .use(express.toybox.session(config));
    ...
```

## resource

* TBW: ...

```javascript
express()
    ...
    .useResource(path, config);
    ...
```

### error404

* TBW: ...

```javascript
express()
    ...
    .use(express.toybox.error404(config))
    ...
```

### error500

* TBW: ...

```javascript
express()
    ...
    .use(express.toybox.error500(config))
```

## declarative configuration for middlewares

```javascript
express()
    ...
    .useCommonMiddlewares(config)
    ...
    .listen(8080);
```

or

```javascript
var app = express();
...
express.toybox.common.configureMiddlewares(app, config);
...
app.listen(8000);
```

### additional methods for http request(http.IncomingMessage)

* req.strParam(name, fallback)
* req.intParam(name, fallback)
* req.numberParam(name, fallback)
* req.boolParam(name, fallback)
* req.collectParams(names)
* TBW: ...

### additional methods for http response(http.ServerResponse)

* res.sendLater(promise)
* res.jsonLater(promise)
* res.jsonpLater(promise)
* res.sendFileLater(promise)
* res.redirectLater(promise)
* res.renderLater(view, promise)
* TBW: ...

### logger

* configure [morgan](https://github.com/expressjs/morgan) middleware(contrib) or [morgan-debug](https://github.com/ChiperSoft/morgan-debug) middleware(by ChiperSoft) via [logger](libs/logger.js) middleware(custom).
* TBW: ...

### compress(or compression)

* configure [compression](https://github.com/expressjs/compression) middleware(contrib).
* TBW: ...

### cookieParser

* configure [cookie-parser](https://github.com/expressjs/cookie-parser) middleware(contrib).
* TBW: ...

### methodOverride

* configure [method-override](https://github.com/expressjs/method-override) middleware(contrib).
* TBW: ...

### cors

* configure [cors](libs/cors.js) middleware(custom).
* TBW: ...

### session

* configure [express-session](https://github.com/expressjs/session) middleware(contrib) via [session](libs/session.js) middleware(custom).
* TBW: ...

### csrf(or csurf)

* configure [csurf](https://github.com/expressjs/csurf) middleware(contrib).
* TBW: ...

### urlencoded

* configure [body-parser](https://github.com/expressjs/body-parser) middleware(contrib).
* TBW: ...

### json

* configure [body-parser](https://github.com/expressjs/body-parser) middleware(contrib).
* TBW: ...

### multipart

* configure [multiparty](https://github.com/andrewrk/node-multiparty) middleware(by andrewrk).
* TBW: ...

### root

* configure [serve-static](https://github.com/expressjs/serve-favicon) middleware(contrib) and [serve-favicon](https://github.com/expressjs/serve-favicon) middleware(contrib).
* TBW: ...

### statics

* configure [serve-static](https://github.com/expressjs/serve-favicon) middleware(contrib).
* TBW: ...

## declarative configuration for routes

```javascript
var app = express();
...
express.toybox.common.configureRoutes(app, config);
//expressToybox.common.configureRoutes(app, config);
...
app.listen(8080);
```

or 

```javascript
express()
    ...
    .useCommonRoutes(config)
    ...
    .listen(8080);
```

### resources

* configure RESTful routes via [resource](libs/resource.js).
* TBW: ...

### errors

#### error404(custom)

* configure [error404](libs/error404.js) middleware(custom).
* TBW: ...

#### error500(custom)

* configure [error500](libs/error500.js) middleware(custom) and [errorhandler](https://github.com/expressjs/errorhandler) middleware(contrib).
* TBW: ...

*may the source be with you...*
