const { Writable } = require('node:stream');

/**
 * System limits for writable stream operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum file size in bytes (1MB) */
  MAX_FILE_SIZE: 1024 * 1024,
  /** Maximum number of lines to process */
  MAX_LINES: 100,
  /** Maximum line length */
  MAX_LINE_LENGTH: 500,
  /** Maximum processing time in ms */
  MAX_PROCESSING_TIME: 30000,
};

/**
 * A writable stream that collects and counts incoming data
 * @extends {Writable}
 */
class DataCollectorStream extends Writable {
  /**
   * Creates a DataCollectorStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {boolean} [options.objectMode=false] - Whether to operate in object mode
   */
  constructor(options = {}) {
    super(options);
    this.collectedData = [];
    this.stats = {
      chunks: 0,
      bytes: 0,
      lines: 0,
      startTime: Date.now(),
    };
    this.maxSize = options.maxSize || LIMITS.MAX_FILE_SIZE;
  }

  /**
   * Internal method to write data to the stream
   * @param {Buffer|string} chunk - Data chunk to write
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when write is complete
   * @private
   */
  _write(chunk, encoding, callback) {
    const data = chunk.toString();

    // Check size limits
    if (this.stats.bytes + data.length > this.maxSize) {
      return callback(new Error('Data exceeds maximum size limit'));
    }

    this.collectedData.push(data);
    this.stats.chunks++;
    this.stats.bytes += data.length;
    this.stats.lines += (data.match(/\n/g) || []).length;

    callback();
  }

  /**
   * Get collected data and statistics
   * @returns {Object} Collection results with data and stats
   */
  getResults() {
    return {
      data: this.collectedData.join(''),
      stats: {
        ...this.stats,
        duration: Date.now() - this.stats.startTime,
      },
    };
  }
}

/**
 * A writable stream that processes and transforms data line by line
 * @extends {Writable}
 */
class LineProcessorStream extends Writable {
  /**
   * Creates a LineProcessorStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {Function} [options.processor] - Function to process each line
   */
  constructor(options = {}) {
    super(options);
    this.processor = options.processor || (line => line.toUpperCase());
    this.processedLines = [];
    this.stats = {
      linesProcessed: 0,
      errors: 0,
      startTime: Date.now(),
    };
    this.buffer = '';
  }

  /**
   * Internal method to write data to the stream
   * @param {Buffer|string} chunk - Data chunk to write
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when write is complete
   * @private
   */
  _write(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');

    // Keep the last incomplete line in buffer
    this.buffer = lines.pop() || '';

    // Process complete lines
    for (const line of lines) {
      if (this.stats.linesProcessed >= LIMITS.MAX_LINES) {
        break;
      }

      if (line.length > LIMITS.MAX_LINE_LENGTH) {
        this.stats.errors++;
        continue;
      }

      this.processedLines.push(this.processor(line));
      this.stats.linesProcessed++;
    }

    callback();
  }

  /**
   * Called when stream is ending
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _final(callback) {
    // Process any remaining data in buffer
    if (this.buffer.trim()) {
      this.processedLines.push(this.processor(this.buffer));
      this.stats.linesProcessed++;
    }
    callback();
  }

  /**
   * Get processed results
   * @returns {Object} Processing results with data and stats
   */
  getResults() {
    return {
      processedLines: this.processedLines,
      stats: {
        ...this.stats,
        duration: Date.now() - this.stats.startTime,
      },
    };
  }
}

/**
 * A writable stream that validates and filters incoming data
 * @extends {Writable}
 */
class ValidationStream extends Writable {
  /**
   * Creates a ValidationStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {Function} [options.validator] - Function to validate each line
   */
  constructor(options = {}) {
    super(options);
    this.validator = options.validator || (line => line.length > 0);
    this.validLines = [];
    this.invalidLines = [];
    this.stats = {
      total: 0,
      valid: 0,
      invalid: 0,
      startTime: Date.now(),
    };
    this.buffer = '';
  }

  /**
   * Internal method to write data to the stream
   * @param {Buffer|string} chunk - Data chunk to write
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when write is complete
   * @private
   */
  _write(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');

    this.buffer = lines.pop() || '';

    for (const line of lines) {
      this.stats.total++;

      if (this.validator(line)) {
        this.validLines.push(line);
        this.stats.valid++;
      } else {
        this.invalidLines.push(line);
        this.stats.invalid++;
      }
    }

    callback();
  }

