const fastify = require('fastify');
const fastifyCors = require('@fastify/cors');

const routes = require('./routes');

const app = fastify({ logger: true });

app.register(fastifyCors, {
  origin: '*',
});
app.register(routes, { prefix: '/api/v1' });

module.exports = app;
