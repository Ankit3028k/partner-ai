/**
 * Migration runner — idempotent (safe to re-run).
 * Run: node src/db/migrate.js
 */
require('dotenv').config();
const {pool} = require('./pool');

const MIGRATIONS = [
  {
    name: '001_create_users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email        TEXT UNIQUE,
        name         TEXT,
        avatar_url   TEXT,
        openrouter_api_key_hash TEXT,
        consent_given BOOLEAN DEFAULT FALSE,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `,
  },
  {
    name: '002_create_sessions',
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
        refresh_token TEXT NOT NULL,
        expires_at    TIMESTAMPTZ NOT NULL,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },
  {
    name: '003_create_conversations',
    sql: `
      CREATE TABLE IF NOT EXISTS conversations (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        title      TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id);
    `,
  },
  {
    name: '004_create_messages',
    sql: `
      CREATE TABLE IF NOT EXISTS messages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        role            TEXT CHECK (role IN ('user','assistant','system')) NOT NULL,
        content         TEXT NOT NULL,
        audio_url       TEXT,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    `,
  },
  {
    name: '005_create_usage_logs',
    sql: `
      CREATE TABLE IF NOT EXISTS usage_logs (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        action     TEXT NOT NULL,
        metadata   JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_usage_user    ON usage_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_logs(created_at);
    `,
  },
  {
    name: '006_create_device_actions',
    sql: `
      CREATE TABLE IF NOT EXISTS device_actions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL,
        parameters  JSONB DEFAULT '{}',
        status      TEXT DEFAULT 'pending',
        executed_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_actions_user ON device_actions(user_id);
    `,
  },
  {
    name: '007_create_wake_words',
    sql: `
      CREATE TABLE IF NOT EXISTS wake_words (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        phrase     TEXT NOT NULL DEFAULT 'Partner',
        enabled    BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },
  {
    name: '008_create_push_tokens',
    sql: `
      CREATE TABLE IF NOT EXISTS push_tokens (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
        fcm_token   TEXT NOT NULL,
        device_name TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },
  {
    name: '009_schema_migrations_table',
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       TEXT PRIMARY KEY,
        run_at     TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },
];

(async () => {
  console.log('[Migrate] Starting...');
  const client = await pool.connect();
  try {
    // Create migrations table first
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name   TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    for (const migration of MIGRATIONS) {
      const {rows} = await client.query(
        'SELECT name FROM schema_migrations WHERE name=$1', [migration.name]
      );
      if (rows.length > 0) {
        console.log(`[Migrate] Skip  ${migration.name}`);
        continue;
      }
      await client.query(migration.sql);
      await client.query(
        'INSERT INTO schema_migrations (name) VALUES ($1)', [migration.name]
      );
      console.log(`[Migrate] Done  ${migration.name}`);
    }
    console.log('[Migrate] All migrations complete.');
  } finally {
    client.release();
    await pool.end();
  }
})();
