const winston = require('winston');
const path = require('path');

const levels = {
  debug: 0,
  http: 1,
  info: 2,
  warning: 3,
  error: 4,
  fatal: 5
};

const colors = {
  debug: 'gray',
  http: 'magenta',
  info: 'green',
  warning: 'yellow',
  error: 'red',
  fatal: 'bold red'
};

winston.addColors(colors);

const isProduction = process.env.NODE_ENV === 'production';

const devTransports = [
  new winston.transports.Console({
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.simple()
    )
  })
];

const prodTransports = [
  new winston.transports.Console({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  new winston.transports.File({
    filename: path.join(process.cwd(), 'errors.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

const logger = winston.createLogger({
  levels,
  level: isProduction ? 'info' : 'debug',
  transports: isProduction ? prodTransports : devTransports
});

module.exports = logger;
