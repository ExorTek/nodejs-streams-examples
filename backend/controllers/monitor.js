const { Transform, PassThrough } = require('node:stream');
const { EventEmitter } = require('node:events');

/**
 * System limits for monitor operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum monitoring duration in ms */
  MAX_MONITOR_TIME: 300000, // 5 minutes
  /** Maximum number of monitored streams */
  MAX_STREAMS: 10,
  /** Metrics collection interval in ms */
  METRICS_INTERVAL: 100,
  /** Maximum stored metrics points */
  MAX_METRICS_POINTS: 1000,
};

/**
 * Stream monitor that tracks performance metrics
 * @extends {Transform}
 */
class StreamMonitor extends Transform {
  /**
   * Creates a StreamMonitor instance
   * @param {Object} [options={}] - Monitor configuration
   * @param {string} [options.name='unnamed'] - Monitor name
   * @param {boolean} [options.trackThroughput=true] - Track throughput metrics
   * @param {boolean} [options.trackLatency=false] - Track processing latency
   * @param {number} [options.sampleRate=100] - Sampling rate in ms
   */
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'unnamed';
    this.trackThroughput = options.trackThroughput !== false;
    this.trackLatency = options.trackLatency || false;
    this.sampleRate = Math.max(50, Math.min(5000, options.sampleRate || 100));

    this.metrics = {
      startTime: Date.now(),
      chunks: 0,
      bytes: 0,
      throughputHistory: [],
      latencyHistory: [],
      errors: 0,
      lastChunkTime: Date.now(),
      peakThroughput: 0,
      avgLatency: 0,
    };

    this.lastSample = Date.now();
    this.lastSampleBytes = 0;
    this._timer = null;

    this._startMonitoring();
  }

  /**
   * Internal method to transform data chunks
   * @param {Buffer|string} chunk - Data chunk
   * @param {string} encoding - Text encoding
   * @param {Function} callback - Completion callback
   * @private
   */
  _transform(chunk, encoding, callback) {
    const now = Date.now();
    const chunkSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);

    // Track latency if enabled
    if (this.trackLatency) {
      const latency = now - this.metrics.lastChunkTime;
      this.metrics.latencyHistory.push(latency);

      // Keep only recent latency data
      if (this.metrics.latencyHistory.length > 100) {
        this.metrics.latencyHistory.shift();
      }

      this.metrics.avgLatency =
        this.metrics.latencyHistory.reduce((a, b) => a + b, 0) / this.metrics.latencyHistory.length;
    }

    // Update metrics
    this.metrics.chunks++;
    this.metrics.bytes += chunkSize;
    this.metrics.lastChunkTime = now;

    // Pass through the data unchanged
    callback(null, chunk);
  }

  /**
   * Start monitoring and collecting metrics
   * @private
   */
  _startMonitoring() {
    this._timer = setInterval(() => {
      if (this.trackThroughput) {
        const now = Date.now();
        const timeDiff = now - this.lastSample;
        const bytesDiff = this.metrics.bytes - this.lastSampleBytes;

        if (timeDiff > 0) {
          const throughput = (bytesDiff / timeDiff) * 1000; // bytes per second
          this.metrics.throughputHistory.push({
            timestamp: now,
            value: throughput,
          });

          // Update peak throughput
          if (throughput > this.metrics.peakThroughput) {
            this.metrics.peakThroughput = throughput;
          }

          // Keep only recent throughput data
          if (this.metrics.throughputHistory.length > LIMITS.MAX_METRICS_POINTS) {
            this.metrics.throughputHistory.shift();
          }
        }

        this.lastSample = now;
        this.lastSampleBytes = this.metrics.bytes;
      }
    }, this.sampleRate);
  }

  /**
   * Get current metrics snapshot
   * @returns {Object} Current metrics
   */
  getMetrics() {
    const now = Date.now();
    const duration = now - this.metrics.startTime;
    const avgThroughput = duration > 0 ? (this.metrics.bytes / duration) * 1000 : 0;

    return {
      name: this.name,
      duration,
      chunks: this.metrics.chunks,
      bytes: this.metrics.bytes,
      avgThroughput: Math.round(avgThroughput),
      peakThroughput: Math.round(this.metrics.peakThroughput),
      avgLatency: Math.round(this.metrics.avgLatency * 100) / 100,
      errors: this.metrics.errors,
      throughputHistory: this.metrics.throughputHistory.slice(-50), // Last 50 points
      latencyHistory: this.metrics.latencyHistory.slice(-50),
      isActive: !this.destroyed,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    const now = Date.now();
    this.metrics = {
      startTime: now,
      chunks: 0,
      bytes: 0,
      throughputHistory: [],
      latencyHistory: [],
      errors: 0,
      lastChunkTime: now,
      peakThroughput: 0,
      avgLatency: 0,
    };
    this.lastSample = now;
    this.lastSampleBytes = 0;
  }

  /**
   * Cleanup method
   * @param {Error|null} err - Error that caused destruction
   * @param {Function} callback - Cleanup callback
   * @private
   */
  _destroy(err, callback) {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    callback(err);
  }
}

