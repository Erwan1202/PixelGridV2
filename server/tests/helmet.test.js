const request = require('supertest');
const express = require('express');
const helmet = require('helmet');

// Create a simple test app with helmet
const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.get('/test', (req, res) => {
  res.json({ message: 'Security headers test' });
});

describe('Helmet Security Headers Tests', () => {
  test('should set X-Content-Type-Options header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('should set X-Frame-Options header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  test('should set Strict-Transport-Security header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  test('should set X-DNS-Prefetch-Control header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
  });

  test('should set Content-Security-Policy header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  });

  test('should remove X-Powered-By header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('should return 200 with security headers', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Security headers test');
  });
});
