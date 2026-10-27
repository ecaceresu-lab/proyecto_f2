const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/data/db');

describe('E10: Pruebas de Integración y Middleware (Supertest)', () => {
  let adminToken = '';
  let customerToken = '';

  beforeAll(async () => {
    db.reset();
    // Obtener token admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ecommerce.com', password: 'password123' });
    adminToken = loginRes.body.data.token;

    // Crear cliente y obtener token
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Cliente Test', email: 'cliente@test.com', password: 'password123', role: 'customer' });

    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cliente@test.com', password: 'password123' });
    customerToken = custRes.body.data.token;
  });

  test('38. Healthcheck debe retornar 200 y status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('39. Acceso a perfil protegido sin token debe responder 401', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Token no proporcionado');
  });

  test('40. Acceso a perfil con token válido debe responder 200', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe('cliente@test.com');
  });

  test('41. Cliente no debe tener permisos de crear productos (403)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ sku: 'NO-AUTH', name: 'No Auth', price: 10, stock: 5 });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Requiere rol admin');
  });

  test('42. Admin puede crear productos vía API (201)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'MIC-006',
        name: 'Micrófono USB Cardioide',
        price: 75.0,
        stock: 12,
        category: 'Audio'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.sku).toBe('MIC-006');
  });

  test('43. Flujo completo de orden vía API', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: 'prod-2', quantity: 1 }]
      });

    expect(orderRes.statusCode).toBe(201);
    expect(orderRes.body.data.items.length).toBe(1);
    expect(orderRes.body.data.status).toBe('PENDING');
  });
});
