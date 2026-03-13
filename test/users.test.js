const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

const unique = () => `test.${Date.now()}.${Math.random().toString(36).slice(2, 9)}`;

describe('Users API', function () {
  this.timeout(5000);

  let userId;
  let testEmail;

  before(async function () {
    testEmail = `${unique()}@users.test.com`;
    const res = await request(app)
      .post('/api/sessions/register')
      .send({
        first_name: 'User',
        last_name: 'Test',
        email: testEmail,
        age: 30,
        password: '123456'
      });
    expect(res.status).to.equal(201);
    userId = res.body.id;
  });

  describe('GET /api/users', function () {
    it('debe devolver 200 y un array de usuarios', async function () {
      const res = await request(app).get('/api/users').expect(200);
      expect(res.body).to.be.an('array');
      expect(res.body.some(u => u.id === userId)).to.be.true;
      res.body.forEach(u => {
        expect(u).to.not.have.property('password');
      });
    });
  });

  describe('GET /api/users/:uid', function () {
    it('debe devolver 200 y el usuario cuando el id existe', async function () {
      const res = await request(app).get(`/api/users/${userId}`).expect(200);
      expect(res.body).to.have.property('id', userId);
      expect(res.body).to.have.property('email', testEmail);
      expect(res.body).to.not.have.property('password');
    });

    it('debe devolver 404 cuando el id no existe', async function () {
      const res = await request(app)
        .get('/api/users/000000000000000000000000')
        .expect(404);
      expect(res.body.error).to.include('no encontrado');
    });
  });

  describe('PUT /api/users/:uid', function () {
    it('debe devolver 200 y usuario actualizado', async function () {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .send({ first_name: 'Updated' })
        .expect(200);
      expect(res.body.first_name).to.equal('Updated');
    });

    it('debe devolver 404 para id inexistente', async function () {
      await request(app)
        .put('/api/users/000000000000000000000000')
        .send({ first_name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /api/users/:uid', function () {
    it('debe devolver 200 y mensaje al eliminar', async function () {
      const toDelete = await request(app)
        .post('/api/sessions/register')
        .send({
          first_name: 'Del',
          last_name: 'User',
          email: `${unique()}@delete.users.test.com`,
          age: 20,
          password: '123'
        });
      const id = toDelete.body.id;
      const res = await request(app).delete(`/api/users/${id}`).expect(200);
      expect(res.body).to.have.property('message');
      expect(res.body).to.have.property('user');
    });

    it('debe devolver 404 para id inexistente', async function () {
      await request(app)
        .delete('/api/users/000000000000000000000000')
        .expect(404);
    });
  });

  describe('POST /api/users/:uid/documents', function () {
    it('debe devolver 404 cuando el usuario no existe', async function () {
      const res = await request(app)
        .post('/api/users/000000000000000000000000/documents')
        .attach('documents', Buffer.from('test'), 'doc.txt')
        .expect(404);
      expect(res.body.error).to.include('no encontrado');
    });

    it('debe devolver 400 cuando no se envían archivos', async function () {
      const res = await request(app)
        .post(`/api/users/${userId}/documents`)
        .expect(400);
      expect(res.body.error).to.include('No se enviaron');
    });

    it('debe devolver 200 y agregar documentos al usuario', async function () {
      const res = await request(app)
        .post(`/api/users/${userId}/documents`)
        .attach('documents', Buffer.from('contenido de prueba'), 'doc1.txt')
        .attach('documents', Buffer.from('otro archivo'), 'doc2.pdf')
        .expect(200);
      expect(res.body).to.have.property('documents').that.is.an('array');
      expect(res.body.documents.length).to.be.at.least(2);
      const first = res.body.documents.find(d => d.name === 'doc1.txt' || (d.reference && d.reference.includes('doc1')));
      expect(first).to.exist;
      expect(first).to.have.property('name');
      expect(first).to.have.property('reference');
      expect(first.reference).to.include('documents');
    });

    it('GET /api/users/:uid debe incluir los documentos subidos', async function () {
      const res = await request(app).get(`/api/users/${userId}`).expect(200);
      expect(res.body).to.have.property('documents').that.is.an('array');
      expect(res.body.documents.length).to.be.at.least(1);
      res.body.documents.forEach(d => {
        expect(d).to.have.property('name');
        expect(d).to.have.property('reference');
      });
    });
  });
});
