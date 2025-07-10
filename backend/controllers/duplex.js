const { Duplex } = require('node:stream');

/**
 * System limits for duplex stream operations
 * @readonly
 * @enum {number}
 */
const LIMITS = {
  /** Maximum message size in bytes */
  MAX_MESSAGE_SIZE: 10240, // 10KB
  /** Maximum number of messages to echo */
  MAX_MESSAGES: 50,
  /** Maximum delay between responses in ms */
  MAX_DELAY: 5000,
  /** Minimum delay between responses in ms */
  MIN_DELAY: 50,
};

/**
 * A duplex stream that echoes incoming data with optional transformations
 * @extends {Duplex}
 */
class EchoStream extends Duplex {
  /**
   * Creates an EchoStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {number} [options.delay=100] - Delay before echoing in ms
   * @param {boolean} [options.uppercase=false] - Convert to uppercase
   * @param {string} [options.prefix=''] - Prefix to add to echoed messages
   */
  constructor(options = {}) {
    super(options);
    this.delay = Math.max(LIMITS.MIN_DELAY, Math.min(LIMITS.MAX_DELAY, options.delay || 100));
    this.uppercase = options.uppercase || false;
    this.prefix = options.prefix || '';
    this.messageCount = 0;
    this.buffer = '';
    this._timers = [];
  }

  /**
   * Internal method to write data to the stream
   * @param {Buffer|string} chunk - Data chunk to write
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when write is complete
   * @private
   */
  _write(chunk, encoding, callback) {
    if (this.messageCount >= LIMITS.MAX_MESSAGES) {
      return callback(new Error('Maximum message limit reached'));
    }

    const data = chunk.toString();
    if (data.length > LIMITS.MAX_MESSAGE_SIZE) {
      return callback(new Error('Message size exceeds limit'));
    }

    this.buffer += data;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    // Process complete lines
    lines.forEach(line => {
      if (line.trim()) {
        this._echoLine(line.trim());
      }
    });

    callback();
  }

  /**
   * Internal method to read data from the stream
   * @private
   */
  _read() {
    // Reading is handled by the echo mechanism
  }

  /**
   * Called when no more data will be written
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _final(callback) {
    // Process any remaining data in buffer
    if (this.buffer.trim()) {
      this._echoLine(this.buffer.trim());
    }

    // Wait for all pending echoes, then end
    setTimeout(() => {
      this.push(null);
      callback();
    }, this.delay * 2);
  }

  /**
   * Echo a line with transformations and delay
   * @param {string} line - Line to echo
   * @private
   */
  _echoLine(line) {
    const timer = setTimeout(() => {
      let response = line;

      if (this.uppercase) {
        response = response.toUpperCase();
      }

      if (this.prefix) {
        response = `${this.prefix}${response}`;
      }

      this.push(`Echo: ${response}\n`);
      this.messageCount++;
    }, this.delay);

    this._timers.push(timer);
  }

  /**
   * Cleanup method called when stream is destroyed
   * @param {Error|null} err - Error that caused destruction, if any
   * @param {Function} callback - Callback to call when cleanup is complete
   * @private
   */
  _destroy(err, callback) {
    this._timers.forEach(timer => clearTimeout(timer));
    this._timers = [];
    callback(err);
  }
}

/**
 * A duplex stream that transforms data bidirectionally
 * @extends {Duplex}
 */
class TransformStream extends Duplex {
  /**
   * Creates a TransformStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {string} [options.mode='reverse'] - Transform mode (reverse, rot13, base64)
   */
  constructor(options = {}) {
    super(options);
    this.mode = options.mode || 'reverse';
    this.buffer = '';
    this.responseCount = 0;
  }

  /**
   * Internal method to write data to the stream
   * @param {Buffer|string} chunk - Data chunk to write
   * @param {string} encoding - Text encoding if chunk is string
   * @param {Function} callback - Callback to call when write is complete
   * @private
   */
  _write(chunk, encoding, callback) {
    if (this.responseCount >= LIMITS.MAX_MESSAGES) {
      return callback(new Error('Maximum transform limit reached'));
    }

    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    lines.forEach(line => {
      if (line.trim()) {
        const transformed = this._transform(line.trim());
        this.push(`${transformed}\n`);
        this.responseCount++;
      }
    });

    callback();
  }

