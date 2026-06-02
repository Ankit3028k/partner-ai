/**
 * API integration tests — conversation routes
 * Uses supertest against the Express app.
 */
const request  = require('supertest');
const app      = require('../app');
const jwt      = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-minimum-64-chars-long-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/partner_ai_test';

const makeToken = (userId = 'user-1') =>
  jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '1h'});

describe('GET /api/conversations', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/conversations');
    expect(res.status).toBe(401);
  });

  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/verify-key', () => {
  test('returns 400 for missing apiKey', async () => {
    const res = await request(app).post('/api/auth/verify-key').send({});
    expect(res.status).toBe(400);
  });

  test('returns 400 for too-short key', async () => {
    const res = await request(app).post('/api/auth/verify-key').send({apiKey: 'abc'});
    expect(res.status).toBe(400);
  });
});
