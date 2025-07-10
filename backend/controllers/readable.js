const { Readable } = require('node:stream');

/**
 * System limits for stream operations to prevent resource abuse
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum number of items in a stream */
  MAX_COUNT: 999,
  /** Maximum delay between chunks in milliseconds */
  MAX_DELAY: 5000,
  /** Minimum delay between chunks in milliseconds */
  MIN_DELAY: 1,
  /** Maximum number of log entries */
  MAX_LOGS: 999,
  /** Maximum text length for custom text streams */
  MAX_TEXT_LENGTH: 1000,
  /** Maximum number of repetitions */
  MAX_REPEAT: 999,
};

/**
 * A readable stream that emits sequential numbers with configurable delays
 * @extends {Readable}
 */
class NumberStream extends Readable {
  /**
   * Creates a NumberStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {number} [options.start=1] - Starting number (will be clamped to minimum 1)
   * @param {number} [options.end=10] - Ending number (will be clamped to start + MAX_COUNT)
   * @param {number} [options.delay=500] - Delay between numbers in ms (clamped to MIN_DELAY-MAX_DELAY)
   */
  constructor(
    options = {
      start: 1,
      end: 10,
      delay: 500,
    },
  ) {
    super(options);
    this.start = Math.max(1, parseInt(options.start) || 1);
    this.end = Math.min(this.start + LIMITS.MAX_COUNT, parseInt(options.end) || 10);
    this.current = this.start;
    this.delay = Math.max(LIMITS.MIN_DELAY, Math.min(LIMITS.MAX_DELAY, parseInt(options.delay) || 500));
    this._timer = null;
  }

  /**
   * Internal method to read data from the stream
   * Emits sequential numbers with configured delay until end is reached
   * @private
   */
  _read() {
    if (this.current <= this.end) {
      this._timer = setTimeout(() => {
        this.push(`${this.current}\n`);
        this.current++;
      }, this.delay);
    } else {
      this.push(null); // Signal end of stream
    }
  }

  /**
   * Cleanup method called when stream is destroyed
   * @param {Error|null} err - Error that caused destruction, if any
   * @param {Function} callback - Callback to call when cleanup is complete
   * @private
   */
  _destroy(err, callback) {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    callback(err);
  }

  eventNames() {
    return undefined;
  }

  getMaxListeners() {
    return 0;
  }

  listenerCount(eventName, listener) {
    return 0;
  }

  listeners(eventName) {
    return undefined;
  }

  off(eventName, listener) {
    return undefined;
  }

  rawListeners(eventName) {
    return undefined;
  }

  removeAllListeners(eventName) {
    return undefined;
  }

  setMaxListeners(n) {
    return undefined;
  }
}

/**
 * A readable stream that emits simple JSON data objects
 * @extends {Readable}
 */
class SimpleDataStream extends Readable {
  /**
   * Creates a SimpleDataStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {number} [options.count=10] - Number of data items to emit (clamped to MAX_COUNT)
   * @param {number} [options.delay=300] - Delay between items in ms (clamped to MIN_DELAY-MAX_DELAY)
   */
  constructor(options = {}) {
    super(options);
    this.count = Math.min(LIMITS.MAX_COUNT, parseInt(options.count) || 10);
    this.delay = Math.max(LIMITS.MIN_DELAY, Math.min(LIMITS.MAX_DELAY, parseInt(options.delay) || 300));
    this.current = 1;
    this._timer = null;
  }

  /**
   * Internal method to read data from the stream
   * Emits JSON objects with id, name, and random value
   * @private
   */
  _read() {
    if (this.current <= this.count) {
      this._timer = setTimeout(() => {
        const data = {
          id: this.current,
          name: `Item ${this.current}`,
          value: Math.floor(Math.random() * 100),
        };
        this.push(JSON.stringify(data) + '\n');
        this.current++;
      }, this.delay);
    } else {
      this.push(null);
    }
  }

  /**
   * Cleanup method called when stream is destroyed
   * @param {Error|null} err - Error that caused destruction, if any
   * @param {Function} callback - Callback to call when cleanup is complete
   * @private
   */
  _destroy(err, callback) {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    callback(err);
  }

  eventNames() {
    return undefined;
  }

  getMaxListeners() {
    return 0;
  }

  listenerCount(eventName, listener) {
    return 0;
  }

  listeners(eventName) {
    return undefined;
  }

  off(eventName, listener) {
    return undefined;
  }

  rawListeners(eventName) {
    return undefined;
  }

  removeAllListeners(eventName) {
    return undefined;
  }

  setMaxListeners(n) {
    return undefined;
  }
}

/**
 * A readable stream that emits simulated log entries
 * @extends {Readable}
 */
class SimpleLogStream extends Readable {
  /**
   * Creates a SimpleLogStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {number} [options.maxLogs=10] - Maximum number of log entries (clamped to MAX_LOGS)
   * @param {number} [options.delay=400] - Delay between log entries in ms (clamped to MIN_DELAY-MAX_DELAY)
   */
  constructor(options = {}) {
    super(options);
    this.maxLogs = Math.min(LIMITS.MAX_LOGS, parseInt(options.maxLogs) || 10);
    this.delay = Math.max(LIMITS.MIN_DELAY, Math.min(LIMITS.MAX_DELAY, parseInt(options.delay) || 400));
    this.current = 1;
    this._timer = null;
  }

