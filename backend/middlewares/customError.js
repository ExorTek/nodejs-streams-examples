const { CustomError } = require('../helpers');

const isDevServer = process.env.NODE_ENV === 'development';

const customErrorHandler = (err, req, reply) => {
  let customError = err;

  if (isDevServer) console.log(err);

  if (customError.name === 'SyntaxError')
    customError = new CustomError(
      'We have encountered a some problem with your request. Please contact the Support!',
      400,
    );

  const response = {
    success: false,
    statusCode: customError.status || customError.statusCode || 500,
    message: customError.message || 'Internal Server Error',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  return reply.code(response.statusCode).send(response);
};

module.exports = customErrorHandler;
