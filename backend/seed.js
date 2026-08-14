const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file create ya connect karo
const dbPath = path.join(__dirname, 'taskflow.db');
const db = new Database(dbPath);

console.log('🌱 Starting database seeding...');

// 1. Tables drop aur recreate karo (Fresh start ke liye)
db.exec(`
  DROP TABLE IF EXISTS tasks;
  DROP TABLE IF EXISTS columns;
  DROP TABLE IF EXISTS boards;

  CREATE TABLE boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  );

  CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    column_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
  );
`);

// 2. Default Board insert karo
const insertBoard = db.prepare(`INSERT INTO boards (name) VALUES (?)`);
const boardResult = insertBoard.run('Project Roadmap');
const boardId = boardResult.lastInsertRowid;

// 3. Default Columns insert karo
const insertColumn = db.prepare(`INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)`);
const colToDo = insertColumn.run(boardId, 'To Do', 1).lastInsertRowid;
const colInProgress = insertColumn.run(boardId, 'In Progress', 2).lastInsertRowid;
const colDone = insertColumn.run(boardId, 'Done', 3).lastInsertRowid;

// 4. Sample Tasks insert karo
const insertTask = db.prepare(`
  INSERT INTO tasks (column_id, title, description, priority) 
  VALUES (?, ?, ?, ?)
`);

// Sample Data
insertTask.run(colToDo, 'Setup CI/CD Pipeline', 'Configure GitHub Actions for automated deployment', 'High');
insertTask.run(colToDo, 'Design Dark Mode UI', 'Add theme switcher and update color palette', 'Low');

insertTask.run(colInProgress, 'Develop Task Filtering', 'Filter tasks by priority (Low, Medium, High)', 'Medium');
insertTask.run(colInProgress, 'Write Backend Tests', 'Add unit tests for API routes and query helpers', 'High');

insertTask.run(colDone, 'Project Kickoff & Setup', 'Initialize repo, structure folders, and create README', 'Medium');

console.log('✅ Database seeded successfully with sample board, columns, and tasks!');
process.exit(0);