  /**
   * Internal method to read data from the stream
   * Emits formatted log entries with timestamp, level, and message
   * @private
   */
  _read() {
    if (this.current <= this.maxLogs) {
      this._timer = setTimeout(() => {
        const levels = ['INFO', 'WARN', 'ERROR'];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const timestamp = new Date().toLocaleTimeString();
        this.push(`[${timestamp}] ${level}: Log entry ${this.current}\n`);
        this.current++;
      }, this.delay);
    } else {
      this.push(null);
    }
  }

  /**
   * Cleanup method called when stream is destroyed
   * @param {Error|null} err - Error that caused destruction, if any
   * @param {Function} callback - Callback to call when cleanup is complete
   * @private
   */
  _destroy(err, callback) {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    callback(err);
  }

  eventNames() {
    return undefined;
  }

  getMaxListeners() {
    return 0;
  }

  listenerCount(eventName, listener) {
    return 0;
  }

  listeners(eventName) {
    return undefined;
  }

  off(eventName, listener) {
    return undefined;
  }

  rawListeners(eventName) {
    return undefined;
  }

  removeAllListeners(eventName) {
    return undefined;
  }

  setMaxListeners(n) {
    return undefined;
  }
}

/**
 * Fastify route handler for basic number stream
 * Streams sequential numbers with configurable start, end, and delay
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} request.query - Query parameters
 * @param {string} [request.query.start="1"] - Starting number
 * @param {string} [request.query.end="10"] - Ending number
 * @param {string} [request.query.delay="500"] - Delay between numbers in ms
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Fastify reply with stream
 * @example
 * // GET /api/v1/readable/basic?start=1&end=5&delay=1000
 * // Response: "1\n2\n3\n4\n5\n" (with 1 second delays)
 */
const basicReadable = async (request, reply) => {
  reply.type('text/plain');
  const { start, end, delay } = request.query;

  const stream = new NumberStream({ start, end, delay });
  return reply.send(stream);
};

/**
 * Fastify route handler for JSON data stream
 * Streams JSON objects with id, name, and random values
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} request.query - Query parameters
 * @param {string} [request.query.count="10"] - Number of items to stream
 * @param {string} [request.query.delay="300"] - Delay between items in ms
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Fastify reply with JSON stream
 * @example
 * // GET /api/v1/readable/data?count=3&delay=500
 * // Response: {"id":1,"name":"Item 1","value":42}\n{"id":2,"name":"Item 2","value":87}\n...
 */
const dataReadable = async (request, reply) => {
  reply.type('application/json');
  const { count, delay } = request.query;
  const stream = new SimpleDataStream({ count, delay });
  return reply.send(stream);
};

/**
 * Fastify route handler for log stream
 * Streams formatted log entries with timestamps and random log levels
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} request.query - Query parameters
 * @param {string} [request.query.maxLogs="10"] - Maximum number of log entries
 * @param {string} [request.query.delay="400"] - Delay between log entries in ms
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Fastify reply with log stream
 * @example
 * // GET /api/v1/readable/logs?maxLogs=2&delay=1000
 * // Response: "[14:30:15] INFO: Log entry 1\n[14:30:16] ERROR: Log entry 2\n"
 */
const logReadable = async (request, reply) => {
  reply.type('text/plain');
  const { maxLogs, delay } = request.query;

  const stream = new SimpleLogStream({ maxLogs, delay });
  return reply.send(stream);
};

/**
 * Fastify route handler for custom text stream
 * Streams custom text with configurable repetition and delay
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} request.query - Query parameters
 * @param {string} [request.query.text="Hello"] - Custom text to repeat
 * @param {string} [request.query.repeat="5"] - Number of repetitions
 * @param {string} [request.query.delay="1000"] - Delay between repetitions in ms
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Fastify reply with text stream
 * @example
 * // GET /api/v1/readable/text?text=World&repeat=3&delay=500
 * // Response: "World 1\nWorld 2\nWorld 3\n" (with 500ms delays)
 */
const textReadable = async (request, reply) => {
  reply.type('text/plain');

  let { text, repeat, delay } = request.query;

  // Validate and sanitize inputs
  const sanitizedText = String(text || 'Hello').substring(0, LIMITS.MAX_TEXT_LENGTH);
  const sanitizedRepeat = Math.min(Math.max(parseInt(repeat) || 5, 1), LIMITS.MAX_REPEAT);
  const sanitizedDelay = Math.max(Math.min(parseInt(delay) || 1000, LIMITS.MAX_DELAY), LIMITS.MIN_DELAY);
  text = sanitizedText;
  repeat = sanitizedRepeat;
  delay = sanitizedDelay;

  let count = 0;

  const stream = new Readable({
    read() {
      if (count < repeat) {
        setTimeout(() => {
          this.push(`${text} ${count + 1}\n`);
          count++;
        }, delay);
      } else {
        this.push(null);
      }
    },
  });

  return reply.send(stream);
};

module.exports = {
  basicReadable,
  dataReadable,
  logReadable,
  textReadable,
};
