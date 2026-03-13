const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

const unique = () => `test.${Date.now()}.${Math.random().toString(36).slice(2, 9)}`;

describe('Carts API', function () {
  this.timeout(8000);

  let cartId;
  let userCookie;
  let productId;
  let userEmail;
  let adminEmail;

  before(async function () {
    userEmail = `${unique()}@cart.user.test.com`;
    const reg = await request(app).post('/api/sessions/register').send({
      first_name: 'Cart',
      last_name: 'User',
      email: userEmail,
      age: 22,
      password: '123456'
    });
    expect(reg.status).to.equal(201);
    cartId = reg.body.cart != null ? String(reg.body.cart) : reg.body.cart;
    const login = await request(app)
      .post('/api/sessions/login')
      .send({ email: userEmail, password: '123456' });
    userCookie = login.headers['set-cookie'];

    const adminReg = await request(app).post('/api/sessions/register').send({
      first_name: 'A',
      last_name: 'B',
      email: 'cart.admin@test.com',
      age: 30,
      password: '123456',
      role: 'admin'
    });
    const adminLogin = await request(app)
      .post('/api/sessions/login')
      .send({ email: 'cart.admin@test.com', password: '123456' });
    const adminCookie = adminLogin.headers['set-cookie'];
    const prod = await request(app)
      .post('/api/products')
      .set('Cookie', adminCookie)
      .send({
        title: 'Prod Cart Test',
        description: 'D',
        code: `CART-${Date.now()}`,
        price: 10,
        stock: 100,
        category: 'Test'
      });
    expect(prod.status).to.equal(201);
    productId = prod.body.id;
  });

  describe('POST /api/carts', function () {
    it('debe devolver 201 y carrito con products array', async function () {
      const res = await request(app).post('/api/carts').expect(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('products').that.is.an('array');
    });
  });

  describe('GET /api/carts/:cid', function () {
    it('debe devolver 200 y carrito con productos', async function () {
      const res = await request(app).get(`/api/carts/${cartId}`).expect(200);
      expect(res.body.id).to.equal(cartId);
      expect(res.body.products).to.be.an('array');
    });

    it('debe devolver 404 para cid inexistente', async function () {
      const res = await request(app)
        .get('/api/carts/000000000000000000000000')
        .expect(404);
      expect(res.body.error).to.include('no encontrado');
    });
  });

  describe('POST /api/carts/:cid/product/:pid', function () {
    it('debe devolver 401 sin autenticación', async function () {
      await request(app)
        .post(`/api/carts/${cartId}/product/${productId}`)
        .expect(401);
    });

    it('debe devolver 200 y carrito con producto agregado', async function () {
      const res = await request(app)
        .post(`/api/carts/${cartId}/product/${productId}`)
        .set('Cookie', userCookie)
        .expect(200);
      expect(res.body.products).to.be.an('array');
      const item = res.body.products.find(p => p.product && p.product.id === productId);
      expect(item).to.exist;
      expect(item.quantity).to.be.at.least(1);
    });
  });

  describe('PUT /api/carts/:cid/products/:pid', function () {
    it('debe devolver 200 al actualizar cantidad', async function () {
      const res = await request(app)
        .put(`/api/carts/${cartId}/products/${productId}`)
        .send({ quantity: 3 })
        .expect(200);
      const item = res.body.products.find(p => p.product && p.product.id === productId);
      expect(item).to.exist;
      expect(item.quantity).to.equal(3);
    });
  });

  describe('DELETE /api/carts/:cid/products/:pid', function () {
    it('debe devolver 200 al quitar producto del carrito', async function () {
      const res = await request(app)
        .delete(`/api/carts/${cartId}/products/${productId}`)
        .expect(200);
      const item = res.body.products.find(p => p.product && p.product.id === productId);
      expect(item).to.not.exist;
    });
  });

  describe('PUT /api/carts/:cid', function () {
    it('debe devolver 200 al actualizar carrito completo', async function () {
      const res = await request(app)
        .put(`/api/carts/${cartId}`)
        .send({
          products: [{ product: productId, quantity: 2 }]
        })
        .expect(200);
      expect(res.body.products).to.have.lengthOf(1);
      expect(res.body.products[0].quantity).to.equal(2);
    });
  });

  describe('POST /api/carts/:cid/purchase', function () {
    it('debe devolver 401 sin autenticación', async function () {
      const newCart = await request(app).post('/api/carts');
      await request(app)
        .post(`/api/carts/${newCart.body.id}/purchase`)
        .expect(401);
    });

    it('debe devolver 200 con ticket cuando hay productos y usuario dueño del carrito', async function () {
      await request(app)
        .put(`/api/carts/${cartId}`)
        .send({ products: [{ product: productId, quantity: 1 }] });
      const res = await request(app)
        .post(`/api/carts/${cartId}/purchase`)
        .set('Cookie', userCookie)
        .expect(200);
      expect(res.body).to.have.property('ticket');
      expect(res.body.ticket).to.have.property('code');
      expect(res.body.ticket).to.have.property('amount');
    });
  });

  describe('DELETE /api/carts/:cid', function () {
    it('debe devolver 200 y carrito vacío', async function () {
      const res = await request(app).delete(`/api/carts/${cartId}`).expect(200);
      expect(res.body.products).to.have.lengthOf(0);
    });
  });
});
