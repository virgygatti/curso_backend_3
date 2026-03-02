require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const productService = require('./services/productService');
const { connect: connectDB } = require('./config/database');
const logger = require('./config/logger');

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

const io = new Server(server);

// Exponer io en la app para usarlo en controladores (emit dentro de POST/DELETE)
app.set('io', io);

io.on('connection', async (socket) => {
  logger.http('Cliente conectado por WebSocket');
  try {
    const products = await productService.getAll();
    socket.emit('products', products);
  } catch (err) {
    logger.error('Error al enviar productos por WebSocket', { error: err.message });
    socket.emit('products', []);
  }
});

connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
