const { Transform } = require('node:stream');

/**
 * System limits for JSONL operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum line length in bytes */
  MAX_LINE_LENGTH: 1024 * 1024, // 1MB per line
  /** Maximum number of objects to process */
  MAX_OBJECTS: 10000,
  /** Maximum buffer size */
  MAX_BUFFER_SIZE: 10 * 1024 * 1024, // 10MB
  /** Maximum field depth for validation */
  MAX_FIELD_DEPTH: 10,
};

/**
 * Parse JSONL data into individual JSON objects
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Parse results
 */
const parseJsonl = async (request, reply) => {
  const { validateJson = 'true', skipEmpty = 'true' } = request.query;

  let input = request.body;
  if (!input) {
    input = `{"id": 1, "name": "Alice", "age": 30, "city": "New York"}
{"id": 2, "name": "Bob", "age": 25, "city": "Los Angeles"}
{"id": 3, "name": "Charlie", "age": 35, "city": "Chicago"}
{"id": 4, "name": "Diana", "age": 28, "city": "Houston"}`;
  }

  const lines = input.split('\n');
  const results = {
    objects: [],
    errors: [],
  };

  const stats = {
    totalLines: lines.length,
    validObjects: 0,
    invalidObjects: 0,
    emptyLines: 0,
    bytes: input.length,
  };

  lines.forEach((line, index) => {
    if (line.trim() === '') {
      stats.emptyLines++;
      if (skipEmpty === 'true') return;
    }

    if (line.trim() === '') return;

    try {
      const obj = JSON.parse(line);

      if (validateJson === 'true') {
        // Basic validation
        if (typeof obj !== 'object' || obj === null) {
          throw new Error('Not a valid object');
        }
      }

      results.objects.push({
        lineNumber: index + 1,
        data: obj,
        originalLine: line,
        size: line.length,
      });
      stats.validObjects++;
    } catch (error) {
      results.errors.push({
        lineNumber: index + 1,
        error: error.message,
        originalLine: line,
        size: line.length,
      });
      stats.invalidObjects++;
    }
  });

  reply.send({
    success: true,
    message: 'JSONL parsing completed',
    results: {
      ...results,
      stats,
      summary: {
        totalObjects: results.objects.length,
        totalErrors: results.errors.length,
        successRate: ((stats.validObjects / (stats.validObjects + stats.invalidObjects)) * 100).toFixed(2) + '%',
      },
    },
  });
};

/**
 * Convert JSON objects to JSONL format
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Conversion results
 */
const toJsonl = async (request, reply) => {
  const { pretty = 'false', sortKeys = 'false' } = request.query;

  let input = request.body;
  if (!input) {
    input = `[
  {"id": 1, "name": "Alice", "age": 30},
  {"id": 2, "name": "Bob", "age": 25},
  {"id": 3, "name": "Charlie", "age": 35}
]`;
  }

  try {
    let data;

    // Try to parse as JSON array first
    try {
      data = JSON.parse(input);
      if (!Array.isArray(data)) {
        // Single object
        data = [data];
      }
    } catch {
      // Try to parse as multiple JSON objects separated by commas/newlines
      const lines = input.split(/[,\n]/).filter(line => line.trim());
      data = lines.map(line => JSON.parse(line.trim()));
    }

    const jsonlLines = [];
    const stats = {
      inputObjects: data.length,
      outputLines: 0,
      totalBytes: 0,
    };

    data.forEach((obj, index) => {
      try {
        let jsonString;

        if (sortKeys === 'true') {
          // Sort object keys
          const sortedObj = Object.keys(obj)
            .sort()
            .reduce((result, key) => {
              result[key] = obj[key];
              return result;
            }, {});
          jsonString = JSON.stringify(sortedObj, null, pretty === 'true' ? 2 : 0);
        } else {
          jsonString = JSON.stringify(obj, null, pretty === 'true' ? 2 : 0);
        }

        jsonlLines.push({
          lineNumber: index + 1,
          content: jsonString,
          size: jsonString.length,
        });
        stats.outputLines++;
        stats.totalBytes += jsonString.length;
      } catch (error) {
        // Skip invalid objects
      }
    });

    const jsonlOutput = jsonlLines.map(line => line.content).join('\n');

    reply.send({
      success: true,
      message: 'JSON to JSONL conversion completed',
      results: {
        jsonl: jsonlOutput,
        lines: jsonlLines,
        stats,
        summary: {
          conversionRate: ((stats.outputLines / stats.inputObjects) * 100).toFixed(2) + '%',
          config: { pretty, sortKeys },
        },
      },
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      message: 'JSON to JSONL conversion failed',
      error: error.message,
    });
  }
};

