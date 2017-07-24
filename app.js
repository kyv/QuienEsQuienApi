const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load('api/swagger/swagger.yaml');
const customCss = '#header, .topbar { display: none }';
const config = {
  appRoot: __dirname, // required config
};

if (process.env.NODE_ENV !== 'test' && !process.env.MONGODB_URI) {
  throw 'please configure MONGODB_URI\nwith "localhost:27017/foo" or similar';
}

module.exports = app; // for testing

app.use('/v1/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, false, {}, customCss));

SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) {
    throw err;
  }

  swaggerExpress.register(app);

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
