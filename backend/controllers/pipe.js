const { Readable, Writable, Transform, pipeline } = require('node:stream');
const { promisify } = require('node:util');
const { CustomError } = require('../helpers');

const safeJSONParser = data => {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new CustomError('Invalid json format! Please provide valid JSON data.', 400);
  }
};

const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  MAX_ITEMS: 1000,
  MAX_PROCESSING_TIME: 60000,
  MAX_PIPE_CHAIN: 10,
};

const createReadableFromData = data => {
  const lines = data.split('\n');
  let index = 0;

  return new Readable({
    read() {
      if (index < lines.length) {
        this.push(lines[index] + '\n');
        index++;
      } else {
        this.push(null);
      }
    },
  });
};

const createTransformStream = (operation, options = {}) => {
  const transforms = {
    uppercase: chunk => chunk.toString().toUpperCase(),
    lowercase: chunk => chunk.toString().toLowerCase(),
    reverse: chunk => chunk.toString().split('').reverse().join(''),
    addTimestamp: chunk => `[${new Date().toISOString()}] ${chunk.toString()}`,
    addLineNumbers: (() => {
      let lineNumber = 1;
      return chunk => {
        const lines = chunk.toString().split('\n');
        return lines.map(line => (line.trim() ? `${lineNumber++}: ${line}` : line)).join('\n');
      };
    })(),
    wordCount: chunk => {
      const text = chunk.toString();
      const words = text.split(/\s+/).filter(word => word.length > 0);
      return `${text.trim()} [${words.length} words]\n`;
    },
    filter: chunk => {
      const lines = chunk.toString().split('\n');
      const keyword = options.keyword || '';
      return lines.filter(line => line.toLowerCase().includes(keyword.toLowerCase())).join('\n') + '\n';
    },
    jsonParse: chunk => {
      const lines = chunk.toString().split('\n');
      return lines
        .map(line => {
          if (line.trim()) {
            const parsed = safeJSONParser(line);
            return JSON.stringify(parsed, null, 2);
          }
          return line;
        })
        .join('\n');
    },
  };

  const transformFn = transforms[operation] || transforms.uppercase;

  return new Transform({
    transform(chunk, encoding, callback) {
      const result = transformFn(chunk);
      callback(null, result);
    },
  });
};

const createCsvToJsonTransform = () => {
  let buffer = '';
  let headers = null;

  return new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');

      buffer = lines.pop() || '';

      const results = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (headers === null) {
          headers = line.split(',').map(h => h.trim());
          continue;
        }

        const values = line.split(',').map(v => v.trim());
        const obj = {};

        headers.forEach((header, index) => {
          let value = values[index] || '';

          if (value && !isNaN(value) && !isNaN(parseFloat(value))) {
            value = parseFloat(value);
          }

          if (value === 'true' || value === 'false') {
            value = value === 'true';
          }

          if (value === '') {
            value = null;
          }

          obj[header] = value;
        });

        results.push(JSON.stringify(obj));
      }

      if (results.length > 0) {
        callback(null, results.join('\n') + '\n');
      } else {
        callback();
      }
    },

    flush(callback) {
      if (buffer.trim() && headers) {
        const values = buffer.split(',').map(v => v.trim());
        const obj = {};

        headers.forEach((header, index) => {
          let value = values[index] || '';

          if (value && !isNaN(value) && !isNaN(parseFloat(value))) {
            value = parseFloat(value);
          }

          if (value === 'true' || value === 'false') {
            value = value === 'true';
          }

          if (value === '') {
            value = null;
          }

          obj[header] = value;
        });

        callback(null, JSON.stringify(obj) + '\n');
      } else {
        callback();
      }
    },
  });
};

const createCollectorStream = () => {
  const results = [];
  let stats = {
    chunks: 0,
    bytes: 0,
    lines: 0,
    startTime: Date.now(),
  };

  const writable = new Writable({
    write(chunk, encoding, callback) {
      const data = chunk.toString();
      results.push(data);
      stats.chunks++;
      stats.bytes += data.length;
      stats.lines += (data.match(/\n/g) || []).length;
      callback();
    },
  });

  const getResults = () => ({
    data: results.join(''),
    stats: {
      ...stats,
      duration: Date.now() - stats.startTime,
    },
  });

  return { writable, getResults };
};

