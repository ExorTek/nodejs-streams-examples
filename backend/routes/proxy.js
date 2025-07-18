const { proxyController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/simple', proxyController.simpleProxy);
  fastify.post('/transform', proxyController.transformProxy);
  fastify.post('/http', proxyController.httpProxy);
  fastify.post('/load-balancer', proxyController.loadBalancer);
  fastify.post('/cache', proxyController.cacheProxy);

  done();
};

module.exports = routes;
