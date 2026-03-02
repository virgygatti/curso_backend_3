const express = require('express');
const router = express.Router();
const { generateMockUsers, generateMockProducts } = require('../mocks/mockData');
const userDao = require('../dao/userDao');
const productDao = require('../dao/productDao');

/**
 * GET /api/mocks
 * Base del router de mocks.
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Mocks API', base: '/api/mocks' });
});

/**
 * GET /api/mocks/mockingproducts
 * Devuelve productos mock (sin insertar en DB). Equivalente a mockingpets en e-commerce.
 */
router.get('/mockingproducts', (req, res) => {
  const count = Math.min(100, Math.max(1, parseInt(req.query.count, 10) || 20));
  const products = generateMockProducts(count);
  res.status(200).json(products);
});

/**
 * GET /api/mocks/mockingusers
 * Genera 50 usuarios mock (password "coder123" encriptado, role user/admin). No inserta en DB.
 */
router.get('/mockingusers', (req, res) => {
  const users = generateMockUsers(50);
  // Formato similar a respuesta MongoDB: sin _id, con id virtual para lectura
  const formatted = users.map((u, i) => ({
    ...u,
    id: `mock-${i}`,
    cart: null
  }));
  res.status(200).json(formatted);
});

/**
 * POST /api/mocks/generateData
 * Body: { users: number, pets: number } o { users: number, products: number }
 * Genera e inserta en la base de datos la cantidad indicada de usuarios y productos.
 */
router.post('/generateData', async (req, res, next) => {
  try {
    const usersCount = Math.min(100, Math.max(0, parseInt(req.body.users, 10) || 0));
    const petsCount = Math.min(100, Math.max(0, parseInt(req.body.pets ?? req.body.products, 10) || 0));

    const inserted = { users: 0, products: 0 };

    if (usersCount > 0) {
      const mockUsers = generateMockUsers(usersCount);
      for (const u of mockUsers) {
        await userDao.create(u);
        inserted.users++;
      }
    }

    if (petsCount > 0) {
      const mockProducts = generateMockProducts(petsCount);
      for (const p of mockProducts) {
        await productDao.create(p);
        inserted.products++;
      }
    }

    res.status(201).json({
      message: 'Datos generados e insertados. Comprobar con GET /api/users y GET /api/products',
      inserted
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