const validateParams = params => {
  return {
    operations: (params.operations || 'uppercase').split(',').slice(0, LIMITS.MAX_PIPE_CHAIN),
    keyword: params.keyword || '',
    parallel: params.parallel === 'true',
    bufferSize: Math.min(parseInt(params.bufferSize) || 1024, 64 * 1024),
  };
};

const simplePipe = async (request, reply) => {
  const { operations } = validateParams(request.query);
  const operation = operations[0] || 'uppercase';

  const readable = createReadableFromData(request.body || '');
  const transform = createTransformStream(operation, request.query);
  const { writable, getResults } = createCollectorStream();

  readable.pipe(transform).pipe(writable);

  return new Promise(resolve => {
    writable.on('finish', () => {
      const results = getResults();
      resolve(
        reply.send({
          success: true,
          message: 'Simple pipe completed successfully',
          operation,
          results,
        }),
      );
    });
  });
};

const chainedPipe = async (request, reply) => {
  const { operations } = validateParams(request.query);

  const readable = createReadableFromData(request.body || '');
  const { writable, getResults } = createCollectorStream();

  const transforms = operations.map(op => createTransformStream(op, request.query));

  let currentStream = readable;

  for (const transform of transforms) {
    currentStream = currentStream.pipe(transform);
  }

  currentStream.pipe(writable);

  return new Promise(resolve => {
    writable.on('finish', () => {
      const results = getResults();
      resolve(
        reply.send({
          success: true,
          message: 'Chained pipe completed successfully',
          operations,
          results,
        }),
      );
    });
  });
};

const pipelineOperation = async (request, reply) => {
  const { operations } = validateParams(request.query);

  const readable = createReadableFromData(request.body || '');
  const { writable, getResults } = createCollectorStream();

  const transforms = operations.map(op => createTransformStream(op, request.query));

  const streams = [readable, ...transforms, writable];

  const pipelineAsync = promisify(pipeline);

  await pipelineAsync(...streams);

  const results = getResults();

  return reply.send({
    success: true,
    message: 'Pipeline completed successfully',
    operations,
    results,
  });
};

const filterAndProcess = async (request, reply) => {
  const { operations, keyword } = validateParams(request.query);

  const readable = createReadableFromData(request.body || '');
  const { writable, getResults } = createCollectorStream();

  const filterTransform = createTransformStream('filter', { keyword });

  const transforms = operations.filter(op => op !== 'filter').map(op => createTransformStream(op, request.query));

  let currentStream = readable.pipe(filterTransform);

  for (const transform of transforms) {
    currentStream = currentStream.pipe(transform);
  }

  currentStream.pipe(writable);

  return new Promise(resolve => {
    writable.on('finish', () => {
      const results = getResults();
      resolve(
        reply.send({
          success: true,
          message: 'Filter and process completed successfully',
          keyword,
          operations,
          results,
        }),
      );
    });
  });
};

const csvToJsonPipe = async (request, reply) => {
  const readable = createReadableFromData(request.body || '');
  const { writable, getResults } = createCollectorStream();

  const csvTransform = createCsvToJsonTransform();

  readable.pipe(csvTransform).pipe(writable);

  return new Promise((resolve, reject) => {
    writable.on('finish', () => {
      const results = getResults();

      if (!results.data.trim()) {
        return resolve(
          reply.send({
            success: false,
            message: 'No valid CSV data found',
            results: {
              data: '',
              jsonData: [],
              count: 0,
            },
          }),
        );
      }

      const lines = results.data.split('\n').filter(line => line.trim());
      const jsonObjects = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        const jsonObject = safeJSONParser(trimmedLine);
        jsonObjects.push(jsonObject);
      }

      resolve(
        reply.send({
          success: true,
          message: 'CSV to JSON conversion completed',
          results: {
            ...results,
            jsonData: jsonObjects,
            count: jsonObjects.length,
          },
        }),
      );
    });

    writable.on('error', error => {
      reject(
        reply.status(500).send({
          success: false,
          message: 'CSV to JSON conversion failed',
          error: error.message,
        }),
      );
    });
  });
};

module.exports = {
  simplePipe,
  chainedPipe,
  pipelineOperation,
  filterAndProcess,
  csvToJsonPipe,
};
