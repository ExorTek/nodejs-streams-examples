const { Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');

/**
 * System limits for transform stream operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum chunk size in bytes */
  MAX_CHUNK_SIZE: 8192, // 8KB
  /** Maximum number of transformations */
  MAX_TRANSFORMS: 1000,
  /** Maximum line length */
  MAX_LINE_LENGTH: 1000,
  /** Maximum filter count */
  MAX_FILTER_COUNT: 500,
};

/**
 * A transform stream that converts text case
 * @extends {Transform}
 */
class CaseTransform extends Transform {
  /**
   * Creates a CaseTransform instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {string} [options.mode='upper'] - Transform mode (upper, lower, title, camel)
   */
  constructor(options = {}) {
    super({ objectMode: false });
    this.mode = options.mode || 'upper';
    this.transformCount = 0;
    this.buffer = '';
  }

  /**
   * Internal method to transform data chunks
   * @param {Buffer|string} chunk - Data chunk to transform
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when transform is complete
   * @private
   */
  _transform(chunk, encoding, callback) {
    if (this.transformCount >= LIMITS.MAX_TRANSFORMS) {
      return callback(new Error('Maximum transform limit reached'));
    }

    const text = chunk.toString();
    this.buffer += text;

    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    const transformedLines = lines.map(line => {
      if (line.length > LIMITS.MAX_LINE_LENGTH) {
        return line; // Skip very long lines
      }

      this.transformCount++;
      return this._transformText(line);
    });

    if (transformedLines.length > 0) {
      this.push(transformedLines.join('\n') + '\n');
    }

    callback();
  }

  /**
   * Called when no more data will be written
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _flush(callback) {
    if (this.buffer.trim()) {
      const transformed = this._transformText(this.buffer);
      this.push(transformed);
    }
    callback();
  }

  /**
   * Transform text based on the selected mode
   * @param {string} text - Text to transform
   * @returns {string} Transformed text
   * @private
   */
  _transformText(text) {
    switch (this.mode) {
      case 'upper':
        return text.toUpperCase();
      case 'lower':
        return text.toLowerCase();
      case 'title':
        return text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      case 'camel':
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
          .replace(/\s+/g, '');
      case 'reverse':
        return text.split('').reverse().join('');
      default:
        return text;
    }
  }
}

/**
 * A transform stream that filters data based on criteria
 * @extends {Transform}
 */
class FilterTransform extends Transform {
  /**
   * Creates a FilterTransform instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {string} [options.mode='length'] - Filter mode
   * @param {number} [options.minLength=1] - Minimum line length
   * @param {string} [options.contains=''] - Text that lines must contain
   * @param {string} [options.pattern=''] - Regex pattern to match
   */
  constructor(options = {}) {
    super({ objectMode: false });
    this.mode = options.mode || 'length';
    this.minLength = parseInt(options.minLength) || 1;
    this.contains = options.contains || '';
    this.pattern = options.pattern ? new RegExp(options.pattern, 'i') : null;
    this.filterCount = 0;
    this.buffer = '';
  }

  /**
   * Internal method to transform data chunks
   * @param {Buffer|string} chunk - Data chunk to transform
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when transform is complete
   * @private
   */
  _transform(chunk, encoding, callback) {
    if (this.filterCount >= LIMITS.MAX_FILTER_COUNT) {
      return callback(new Error('Maximum filter limit reached'));
    }

    const text = chunk.toString();
    this.buffer += text;

    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    const filteredLines = lines.filter(line => {
      this.filterCount++;
      return this._shouldIncludeLine(line);
    });

    if (filteredLines.length > 0) {
      this.push(filteredLines.join('\n') + '\n');
    }

    callback();
  }

  /**
   * Called when no more data will be written
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _flush(callback) {
    if (this.buffer.trim() && this._shouldIncludeLine(this.buffer)) {
      this.push(this.buffer);
    }
    callback();
  }

  /**
   * Check if a line should be included based on filter criteria
   * @param {string} line - Line to check
   * @returns {boolean} Whether to include the line
   * @private
   */
  _shouldIncludeLine(line) {
    switch (this.mode) {
      case 'length':
        return line.length >= this.minLength;
      case 'contains':
        return this.contains ? line.toLowerCase().includes(this.contains.toLowerCase()) : true;
      case 'pattern':
        return this.pattern ? this.pattern.test(line) : true;
      case 'numbers':
        return /\d/.test(line);
      case 'alpha':
        return /[a-zA-Z]/.test(line);
      case 'empty':
        return line.trim().length === 0;
      case 'nonEmpty':
        return line.trim().length > 0;
      default:
        return true;
    }
  }
}

/**
 * A transform stream that processes data with mathematical operations
 * @extends {Transform}
 */
