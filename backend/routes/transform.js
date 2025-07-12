const { transformController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/case', transformController.caseTransform);
  fastify.post('/filter', transformController.filterTransform);
  fastify.post('/math', transformController.mathTransform);
  fastify.post('/encoding', transformController.encodingTransform);
  done();
};

module.exports = routes;
