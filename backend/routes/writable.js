const { writableController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/collect', writableController.collectData);
  fastify.post('/process', writableController.processLines);
  fastify.post('/validate', writableController.validateData);
  fastify.post('/upload', writableController.streamUpload);
  done();
};

module.exports = routes;