class MathTransform extends Transform {
  /**
   * Creates a MathTransform instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {string} [options.operation='count'] - Math operation
   */
  constructor(options = {}) {
    super({ objectMode: false });
    this.operation = options.operation || 'count';
    this.numbers = [];
    this.lineCount = 0;
    this.wordCount = 0;
    this.charCount = 0;
    this.buffer = '';
  }

  /**
   * Internal method to transform data chunks
   * @param {Buffer|string} chunk - Data chunk to transform
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when transform is complete
   * @private
   */
  _transform(chunk, encoding, callback) {
    const text = chunk.toString();
    this.buffer += text;

    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    lines.forEach(line => {
      this.lineCount++;
      this.charCount += line.length;
      this.wordCount += line.split(/\s+/).filter(word => word.length > 0).length;

      // Extract numbers from line
      const numbersInLine = line.match(/\d+(\.\d+)?/g);
      if (numbersInLine) {
        this.numbers.push(...numbersInLine.map(parseFloat));
      }
    });

    // Output intermediate results for streaming effect
    if (this.operation === 'realtime' && lines.length > 0) {
      this.push(`Processed ${this.lineCount} lines, ${this.wordCount} words, ${this.charCount} chars\n`);
    }

    callback();
  }

  /**
   * Called when no more data will be written
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _flush(callback) {
    // Process remaining buffer
    if (this.buffer.trim()) {
      this.lineCount++;
      this.charCount += this.buffer.length;
      this.wordCount += this.buffer.split(/\s+/).filter(word => word.length > 0).length;

      const numbersInBuffer = this.buffer.match(/\d+(\.\d+)?/g);
      if (numbersInBuffer) {
        this.numbers.push(...numbersInBuffer.map(parseFloat));
      }
    }

    // Generate final output based on operation
    const result = this._calculateResult();
    this.push(result);
    callback();
  }

  /**
   * Calculate the final result based on the selected operation
   * @returns {string} Calculation result
   * @private
   */
  _calculateResult() {
    const stats = {
      lines: this.lineCount,
      words: this.wordCount,
      characters: this.charCount,
      numbers: this.numbers.length,
    };

    switch (this.operation) {
      case 'count':
        return `Statistics:\nLines: ${stats.lines}\nWords: ${stats.words}\nCharacters: ${stats.characters}\nNumbers found: ${stats.numbers}\n`;

      case 'sum':
        const sum = this.numbers.reduce((a, b) => a + b, 0);
        return `Sum of all numbers: ${sum}\nNumbers processed: ${this.numbers.length}\n`;

      case 'average':
        const avg = this.numbers.length > 0 ? this.numbers.reduce((a, b) => a + b, 0) / this.numbers.length : 0;
        return `Average of numbers: ${avg.toFixed(2)}\nNumbers processed: ${this.numbers.length}\n`;

      case 'minmax':
        const min = this.numbers.length > 0 ? Math.min(...this.numbers) : 0;
        const max = this.numbers.length > 0 ? Math.max(...this.numbers) : 0;
        return `Min: ${min}\nMax: ${max}\nNumbers processed: ${this.numbers.length}\n`;

      case 'realtime':
        return `Final Statistics:\nLines: ${stats.lines}\nWords: ${stats.words}\nCharacters: ${stats.characters}\n`;

      default:
        return JSON.stringify(stats, null, 2) + '\n';
    }
  }
}

/**
 * A transform stream that encodes/decodes data
 * @extends {Transform}
 */
class EncodingTransform extends Transform {
  /**
   * Creates an EncodingTransform instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {string} [options.encoding='base64'] - Encoding type
   * @param {string} [options.direction='encode'] - encode or decode
   */
  constructor(options = {}) {
    super({ objectMode: false });
    this.encoding = options.encoding || 'base64';
    this.direction = options.direction || 'encode';
    this.buffer = '';
  }

  /**
   * Internal method to transform data chunks
   * @param {Buffer|string} chunk - Data chunk to transform
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when transform is complete
   * @private
   */
  _transform(chunk, encoding, callback) {
    const text = chunk.toString();
    this.buffer += text;

    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    const transformedLines = lines.map(line => {
      return this._transformLine(line);
    });

    if (transformedLines.length > 0) {
      this.push(transformedLines.join('\n') + '\n');
    }

    callback();
  }

  /**
   * Called when no more data will be written
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _flush(callback) {
    if (this.buffer.trim()) {
      const transformed = this._transformLine(this.buffer);
      this.push(transformed);
    }
    callback();
  }

  /**
   * Transform a line based on encoding and direction
   * @param {string} line - Line to transform
   * @returns {string} Transformed line
   * @private
   */
  _transformLine(line) {
    if (!line.trim()) return line;

    switch (this.encoding) {
      case 'base64':
        return this.direction === 'encode'
          ? Buffer.from(line).toString('base64')
          : Buffer.from(line, 'base64').toString('utf8');

      case 'hex':
        return this.direction === 'encode'
          ? Buffer.from(line).toString('hex')
          : Buffer.from(line, 'hex').toString('utf8');

      case 'url':
        return this.direction === 'encode' ? encodeURIComponent(line) : decodeURIComponent(line);

      case 'json':
        return this.direction === 'encode' ? JSON.stringify(line) : JSON.parse(line);

      default:
        return line;
    }
  }
}

