const request = require('supertest');
const app = require('../src/app');
const { pool, connectDB } = require('../src/config/db');

let testUser = {
  username: 'testuser_' + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: 'Password123!',
};

let accessToken;
let refreshToken;

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
    refreshToken = res.body.refreshToken;
  });

  test('POST /api/auth/refresh - should get a new access token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ token: refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    // The new token should be different from the old one
    expect(res.body.accessToken).not.toBe(accessToken);
    accessToken = res.body.accessToken; // Update for subsequent tests
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
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('POST /api/auth/logout - should logout the user', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Successfully logged out');
  });

  test('POST /api/auth/refresh - should fail after logout', async () => {
    // This test ensures the refresh token was invalidated
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ token: refreshToken });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid refresh token');
  });

  test('Database check - refresh token should be null after logout', async () => {
    const { rows } = await pool.query(
      'SELECT refresh_token FROM users WHERE email = $1',
      [testUser.email]
    );
    expect(rows.length).toBe(1);
    expect(rows[0].refresh_token).toBeNull();
  });
});
