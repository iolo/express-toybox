express-toybox
==============

My Own Extra Stuff for [Express](http://expressjs.com).

## errors

## utils

## custom middlewares

### cors

### logger

### session

### resource

### error404

### error500

## additional methods for http request(http.IncomingMessage)

## additional methods for http response(http.ServerResponse)

## declarative configuration for middlewares

```javascript
var app = express();
...
express.toybox.common.configureMiddlewares(app, config);
...
app.listen(8000);
```

or

```javascript
var app = express()
    ...
    .useCommonMiddlewares(config)
    ...
    .listen(8080);
```

### logger: [morgan]() or [morgan-debug]() via logger(custom)

### compress(or compression): [compression]()

### cookieParser: [cookie-parser]()

### methodOverride: [method-override]()

### cors: cors(custom)

### session: [express-session]() via session(custom)

### csrf(or csurf): [csurf]()

### urlencoded: [body-parser]()

### json: [body-parser]()

### multipart: [multiparty]()

### root: [serve-favicon]() and [serve-static]()

### statics: [serve-static]()

## declarative configuration for error routes

```javascript
var app = express();
...
express.toybox.common.configureRoutes(app, config);
...
app.listen(8080);
```

or 

```javascript
express()
    ...
    .useCommonMiddlewares(config)
    ...
    .listen(8080);
```

### error404(custom)

### error500(custom)

*may the source be with you...*
