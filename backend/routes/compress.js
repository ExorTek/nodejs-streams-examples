const { compressController } = require('../controllers');

const routes = (fastify, options, done) => {
  fastify.post('/gzip', compressController.gzipCompress);
  fastify.post('/gunzip', compressController.gzipDecompress);
  fastify.post('/deflate', compressController.deflateCompress);
  fastify.post('/brotli', compressController.brotliCompress);
  fastify.post('/compare', compressController.compareAlgorithms);

  done();
};

module.exports = routes;
