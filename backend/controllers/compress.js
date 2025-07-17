const {
  createGzip,
  createDeflate,
  createBrotliCompress,
  createGunzip,
  createInflate,
  createBrotliDecompress,
} = require('node:zlib');
const { pipeline } = require('node:stream/promises');
const { Readable, Writable } = require('node:stream');

/**
 * System limits for compression operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum input size in bytes (10MB) */
  MAX_INPUT_SIZE: 10 * 1024 * 1024,
  /** Maximum compression level */
  MAX_COMPRESSION_LEVEL: 9,
  /** Minimum compression level */
  MIN_COMPRESSION_LEVEL: 1,
  /** Maximum chunk size */
  MAX_CHUNK_SIZE: 64 * 1024,
};

/**
 * Gzip compression
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Compression results
 */
const gzipCompress = async (request, reply) => {
  const { level = 6, strategy = 'default' } = request.query;

  let input = request.body;
  if (!input) {
    input = `This is sample text data for compression testing.
It contains multiple lines and repeated patterns.
The compression algorithm should be able to reduce the size significantly.
This is sample text data for compression testing.
It contains multiple lines and repeated patterns.`;
  }

  try {
    const compressionLevel = Math.max(
      LIMITS.MIN_COMPRESSION_LEVEL,
      Math.min(LIMITS.MAX_COMPRESSION_LEVEL, parseInt(level)),
    );

    const options = {
      level: compressionLevel,
      strategy:
        strategy === 'huffman'
          ? require('zlib').constants.Z_HUFFMAN_ONLY
          : strategy === 'rle'
            ? require('zlib').constants.Z_RLE
            : strategy === 'fixed'
              ? require('zlib').constants.Z_FIXED
              : require('zlib').constants.Z_DEFAULT_STRATEGY,
    };

    const startTime = Date.now();
    const originalSize = Buffer.byteLength(input);

    // Create input stream
    const inputStream = Readable.from([input]);

    // Create compression stream
    const gzip = createGzip(options);

    // Collect compressed data
    const chunks = [];
    const outputStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    await pipeline(inputStream, gzip, outputStream);

    const compressedBuffer = Buffer.concat(chunks);
    const compressedSize = compressedBuffer.length;
    const compressionTime = Date.now() - startTime;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    reply.send({
      success: true,
      message: 'Gzip compression completed',
      results: {
        compressed: compressedBuffer.toString('base64'),
        stats: {
          originalSize,
          compressedSize,
          compressionRatio: parseFloat(compressionRatio.toFixed(2)),
          compressionTime,
          algorithm: 'gzip',
          level: compressionLevel,
          strategy,
        },
        summary: {
          sizeSaved: originalSize - compressedSize,
          efficiency: compressionRatio > 0 ? 'Good' : 'Poor',
          config: { level: compressionLevel, strategy },
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Gzip compression failed',
      error: error.message,
    });
  }
};

/**
 * Gzip decompression
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Decompression results
 */
const gzipDecompress = async (request, reply) => {
  let input = request.body;

  if (!input) {
    input =
      'H4sIAAAAAAAAAy2MQRLCIBRDr5KVq8rK8QBq9RyUplNG4Hf4dKqeXsSuMkle8vj4BVeJS6aql4QDLlZ5PqFPTkbm441N4XaIisJX6cAGVCf7pINkjPynvmCw7mnQW/XhDd18cTMGlo1MiA2a6kBpY6i/WJUGd59Yy8yfndZQ3yUoZmaaL2QmIQ+sAAAA';
  }

  try {
    const startTime = Date.now();
    let compressedBuffer;

    // Clean the input string
    const cleanInput = input.toString().trim();

    try {
      // Try to decode as base64
      compressedBuffer = Buffer.from(cleanInput, 'base64');

      // Validate it's actually gzip data by checking magic number
      if (compressedBuffer.length < 2 || compressedBuffer[0] !== 0x1f || compressedBuffer[1] !== 0x8b) {
        throw new Error('Not valid gzip data');
      }
    } catch (base64Error) {
      // If base64 decode fails, try to treat as binary
      try {
        compressedBuffer = Buffer.from(cleanInput, 'binary');
        if (compressedBuffer.length < 2 || compressedBuffer[0] !== 0x1f || compressedBuffer[1] !== 0x8b) {
          throw new Error('Input is not valid gzip data');
        }
      } catch {
        return reply.status(400).send({
          success: false,
          message: 'Invalid input format. Please provide base64 encoded gzip data.',
          error: 'Input must be base64 encoded gzip compressed data',
        });
      }
    }

    const compressedSize = compressedBuffer.length;

    // Create input stream
    const inputStream = Readable.from([compressedBuffer]);

    // Create decompression stream
    const gunzip = createGunzip();

    // Collect decompressed data
    const chunks = [];
    const outputStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    await pipeline(inputStream, gunzip, outputStream);

    const decompressedBuffer = Buffer.concat(chunks);
    const decompressedSize = decompressedBuffer.length;
    const decompressionTime = Date.now() - startTime;
    const expansionRatio = decompressedSize / compressedSize;

    reply.send({
      success: true,
      message: 'Gzip decompression completed',
      results: {
        decompressed: decompressedBuffer.toString('utf8'),
        stats: {
          compressedSize,
          decompressedSize,
          expansionRatio: parseFloat(expansionRatio.toFixed(2)),
          decompressionTime,
          algorithm: 'gzip',
        },
        summary: {
          sizeRestored: decompressedSize - compressedSize,
          originalCompressionRatio: ((compressedSize / decompressedSize) * 100).toFixed(2) + '%',
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Gzip decompression failed',
      error: error.message,
      hint: 'Make sure input is valid base64 encoded gzip data. You can use the Gzip Compress endpoint to generate valid test data.',
    });
  }
};

/**
 * Deflate compression
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Compression results
 */
const deflateCompress = async (request, reply) => {
  const { level = 6, windowBits = 15 } = request.query;

  let input = request.body;
  if (!input) {
    input = `Deflate compression test data with repeating patterns.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Deflate compression test data with repeating patterns.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
  }

  try {
    const compressionLevel = Math.max(
      LIMITS.MIN_COMPRESSION_LEVEL,
      Math.min(LIMITS.MAX_COMPRESSION_LEVEL, parseInt(level)),
    );
    const windowSize = Math.max(8, Math.min(15, parseInt(windowBits)));

    const options = {
      level: compressionLevel,
      windowBits: windowSize,
    };

    const startTime = Date.now();
    const originalSize = Buffer.byteLength(input);

    const inputStream = Readable.from([input]);
    const deflate = createDeflate(options);

    const chunks = [];
    const outputStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    await pipeline(inputStream, deflate, outputStream);

    const compressedBuffer = Buffer.concat(chunks);
    const compressedSize = compressedBuffer.length;
    const compressionTime = Date.now() - startTime;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    reply.send({
      success: true,
      message: 'Deflate compression completed',
      results: {
        compressed: compressedBuffer.toString('base64'),
        stats: {
          originalSize,
          compressedSize,
          compressionRatio: parseFloat(compressionRatio.toFixed(2)),
          compressionTime,
          algorithm: 'deflate',
          level: compressionLevel,
          windowBits: windowSize,
        },
        summary: {
          sizeSaved: originalSize - compressedSize,
          efficiency: compressionRatio > 0 ? 'Good' : 'Poor',
          config: { level: compressionLevel, windowBits: windowSize },
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Deflate compression failed',
      error: error.message,
    });
  }
};

/**
 * Brotli compression
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Compression results
 */
const brotliCompress = async (request, reply) => {
  const { quality = 6, mode = 'generic' } = request.query;

  let input = request.body;
  if (!input) {
    input = `Brotli compression algorithm test data.
This modern compression format offers excellent compression ratios.
Brotli compression algorithm test data.
This modern compression format offers excellent compression ratios.
It's particularly effective for text-based content and web resources.`;
  }

  try {
    const compressionQuality = Math.max(0, Math.min(11, parseInt(quality)));

    const options = {
      params: {
        [require('zlib').constants.BROTLI_PARAM_QUALITY]: compressionQuality,
        [require('zlib').constants.BROTLI_PARAM_MODE]:
          mode === 'text'
            ? require('zlib').constants.BROTLI_MODE_TEXT
            : mode === 'font'
              ? require('zlib').constants.BROTLI_MODE_FONT
              : require('zlib').constants.BROTLI_MODE_GENERIC,
      },
    };

    const startTime = Date.now();
    const originalSize = Buffer.byteLength(input);

    const inputStream = Readable.from([input]);
    const brotli = createBrotliCompress(options);

    const chunks = [];
    const outputStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    await pipeline(inputStream, brotli, outputStream);

    const compressedBuffer = Buffer.concat(chunks);
    const compressedSize = compressedBuffer.length;
    const compressionTime = Date.now() - startTime;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    reply.send({
      success: true,
      message: 'Brotli compression completed',
      results: {
        compressed: compressedBuffer.toString('base64'),
        stats: {
          originalSize,
          compressedSize,
          compressionRatio: parseFloat(compressionRatio.toFixed(2)),
          compressionTime,
          algorithm: 'brotli',
          quality: compressionQuality,
          mode,
        },
        summary: {
          sizeSaved: originalSize - compressedSize,
          efficiency: compressionRatio > 0 ? 'Excellent' : 'Poor',
          config: { quality: compressionQuality, mode },
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Brotli compression failed',
      error: error.message,
    });
  }
};

/**
 * Compare multiple compression algorithms
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Comparison results
 */
const compareAlgorithms = async (request, reply) => {
  let input = request.body;
  if (!input) {
    input = `Compression algorithm comparison test data.
This text contains various patterns and structures to test different compression algorithms.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Compression algorithm comparison test data.
This text contains various patterns and structures to test different compression algorithms.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`.repeat(
      5,
    );
  }

  try {
    const originalSize = Buffer.byteLength(input);
    const algorithms = ['gzip', 'deflate', 'brotli'];
    const results = [];

    for (const algorithm of algorithms) {
      const startTime = Date.now();

      let compressor;

      switch (algorithm) {
        case 'gzip':
          compressor = createGzip({ level: 6 });
          break;
        case 'deflate':
          compressor = createDeflate({ level: 6 });
          break;
        case 'brotli':
          compressor = createBrotliCompress({
            params: {
              [require('zlib').constants.BROTLI_PARAM_QUALITY]: 6,
            },
          });
          break;
      }

      const inputStream = Readable.from([input]);
      const chunks = [];
      const outputStream = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      });

      await pipeline(inputStream, compressor, outputStream);

      const compressedBuffer = Buffer.concat(chunks);
      const compressedSize = compressedBuffer.length;
      const compressionTime = Date.now() - startTime;
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      results.push({
        algorithm,
        originalSize,
        compressedSize,
        compressionRatio: parseFloat(compressionRatio.toFixed(2)),
        compressionTime,
        sizeSaved: originalSize - compressedSize,
        throughput: Math.round((originalSize / compressionTime) * 1000), // bytes per second
      });
    }

    // Find best algorithm
    const bestRatio = results.reduce((best, current) =>
      current.compressionRatio > best.compressionRatio ? current : best,
    );

    const fastest = results.reduce((fast, current) =>
      current.compressionTime < fast.compressionTime ? current : fast,
    );

    reply.send({
      success: true,
      message: 'Compression algorithm comparison completed',
      results: {
        comparison: results,
        originalSize,
        bestCompression: bestRatio,
        fastestAlgorithm: fastest,
        summary: {
          totalAlgorithms: algorithms.length,
          avgCompressionRatio:
            (results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length).toFixed(2) + '%',
          avgCompressionTime: Math.round(results.reduce((sum, r) => sum + r.compressionTime, 0) / results.length),
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Compression comparison failed',
      error: error.message,
    });
  }
};

module.exports = {
  gzipCompress,
  gzipDecompress,
  deflateCompress,
  brotliCompress,
  compareAlgorithms,
};
