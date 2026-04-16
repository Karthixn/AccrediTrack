const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'accreditrack.db');

let db;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Faculty',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS faculty (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      department TEXT,
      designation TEXT,
      qualification TEXT,
      experience INTEGER,
      publications INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_number TEXT UNIQUE NOT NULL,
      department TEXT,
      year INTEGER,
      achievement_type TEXT,
      achievement_title TEXT,
      achievement_date TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      filename TEXT NOT NULL,
      original_name TEXT,
      file_type TEXT,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT,
      content TEXT,
      generated_by INTEGER,
      status TEXT DEFAULT 'Draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed admin if not exists
  const adminRows = db.exec("SELECT id FROM users WHERE email = 'admin@accreditrack.com'");
  if (!adminRows.length || !adminRows[0].values.length) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)', ['System Admin', 'admin@accreditrack.com', adminHash, 'Admin', 'Administration']);
    db.run('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)', ['Dr. John Smith', 'faculty@accreditrack.com', bcrypt.hashSync('faculty123', 10), 'Faculty', 'Computer Science']);
    db.run('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)', ['Prof. Sarah Lee', 'hod@accreditrack.com', bcrypt.hashSync('hod123', 10), 'HOD', 'Computer Science']);
    db.run('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)', ['Mr. Audit Team', 'auditor@accreditrack.com', bcrypt.hashSync('audit123', 10), 'Auditor', 'Quality']);
    db.run('INSERT INTO faculty (name, department, designation, qualification, experience, publications) VALUES (?, ?, ?, ?, ?, ?)', ['Dr. John Smith', 'Computer Science', 'Associate Professor', 'Ph.D', 10, 15]);
    db.run('INSERT INTO faculty (name, department, designation, qualification, experience, publications) VALUES (?, ?, ?, ?, ?, ?)', ['Prof. Sarah Lee', 'Computer Science', 'Professor & HOD', 'Ph.D', 18, 32]);
    db.run('INSERT INTO faculty (name, department, designation, qualification, experience, publications) VALUES (?, ?, ?, ?, ?, ?)', ['Mr. Raj Kumar', 'Electronics', 'Assistant Professor', 'M.Tech', 5, 4]);
    db.run('INSERT INTO students (name, roll_number, department, year, achievement_type, achievement_title, achievement_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['Alice Johnson', 'CS2021001', 'Computer Science', 3, 'Academic', 'Best Project Award', '2024-03-15', 'Won best project at national hackathon']);
    db.run('INSERT INTO students (name, roll_number, department, year, achievement_type, achievement_title, achievement_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['Bob Williams', 'CS2021002', 'Computer Science', 3, 'Sports', 'State Chess Champion', '2024-02-10', 'Won state level chess championship']);
    db.run('INSERT INTO students (name, roll_number, department, year, achievement_type, achievement_title, achievement_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['Carol Davis', 'EC2022001', 'Electronics', 2, 'Cultural', 'Best Dancer Award', '2024-01-20', 'Won inter-college dance competition']);
    saveDb();
  }

  return { db, saveDb };
}

// Helpers to mimic better-sqlite3 sync API using sql.js
function queryAll(sql, params = []) {
  const result = db.exec(sql.replace(/\?/g, () => '?'), params.length ? undefined : undefined);
  // sql.js exec doesn't support params well for SELECT, use prepare
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryGet(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function queryRun(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0];
  saveDb();
  return { lastInsertRowid: lastId };
}

module.exports = { initDb, queryAll, queryGet, queryRun, saveDb, getDb: () => db };
