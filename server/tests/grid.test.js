const request = require('supertest');
const app = require('../src/app');
const { pool, connectDB } = require('../src/config/db');

let testUser = {
  username: 'griduser_' + Date.now(),
  email: `grid_${Date.now()}@example.com`,
  password: 'Password123!',
};

let accessToken;

beforeAll(async () => {
  await connectDB();

  await request(app)
    .post('/api/auth/register')
    .send({
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
    });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password,
    });

  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  try {
    await pool.query(
      'DELETE FROM pixel WHERE user_id IN (SELECT id FROM users WHERE email = $1)',
      [testUser.email]
    );
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  } catch (err) {
    console.error('Error cleaning grid tests:', err);
  }

  await pool.end();
});

describe('Grid API', () => {
  test('GET /api/grid - should return grid state (public)', async () => {
    const res = await request(app).get('/api/grid');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/grid/pixel - should reject without token', async () => {
    const res = await request(app)
      .post('/api/grid/pixel')
      .send({ x: 10, y: 10, color: '#FF0000' });

    expect(res.statusCode).toBe(401);
  });

  test('POST /api/grid/pixel - should allow placing a pixel with token', async () => {
    const res = await request(app)
      .post('/api/grid/pixel')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ x: 10, y: 10, color: '#FF0000' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('x_coord', 10);
    expect(res.body).toHaveProperty('y_coord', 10);
    expect(res.body).toHaveProperty('color', '#FF0000');
  });

  test('GET /api/grid - should now contain that pixel', async () => {
    const res = await request(app).get('/api/grid');

    expect(res.statusCode).toBe(200);
    const pixels = res.body;

    const found = pixels.find(
      (p) => p.x_coord === 10 && p.y_coord === 10 && p.color === '#FF0000'
    );

    expect(found).toBeDefined();
  });
});
