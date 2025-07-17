const { jsonlController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/parse', jsonlController.parseJsonl);
  fastify.post('/to-jsonl', jsonlController.toJsonl);
  fastify.post('/filter', jsonlController.filterJsonl);
  fastify.post('/transform', jsonlController.transformJsonl);
  fastify.post('/aggregate', jsonlController.aggregateJsonl);

  done();
};

module.exports = routes;
