express-toybox
==============

My Own Extra Stuff for [Express](http://expressjs.com).

## getting started

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

### run example

```
$ export DEBUG='*'
$ node example/app.js
$ open http://localhost:3333
```

### require it with/wihtout express

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

* StatusCode
* StatusLine
* HttpError
* ClientError
* BadRequest
* Unauthorized
* Forbidden
* NotFound
* ServerError
* InternalServerError
* NotImplemented
* ...

### commons

* [configureMiddlewares(config)](#declarative-middlewares)
* [configureRoutes(config)](#declarative-routes)

### server

* start()
* stop()

### utils

* collectQueryParams()
* pagination()
* renderViewOrRedirectToNext()
* echo()
* extendHttpRequest() - additional methods for express.request(http.IncomingMessage)
    - req.strParam(name, fallback)
    - req.intParam(name, fallback)
    - req.numberParam(name, fallback)
    - req.boolParam(name, fallback)
    - req.collectParams(names)
    - ...
* extendHttpResponse() - additional methods for express.response(http.ServerResponse)
    - res.sendCallbackFn(next)
        ```javascript
        var fs = require('fs');
        app.get('/foo', function (req, res, next) {
                fs.readFile('file.txt', res.sendCallbackFn(next));
        });
        ```
    - res.jsonCallbackFn(next)
    - res.jsonpCallbackFn(next)
    - res.sendFileCallbackFn(next)
    - res.redirectCallbackFn(next)
    - res.renderCallbackFn(view, next)
    - res.sendLater(promise, next)
        ```javascript
        var FS = require('q-io/fs');
        app.get('/bar', function (req, res, next) {
                res.sendLater(FS.readFile('file.txt'), next);
        });
        ```
    - res.jsonLater(promise, next)
    - res.jsonpLater(promise, next)
    - res.sendFileLater(promise, next)
    - res.redirectLater(promise, next)
    - res.renderLater(view, promise, next)
    - ...
* ...

<a id="cors-middleware"></a>
### cors

* usage
```
express()...use(express.toybox.cors(config))...
```

* config
```
{
TBW: ...
}
```

<a id="logger-middleware"></a>
### logger

* usage

```
express()...use(express.toybox.logger(config))...
```

* log to console using morgan: 'combined', 'common', 'short', 'tiny', 'default' or 'dev'
* log to file using morgan
```
{
    file:'path-to-log-file',
    format:'morgan-format',
    morgan-options...
}
```
* log to debug using morgan-debug
```
{
    debug:'debug-namespace',
    format:'morgan-format',
    morgan-debug-options...
}
```
* ...

<a id="session-middleware"></a>
### session

* usage
```
express()...use(express.toybox.session(config))...
```

* express-session with memory store: `{express-session-options...}`
* express-session with custom store:
```
{
    store:{
        module:'store-module-name',
        store-module-options...
    },
    express-session-options...
}
```
* ...

<a id="resource-middleware"></a>
### resource

* usage
```
express()...useResource(path, resource-module)...
```

* example
```javascript
useResource('/posts/:id', {
    // get /posts
    index: function (req, res) { ... },
    // post /posts
    create: ...
    // get /posts/123
    show: function (req, res) { assert(req.param('id') == 123)... }
    // put /posts/123
    update: ...
    // delete /posts/123
    destroy: ...
    ...
});
```

<a id="error404-middleware"></a>
### error404

send custom http 404 error with json/html/text by accept header in request.

* usage
```
express()...use(express.toybox.error404(config))...
```

* config
```
{
    code: custom-error-code,
    message:'custom-error-message',
    template: 'lodash-micro-template-string-for-404-error-page',
    view:'path-view-template'
    ...
}
```

* example: see [test case](tests/error404_test.js)

<a id="errorr500-middleware"></a>
### error500

send custom http error with json/html/text by accept header in request.

* usage
```
express()...use(express.toybox.error500(config))...
```

* config
```
{
    status: custom-status-code,
    code: custom-error-code,
    mappings:{'err.name':{err-response-body...}, 'err.code': {err-response-body...}, ...},
    stack:true/false,
    template: 'lodash-micro-template-string-for-error-page',
    view:'path-view-template',
    ...
}
```

* see [test case](tests/error500_test.js)

<a id="declarative-middlewares"></a>
## declarative middlewares

* usage
```
express()...useCommonMiddlewares(config)...
```
or
```
var app = express();
...
express.toybox.common.configureMiddlewares(app, config);
...
```

* config
```
{
    logger: {logger-config...},
    compress: {compress-config...},
    cookieParser: {cookieParser-config...},
    methodOverride: {methodOverride-config...},
    cors: {cors-config...},
    session: {session-config...},
    csrf: {csrf-config...},
    multipart: {multipart-config...},
    urlencoded: {urlencoded-config...},
    json: {json-config...},
    text: {text-config...},
    raw: {raw-config...},
    ...
}
```

### logger

* configure [morgan](https://github.com/expressjs/morgan) middleware(contrib) or [morgan-debug](https://github.com/ChiperSoft/morgan-debug) middleware(by ChiperSoft)
* via [logger](#logger-middleware) middleware(custom).

### compress(or compression)

* configure [compression](https://github.com/expressjs/compression) middleware(contrib).
```
{
TBW: ...
}
```

### cookieParser

* configure [cookie-parser](https://github.com/expressjs/cookie-parser) middleware(contrib).
```
{
TBW: ...
}
```

### methodOverride

* configure [method-override](https://github.com/expressjs/method-override) middleware(contrib).
```
{
TBW: ...
}
```

### cors

* configure [cors](#cors-middleware) middleware(custom).

### session

* configure [express-session](https://github.com/expressjs/session) middleware(contrib)
* via [session](#session-middleware) middleware(custom).

### csrf(or csurf)

* configure [csurf](https://github.com/expressjs/csurf) middleware(contrib).
```
{
TBW: ...
}
```

### multipart

* configure [multiparty](https://github.com/andrewrk/node-multiparty) middleware(by andrewrk) for `multipart/form-data` request.
```
{
TBW: ...
}
```

### urlencoded

* configure [body-parser](https://github.com/expressjs/body-parser) urlencoded middleware(contrib) for `application/x-www-form-urlencoded` request.
```
{
TBW: ...
}
```

### json

* configure [body-parser](https://github.com/expressjs/body-parser) json middleware(contrib) for `application/json` request.
```
{
TBW: ...
}
```

### text

* configure [body-parser](https://github.com/expressjs/body-parser) text middleware(contrib) for `plain/text` request.
```
{
TBW: ...
}
```

### raw

* configure [body-parser](https://github.com/expressjs/body-parser) raw middleware(contrib) for `application/octet-stream` request.
```
{
TBW: ...
}
```

<a id="declarative-routes"></a>
## declarative routes

* usage
```
express()...useCommonRoutes(config)...
```
or
```javascript
var app = express();
...
express.toybox.common.configureRoutes(app, config);
//expressToybox.common.configureRoutes(app, config);
...
```

* config
```
{
    root: path-to-directory,
    statics: {statics-config...},
    resources: {resources-config...},
    errors: {errors-config...},
    ...
}
```

### root

* configure [serve-static](https://github.com/expressjs/serve-favicon) middleware(contrib) and [serve-favicon](https://github.com/expressjs/serve-favicon) middleware(contrib).

### statics

* configure multiple [serve-static](https://github.com/expressjs/serve-favicon) middleware(contrib).
```
{
    'url-path': 'path-to-static-content-directory'
    ...
}
```

### resources

* configure multiple [resource](#resource-middleware) middleware(custom).
```
{
    'url-path': 'resource-module-name'
    ...
}
```

### errors

```
{
    '404': {error404-config...},
    '500': {error500-config...},
    ...
}
```

#### error404

* configure [error404](#error4040-middleware) middleware(custom).

#### error500

* configure [error500](#error500-middleware) middleware(custom) and [errorhandler](https://github.com/expressjs/errorhandler) middleware(contrib).

*may the source be with you...*
