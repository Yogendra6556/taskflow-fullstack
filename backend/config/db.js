const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' 
  ? path.join(__dirname, '../test_taskflow.db') 
  : path.join(__dirname, '../taskflow.db');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

module.exports = db;