  /**
   * Called when stream is ending
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _final(callback) {
    if (this.buffer.trim()) {
      this.stats.total++;
      if (this.validator(this.buffer)) {
        this.validLines.push(this.buffer);
        this.stats.valid++;
      } else {
        this.invalidLines.push(this.buffer);
        this.stats.invalid++;
      }
    }
    callback();
  }

  /**
   * Get validation results
   * @returns {Object} Validation results with data and stats
   */
  getResults() {
    return {
      validLines: this.validLines,
      invalidLines: this.invalidLines,
      stats: {
        ...this.stats,
        duration: Date.now() - this.stats.startTime,
      },
    };
  }
}

/**
 * Validates and sanitizes request parameters
 * @param {Object} params - Raw parameters from request
 * @returns {Object} Validated parameters
 */
const validateParams = params => {
  return {
    maxSize: Math.min(parseInt(params.maxSize) || LIMITS.MAX_FILE_SIZE, LIMITS.MAX_FILE_SIZE),
    processor: params.processor || 'uppercase',
    validator: params.validator || 'nonEmpty',
  };
};

/**
 * Fastify route handler for data collection writable stream
 * Accepts POST data and collects it in memory with statistics
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} request.body - Request body data
 * @param {Object} request.query - Query parameters
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Collection results with statistics
 * @example
 * // POST /api/v1/writable/collect
 * // Body: "Line 1\nLine 2\nLine 3"
 * // Response: { data: "Line 1\nLine 2\nLine 3", stats: { chunks: 1, bytes: 21, lines: 3 } }
 */
const collectData = async (request, reply) => {
  const { maxSize } = validateParams(request.query);

  const collector = new DataCollectorStream({ maxSize });

  // Write request body to collector stream
  collector.write(request.body || '');
  collector.end();

  const results = collector.getResults();

  return reply.send({
    success: true,
    message: 'Data collected successfully',
    results,
  });
};

/**
 * Fastify route handler for line processing writable stream
 * Processes incoming data line by line with transformations
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} request.body - Request body data
 * @param {Object} request.query - Query parameters
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Processing results with transformed lines
 * @example
 * // POST /api/v1/writable/process?processor=uppercase
 * // Body: "hello\nworld"
 * // Response: { processedLines: ["HELLO", "WORLD"], stats: { linesProcessed: 2 } }
 */
const processLines = async (request, reply) => {
  const { processor } = validateParams(request.query);

  const processors = {
    uppercase: line => line.toUpperCase(),
    lowercase: line => line.toLowerCase(),
    reverse: line => line.split('').reverse().join(''),
    wordCount: line => `${line} (${line.split(' ').length} words)`,
  };

  const processorFn = processors[processor] || processors.uppercase;
  const lineProcessor = new LineProcessorStream({ processor: processorFn });

  lineProcessor.write(request.body || '');
  lineProcessor.end();

  const results = lineProcessor.getResults();

  return reply.send({
    success: true,
    message: 'Lines processed successfully',
    results,
  });
};

/**
 * Fastify route handler for data validation writable stream
 * Validates incoming data and separates valid/invalid entries
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} request.body - Request body data
 * @param {Object} request.query - Query parameters
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Validation results with separated data
 * @example
 * // POST /api/v1/writable/validate?validator=email
 * // Body: "test@example.com\ninvalid-email\nuser@domain.org"
 * // Response: { validLines: ["test@example.com", "user@domain.org"], invalidLines: ["invalid-email"] }
 */
const validateData = async (request, reply) => {
  const { validator } = validateParams(request.query);

  const validators = {
    nonEmpty: line => line.trim().length > 0,
    email: line => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line.trim()),
    number: line => !isNaN(parseFloat(line.trim())),
    minLength: line => line.trim().length >= 3,
  };

  const validatorFn = validators[validator] || validators.nonEmpty;
  const validationStream = new ValidationStream({ validator: validatorFn });

  validationStream.write(request.body || '');
  validationStream.end();

  const results = validationStream.getResults();

  return reply.send({
    success: true,
    message: 'Data validated successfully',
    results,
  });
};

/**
 * Fastify route handler for streaming data upload
 * Handles streaming upload with real-time processing
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Upload results
 */
const streamUpload = async (request, reply) => {
  const collector = new DataCollectorStream();

  const bodyData = request.body || '';

  collector.write(bodyData);
  collector.end();

  const results = collector.getResults();

  if (results.stats.bytes === 0) {
    return reply.status(400).send({
      success: false,
      message: 'No data received for upload',
    });
  }

  return reply.send({
    success: true,
    message: 'Stream upload completed',
    results,
  });
};

module.exports = {
  collectData,
  processLines,
  validateData,
  streamUpload,
};
