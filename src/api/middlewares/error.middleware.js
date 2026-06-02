const logger = require('../../utils/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error(err.message, {stack: err.stack, path: req.path});
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error.' : err.message,
  });
};

module.exports = {errorHandler};
