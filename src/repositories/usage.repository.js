const {query}  = require('../db/pool');
const {v4: uuidv4} = require('uuid');

const usageRepository = {
  log: async ({userId, action, metadata = {}}) => {
    await query(
      'INSERT INTO usage_logs (id, user_id, action, metadata) VALUES ($1,$2,$3,$4)',
      [uuidv4(), userId, action, JSON.stringify(metadata)]
    );
  },

  getStats: async (userId, period = 'month') => {
    const interval = period === 'day' ? '1 day' : '30 days';
    const {rows} = await query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day')  AS daily,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS monthly,
         COUNT(*) FILTER (WHERE action = 'wake_word')                     AS wake_word_count
       FROM usage_logs WHERE user_id=$1`,
      [userId]
    );
    return rows[0] || {daily:0, monthly:0, wake_word_count:0};
  },
};

module.exports = usageRepository;
