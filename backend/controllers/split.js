const { Transform, PassThrough } = require('node:stream');

/**
 * System limits for split operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum number of output streams */
  MAX_OUTPUT_STREAMS: 10,
  /** Maximum line length */
  MAX_LINE_LENGTH: 10000,
  /** Maximum buffer size */
  MAX_BUFFER_SIZE: 1024 * 1024, // 1MB
  /** Maximum split operations */
  MAX_SPLIT_OPERATIONS: 1000,
};

/**
 * Stream splitter that divides data based on delimiters
 * @extends {Transform}
 */
class LineSplitter extends Transform {
  /**
   * Creates a LineSplitter instance
   * @param {Object} [options={}] - Splitter configuration
   * @param {string} [options.delimiter='\n'] - Line delimiter
   * @param {boolean} [options.skipEmpty=true] - Skip empty lines
   * @param {number} [options.maxLineLength=10000] - Maximum line length
   */
  constructor(options = {}) {
    super({ objectMode: true });
    this.delimiter = options.delimiter || '\n';
    this.skipEmpty = options.skipEmpty !== false;
    this.maxLineLength = Math.min(LIMITS.MAX_LINE_LENGTH, options.maxLineLength || 10000);
    this.buffer = '';
    this.lineCount = 0;
    this.stats = {
      totalLines: 0,
      emptyLines: 0,
      oversizedLines: 0,
      bytes: 0,
    };
  }

  /**
   * Internal method to transform data chunks
   * @param {Buffer|string} chunk - Data chunk to split
   * @param {string} encoding - Text encoding
   * @param {Function} callback - Completion callback
   * @private
   */
  _transform(chunk, encoding, callback) {
    const text = chunk.toString();
    this.buffer += text;
    this.stats.bytes += text.length;

    const lines = this.buffer.split(this.delimiter);
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      this._processLine(line);
    }

    callback();
  }

  /**
   * Process a single line
   * @param {string} line - Line to process
   * @private
   */
  _processLine(line) {
    this.stats.totalLines++;

    if (line.length === 0) {
      this.stats.emptyLines++;
      if (this.skipEmpty) return;
    }

    if (line.length > this.maxLineLength) {
      this.stats.oversizedLines++;
      line = line.substring(0, this.maxLineLength) + '...';
    }

    this.push({
      lineNumber: this.lineCount++,
      content: line,
      length: line.length,
      isEmpty: line.length === 0,
      timestamp: Date.now(),
    });
  }

  /**
   * Called when no more data will be written
   * @param {Function} callback - Completion callback
   * @private
   */
  _flush(callback) {
    if (this.buffer.length > 0) {
      this._processLine(this.buffer);
    }
    callback();
  }

  /**
   * Get splitter statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return { ...this.stats };
  }
}

/**
 * Multi-output splitter that duplicates data to multiple streams
 */
class MultiOutputSplitter {
  /**
   * Creates a MultiOutputSplitter instance
   * @param {number} outputCount - Number of output streams
   */
  constructor(outputCount = 2) {
    this.outputCount = Math.min(LIMITS.MAX_OUTPUT_STREAMS, Math.max(1, outputCount));
    this.outputs = [];
    this.stats = {
      inputChunks: 0,
      outputChunks: 0,
      bytes: 0,
    };

    // Create output streams
    for (let i = 0; i < this.outputCount; i++) {
      this.outputs.push(new PassThrough());
    }
  }

  /**
   * Write data to all output streams
   * @param {any} chunk - Data chunk
   */
  write(chunk) {
    this.stats.inputChunks++;
    const chunkSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk.toString());
    this.stats.bytes += chunkSize;

    this.outputs.forEach(output => {
      output.write(chunk);
      this.stats.outputChunks++;
    });
  }

  /**
   * End all output streams
   */
  end() {
    this.outputs.forEach(output => output.end());
  }

  /**
   * Get output stream by index
   * @param {number} index - Stream index
   * @returns {PassThrough} Output stream
   */
  getOutput(index) {
    return this.outputs[index];
  }

  /**
   * Get all output streams
   * @returns {PassThrough[]} All output streams
   */
  getAllOutputs() {
    return [...this.outputs];
  }

  /**
   * Get splitter statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return { ...this.stats };
  }
}

/**
 * Basic line splitting operation
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Split results
 */
