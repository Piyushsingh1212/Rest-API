// ─────────────────────────────────────────────────────────────
// db/database.js — SQLite setup with schema auto-creation
// ─────────────────────────────────────────────────────────────
const path = require('path');
const Database = require('better-sqlite3');

// Store the .db file inside the db/ folder
const dbPath = path.join(__dirname, 'app.db');
const db = new Database(dbPath);

// Enable foreign key enforcement (SQLite has them OFF by default)
db.pragma('journal_mode = WAL');   // faster concurrent reads
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    email     TEXT    UNIQUE NOT NULL,
    password  TEXT    NOT NULL,
    createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK(status IN ('pending', 'in_progress', 'done')),
    userId      INTEGER NOT NULL,
    createdAt   TEXT    NOT NULL DEFAULT (datetime('now')),
    updatedAt   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

module.exports = db;