/**
 * Multi-stream monitor for tracking multiple streams
 */
class MultiStreamMonitor extends EventEmitter {
  constructor() {
    super();
    this.monitors = new Map();
    this.globalMetrics = {
      totalStreams: 0,
      activeStreams: 0,
      totalBytes: 0,
      totalChunks: 0,
    };
  }

  /**
   * Add a stream to monitor
   * @param {string} streamId - Unique stream identifier
   * @param {Object} options - Monitor options
   * @returns {StreamMonitor} Monitor instance
   */
  addStream(streamId, options = {}) {
    if (this.monitors.size >= LIMITS.MAX_STREAMS) {
      throw new Error('Maximum number of monitored streams reached');
    }

    const monitor = new StreamMonitor({ ...options, name: streamId });
    this.monitors.set(streamId, monitor);
    this.globalMetrics.totalStreams++;
    this.globalMetrics.activeStreams++;

    monitor.on('end', () => {
      this.globalMetrics.activeStreams--;
      this.emit('streamEnded', streamId);
    });

    monitor.on('error', err => {
      this.emit('streamError', streamId, err);
    });

    return monitor;
  }

  /**
   * Remove a stream monitor
   * @param {string} streamId - Stream identifier
   */
  removeStream(streamId) {
    const monitor = this.monitors.get(streamId);
    if (monitor) {
      monitor.destroy();
      this.monitors.delete(streamId);
      this.globalMetrics.activeStreams--;
    }
  }

  /**
   * Get metrics for all monitored streams
   * @returns {Object} Combined metrics
   */
  getAllMetrics() {
    const streamMetrics = {};
    let totalBytes = 0;
    let totalChunks = 0;

    for (const [streamId, monitor] of this.monitors) {
      const metrics = monitor.getMetrics();
      streamMetrics[streamId] = metrics;
      totalBytes += metrics.bytes;
      totalChunks += metrics.chunks;
    }

    return {
      global: {
        ...this.globalMetrics,
        totalBytes,
        totalChunks,
        timestamp: Date.now(),
      },
      streams: streamMetrics,
    };
  }

  /**
   * Clear all monitors
   */
  clearAll() {
    for (const monitor of this.monitors.values()) {
      monitor.destroy();
    }
    this.monitors.clear();
    this.globalMetrics = {
      totalStreams: 0,
      activeStreams: 0,
      totalBytes: 0,
      totalChunks: 0,
    };
  }
}

// Global monitor instance
const globalMonitor = new MultiStreamMonitor();

/**
 * Create a simple stream monitor
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Monitor results
 */
const createMonitor = async (request, reply) => {
  const { name = 'test-stream', sampleRate = 100, trackLatency = false } = request.query;
  const input = request.body || 'Hello\nWorld\nStream\nMonitoring\nTest\n';

  const monitor = new StreamMonitor({
    name,
    sampleRate: parseInt(sampleRate),
    trackLatency: trackLatency === 'true',
  });

  return new Promise(resolve => {
    let output = '';

    monitor.on('data', chunk => {
      output += chunk.toString();
    });

    monitor.on('end', () => {
      const metrics = monitor.getMetrics();
      resolve(
        reply.send({
          success: true,
          message: 'Stream monitoring completed',
          results: {
            output,
            metrics,
          },
        }),
      );
    });

    monitor.write(input);
    monitor.end();
  });
};

