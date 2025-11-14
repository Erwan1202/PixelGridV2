const request = require('supertest');
const app = require('../src/app');
const { pool, connectDB } = require('../src/config/db');

let testUser = {
  username: 'testuser_' + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: 'Password123!',
};

let accessToken;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  } catch (err) {
    console.error('Error cleaning test users:', err);
  }

  await pool.end();
});

describe('Auth API', () => {
  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('POST /api/auth/login - should login and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');

    accessToken = res.body.accessToken;
  });

  test('GET /api/auth/me - should fail without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me - should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testUser.email);
  });
});
