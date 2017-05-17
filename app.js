const SwaggerRestify = require('swagger-restify-mw');
const restify = require('restify');
const app = restify.createServer();

const config = {
  appRoot: __dirname, // required config
};

app.use(restify.acceptParser(app.acceptable));

app.get(/\/v1\/docs\/?.*/, restify.serveStatic({
  directory: __dirname,
  default: 'index.html',
  //charSet: 'utf-8',
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

app.use(restify.CORS());
