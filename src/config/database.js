const mongoose = require('mongoose');
const logger = require('./logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/backend3';

/**
 * Conecta a MongoDB. Si no está instalado o no está en ejecución, el servidor
 * arranca igual (se usa persistencia en archivos hasta que migres a Mongoose).
 */
async function connect() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info('MongoDB conectado');
    return true;
  } catch (err) {
    logger.warning('MongoDB no disponible: ' + err.message);
    if (err.message && err.message.includes('auth')) {
      logger.warning('Revisa en Atlas: Database Access → usuario y contraseña correctos.');
      logger.warning('Si la contraseña tiene @ # : / etc., codifícala en la URI: @ → %40, # → %23');
    } else {
      logger.warning('El servidor sigue. Para usar MongoDB: Atlas → https://www.mongodb.com/cloud/atlas');
    }
    return false;
  }
}

module.exports = { connect, MONGODB_URI };
