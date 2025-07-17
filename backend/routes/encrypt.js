const { encryptController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/aes-encrypt', encryptController.aesEncrypt);
  fastify.post('/aes-decrypt', encryptController.aesDecrypt);
  fastify.post('/hash', encryptController.generateHash);
  fastify.post('/sign', encryptController.createSignature);
  fastify.post('/random', encryptController.generateRandom);

  done();
};

module.exports = routes;
