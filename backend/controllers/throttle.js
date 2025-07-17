const { Transform } = require('node:stream');

/**
 * System limits for throttle operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum bytes per second */
  MAX_BYTES_PER_SECOND: 10 * 1024 * 1024, // 10MB/s
  /** Minimum bytes per second */
  MIN_BYTES_PER_SECOND: 1,
  /** Maximum chunk size */
  MAX_CHUNK_SIZE: 1024 * 1024, // 1MB
  /** Maximum queue size */
  MAX_QUEUE_SIZE: 100,
  /** Maximum delay between chunks in ms */
  MAX_DELAY: 60000, // 1 minute
};

/**
 * Throttle stream that limits data flow rate
 * @extends {Transform}
 */
class ThrottleStream extends Transform {
  /**
   * Creates a ThrottleStream instance
   * @param {Object} [options={}] - Throttle configuration
   * @param {number} [options.bytesPerSecond=1024] - Maximum bytes per second
   * @param {number} [options.chunkDelay=0] - Fixed delay between chunks in ms
   * @param {number} [options.burstSize=0] - Allow burst of N bytes without throttling
   * @param {boolean} [options.smoothing=true] - Enable smooth data flow
   */
  constructor(options = {}) {
    super(options);

    this.bytesPerSecond = Math.max(
      LIMITS.MIN_BYTES_PER_SECOND,
      Math.min(LIMITS.MAX_BYTES_PER_SECOND, options.bytesPerSecond || 1024),
    );

    this.chunkDelay = Math.max(0, Math.min(LIMITS.MAX_DELAY, options.chunkDelay || 0));
    this.burstSize = Math.max(0, options.burstSize || 0);
    this.smoothing = options.smoothing !== false;

    // Tracking variables
    this.bytesWritten = 0;
    this.startTime = Date.now();
    this.lastChunkTime = Date.now();
    this.burstBytesUsed = 0;
    this.queue = [];
    this.processing = false;

    this.stats = {
      totalBytes: 0,
      totalChunks: 0,
      delays: 0,
      avgDelay: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Internal method to transform data chunks with throttling
   * @param {Buffer|string} chunk - Data chunk to throttle
   * @param {string} encoding - Text encoding
   * @param {Function} callback - Completion callback
   * @private
   */
  _transform(chunk, encoding, callback) {
    const chunkSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);

    this.stats.totalBytes += chunkSize;
    this.stats.totalChunks++;

    this.queue.push({ chunk, callback, size: chunkSize, timestamp: Date.now() });

    if (!this.processing) {
      this._processQueue();
    }
  }

  /**
   * Process the throttle queue
   * @private
   */
  async _processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      const delay = this._calculateDelay(item.size);

      if (delay > 0) {
        this.stats.delays++;
        this.stats.avgDelay = (this.stats.avgDelay * (this.stats.delays - 1) + delay) / this.stats.delays;
        await this._delay(delay);
      }

      this.bytesWritten += item.size;
      this.lastChunkTime = Date.now();

      this.push(item.chunk);
      item.callback();
    }

    this.processing = false;
  }

  /**
   * Calculate delay for chunk based on throttling rules
   * @param {number} chunkSize - Size of current chunk
   * @returns {number} Delay in milliseconds
   * @private
   */
  _calculateDelay(chunkSize) {
    const now = Date.now();
    const elapsed = now - this.startTime;

    // Fixed chunk delay
    if (this.chunkDelay > 0) {
      const timeSinceLastChunk = now - this.lastChunkTime;
      return Math.max(0, this.chunkDelay - timeSinceLastChunk);
    }

    // Burst allowance
    if (this.burstSize > 0 && this.burstBytesUsed < this.burstSize) {
      const availableBurst = this.burstSize - this.burstBytesUsed;
      if (chunkSize <= availableBurst) {
        this.burstBytesUsed += chunkSize;
        return 0;
      }
    }

    // Rate limiting calculation
    if (elapsed === 0) return 0;

    const expectedBytes = (elapsed / 1000) * this.bytesPerSecond;
    const excessBytes = this.bytesWritten + chunkSize - expectedBytes;

    if (excessBytes <= 0) return 0;

    const delayMs = (excessBytes / this.bytesPerSecond) * 1000;

    return this.smoothing ? Math.min(delayMs, 1000) : delayMs;
  }

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current throttling statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const duration = Date.now() - this.stats.startTime;
    const actualBytesPerSecond = duration > 0 ? (this.stats.totalBytes / duration) * 1000 : 0;

    return {
      ...this.stats,
      duration,
      actualBytesPerSecond: Math.round(actualBytesPerSecond),
      targetBytesPerSecond: this.bytesPerSecond,
      efficiency: this.bytesPerSecond > 0 ? (actualBytesPerSecond / this.bytesPerSecond) * 100 : 0,
      queueSize: this.queue.length,
    };
  }
}

