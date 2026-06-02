const {query, transaction} = require('../db/pool');
const {v4: uuidv4}          = require('uuid');

const userRepository = {
  findById: async (id) => {
    const {rows} = await query('SELECT * FROM users WHERE id=$1', [id]);
    return rows[0] || null;
  },

  findByEmail: async (email) => {
    const {rows} = await query('SELECT * FROM users WHERE email=$1', [email]);
    return rows[0] || null;
  },

  create: async ({email, name, avatarUrl, consentGiven}) => {
    const {rows} = await query(
      `INSERT INTO users (id, email, name, avatar_url, consent_given)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [uuidv4(), email, name, avatarUrl, consentGiven || false]
    );
    return rows[0];
  },

  upsert: async ({email, name, avatarUrl}) => {
    const {rows} = await query(
      `INSERT INTO users (id, email, name, avatar_url, consent_given)
       VALUES ($1,$2,$3,$4,TRUE)
       ON CONFLICT (email) DO UPDATE SET
         name       = EXCLUDED.name,
         avatar_url = EXCLUDED.avatar_url,
         updated_at = NOW()
       RETURNING *`,
      [uuidv4(), email || null, name || 'Partner User', avatarUrl || null]
    );
    return rows[0];
  },

  update: async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const set = fields.map((k, i) => `${toSnake(k)}=$${i+2}`).join(', ');
    const {rows} = await query(
      `UPDATE users SET ${set}, updated_at=NOW() WHERE id=$1 RETURNING *`,
      [id, ...values]
    );
    return rows[0] || null;
  },

  delete: async (id) => {
    await query('DELETE FROM users WHERE id=$1', [id]);
  },
};

// camelCase → snake_case
const toSnake = (s) => s.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);

module.exports = userRepository;
