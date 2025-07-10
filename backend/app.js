const fastify = require('fastify');
const fastifyCors = require('@fastify/cors');

const routes = require('./routes');

const { customError } = require('./middlewares');

const app = fastify({ logger: true });

app.register(fastifyCors, {
  origin: '*',
});
app.register(routes, { prefix: '/api/v1' });

app.setErrorHandler(customError);

module.exports = app;
