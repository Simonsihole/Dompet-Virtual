const Database = require('better-sqlite3');
const path     = require('path');

const DB_PATH = path.join(__dirname, 'data.db');
const db      = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT    NOT NULL CHECK(type IN ('income','expense')),
    amount      INTEGER NOT NULL CHECK(amount > 0),
    category    TEXT    NOT NULL DEFAULT 'Other',
    description TEXT    NOT NULL DEFAULT '',
    source      TEXT    NOT NULL DEFAULT 'manual' CHECK(source IN ('manual','whatsapp')),
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#9ca3af'
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT    NOT NULL DEFAULT 'info' CHECK(type IN ('info','success','warning','danger')),
    title       TEXT    NOT NULL,
    body        TEXT    NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    category       TEXT NOT NULL,
    monthly_limit  INTEGER NOT NULL CHECK(monthly_limit > 0),
    month          INTEGER NOT NULL,
    year           INTEGER NOT NULL,
    created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE(category, month, year)
  );
`);

// Seed categories if empty
const catCount = db.prepare('SELECT COUNT(*) as n FROM categories').get().n;
if (catCount === 0) {
  const insert = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
  const seedCats = db.transaction(() => {
    insert.run('Food',          '#22c55e');
    insert.run('Transport',     '#60a5fa');
    insert.run('Shopping',      '#fbbf24');
    insert.run('Bills',         '#f87171');
    insert.run('Entertainment', '#a78bfa');
    insert.run('Salary',        '#34d399');
    insert.run('Other',         '#9ca3af');
  });
  seedCats();
}

module.exports = db;
