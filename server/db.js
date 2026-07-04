const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  try {
    const client = await pool.connect();
    
    // Transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id          SERIAL PRIMARY KEY,
        type        TEXT    NOT NULL CHECK(type IN ('income','expense')),
        amount      INTEGER NOT NULL CHECK(amount > 0),
        category    TEXT    NOT NULL DEFAULT 'Other',
        description TEXT    NOT NULL DEFAULT '',
        source      TEXT    NOT NULL DEFAULT 'manual' CHECK(source IN ('manual','whatsapp')),
        created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id    SERIAL PRIMARY KEY,
        name  TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL DEFAULT '#9ca3af'
      );
    `);

    // Notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          SERIAL PRIMARY KEY,
        type        TEXT    NOT NULL DEFAULT 'info' CHECK(type IN ('info','success','warning','danger')),
        title       TEXT    NOT NULL,
        body        TEXT    NOT NULL,
        is_read     INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Budgets
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id             SERIAL PRIMARY KEY,
        category       TEXT NOT NULL,
        monthly_limit  INTEGER NOT NULL CHECK(monthly_limit > 0),
        month          INTEGER NOT NULL,
        year           INTEGER NOT NULL,
        created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(category, month, year)
      );
    `);

    // Seed categories if empty
    const catRes = await client.query('SELECT COUNT(*) as n FROM categories');
    if (parseInt(catRes.rows[0].n, 10) === 0) {
      const seedCats = [
        ['Food',          '#22c55e'],
        ['Transport',     '#60a5fa'],
        ['Shopping',      '#fbbf24'],
        ['Bills',         '#f87171'],
        ['Entertainment', '#a78bfa'],
        ['Salary',        '#34d399'],
        ['Other',         '#9ca3af'],
      ];
      
      for (const [name, color] of seedCats) {
        await client.query('INSERT INTO categories (name, color) VALUES ($1, $2)', [name, color]);
      }
    }
    
    client.release();
    console.log('[db] PostgreSQL initialized');
  } catch (err) {
    console.error('[db] Initialization error:', err);
  }
}

// Call on startup
initDB();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
