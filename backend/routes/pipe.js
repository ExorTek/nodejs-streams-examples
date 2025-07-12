const { pipeController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/simple', pipeController.simplePipe);
  fastify.post('/chain', pipeController.chainedPipe);
  fastify.post('/pipeline', pipeController.pipelineOperation);
  fastify.post('/filter', pipeController.filterAndProcess);
  fastify.post('/csv-to-json', pipeController.csvToJsonPipe);

  done();
};

module.exports = routes;