/**
 * Filter JSONL data based on field conditions
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Filter results
 */
const filterJsonl = async (request, reply) => {
  const { field = 'id', operator = 'exists', value = '', outputFormat = 'jsonl' } = request.query;

  let input = request.body;
  if (!input) {
    input = `{"id": 1, "name": "Alice", "age": 30, "active": true}
{"id": 2, "name": "Bob", "age": 25, "active": false}
{"id": 3, "name": "Charlie", "age": 35, "active": true}
{"name": "Diana", "age": 28, "active": true}`;
  }

  const lines = input.split('\n').filter(line => line.trim());
  const results = {
    matched: [],
    unmatched: [],
  };

  const stats = {
    totalLines: lines.length,
    matchedObjects: 0,
    unmatchedObjects: 0,
    invalidObjects: 0,
  };

  lines.forEach((line, index) => {
    try {
      const obj = JSON.parse(line);
      let matches = false;

      switch (operator) {
        case 'exists':
          matches = obj.hasOwnProperty(field);
          break;
        case 'equals':
          matches = obj[field] == value;
          break;
        case 'not_equals':
          matches = obj[field] != value;
          break;
        case 'greater_than':
          matches = Number(obj[field]) > Number(value);
          break;
        case 'less_than':
          matches = Number(obj[field]) < Number(value);
          break;
        case 'contains':
          matches = String(obj[field]).toLowerCase().includes(String(value).toLowerCase());
          break;
        case 'starts_with':
          matches = String(obj[field]).startsWith(String(value));
          break;
        case 'is_true':
          matches = obj[field] === true;
          break;
        case 'is_false':
          matches = obj[field] === false;
          break;
        default:
          matches = true;
      }

      const resultObj = {
        lineNumber: index + 1,
        data: obj,
        originalLine: line,
        matches,
      };

      if (matches) {
        results.matched.push(resultObj);
        stats.matchedObjects++;
      } else {
        results.unmatched.push(resultObj);
        stats.unmatchedObjects++;
      }
    } catch (error) {
      stats.invalidObjects++;
    }
  });

  // Format output
  let output = '';
  if (outputFormat === 'jsonl') {
    output = results.matched.map(item => JSON.stringify(item.data)).join('\n');
  } else if (outputFormat === 'json') {
    output = JSON.stringify(
      results.matched.map(item => item.data),
      null,
      2,
    );
  } else {
    output = results.matched.map(item => item.originalLine).join('\n');
  }

  reply.send({
    success: true,
    message: 'JSONL filtering completed',
    results: {
      ...results,
      output,
      stats,
      summary: {
        filter: { field, operator, value },
        matchRate: ((stats.matchedObjects / (stats.matchedObjects + stats.unmatchedObjects)) * 100).toFixed(2) + '%',
        outputFormat,
      },
    },
  });
};

/**
 * Transform JSONL data by modifying fields
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Transform results
 */
const transformJsonl = async (request, reply) => {
  const {
    operation = 'add_field',
    field = 'timestamp',
    value = new Date().toISOString(),
    targetField = 'name',
  } = request.query;

  let input = request.body;
  if (!input) {
    input = `{"id": 1, "name": "alice", "age": 30}
{"id": 2, "name": "bob", "age": 25}
{"id": 3, "name": "charlie", "age": 35}`;
  }

  const lines = input.split('\n').filter(line => line.trim());
  const results = {
    transformed: [],
    errors: [],
  };

  const stats = {
    totalLines: lines.length,
    transformedObjects: 0,
    errorObjects: 0,
  };

  lines.forEach((line, index) => {
    try {
      const obj = JSON.parse(line);
      const transformedObj = { ...obj };

      switch (operation) {
        case 'add_field':
          transformedObj[field] = value;
          break;
        case 'remove_field':
          delete transformedObj[field];
          break;
        case 'rename_field':
          if (obj.hasOwnProperty(field)) {
            transformedObj[targetField] = obj[field];
            delete transformedObj[field];
          }
          break;
        case 'uppercase_field':
          if (obj[field]) {
            transformedObj[field] = String(obj[field]).toUpperCase();
          }
          break;
        case 'lowercase_field':
          if (obj[field]) {
            transformedObj[field] = String(obj[field]).toLowerCase();
          }
          break;
        case 'add_id':
          transformedObj.generated_id = `obj_${index + 1}`;
          break;
        case 'add_timestamp':
          transformedObj.processed_at = new Date().toISOString();
          break;
        default:
          // No transformation
          break;
      }

      results.transformed.push({
        lineNumber: index + 1,
        original: obj,
        transformed: transformedObj,
        line: JSON.stringify(transformedObj),
      });
      stats.transformedObjects++;
    } catch (error) {
      results.errors.push({
        lineNumber: index + 1,
        error: error.message,
        originalLine: line,
      });
      stats.errorObjects++;
    }
  });

  const jsonlOutput = results.transformed.map(item => item.line).join('\n');

  reply.send({
    success: true,
    message: 'JSONL transformation completed',
    results: {
      jsonl: jsonlOutput,
      transformed: results.transformed,
      errors: results.errors,
      stats,
      summary: {
        operation,
        config: { field, value, targetField },
        successRate: ((stats.transformedObjects / stats.totalLines) * 100).toFixed(2) + '%',
      },
    },
  });
};

