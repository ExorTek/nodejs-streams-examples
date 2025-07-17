const { splitController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/line', splitController.lineSplit);
  fastify.post('/multi-output', splitController.multiOutput);
  fastify.post('/field', splitController.fieldSplit);
  done();
};

module.exports = routes;
