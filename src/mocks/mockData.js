const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'coder123';

const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofia', 'Diego', 'Valentina'];
const lastNames = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Romero', 'Fernández', 'Torres'];
const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Herramientas', 'Jardín'];

/**
 * Genera N usuarios mock (formato MongoDB/User).
 * password encriptado "coder123", role "user" o "admin", sin insertar en DB.
 */
function generateMockUsers(count = 50) {
  const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, SALT_ROUNDS);
  const users = [];
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    let email;
    do {
      const name = firstNames[i % firstNames.length].toLowerCase();
      const num = Math.floor(i / firstNames.length) * 10 + (i % 10);
      email = `mock.${name}.${num}@test.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    users.push({
      first_name: firstNames[i % firstNames.length],
      last_name: lastNames[i % lastNames.length],
      email,
      age: 18 + (i % 50),
      password: hashedPassword,
      cart: null,
      role: i % 5 === 0 ? 'admin' : 'user'
    });
  }

  return users;
}

/**
 * Genera N productos mock (formato MongoDB/Product).
 */
function generateMockProducts(count = 10) {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      title: `Producto Mock ${i + 1}`,
      description: `Descripción del producto mock número ${i + 1}`,
      code: `MOCK-${Date.now()}-${i}`,
      price: Math.round(100 + Math.random() * 900),
      status: true,
      stock: Math.floor(Math.random() * 100) + 1,
      category: categories[i % categories.length],
      thumbnails: []
    });
  }
  return products;
}

module.exports = {
  generateMockUsers,
  generateMockProducts,
  DEFAULT_PASSWORD
};