/**
 * Aggregate JSONL data with grouping and calculations
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Aggregation results
 */
const aggregateJsonl = async (request, reply) => {
  const { groupBy = 'type', operation = 'count', field = 'value', outputFormat = 'jsonl' } = request.query;

  let input = request.body;
  if (!input) {
    input = `{"type": "sale", "amount": 100, "region": "north"}
{"type": "sale", "amount": 150, "region": "south"}
{"type": "refund", "amount": 50, "region": "north"}
{"type": "sale", "amount": 200, "region": "east"}
{"type": "refund", "amount": 75, "region": "south"}`;
  }

  const lines = input.split('\n').filter(line => line.trim());
  const groups = {};
  const stats = {
    totalLines: lines.length,
    validObjects: 0,
    invalidObjects: 0,
    groups: 0,
  };

  // Group objects
  lines.forEach(line => {
    try {
      const obj = JSON.parse(line);
      const groupKey = obj[groupBy] || 'undefined';

      if (!groups[groupKey]) {
        groups[groupKey] = [];
        stats.groups++;
      }

      groups[groupKey].push(obj);
      stats.validObjects++;
    } catch (error) {
      stats.invalidObjects++;
    }
  });

  // Perform aggregations
  const aggregations = {};

  Object.keys(groups).forEach(groupKey => {
    const groupItems = groups[groupKey];
    let result = {
      [groupBy]: groupKey,
      count: groupItems.length,
    };

    switch (operation) {
      case 'count':
        // Already have count
        break;
      case 'sum':
        result.sum = groupItems.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
        break;
      case 'average':
        const total = groupItems.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
        result.average = groupItems.length > 0 ? (total / groupItems.length).toFixed(2) : 0;
        break;
      case 'min':
        const values = groupItems.map(item => Number(item[field])).filter(v => !isNaN(v));
        result.min = values.length > 0 ? Math.min(...values) : null;
        break;
      case 'max':
        const maxValues = groupItems.map(item => Number(item[field])).filter(v => !isNaN(v));
        result.max = maxValues.length > 0 ? Math.max(...maxValues) : null;
        break;
      case 'unique':
        const uniqueValues = [...new Set(groupItems.map(item => item[field]))];
        result.unique_values = uniqueValues;
        result.unique_count = uniqueValues.length;
        break;
      default:
        // Just count
        break;
    }

    aggregations[groupKey] = result;
  });

  // Format output
  let output = '';
  const resultArray = Object.values(aggregations);

  if (outputFormat === 'jsonl') {
    output = resultArray.map(item => JSON.stringify(item)).join('\n');
  } else if (outputFormat === 'json') {
    output = JSON.stringify(resultArray, null, 2);
  } else {
    output = JSON.stringify(aggregations, null, 2);
  }

  reply.send({
    success: true,
    message: 'JSONL aggregation completed',
    results: {
      aggregations,
      output,
      groups,
      stats,
      summary: {
        groupBy,
        operation,
        field,
        totalGroups: stats.groups,
        outputFormat,
      },
    },
  });
};

module.exports = {
  parseJsonl,
  toJsonl,
  filterJsonl,
  transformJsonl,
  aggregateJsonl,
};
