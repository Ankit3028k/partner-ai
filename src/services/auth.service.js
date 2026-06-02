const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const axios    = require('axios');
const userRepo = require('../repositories/user.repository');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1';

const authService = {
  /**
   * Verify OpenRouter API key by calling their auth endpoint.
   * Create or update local user, return JWT.
   */
  verifyAndLogin: async (apiKey) => {
    if (!apiKey || !apiKey.startsWith('sk-or-')) {
      throw Object.assign(new Error('Invalid API key format.'), {status: 400});
    }

    // Verify key with OpenRouter
    let orUser;
    try {
      const {data} = await axios.get(`${OPENROUTER_URL}/auth/key`, {
        headers: {Authorization: `Bearer ${apiKey}`},
        timeout: 8000,
      });
      orUser = data?.data || {};
    } catch (err) {
      if (err.response?.status === 401) {
        throw Object.assign(new Error('Invalid OpenRouter API key.'), {status: 401});
      }
      throw Object.assign(new Error('Could not verify API key. Check your connection.'), {status: 503});
    }

    // Upsert user
    const user = await userRepo.upsert({
      email:     orUser.email     || null,
      name:      orUser.label     || 'Partner User',
      avatarUrl: orUser.avatarUrl || null,
    });

    const token = authService.signToken(user.id);
    return {
      user:  {id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url},
      token,
    };
  },

  signToken: (userId) =>
    jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN || '7d'}),

  verifyToken: (token) =>
    jwt.verify(token, process.env.JWT_SECRET),
};

module.exports = authService;
