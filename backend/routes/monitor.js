const { monitorController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/create', monitorController.createMonitor);
  fastify.post('/realtime', monitorController.realtimeMonitor);
  fastify.post('/compare', monitorController.compareStreams);
  fastify.get('/stats', monitorController.getGlobalStats);

  done();
};

module.exports = routes;
