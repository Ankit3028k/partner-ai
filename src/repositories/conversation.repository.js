const {query}  = require('../db/pool');
const {v4: uuidv4} = require('uuid');

const conversationRepository = {
  findByUser: async (userId, {limit=20, offset=0} = {}) => {
    const {rows} = await query(
      `SELECT c.*, COUNT(m.id)::int AS message_count
       FROM conversations c
       LEFT JOIN messages m ON m.conversation_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  },

  findById: async (id, userId) => {
    const {rows} = await query(
      'SELECT * FROM conversations WHERE id=$1 AND user_id=$2',
      [id, userId]
    );
    return rows[0] || null;
  },

  create: async ({userId, title}) => {
    const {rows} = await query(
      'INSERT INTO conversations (id, user_id, title) VALUES ($1,$2,$3) RETURNING *',
      [uuidv4(), userId, title || 'New Conversation']
    );
    return rows[0];
  },

  update: async (id, userId, {title}) => {
    const {rows} = await query(
      `UPDATE conversations SET title=$3, updated_at=NOW()
       WHERE id=$1 AND user_id=$2 RETURNING *`,
      [id, userId, title]
    );
    return rows[0] || null;
  },

  touch: async (id) => {
    await query('UPDATE conversations SET updated_at=NOW() WHERE id=$1', [id]);
  },

  delete: async (id, userId) => {
    const {rowCount} = await query(
      'DELETE FROM conversations WHERE id=$1 AND user_id=$2', [id, userId]
    );
    return rowCount > 0;
  },

  // ── Messages ───────────────────────────────────────────────────────────────
  getMessages: async (conversationId, {limit=100, offset=0} = {}) => {
    const {rows} = await query(
      `SELECT * FROM messages
       WHERE conversation_id=$1
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return rows;
  },

  addMessage: async ({conversationId, role, content, audioUrl}) => {
    const {rows} = await query(
      `INSERT INTO messages (id, conversation_id, role, content, audio_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [uuidv4(), conversationId, role, content, audioUrl || null]
    );
    // Touch parent conversation
    await query('UPDATE conversations SET updated_at=NOW() WHERE id=$1', [conversationId]);
    return rows[0];
  },
};

module.exports = conversationRepository;
