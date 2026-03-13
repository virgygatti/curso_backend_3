require('dotenv').config();

process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../src/config/database');

// Usar MONGODB_URI_TEST o misma URI con base de datos backend3_test
const testDbUri = process.env.MONGODB_URI_TEST || MONGODB_URI.replace(/\/[^/]+$/, '/backend3_test');

before(async function () {
  this.timeout(10000);
  await mongoose.connect(testDbUri, { serverSelectionTimeoutMS: 5000 });
});

after(async function () {
  await mongoose.disconnect();
});
