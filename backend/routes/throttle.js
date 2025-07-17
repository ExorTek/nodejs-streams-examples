const { throttleController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/basic', throttleController.basicThrottle);
  fastify.post('/burst', throttleController.burstThrottle);
  fastify.post('/rate-limit', throttleController.rateLimiting);
  fastify.post('/adaptive', throttleController.adaptiveThrottle);

  done();
};

module.exports = routes;
