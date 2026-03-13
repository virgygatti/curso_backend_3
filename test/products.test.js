const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

const unique = () => `test.${Date.now()}.${Math.random().toString(36).slice(2, 9)}`;

describe('Products API', function () {
  this.timeout(5000);

  let adminCookie;
  let productId;
  let adminEmail;

  before(async function () {
    adminEmail = `${unique()}@admin.test.com`;
    await request(app).post('/api/sessions/register').send({
      first_name: 'Admin',
      last_name: 'Products',
      email: adminEmail,
      age: 28,
      password: '123456',
      role: 'admin'
    });
    const login = await request(app)
      .post('/api/sessions/login')
      .send({ email: adminEmail, password: '123456' });
    adminCookie = login.headers['set-cookie'];
  });

  describe('GET /api/products', function () {
    it('debe devolver 200 y estructura paginada', async function () {
      const res = await request(app).get('/api/products').expect(200);
      expect(res.body).to.have.property('status', 'success');
      expect(res.body).to.have.property('payload').that.is.an('array');
      expect(res.body).to.have.property('totalPages');
      expect(res.body).to.have.property('page');
    });

    it('debe aceptar query limit y page', async function () {
      const res = await request(app)
        .get('/api/products?limit=2&page=1')
        .expect(200);
      expect(res.body.payload.length).to.be.at.most(2);
      expect(res.body.page).to.equal(1);
    });
  });

  describe('GET /api/products/:pid', function () {
    it('debe devolver 404 para id inexistente', async function () {
      const res = await request(app)
        .get('/api/products/000000000000000000000000')
        .expect(404);
      expect(res.body.error).to.include('no encontrado');
    });
  });

  describe('POST /api/products', function () {
    it('debe devolver 401 sin cookie de autenticación', async function () {
      await request(app)
        .post('/api/products')
        .send({
          title: 'Prod',
          description: 'Desc',
          code: 'CODE-1',
          price: 100,
          stock: 10,
          category: 'Test'
        })
        .expect(401);
    });

    it('debe devolver 201 y producto creado con admin', async function () {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie)
        .send({
          title: 'Producto Test',
          description: 'Descripción test',
          code: 'TEST-PROD-001',
          price: 99,
          stock: 5,
          category: 'Testing'
        })
        .expect(201);
      expect(res.body).to.have.property('id');
      expect(res.body.title).to.equal('Producto Test');
      expect(res.body.price).to.equal(99);
      productId = res.body.id;
    });

    it('debe devolver 400 cuando faltan campos obligatorios', async function () {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie)
        .send({ title: 'Solo título' })
        .expect(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('GET /api/products/:pid', function () {
    it('debe devolver 200 y el producto por id', async function () {
      const res = await request(app).get(`/api/products/${productId}`).expect(200);
      expect(res.body.id).to.equal(productId);
      expect(res.body.title).to.equal('Producto Test');
    });
  });

  describe('PUT /api/products/:pid', function () {
    it('debe devolver 200 y producto actualizado', async function () {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Cookie', adminCookie)
        .send({ price: 150 })
        .expect(200);
      expect(res.body.price).to.equal(150);
    });

    it('debe devolver 404 para id inexistente', async function () {
      await request(app)
        .put('/api/products/000000000000000000000000')
        .set('Cookie', adminCookie)
        .send({ title: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /api/products/:pid', function () {
    it('debe devolver 200 y mensaje al eliminar', async function () {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Cookie', adminCookie)
        .expect(200);
      expect(res.body).to.have.property('message', 'Producto eliminado');
      expect(res.body).to.have.property('product');
    });

    it('debe devolver 404 para id inexistente', async function () {
      await request(app)
        .delete('/api/products/000000000000000000000000')
        .set('Cookie', adminCookie)
        .expect(404);
    });
  });
});
