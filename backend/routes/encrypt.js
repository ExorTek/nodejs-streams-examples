const { encryptController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/aes-encrypt', encryptController.aesEncrypt);
  fastify.post('/aes-decrypt', encryptController.aesDecrypt);
  fastify.post('/hash', encryptController.generateHash);
  fastify.post('/signature', encryptController.createSignature);
  fastify.get('/random', encryptController.generateRandom);
  done();
};

module.exports = routes;
