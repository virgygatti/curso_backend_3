const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

const unique = () => `test.${Date.now()}.${Math.random().toString(36).slice(2, 9)}`;

describe('Sessions API', function () {
  this.timeout(5000);

  let validUser;

  before(function () {
    validUser = {
      first_name: 'Test',
      last_name: 'Session',
      email: `${unique()}@test.com`,
      age: 25,
      password: '123456'
    };
  });

  describe('POST /api/sessions/register', function () {
    it('debe devolver 201 y usuario sin password al registrar con todos los campos', async function () {
      const res = await request(app)
        .post('/api/sessions/register')
        .send(validUser)
        .expect(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('email', validUser.email);
      expect(res.body).to.have.property('first_name', validUser.first_name);
      expect(res.body).to.not.have.property('password');
    });

    it('debe devolver 400 cuando faltan campos obligatorios', async function () {
      const res = await request(app)
        .post('/api/sessions/register')
        .send({ email: 'x@x.com' })
        .expect(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.be.a('string');
    });

    it('debe devolver 400 al registrar email ya existente', async function () {
      const dup = { ...validUser, email: `${unique()}@dup.com` };
      await request(app).post('/api/sessions/register').send(dup);
      const res = await request(app)
        .post('/api/sessions/register')
        .send({ ...dup, first_name: 'Otro' })
        .expect(400);
      expect(res.body.error).to.include('email');
    });
  });

  describe('POST /api/sessions/login', function () {
    it('debe devolver 200, cookie y usuario al login correcto', async function () {
      const res = await request(app)
        .post('/api/sessions/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('email', validUser.email);
      expect(res.body.user).to.not.have.property('password');
      const cookies = res.headers['set-cookie'];
      expect(cookies).to.be.an('array');
      expect(cookies.some(c => c.includes('token='))).to.be.true;
    });

    it('debe devolver 400 cuando faltan email o password', async function () {
      await request(app)
        .post('/api/sessions/login')
        .send({ email: 'a@a.com' })
        .expect(400);
      await request(app)
        .post('/api/sessions/login')
        .send({ password: '123' })
        .expect(400);
    });

    it('debe devolver 401 con credenciales incorrectas', async function () {
      const res = await request(app)
        .post('/api/sessions/login')
        .send({ email: validUser.email, password: 'wrong' })
        .expect(401);
      expect(res.body.error).to.include('Credenciales');
    });
  });
});
