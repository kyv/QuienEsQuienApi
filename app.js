const SwaggerRestify = require('swagger-restify-mw');
const restify = require('restify');
const app = restify.createServer();

if (process.env.NODE_ENV !== 'test' && !process.env.MONGODB_URI) {
  throw 'please configure MONGODB_URI\nwith "localhost:27017/foo" or similar';
}

module.exports = app; // for testing

const config = {
  appRoot: __dirname, // required config
};

app.use(restify.acceptParser(app.acceptable));

app.get(/\/v1\/docs\/?.*/, restify.serveStatic({
  directory: __dirname,
  default: 'index.html',
  // charSet: 'utf-8',
}));

SwaggerRestify.create(config, (err, swaggerRestify) => {
  if (err) {
    throw err;
  }

  swaggerRestify.register(app);

  const port = process.env.PORT || 10010;

  app.listen(port);

});

// FIXME gzip breaks swagger-ui
// app.use(restify.gzipResponse());

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  return next();
});
