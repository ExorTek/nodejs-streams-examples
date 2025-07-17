const crypto = require('node:crypto');

/**
 * System limits for encryption operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum input size in bytes (5MB) */
  MAX_INPUT_SIZE: 5 * 1024 * 1024,
  /** Maximum key length */
  MAX_KEY_LENGTH: 512,
  /** Maximum IV length */
  MAX_IV_LENGTH: 64,
};

/**
 * AES encryption
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Encryption results
 */
const aesEncrypt = async (request, reply) => {
  const { algorithm = 'aes-256-cbc', key = '', iv = '', outputFormat = 'base64' } = request.query;

  let input = request.body;
  if (!input) {
    input = `This is sensitive data that needs to be encrypted.
It contains confidential information that should be protected.
AES encryption provides strong security for data protection.`;
  }

  try {
    const startTime = Date.now();

    // Generate key if not provided
    let encryptionKey;
    if (key) {
      encryptionKey = Buffer.from(key, 'utf8');
      // Ensure key is the right length for the algorithm
      if (algorithm.includes('256')) {
        encryptionKey = crypto.scryptSync(key, 'salt', 32);
      } else if (algorithm.includes('192')) {
        encryptionKey = crypto.scryptSync(key, 'salt', 24);
      } else {
        encryptionKey = crypto.scryptSync(key, 'salt', 16);
      }
    } else {
      // Generate random key
      const keyLength = algorithm.includes('256') ? 32 : algorithm.includes('192') ? 24 : 16;
      encryptionKey = crypto.randomBytes(keyLength);
    }

    // Generate IV if not provided
    let initVector;
    if (iv) {
      initVector = Buffer.from(iv, 'hex');
    } else {
      initVector = crypto.randomBytes(16);
    }

    // Create cipher
    const cipher = crypto.createCipher(algorithm, encryptionKey);

    let encrypted = cipher.update(input, 'utf8', outputFormat);
    encrypted += cipher.final(outputFormat);

    const encryptionTime = Date.now() - startTime;
    const originalSize = Buffer.byteLength(input);
    const encryptedSize = Buffer.byteLength(encrypted, outputFormat);

    reply.send({
      success: true,
      message: 'AES encryption completed',
      results: {
        encrypted,
        keyUsed: encryptionKey.toString('hex'),
        ivUsed: initVector.toString('hex'),
        stats: {
          algorithm,
          originalSize,
          encryptedSize,
          encryptionTime,
          outputFormat,
          keyLength: encryptionKey.length * 8, // bits
        },
        summary: {
          keyGenerated: !key,
          ivGenerated: !iv,
          securityLevel: algorithm.includes('256') ? 'High' : algorithm.includes('192') ? 'Medium' : 'Standard',
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'AES encryption failed',
      error: error.message,
    });
  }
};

/**
 * AES decryption
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Decryption results
 */
const aesDecrypt = async (request, reply) => {
  const { algorithm = 'aes-256-cbc', key = '', iv = '', inputFormat = 'base64' } = request.query;

  let input = request.body;
  if (!input) {
    return reply.status(400).send({
      success: false,
      message: 'No encrypted data provided',
      error: 'Please provide encrypted data to decrypt',
    });
  }

  try {
    const startTime = Date.now();

    if (!key) {
      return reply.status(400).send({
        success: false,
        message: 'Encryption key required for decryption',
        error: 'Please provide the encryption key used for encryption',
      });
    }

    // Prepare key
    let decryptionKey;
    if (key.length === 64 || key.length === 48 || key.length === 32) {
      // Assume hex key
      decryptionKey = Buffer.from(key, 'hex');
    } else {
      // Derive key from password
      if (algorithm.includes('256')) {
        decryptionKey = crypto.scryptSync(key, 'salt', 32);
      } else if (algorithm.includes('192')) {
        decryptionKey = crypto.scryptSync(key, 'salt', 24);
      } else {
        decryptionKey = crypto.scryptSync(key, 'salt', 16);
      }
    }

    // Create decipher
    const decipher = crypto.createDecipher(algorithm, decryptionKey);

    let decrypted = decipher.update(input, inputFormat, 'utf8');
    decrypted += decipher.final('utf8');

    const decryptionTime = Date.now() - startTime;
    const encryptedSize = Buffer.byteLength(input, inputFormat);
    const decryptedSize = Buffer.byteLength(decrypted);

    reply.send({
      success: true,
      message: 'AES decryption completed',
      results: {
        decrypted,
        stats: {
          algorithm,
          encryptedSize,
          decryptedSize,
          decryptionTime,
          inputFormat,
          keyLength: decryptionKey.length * 8,
        },
        summary: {
          dataRestored: decryptedSize,
          compressionRatio: (((encryptedSize - decryptedSize) / encryptedSize) * 100).toFixed(2) + '%',
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'AES decryption failed',
      error: error.message,
      hint: 'Make sure you are using the correct key and algorithm that was used for encryption.',
    });
  }
};

/**
 * Hash generation
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Hash results
 */
const generateHash = async (request, reply) => {
  const { algorithm = 'sha256', outputFormat = 'hex', salt = '', iterations = 1 } = request.query;

  let input = request.body;
  if (!input) {
    input = `Data to be hashed for integrity verification.
This text will be processed through cryptographic hash function.
The resulting hash can be used to verify data integrity.`;
  }

  try {
    const startTime = Date.now();
    const iterationCount = Math.min(10000, Math.max(1, parseInt(iterations)));

    // Available hash algorithms
    const availableAlgorithms = crypto.getHashes();
    if (!availableAlgorithms.includes(algorithm)) {
      return reply.status(400).send({
        success: false,
        message: `Unsupported hash algorithm: ${algorithm}`,
        availableAlgorithms: availableAlgorithms.slice(0, 20), // Show first 20
      });
    }

    let hash;
    let finalSalt = salt;

    if (algorithm === 'pbkdf2') {
      // PBKDF2 key derivation
      if (!salt) {
        finalSalt = crypto.randomBytes(16).toString('hex');
      }
      hash = crypto.pbkdf2Sync(input, finalSalt, iterationCount, 32, 'sha256').toString(outputFormat);
    } else {
      // Regular hash
      const hasher = crypto.createHash(algorithm);

      if (salt) {
        hasher.update(salt);
      }

      hasher.update(input);
      hash = hasher.digest(outputFormat);
    }

    const hashingTime = Date.now() - startTime;
    const inputSize = Buffer.byteLength(input);
    const hashSize = Buffer.byteLength(hash, outputFormat);

    reply.send({
      success: true,
      message: 'Hash generation completed',
      results: {
        hash,
        salt: finalSalt,
        stats: {
          algorithm,
          inputSize,
          hashSize,
          hashingTime,
          outputFormat,
          iterations: algorithm === 'pbkdf2' ? iterationCount : 1,
        },
        summary: {
          hashLength: hash.length,
          securityLevel:
            algorithm.includes('sha256') || algorithm.includes('sha512')
              ? 'High'
              : algorithm.includes('sha1')
                ? 'Medium'
                : 'Standard',
          saltGenerated: !salt && algorithm === 'pbkdf2',
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Hash generation failed',
      error: error.message,
    });
  }
};

/**
 * Digital signature creation
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Signature results
 */
const createSignature = async (request, reply) => {
  const { algorithm = 'RSA-SHA256', keySize = 2048, outputFormat = 'base64' } = request.query;

  let input = request.body;
  if (!input) {
    input = `Document content that needs to be digitally signed.
This ensures authenticity and non-repudiation.
Digital signatures provide strong security guarantees.`;
  }

  try {
    const startTime = Date.now();
    const keyLength = Math.min(4096, Math.max(1024, parseInt(keySize)));

    // Generate RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: keyLength,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Create signature
    const sign = crypto.createSign(algorithm);
    sign.update(input);
    const signature = sign.sign(privateKey, outputFormat);

    const signingTime = Date.now() - startTime;
    const inputSize = Buffer.byteLength(input);
    const signatureSize = Buffer.byteLength(signature, outputFormat);

    reply.send({
      success: true,
      message: 'Digital signature created',
      results: {
        signature,
        publicKey,
        // Note: In production, never return private key!
        privateKey: '*** PRIVATE KEY HIDDEN FOR SECURITY ***',
        stats: {
          algorithm,
          inputSize,
          signatureSize,
          signingTime,
          keySize: keyLength,
          outputFormat,
        },
        summary: {
          signatureLength: signature.length,
          keyGenerated: true,
          securityLevel: keyLength >= 2048 ? 'High' : 'Medium',
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Digital signature creation failed',
      error: error.message,
    });
  }
};

/**
 * Random data generation
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Random data results
 */
const generateRandom = async (request, reply) => {
  const { size = 32, format = 'hex', type = 'bytes' } = request.query;

  try {
    const startTime = Date.now();
    const dataSize = Math.min(1024, Math.max(1, parseInt(size)));

    let randomData;
    let stats = {
      size: dataSize,
      format,
      type,
      generationTime: 0,
    };

    switch (type) {
      case 'bytes':
        randomData = crypto.randomBytes(dataSize).toString(format);
        break;
      case 'password':
        // Generate password with mixed characters
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        randomData = '';
        for (let i = 0; i < dataSize; i++) {
          randomData += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        stats.charset = 'Mixed alphanumeric + symbols';
        break;
      case 'uuid':
        randomData = crypto.randomUUID();
        stats.size = 36; // UUID length
        stats.format = 'string';
        break;
      case 'key':
        // Generate cryptographic key
        randomData = crypto.randomBytes(dataSize).toString('hex');
        stats.keyStrength = dataSize * 8 + ' bits';
        break;
      default:
        randomData = crypto.randomBytes(dataSize).toString(format);
    }

    const generationTime = Date.now() - startTime;
    stats.generationTime = generationTime;

    reply.send({
      success: true,
      message: 'Random data generated',
      results: {
        data: randomData,
        stats,
        summary: {
          dataLength: randomData.length,
          entropy: dataSize * 8 + ' bits',
          securityLevel: dataSize >= 32 ? 'High' : dataSize >= 16 ? 'Medium' : 'Low',
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Random data generation failed',
      error: error.message,
    });
  }
};

module.exports = {
  aesEncrypt,
  aesDecrypt,
  generateHash,
  createSignature,
  generateRandom,
};
