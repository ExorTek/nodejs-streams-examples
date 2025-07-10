const {
  readableController: { basicReadable, textReadable, dataReadable, logReadable },
} = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.get('/basic', basicReadable);
  fastify.get('/data', dataReadable);
  fastify.get('/logs', logReadable);
  fastify.get('/custom', textReadable);
  done();
};

module.exports = routes;
