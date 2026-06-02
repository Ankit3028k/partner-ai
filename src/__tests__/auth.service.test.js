/**
 * Integration test — authService
 * Requires DB running. Skip in CI without DB via env flag.
 */
const authService = require('../services/auth.service');

const MOCK_KEY = 'sk-or-v1-testkey';

describe('authService.signToken / verifyToken', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-minimum-64-chars-long-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  });

  test('signToken produces verifiable token', () => {
    const token   = authService.signToken('user-uuid-123');
    const decoded = authService.verifyToken(token);
    expect(decoded.userId).toBe('user-uuid-123');
  });

  test('verifyToken throws on tampered token', () => {
    expect(() => authService.verifyToken('bad.token.here')).toThrow();
  });
});
