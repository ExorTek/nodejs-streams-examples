const { duplexController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/echo', duplexController.echoStream);
  fastify.post('/transform', duplexController.transformStream);
  fastify.post('/chatbot', duplexController.chatBotStream);
  fastify.post('/bidirectional', duplexController.bidirectionalStream);
  done();
};

module.exports = routes;
