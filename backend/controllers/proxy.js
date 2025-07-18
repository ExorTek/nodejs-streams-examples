const { PassThrough, Transform, pipeline } = require('node:stream');
const { promisify } = require('node:util');

/**
 * System limits for proxy operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum number of proxy targets */
  MAX_TARGETS: 5,
  /** Maximum data size */
  MAX_DATA_SIZE: 10 * 1024 * 1024, // 10MB
  /** Maximum cache size */
  MAX_CACHE_SIZE: 100,
  /** Request timeout */
  REQUEST_TIMEOUT: 30000, // 30 seconds
};

// Simple in-memory cache
const proxyCache = new Map();

/**
 * Simple data proxy - forwards data to multiple targets
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Proxy results
 */
const simpleProxy = async (request, reply) => {
  const { targets = 2, delay = 0 } = request.query;

  let input = request.body;
  if (!input) {
    input = `Data to be proxied to multiple targets.
This demonstrates basic stream proxying functionality.
Each target will receive the same data stream.`;
  }

  try {
    const targetCount = Math.min(LIMITS.MAX_TARGETS, Math.max(1, parseInt(targets)));
    const proxyDelay = Math.max(0, Math.min(5000, parseInt(delay)));

    const startTime = Date.now();
    const results = [];

    // Create proxy targets
    const proxyTargets = [];

    for (let i = 0; i < targetCount; i++) {
      const target = {
        id: `target-${i + 1}`,
        stream: new PassThrough(),
        data: '',
        stats: {
          chunks: 0,
          bytes: 0,
          startTime: Date.now(),
        },
      };

      // Collect data from each target
      target.stream.on('data', chunk => {
        target.data += chunk.toString();
        target.stats.chunks++;
        target.stats.bytes += chunk.length;
      });

      target.stream.on('end', () => {
        target.stats.endTime = Date.now();
        target.stats.duration = target.stats.endTime - target.stats.startTime;
      });

      proxyTargets.push(target);
    }

    // Simulate proxy delay
    if (proxyDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, proxyDelay));
    }

    // Send data to all targets
    const inputLines = input.split('\n');

    for (const line of inputLines) {
      for (const target of proxyTargets) {
        target.stream.write(line + '\n');
      }

      // Small delay between lines for demonstration
      if (inputLines.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // End all target streams
    proxyTargets.forEach(target => target.stream.end());

    // Wait for all targets to complete
    await Promise.all(proxyTargets.map(target => new Promise(resolve => target.stream.on('end', resolve))));

    // Collect results
    const proxyResults = proxyTargets.map(target => ({
      targetId: target.id,
      data: target.data,
      stats: target.stats,
    }));

    const totalTime = Date.now() - startTime;

    reply.send({
      success: true,
      message: 'Simple proxy completed',
      results: {
        targets: proxyResults,
        summary: {
          targetCount,
          totalTime,
          proxyDelay,
          inputSize: input.length,
          avgProcessingTime: proxyResults.reduce((sum, r) => sum + r.stats.duration, 0) / proxyResults.length,
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Simple proxy failed',
      error: error.message,
    });
  }
};

/**
 * Transform proxy - modifies data while proxying
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Transform proxy results
 */
const transformProxy = async (request, reply) => {
  const { transform = 'uppercase', targets = 2, preserveOriginal = true } = request.query;

  let input = request.body;
  if (!input) {
    input = `Original data for transform proxy testing.
This data will be modified during proxy forwarding.
Different targets may receive different transformations.`;
  }

  try {
    const targetCount = Math.min(LIMITS.MAX_TARGETS, Math.max(1, parseInt(targets)));
    const keepOriginal = preserveOriginal === 'true';

    const transformations = {
      'uppercase': data => data.toUpperCase(),
      'lowercase': data => data.toLowerCase(),
      'reverse': data => data.split('').reverse().join(''),
      'base64': data => Buffer.from(data).toString('base64'),
      'hash': data => require('crypto').createHash('md5').update(data).digest('hex'),
    };

    const transformFn = transformations[transform] || transformations.uppercase;
    const results = [];

    // Original target (if enabled)
    if (keepOriginal) {
      results.push({
        targetId: 'original',
        transformation: 'none',
        data: input,
        stats: {
          bytes: input.length,
          processingTime: 0,
        },
      });
    }

    // Transformed targets
    for (let i = 0; i < targetCount; i++) {
      const startTime = Date.now();

      let transformedData;
      if (i === 0) {
        // First target gets the specified transformation
        transformedData = transformFn(input);
      } else {
        // Other targets get variations
        const variations = ['uppercase', 'lowercase', 'reverse'];
        const variationTransform = transformations[variations[i % variations.length]];
        transformedData = variationTransform(input);
      }

      const processingTime = Date.now() - startTime;

      results.push({
        targetId: `target-${i + 1}`,
        transformation: i === 0 ? transform : ['uppercase', 'lowercase', 'reverse'][i % 3],
        data: transformedData,
        stats: {
          bytes: transformedData.length,
          processingTime,
        },
      });
    }

    reply.send({
      success: true,
      message: 'Transform proxy completed',
      results: {
        targets: results,
        summary: {
          targetCount: results.length,
          originalSize: input.length,
          transformUsed: transform,
          preservedOriginal: keepOriginal,
          totalTransformations: results.filter(r => r.transformation !== 'none').length,
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Transform proxy failed',
      error: error.message,
    });
  }
};

/**
 * HTTP proxy simulation - forwards requests to mock endpoints
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} HTTP proxy results
 */
const httpProxy = async (request, reply) => {
  const { endpoint = '/api/data', method = 'GET', timeout = 1000, retries = 1 } = request.query;

  let input = request.body;
  if (!input) {
    input = `{"message": "HTTP proxy test data", "timestamp": "${new Date().toISOString()}"}`;
  }

  try {
    const requestTimeout = Math.min(LIMITS.REQUEST_TIMEOUT, Math.max(100, parseInt(timeout)));
    const maxRetries = Math.min(3, Math.max(0, parseInt(retries)));

    // Mock endpoints with different behaviors
    const mockEndpoints = [
      {
        id: 'endpoint-1',
        name: 'Fast API',
        delay: 100,
        successRate: 0.95,
        response: { status: 'success', data: 'Fast response', processingTime: 100 },
      },
      {
        id: 'endpoint-2',
        name: 'Slow API',
        delay: 800,
        successRate: 0.85,
        response: { status: 'success', data: 'Slow but reliable', processingTime: 800 },
      },
      {
        id: 'endpoint-3',
        name: 'Unreliable API',
        delay: 300,
        successRate: 0.6,
        response: { status: 'success', data: 'Sometimes fails', processingTime: 300 },
      },
    ];

    const proxyResults = [];

    for (const mockEndpoint of mockEndpoints) {
      let attempts = 0;
      let success = false;
      let lastError = null;

      while (attempts <= maxRetries && !success) {
        attempts++;

        try {
          const startTime = Date.now();

          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, mockEndpoint.delay));

          // Simulate success/failure based on success rate
          const isSuccess = Math.random() < mockEndpoint.successRate;

          if (!isSuccess && attempts <= maxRetries) {
            throw new Error(`${mockEndpoint.name} temporarily unavailable`);
          }

          const responseTime = Date.now() - startTime;

          proxyResults.push({
            endpointId: mockEndpoint.id,
            endpointName: mockEndpoint.name,
            success: true,
            attempts,
            responseTime,
            response: {
              ...mockEndpoint.response,
              requestData: method === 'POST' ? JSON.parse(input) : null,
              endpoint,
              method,
            },
          });

          success = true;
        } catch (error) {
          lastError = error.message;

          if (attempts > maxRetries) {
            proxyResults.push({
              endpointId: mockEndpoint.id,
              endpointName: mockEndpoint.name,
              success: false,
              attempts,
              error: lastError,
              responseTime: null,
            });
          }
        }
      }
    }

    const successfulRequests = proxyResults.filter(r => r.success).length;
    const avgResponseTime =
      proxyResults.filter(r => r.success).reduce((sum, r) => sum + r.responseTime, 0) / (successfulRequests || 1);

    reply.send({
      success: true,
      message: 'HTTP proxy simulation completed',
      results: {
        proxied: proxyResults,
        summary: {
          endpoint,
          method,
          totalEndpoints: mockEndpoints.length,
          successfulRequests,
          failedRequests: proxyResults.length - successfulRequests,
          successRate: ((successfulRequests / proxyResults.length) * 100).toFixed(1) + '%',
          avgResponseTime: Math.round(avgResponseTime),
          maxRetries,
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'HTTP proxy simulation failed',
      error: error.message,
    });
  }
};

/**
 * Load balancer proxy - distributes load across multiple targets
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Load balancer results
 */
const loadBalancer = async (request, reply) => {
  const { algorithm = 'round-robin', targets = 3, requests = 10 } = request.query;

  let input = request.body;
  if (!input) {
    input = `Load balancer test request data.
This simulates distributing requests across multiple backend servers.
Each request will be routed based on the selected algorithm.`;
  }

  try {
    const targetCount = Math.min(LIMITS.MAX_TARGETS, Math.max(2, parseInt(targets)));
    const requestCount = Math.min(50, Math.max(1, parseInt(requests)));

    // Create mock targets with different capacities
    const backendTargets = [];
    for (let i = 0; i < targetCount; i++) {
      backendTargets.push({
        id: `backend-${i + 1}`,
        name: `Server ${i + 1}`,
        capacity: Math.floor(Math.random() * 5) + 3, // 3-7 requests capacity
        load: 0,
        requests: [],
        responseTime: Math.floor(Math.random() * 300) + 100, // 100-400ms
      });
    }

    const distributionResults = [];
    let currentTargetIndex = 0;

    // Process requests based on algorithm
    for (let i = 0; i < requestCount; i++) {
      let selectedTarget;

      switch (algorithm) {
        case 'round-robin':
          selectedTarget = backendTargets[currentTargetIndex];
          currentTargetIndex = (currentTargetIndex + 1) % targetCount;
          break;

        case 'least-connections':
          selectedTarget = backendTargets.reduce((min, target) => (target.load < min.load ? target : min));
          break;

        case 'weighted':
          // Simple weighted selection based on inverse of current load
          const weights = backendTargets.map(t => Math.max(1, t.capacity - t.load));
          const totalWeight = weights.reduce((sum, w) => sum + w, 0);
          let random = Math.random() * totalWeight;

          for (let j = 0; j < backendTargets.length; j++) {
            random -= weights[j];
            if (random <= 0) {
              selectedTarget = backendTargets[j];
              break;
            }
          }
          break;

        default:
          selectedTarget = backendTargets[0];
      }

      // Simulate request processing
      const requestStartTime = Date.now();

      // Check if target is overloaded
      const isOverloaded = selectedTarget.load >= selectedTarget.capacity;

      if (!isOverloaded) {
        selectedTarget.load++;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, selectedTarget.responseTime / 10));

        const processingTime = Date.now() - requestStartTime;

        const requestResult = {
          requestId: i + 1,
          targetId: selectedTarget.id,
          targetName: selectedTarget.name,
          success: true,
          processingTime,
          algorithm,
        };

        selectedTarget.requests.push(requestResult);
        distributionResults.push(requestResult);

        // Simulate request completion (reduce load)
        setTimeout(() => {
          selectedTarget.load = Math.max(0, selectedTarget.load - 1);
        }, selectedTarget.responseTime);
      } else {
        // Handle overloaded target
        distributionResults.push({
          requestId: i + 1,
          targetId: selectedTarget.id,
          targetName: selectedTarget.name,
          success: false,
          error: 'Target overloaded',
          algorithm,
        });
      }
    }

    // Calculate statistics
    const targetStats = backendTargets.map(target => ({
      ...target,
      requestCount: target.requests.length,
      successRate:
        target.requests.length > 0
          ? ((target.requests.filter(r => r.success).length / target.requests.length) * 100).toFixed(1) + '%'
          : '0%',
      avgResponseTime:
        target.requests.length > 0
          ? Math.round(target.requests.reduce((sum, r) => sum + (r.processingTime || 0), 0) / target.requests.length)
          : 0,
    }));

    const successfulRequests = distributionResults.filter(r => r.success).length;

    reply.send({
      success: true,
      message: 'Load balancer simulation completed',
      results: {
        distribution: distributionResults,
        targets: targetStats,
        summary: {
          algorithm,
          totalRequests: requestCount,
          successfulRequests,
          failedRequests: requestCount - successfulRequests,
          successRate: ((successfulRequests / requestCount) * 100).toFixed(1) + '%',
          targetCount,
          avgLoadPerTarget: (successfulRequests / targetCount).toFixed(1),
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Load balancer simulation failed',
      error: error.message,
    });
  }
};

/**
 * Cache proxy - caches responses for faster subsequent requests
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Cache proxy results
 */
const cacheProxy = async (request, reply) => {
  const { cacheDuration = 5000, maxCacheSize = 10, operation = 'get' } = request.query;

  let input = request.body;
  if (!input) {
    input = `Cache proxy test data for key: test-${Date.now()}`;
  }

  try {
    const cacheExpiry = Math.min(60000, Math.max(1000, parseInt(cacheDuration)));
    const maxSize = Math.min(LIMITS.MAX_CACHE_SIZE, Math.max(1, parseInt(maxCacheSize)));

    const cacheKey = require('crypto').createHash('md5').update(input).digest('hex');

    let result;
    let cacheHit = false;
    let cacheAction;

    switch (operation) {
      case 'get':
        // Check cache first
        if (proxyCache.has(cacheKey)) {
          const cached = proxyCache.get(cacheKey);

          // Check if cache entry is still valid
          if (Date.now() - cached.timestamp < cacheExpiry) {
            result = cached.data;
            cacheHit = true;
            cacheAction = 'cache_hit';
          } else {
            // Cache expired, remove it
            proxyCache.delete(cacheKey);
            cacheAction = 'cache_expired';
          }
        }

        if (!cacheHit) {
          // Simulate backend request
          const processingStartTime = Date.now();
          await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

          result = {
            data: `Processed: ${input}`,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - processingStartTime,
            source: 'backend',
          };

          // Store in cache
          if (proxyCache.size >= maxSize) {
            // Remove oldest entry
            const oldestKey = proxyCache.keys().next().value;
            proxyCache.delete(oldestKey);
          }

          proxyCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });

          cacheAction = 'cache_miss';
        } else {
          result.source = 'cache';
        }
        break;

      case 'clear':
        const clearedCount = proxyCache.size;
        proxyCache.clear();
        result = { message: `Cleared ${clearedCount} cache entries` };
        cacheAction = 'cache_cleared';
        break;

      case 'stats':
        result = {
          cacheSize: proxyCache.size,
          maxSize,
          entries: Array.from(proxyCache.keys()).map(key => ({
            key: key.substring(0, 8) + '...',
            age: Date.now() - proxyCache.get(key).timestamp,
          })),
        };
        cacheAction = 'cache_stats';
        break;

      default:
        cacheAction = 'invalid_operation';
    }

    reply.send({
      success: true,
      message: 'Cache proxy operation completed',
      results: {
        data: result,
        cache: {
          action: cacheAction,
          hit: cacheHit,
          key: cacheKey.substring(0, 8) + '...',
          size: proxyCache.size,
          maxSize,
          expiry: cacheExpiry,
        },
        summary: {
          operation,
          cacheHitRate: cacheHit ? '100%' : '0%',
          performance: cacheHit ? 'Excellent (Cache Hit)' : 'Normal (Backend Request)',
        },
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Cache proxy operation failed',
      error: error.message,
    });
  }
};

module.exports = {
  simpleProxy,
  transformProxy,
  httpProxy,
  loadBalancer,
  cacheProxy,
};
