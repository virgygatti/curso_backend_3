const logger = require('../config/logger');

/**
 * Middleware de manejo de errores centralizado.
 * Captura errores, los loguea y responde con formato JSON consistente.
 */
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { errorHandler };
