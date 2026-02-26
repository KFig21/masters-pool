import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scores (
      event       TEXT NOT NULL,
      year        INT  NOT NULL,
      data        JSONB NOT NULL,
      updated_at  TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (event, year)
    );
  `);
  console.log('✅ DB ready');
}