/**
 * Rate limiter for controlling request frequency
 */
class RateLimiter {
  /**
   * Creates a RateLimiter instance
   * @param {Object} options - Rate limiter configuration
   * @param {number} options.requestsPerSecond - Maximum requests per second
   * @param {number} [options.windowSize=1000] - Time window in ms
   * @param {number} [options.burstLimit=0] - Burst allowance
   */
  constructor(options) {
    this.requestsPerSecond = options.requestsPerSecond;
    this.windowSize = options.windowSize || 1000;
    this.burstLimit = options.burstLimit || 0;

    this.requests = [];
    this.burstUsed = 0;
  }

  /**
   * Check if request is allowed
   * @returns {boolean} Whether request is allowed
   */
  isAllowed() {
    const now = Date.now();

    // Clean old requests
    this.requests = this.requests.filter(time => now - time < this.windowSize);

    // Check burst allowance
    if (this.burstLimit > 0 && this.burstUsed < this.burstLimit) {
      this.burstUsed++;
      this.requests.push(now);
      return true;
    }

    // Check rate limit
    if (this.requests.length < this.requestsPerSecond) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  /**
   * Get time until next request is allowed
   * @returns {number} Milliseconds until next request
   */
  getTimeUntilNext() {
    if (this.requests.length === 0) return 0;

    const oldestRequest = Math.min(...this.requests);
    const nextAvailable = oldestRequest + this.windowSize;

    return Math.max(0, nextAvailable - Date.now());
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.requests = [];
    this.burstUsed = 0;
  }
}

/**
 * Basic throttle operation
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Throttle results
 */
const basicThrottle = async (request, reply) => {
  const { bytesPerSecond = 1024, chunkDelay = 0, smoothing = true } = request.query;

  const input = request.body || 'Sample data for throttling test\n'.repeat(10);

  const throttle = new ThrottleStream({
    bytesPerSecond: parseInt(bytesPerSecond),
    chunkDelay: parseInt(chunkDelay),
    smoothing: smoothing === 'true',
  });

  return new Promise(resolve => {
    let output = '';
    const startTime = Date.now();

    throttle.on('data', chunk => {
      output += chunk.toString();
    });

    throttle.on('end', () => {
      const endTime = Date.now();
      const stats = throttle.getStats();

      resolve(
        reply.send({
          success: true,
          message: 'Basic throttling completed',
          results: {
            output,
            stats: {
              ...stats,
              totalDuration: endTime - startTime,
            },
          },
        }),
      );
    });

    throttle.write(input);
    throttle.end();
  });
};

/**
 * Burst throttle with initial allowance
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Burst throttle results
 */
const burstThrottle = async (request, reply) => {
  const { bytesPerSecond = 512, burstSize = 2048, smoothing = true } = request.query;

  const input = request.body || 'Burst test data\n'.repeat(50);

  const throttle = new ThrottleStream({
    bytesPerSecond: parseInt(bytesPerSecond),
    burstSize: parseInt(burstSize),
    smoothing: smoothing === 'true',
  });

  return new Promise(resolve => {
    let output = '';
    const chunks = [];
    const startTime = Date.now();

    throttle.on('data', chunk => {
      output += chunk.toString();
      chunks.push({
        timestamp: Date.now() - startTime,
        size: chunk.length,
      });
    });

    throttle.on('end', () => {
      const stats = throttle.getStats();

      resolve(
        reply.send({
          success: true,
          message: 'Burst throttling completed',
          results: {
            output,
            chunks,
            stats,
          },
        }),
      );
    });

    throttle.write(input);
    throttle.end();
  });
};

/**
 * Rate limiting demonstration
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Rate limiting results
 */
const rateLimiting = async (request, reply) => {
  const { requestsPerSecond = 5, windowSize = 1000, burstLimit = 2, testDuration = 3000 } = request.query;

  const rateLimiter = new RateLimiter({
    requestsPerSecond: parseInt(requestsPerSecond),
    windowSize: parseInt(windowSize),
    burstLimit: parseInt(burstLimit),
  });

  const results = [];
  const startTime = Date.now();
  const endTime = startTime + parseInt(testDuration);

  let requestCount = 0;
  let allowedCount = 0;
  let blockedCount = 0;

  return new Promise(resolve => {
    const testInterval = setInterval(() => {
      const now = Date.now();

      if (now >= endTime) {
        clearInterval(testInterval);

        resolve(
          reply.send({
            success: true,
            message: 'Rate limiting test completed',
            results: {
              timeline: results,
              summary: {
                totalRequests: requestCount,
                allowedRequests: allowedCount,
                blockedRequests: blockedCount,
                allowedPercentage: (allowedCount / requestCount) * 100,
                testDuration: now - startTime,
              },
            },
          }),
        );
        return;
      }

      requestCount++;
      const allowed = rateLimiter.isAllowed();

      if (allowed) {
        allowedCount++;
      } else {
        blockedCount++;
      }

      results.push({
        timestamp: now - startTime,
        requestId: requestCount,
        allowed,
        timeUntilNext: rateLimiter.getTimeUntilNext(),
      });
    }, 100); // Test every 100ms
  });
};

/**
 * Adaptive throttling based on system load
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Adaptive throttling results
 */
const adaptiveThrottle = async (request, reply) => {
  const { baseBytesPerSecond = 1024, adaptationFactor = 0.5, loadThreshold = 0.8 } = request.query;

  const input = request.body || 'Adaptive throttling test data\n'.repeat(100);

  let currentBytesPerSecond = parseInt(baseBytesPerSecond);
  const adaptations = [];

  const throttle = new ThrottleStream({
    bytesPerSecond: currentBytesPerSecond,
    smoothing: true,
  });

  return new Promise(resolve => {
    let output = '';
    const startTime = Date.now();

    // Simulate load monitoring
    const adaptInterval = setInterval(() => {
      const stats = throttle.getStats();
      const simulatedLoad = Math.random(); // Simulate system load

      if (simulatedLoad > parseFloat(loadThreshold)) {
        // High load - reduce throughput
        const newRate = Math.max(100, currentBytesPerSecond * (1 - parseFloat(adaptationFactor)));
        adaptations.push({
          timestamp: Date.now() - startTime,
          oldRate: currentBytesPerSecond,
          newRate: Math.round(newRate),
          reason: 'High load detected',
          load: simulatedLoad,
        });
        currentBytesPerSecond = newRate;
        throttle.bytesPerSecond = newRate;
      } else if (simulatedLoad < 0.3) {
        // Low load - increase throughput
        const newRate = Math.min(
          parseInt(baseBytesPerSecond) * 2,
          currentBytesPerSecond * (1 + parseFloat(adaptationFactor)),
        );
        adaptations.push({
          timestamp: Date.now() - startTime,
          oldRate: currentBytesPerSecond,
          newRate: Math.round(newRate),
          reason: 'Low load detected',
          load: simulatedLoad,
        });
        currentBytesPerSecond = newRate;
        throttle.bytesPerSecond = newRate;
      }
    }, 500);

    throttle.on('data', chunk => {
      output += chunk.toString();
    });

    throttle.on('end', () => {
      clearInterval(adaptInterval);
      const stats = throttle.getStats();

      resolve(
        reply.send({
          success: true,
          message: 'Adaptive throttling completed',
          results: {
            output,
            adaptations,
            finalStats: stats,
          },
        }),
      );
    });

    throttle.write(input);
    throttle.end();
  });
};

module.exports = {
  basicThrottle,
  burstThrottle,
  rateLimiting,
  adaptiveThrottle,
};
