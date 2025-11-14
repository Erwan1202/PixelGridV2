const request = require('supertest');
const express = require('express');
const validate = require('../src/middlewares/validate.middleware');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../src/validations/auth.validation');
const { placePixelSchema } = require('../src/validations/grid.validation');

// Create a simple test app
const createTestApp = (schema) => {
  const app = express();
  app.use(express.json());
  app.post('/test', validate(schema), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  return app;
};

describe('Validation Middleware Tests', () => {
  describe('Auth Validations', () => {
    test('registerSchema - should accept valid registration data', async () => {
      const app = createTestApp(registerSchema);
      const res = await request(app)
        .post('/test')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('registerSchema - should reject invalid email', async () => {
      const app = createTestApp(registerSchema);
      const res = await request(app)
        .post('/test')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
      expect(res.body.errors).toContain('Please provide a valid email address');
    });

    test('registerSchema - should reject weak password', async () => {
      const app = createTestApp(registerSchema);
      const res = await request(app)
        .post('/test')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    test('registerSchema - should reject short username', async () => {
      const app = createTestApp(registerSchema);
      const res = await request(app)
        .post('/test')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Username must be at least 3 characters long');
    });

    test('loginSchema - should accept valid login data', async () => {
      const app = createTestApp(loginSchema);
      const res = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'anypassword',
        });

      expect(res.statusCode).toBe(200);
    });

    test('loginSchema - should reject missing password', async () => {
      const app = createTestApp(loginSchema);
      const res = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Password is required');
    });

    test('refreshTokenSchema - should accept valid token', async () => {
      const app = createTestApp(refreshTokenSchema);
      const res = await request(app)
        .post('/test')
        .send({
          token: 'some-refresh-token',
        });

      expect(res.statusCode).toBe(200);
    });

    test('refreshTokenSchema - should reject missing token', async () => {
      const app = createTestApp(refreshTokenSchema);
      const res = await request(app)
        .post('/test')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Refresh token is required');
    });
  });

  describe('Grid Validations', () => {
    test('placePixelSchema - should accept valid pixel data', async () => {
      const app = createTestApp(placePixelSchema);
      const res = await request(app)
        .post('/test')
        .send({
          x: 25,
          y: 30,
          color: '#FF00AA',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.x).toBe(25);
      expect(res.body.data.y).toBe(30);
      expect(res.body.data.color).toBe('#FF00AA');
    });

    test('placePixelSchema - should reject invalid color format', async () => {
      const app = createTestApp(placePixelSchema);
      const res = await request(app)
        .post('/test')
        .send({
          x: 10,
          y: 10,
          color: 'red',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Color must be a valid hex color (e.g., #FFFFFF)');
    });

    test('placePixelSchema - should reject out of bounds x coordinate', async () => {
      const app = createTestApp(placePixelSchema);
      const res = await request(app)
        .post('/test')
        .send({
          x: 51,
          y: 10,
          color: '#FFFFFF',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('X coordinate cannot exceed 50');
    });

    test('placePixelSchema - should reject negative y coordinate', async () => {
      const app = createTestApp(placePixelSchema);
      const res = await request(app)
        .post('/test')
        .send({
          x: 10,
          y: 0,
          color: '#FFFFFF',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Y coordinate must be at least 1');
    });

    test('placePixelSchema - should reject non-integer coordinates', async () => {
      const app = createTestApp(placePixelSchema);
      const res = await request(app)
        .post('/test')
        .send({
          x: 10.5,
          y: 20,
          color: '#FFFFFF',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('X coordinate must be an integer');
    });

    test('placePixelSchema - should strip unknown fields', async () => {
      const app = createTestApp(placePixelSchema);
      const res = await request(app)
        .post('/test')
        .send({
          x: 10,
          y: 20,
          color: '#FFFFFF',
          extraField: 'should be removed',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.extraField).toBeUndefined();
    });
  });
});
