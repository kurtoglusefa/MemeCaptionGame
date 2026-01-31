import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'meme.db');

let dbInstance = null;
let sqlModule = null;

const initDb = async () => {
  if (dbInstance) return dbInstance;
  sqlModule = await initSqlJs({
    locateFile: (file) =>
      path.join(__dirname, 'node_modules', 'sql.js', 'dist', file),
  });

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    dbInstance = new sqlModule.Database(fileBuffer);
  } else {
    dbInstance = new sqlModule.Database();
  }

  dbInstance.run('PRAGMA foreign_keys = ON;');
  return dbInstance;
};

const persistDb = () => {
  if (!dbInstance) return;
  const data = dbInstance.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
};

const queryAll = (db, sql, params = []) => {
  const statement = db.prepare(sql);
  statement.bind(params);
  const rows = [];
  while (statement.step()) {
    rows.push(statement.getAsObject());
  }
  statement.free();
  return rows;
};

export const run = async (sql, params = []) => {
  const db = await initDb();
  db.run(sql, params);
  const row = queryAll(db, 'SELECT last_insert_rowid() AS lastID')[0] || {
    lastID: 0,
  };
  persistDb();
  return { lastID: row.lastID, changes: db.getRowsModified() };
};

export const get = async (sql, params = []) => {
  const db = await initDb();
  const rows = queryAll(db, sql, params);
  return rows[0];
};

export const all = async (sql, params = []) => {
  const db = await initDb();
  return queryAll(db, sql, params);
};

export const migrate = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      salt TEXT,
      hash TEXT
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS memes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS captions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS meme_captions (
      meme_id INTEGER,
      caption_id INTEGER,
      is_best_match BOOLEAN,
      FOREIGN KEY(meme_id) REFERENCES memes(id),
      FOREIGN KEY(caption_id) REFERENCES captions(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      meme_id INTEGER,
      score INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(meme_id) REFERENCES memes(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      meme_id INTEGER NOT NULL,
      caption_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (meme_id) REFERENCES memes(id),
      FOREIGN KEY (caption_id) REFERENCES captions(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      total_score INTEGER NOT NULL DEFAULT 0,
      rounds_total INTEGER NOT NULL DEFAULT 3,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      meme_id INTEGER NOT NULL,
      caption_id INTEGER,
      is_correct INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      time_taken INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (meme_id) REFERENCES memes(id),
      FOREIGN KEY (caption_id) REFERENCES captions(id)
    );
  `);
};

process.on('SIGINT', () => {
  persistDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  persistDb();
  process.exit(0);
});