const lineSplit = async (request, reply) => {
  const { delimiter = '\n', skipEmpty = true, maxLineLength = 1000 } = request.query;

  const input =
    request.body ||
    `Line 1: Hello World
Line 2: Node.js Streams
Line 3: Split Operations

Line 5: After empty line
Line 6: Final line`;

  const splitter = new LineSplitter({
    delimiter,
    skipEmpty: skipEmpty === 'true',
    maxLineLength: parseInt(maxLineLength),
  });

  const lines = [];

  return new Promise(resolve => {
    splitter.on('data', lineObj => {
      lines.push(lineObj);
    });

    splitter.on('end', () => {
      const stats = splitter.getStats();

      resolve(
        reply.send({
          success: true,
          message: 'Line splitting completed',
          results: {
            lines,
            stats,
            summary: {
              totalLines: lines.length,
              config: { delimiter, skipEmpty, maxLineLength },
            },
          },
        }),
      );
    });

    splitter.write(input);
    splitter.end();
  });
};

/**
 * Multi-output splitting to multiple streams
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Multi-output results
 */
const multiOutput = async (request, reply) => {
  const { outputs = 3, processDelay = 100 } = request.query;

  const input =
    request.body ||
    `Data chunk 1
Data chunk 2
Data chunk 3
Data chunk 4
Data chunk 5`;

  const outputCount = Math.min(5, Math.max(1, parseInt(outputs)));
  const splitter = new MultiOutputSplitter(outputCount);

  const outputResults = Array(outputCount)
    .fill(null)
    .map(() => []);
  const promises = [];

  // Setup collectors for each output
  splitter.getAllOutputs().forEach((output, index) => {
    const promise = new Promise(resolve => {
      output.on('data', chunk => {
        outputResults[index].push({
          content: chunk.toString(),
          timestamp: Date.now(),
          outputIndex: index,
        });
      });

      output.on('end', () => {
        resolve();
      });
    });
    promises.push(promise);
  });

  // Write data with delays
  const lines = input.split('\n').filter(line => line.trim());

  for (let i = 0; i < lines.length; i++) {
    await new Promise(resolve => setTimeout(resolve, parseInt(processDelay)));
    splitter.write(lines[i] + '\n');
  }

  splitter.end();

  // Wait for all outputs to complete
  await Promise.all(promises);

  const stats = splitter.getStats();

  return reply.send({
    success: true,
    message: 'Multi-output splitting completed',
    results: {
      outputs: outputResults,
      stats,
      summary: {
        outputCount,
        inputLines: lines.length,
        totalOutputItems: outputResults.reduce((sum, output) => sum + output.length, 0),
      },
    },
  });
};

/**
 * Field-based splitting for structured data
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Field split results
 */
const fieldSplit = async (request, reply) => {
  const { field = 'type', format = 'json', delimiter = '\n' } = request.query;

  let input = request.body;

  if (!input) {
    input =
      format === 'json'
        ? `{"type": "info", "message": "Application started", "timestamp": "2024-01-01T10:00:00Z"}
{"type": "error", "message": "Connection failed", "timestamp": "2024-01-01T10:01:00Z"}
{"type": "warning", "message": "Deprecated method", "timestamp": "2024-01-01T10:02:00Z"}
{"type": "info", "message": "Process completed", "timestamp": "2024-01-01T10:03:00Z"}
{"type": "error", "message": "Timeout occurred", "timestamp": "2024-01-01T10:04:00Z"}`
        : `info,Application started,2024-01-01T10:00:00Z
error,Connection failed,2024-01-01T10:01:00Z
warning,Deprecated method,2024-01-01T10:02:00Z
info,Process completed,2024-01-01T10:03:00Z
error,Timeout occurred,2024-01-01T10:04:00Z`;
  }

  const lines = input.split(delimiter).filter(line => line.trim());
  const groups = {};
  const stats = {
    totalLines: lines.length,
    validLines: 0,
    invalidLines: 0,
    groups: 0,
  };

  for (const line of lines) {
    let item;
    let fieldValue;

    try {
      if (format === 'json') {
        item = JSON.parse(line);
        fieldValue = item[field];
      } else {
        // Assume CSV format
        const parts = line.split(',');
        fieldValue = parts[0]; // First column as field value
        item = {
          [field]: fieldValue,
          data: parts.slice(1),
          raw: line,
        };
      }

      if (fieldValue) {
        if (!groups[fieldValue]) {
          groups[fieldValue] = [];
          stats.groups++;
        }
        groups[fieldValue].push(item);
        stats.validLines++;
      } else {
        stats.invalidLines++;
      }
    } catch (error) {
      stats.invalidLines++;
    }
  }

  return reply.send({
    success: true,
    message: 'Field-based splitting completed',
    results: {
      groups,
      stats,
      summary: {
        field,
        format,
        groupNames: Object.keys(groups),
        largestGroup: Object.keys(groups).reduce(
          (max, key) => (groups[key].length > (groups[max]?.length || 0) ? key : max),
          '',
        ),
      },
    },
  });
};

module.exports = {
  lineSplit,
  multiOutput,
  fieldSplit,
};