/**
 * Validates and sanitizes request parameters
 * @param {Object} params - Raw parameters from request
 * @returns {Object} Validated parameters
 */
const validateParams = params => {
  return {
    mode: ['upper', 'lower', 'title', 'camel', 'reverse'].includes(params.mode) ? params.mode : 'upper',
    filterMode: ['length', 'contains', 'pattern', 'numbers', 'alpha', 'empty', 'nonEmpty'].includes(params.filterMode)
      ? params.filterMode
      : 'length',
    minLength: Math.max(0, Math.min(1000, parseInt(params.minLength) || 1)),
    contains: (params.contains || '').substring(0, 100),
    pattern: (params.pattern || '').substring(0, 100),
    operation: ['count', 'sum', 'average', 'minmax', 'realtime'].includes(params.operation)
      ? params.operation
      : 'count',
    encoding: ['base64', 'hex', 'url', 'json'].includes(params.encoding) ? params.encoding : 'base64',
    direction: ['encode', 'decode'].includes(params.direction) ? params.direction : 'encode',
  };
};

/**
 * Fastify route handler for case transformation
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Transform results
 */
const caseTransform = async (request, reply) => {
  const { mode } = validateParams(request.query);
  const input = request.body || '';

  return new Promise(resolve => {
    const transformer = new CaseTransform({ mode });
    let output = '';

    transformer.on('data', chunk => {
      output += chunk.toString();
    });

    transformer.on('end', () => {
      const response = {
        success: true,
        message: 'Case transformation completed',
        results: {
          transformed: output,
          stats: {
            mode,
            transformCount: transformer.transformCount,
          },
        },
      };

      reply.send(response);
      resolve(response);
    });

    transformer.write(input);
    transformer.end();
  });
};

/**
 * Fastify route handler for data filtering
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Filter results
 */
const filterTransform = async (request, reply) => {
  const { filterMode, minLength, contains, pattern } = validateParams(request.query);
  const input = request.body || '';

  return new Promise(resolve => {
    const filter = new FilterTransform({
      mode: filterMode,
      minLength,
      contains,
      pattern,
    });
    let output = '';

    filter.on('data', chunk => {
      output += chunk.toString();
    });

    filter.on('end', () => {
      const response = {
        success: true,
        message: 'Filtering completed',
        results: {
          filtered: output,
          stats: {
            filterMode,
            filterCount: filter.filterCount,
            criteria: { minLength, contains, pattern },
          },
        },
      };

      reply.send(response);
      resolve(response);
    });

    filter.write(input);
    filter.end();
  });
};

/**
 * Fastify route handler for mathematical operations
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Math results
 */
const mathTransform = async (request, reply) => {
  const { operation } = validateParams(request.query);
  const input = request.body || '';

  return new Promise(resolve => {
    const mathProcessor = new MathTransform({ operation });
    let output = '';

    mathProcessor.on('data', chunk => {
      output += chunk.toString();
    });

    mathProcessor.on('end', () => {
      const response = {
        success: true,
        message: 'Mathematical processing completed',
        results: {
          calculations: output,
          stats: {
            operation,
            lineCount: mathProcessor.lineCount,
            wordCount: mathProcessor.wordCount,
            charCount: mathProcessor.charCount,
            numberCount: mathProcessor.numbers.length,
          },
        },
      };

      reply.send(response);
      resolve(response);
    });

    mathProcessor.write(input);
    mathProcessor.end();
  });
};

/**
 * Fastify route handler for encoding/decoding
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Encoding results
 */
const encodingTransform = async (request, reply) => {
  const { encoding, direction } = validateParams(request.query);
  const input = request.body || '';

  return new Promise(resolve => {
    const encoder = new EncodingTransform({ encoding, direction });
    let output = '';

    encoder.on('data', chunk => {
      output += chunk.toString();
    });

    encoder.on('end', () => {
      const response = {
        success: true,
        message: `${direction === 'encode' ? 'Encoding' : 'Decoding'} completed`,
        results: {
          encoded: output,
          stats: {
            encoding,
            direction,
          },
        },
      };

      reply.send(response);
      resolve(response);
    });

    encoder.on('error', error => {
      const errorResponse = {
        success: false,
        error: error.message,
        stats: { encoding, direction },
      };

      reply.send(errorResponse);
      resolve(errorResponse);
    });

    encoder.write(input);
    encoder.end();
  });
};

module.exports = {
  caseTransform,
  filterTransform,
  mathTransform,
  encodingTransform,
};