  /**
   * Internal method to read data from the stream
   * @private
   */
  _read() {
    // Reading is handled by the transform mechanism
  }

  /**
   * Called when no more data will be written
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _final(callback) {
    if (this.buffer.trim()) {
      const transformed = this._transform(this.buffer.trim());
      this.push(`${transformed}\n`);
    }
    this.push(null);
    callback();
  }

  /**
   * Transform a line based on the selected mode
   * @param {string} line - Line to transform
   * @returns {string} Transformed line
   * @private
   */
  _transform(line) {
    switch (this.mode) {
      case 'reverse':
        return line.split('').reverse().join('');
      case 'rot13':
        return line.replace(/[a-zA-Z]/g, char => {
          const start = char <= 'Z' ? 65 : 97;
          return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
        });
      case 'base64':
        return Buffer.from(line).toString('base64');
      case 'morse':
        return this._toMorse(line);
      default:
        return line.toUpperCase();
    }
  }

  /**
   * Convert text to morse code
   * @param {string} text - Text to convert
   * @returns {string} Morse code
   * @private
   */
  _toMorse(text) {
    const morseCode = {
      'A': '.-',
      'B': '-...',
      'C': '-.-.',
      'D': '-..',
      'E': '.',
      'F': '..-.',
      'G': '--.',
      'H': '....',
      'I': '..',
      'J': '.---',
      'K': '-.-',
      'L': '.-..',
      'M': '--',
      'N': '-.',
      'O': '---',
      'P': '.--.',
      'Q': '--.-',
      'R': '.-.',
      'S': '...',
      'T': '-',
      'U': '..-',
      'V': '...-',
      'W': '.--',
      'X': '-..-',
      'Y': '-.--',
      'Z': '--..',
      ' ': '/',
    };

    return text
      .toUpperCase()
      .split('')
      .map(char => morseCode[char] || char)
      .join(' ');
  }
}

/**
 * A duplex stream that simulates a chat bot conversation
 * @extends {Duplex}
 */
class ChatBotStream extends Duplex {
  /**
   * Creates a ChatBotStream instance
   * @param {Object} [options={}] - Stream configuration options
   * @param {string} [options.personality='friendly'] - Bot personality
   */
  constructor(options = {}) {
    super(options);
    this.personality = options.personality || 'friendly';
    this.conversationHistory = [];
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

    lines.forEach(line => {
      if (line.trim()) {
        const response = this._generateResponse(line.trim());
        this.push(`Bot: ${response}\n`);
      }
    });

    callback();
  }

  /**
   * Internal method to read data from the stream
   * @private
   */
  _read() {
    // Reading is handled by the response mechanism
  }

  /**
   * Called when no more data will be written
   * @param {Function} callback - Callback to call when finalization is complete
   * @private
   */
  _final(callback) {
    if (this.buffer.trim()) {
      const response = this._generateResponse(this.buffer.trim());
      this.push(`Bot: ${response}\n`);
    }
    this.push('Bot: Goodbye! Thanks for chatting.\n');
    this.push(null);
    callback();
  }

  /**
   * Generate a response based on input and personality
   * @param {string} input - User input
   * @returns {string} Bot response
   * @private
   */
  _generateResponse(input) {
    this.conversationHistory.push(input);
    const lowerInput = input.toLowerCase();

    const responses = {
      friendly: {
        greeting: ['Hello there! How are you today?', 'Hi! Great to meet you!', 'Hey! How can I help you?'],
        question: ["That's a great question!", 'Hmm, let me think about that...', 'Interesting point!'],
        goodbye: ['See you later!', 'Take care!', 'Have a wonderful day!'],
        default: ["That's fascinating!", 'Tell me more!', 'I see what you mean!'],
      },
      sarcastic: {
        greeting: ['Oh, another human...', 'Well, well, well...', 'Let me guess, you need help?'],
        question: ["Really? That's your question?", 'Wow, so deep...', 'Groundbreaking stuff here.'],
        goodbye: ['Finally!', "Don't let the door hit you...", 'Peace out!'],
        default: ['Riveting...', 'Absolutely thrilling.', 'My circuits are tingling with excitement.'],
      },
      helpful: {
        greeting: [
          "Hello! I'm here to assist you.",
          'Welcome! How may I help?',
          'Hi! Ready to solve problems together?',
        ],
        question: ['Let me analyze that for you.', "Here's what I think...", 'Based on my knowledge...'],
        goodbye: ['Goodbye! Feel free to return anytime.', 'Have a productive day!', 'Until next time!'],
        default: ['I understand.', 'That makes sense.', 'Let me process that information.'],
      },
    };

    const personality = responses[this.personality] || responses.friendly;

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return this._randomResponse(personality.greeting);
    } else if (lowerInput.includes('?')) {
      return this._randomResponse(personality.question);
    } else if (lowerInput.includes('bye') || lowerInput.includes('goodbye') || lowerInput.includes('see you')) {
      return this._randomResponse(personality.goodbye);
    } else {
      return this._randomResponse(personality.default);
    }
  }

  /**
   * Get a random response from an array
   * @param {string[]} responses - Array of possible responses
   * @returns {string} Random response
   * @private
   */
  _randomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