/**
 * Monitor real-time stream data
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Real-time monitoring results
 */
const realtimeMonitor = async (request, reply) => {
  const { streamId = `stream-${Date.now()}`, duration = 5000 } = request.query;
  const input = request.body || '';

  const monitor = globalMonitor.addStream(streamId, {
    trackThroughput: true,
    trackLatency: true,
    sampleRate: 100,
  });

  const results = [];
  const startTime = Date.now();

  return new Promise(resolve => {
    const collectMetrics = setInterval(() => {
      const metrics = monitor.getMetrics();
      results.push({
        timestamp: Date.now() - startTime,
        ...metrics,
      });
    }, 200);

    monitor.on('data', () => {
      // Data flows through
    });

    monitor.on('end', () => {
      clearInterval(collectMetrics);
      globalMonitor.removeStream(streamId);

      resolve(
        reply.send({
          success: true,
          message: 'Real-time monitoring completed',
          results: {
            streamId,
            monitoring: results,
            final: monitor.getMetrics(),
          },
        }),
      );
    });

    // Simulate streaming data
    const lines = input.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      lines.push('Sample', 'Stream', 'Data', 'Monitoring');
    }

    let index = 0;
    const streamInterval = setInterval(
      () => {
        if (index < lines.length) {
          monitor.write(lines[index] + '\n');
          index++;
        } else {
          clearInterval(streamInterval);
          monitor.end();
        }
      },
      Math.min(1000, parseInt(duration) / lines.length),
    );

    // Timeout protection
    setTimeout(
      () => {
        clearInterval(collectMetrics);
        clearInterval(streamInterval);
        if (!monitor.destroyed) {
          monitor.end();
        }
      },
      parseInt(duration) + 1000,
    );
  });
};

/**
 * Compare multiple streams performance
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Performance comparison results
 */
const compareStreams = async (request, reply) => {
  const { streams = '2', dataSize = 'small' } = request.query;
  const streamCount = Math.min(5, Math.max(1, parseInt(streams)));

  const testData = {
    small: 'Test data\n'.repeat(10),
    medium: 'Test data line with more content\n'.repeat(100),
    large: 'Large test data line with much more content for performance testing\n'.repeat(1000),
  };

  const input = testData[dataSize] || testData.small;
  const monitors = [];
  const results = [];

  for (let i = 0; i < streamCount; i++) {
    const monitor = new StreamMonitor({
      name: `stream-${i + 1}`,
      trackThroughput: true,
      trackLatency: true,
    });

    monitors.push(monitor);

    const promise = new Promise(resolve => {
      let output = '';

      monitor.on('data', chunk => {
        output += chunk.toString();
      });

      monitor.on('end', () => {
        const metrics = monitor.getMetrics();
        resolve({
          streamName: `stream-${i + 1}`,
          metrics,
          outputSize: output.length,
        });
      });

      // Add some random delay to simulate different processing speeds
      setTimeout(() => {
        monitor.write(input);
        monitor.end();
      }, Math.random() * 100);
    });

    results.push(promise);
  }

  const comparison = await Promise.all(results);

  return reply.send({
    success: true,
    message: 'Stream comparison completed',
    results: {
      comparison,
      summary: {
        totalStreams: streamCount,
        dataSize,
        inputSize: input.length,
        fastest: comparison.reduce((prev, curr) => (prev.metrics.duration < curr.metrics.duration ? prev : curr)),
        slowest: comparison.reduce((prev, curr) => (prev.metrics.duration > curr.metrics.duration ? prev : curr)),
      },
    },
  });
};

/**
 * Get global monitoring statistics
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Global statistics
 */
const getGlobalStats = async (request, reply) => {
  const metrics = globalMonitor.getAllMetrics();

  return reply.send({
    success: true,
    message: 'Global monitoring statistics',
    results: metrics,
  });
};

module.exports = {
  createMonitor,
  realtimeMonitor,
  compareStreams,
  getGlobalStats,
};