/**
 * Validates and sanitizes request parameters
 * @param {Object} params - Raw parameters from request
 * @returns {Object} Validated parameters
 */
const validateParams = params => {
  return {
    delay: Math.max(LIMITS.MIN_DELAY, Math.min(LIMITS.MAX_DELAY, parseInt(params.delay) || 100)),
    uppercase: params.uppercase === 'true',
    prefix: (params.prefix || '').substring(0, 20),
    mode: ['reverse', 'rot13', 'base64', 'morse'].includes(params.mode) ? params.mode : 'reverse',
    personality: ['friendly', 'sarcastic', 'helpful'].includes(params.personality) ? params.personality : 'friendly',
  };
};

/**
 * Fastify route handler for echo duplex stream
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Echo results
 */
const echoStream = async (request, reply) => {
  const { delay, uppercase, prefix } = validateParams(request.query);

  const echo = new EchoStream({ delay, uppercase, prefix });
  const input = request.body || '';

  return new Promise(resolve => {
    const results = [];

    echo.on('data', chunk => {
      results.push(chunk.toString());
    });

    echo.on('end', () => {
      const response = {
        success: true,
        message: 'Echo completed',
        results: {
          echoes: results,
          stats: {
            messageCount: echo.messageCount,
            delay: echo.delay,
            transformations: { uppercase, prefix },
          },
        },
      };

      reply.send(response);
      resolve(response);
    });

    echo.write(input);
    echo.end();
  });
};

/**
 * Fastify route handler for transform duplex stream
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Transform results
 */
const transformStream = async (request, reply) => {
  const { mode } = validateParams(request.query);

  const transformer = new TransformStream({ mode });
  const input = request.body || '';

  return new Promise(resolve => {
    const results = [];

    transformer.on('data', chunk => {
      results.push(chunk.toString());
    });

    transformer.on('end', () => {
      const response = {
        success: true,
        message: 'Transform completed',
        results: {
          transformed: results,
          stats: {
            mode,
            responseCount: transformer.responseCount,
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
 * Fastify route handler for chatbot duplex stream
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Chat results
 */
const chatBotStream = async (request, reply) => {
  const { personality } = validateParams(request.query);

  const chatBot = new ChatBotStream({ personality });
  const input = request.body || '';

  return new Promise(resolve => {
    const results = [];

    chatBot.on('data', chunk => {
      results.push(chunk.toString());
    });

    chatBot.on('end', () => {
      const response = {
        success: true,
        message: 'Chat completed',
        results: {
          conversation: results,
          stats: {
            personality,
            messageCount: chatBot.conversationHistory.length,
          },
        },
      };

      reply.send(response);
      resolve(response);
    });

    chatBot.write(input);
    chatBot.end();
  });
};

/**
 * Fastify route handler for bidirectional communication simulation
 * @async
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Bidirectional results
 */
const bidirectionalStream = async (request, reply) => {
  const input = request.body || '';
  const lines = input.split('\n').filter(line => line.trim());

  const results = [];

  lines.forEach((line, index) => {
    results.push(`Request ${index + 1}: ${line}`);
    results.push(`Response ${index + 1}: Processed "${line}" successfully`);
  });

  reply.send({
    success: true,
    message: 'Bidirectional communication completed',
    results: {
      communication: results,
      stats: {
        requestCount: lines.length,
        responseCount: lines.length,
      },
    },
  });
};

module.exports = {
  echoStream,
  transformStream,
  chatBotStream,
  bidirectionalStream,
};
