const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

beforeAll(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS columns (id INTEGER PRIMARY KEY AUTOINCREMENT, board_id INTEGER, name TEXT, position INTEGER);
    CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, column_id INTEGER, title TEXT NOT NULL, description TEXT, priority TEXT DEFAULT 'Medium', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  `);
  db.prepare("INSERT INTO boards (name) VALUES ('Test Board')").run();
  db.prepare("INSERT INTO columns (board_id, name, position) VALUES (1, 'To Do', 1), (1, 'Done', 2)").run();
});

afterAll(() => {
  db.exec('DROP TABLE IF EXISTS tasks; DROP TABLE IF EXISTS columns; DROP TABLE IF EXISTS boards;');
});

describe('TaskFlow API Tests', () => {
  // Test 1: Empty title should fail (400 Bad Request)
  it('should fail with 400 if task title is empty', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ column_id: 1, title: '', priority: 'High' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // Test 2: Moving a task updates its column
  it('should move a task to another column successfully', async () => {
    const task = await request(app)
      .post('/api/tasks')
      .send({ column_id: 1, title: 'Move Me', priority: 'Medium' });

    const moveRes = await request(app)
      .patch(`/api/tasks/${task.body.id}/move`)
      .send({ column_id: 2 });

    expect(moveRes.statusCode).toBe(200);
    expect(moveRes.body.column_id).toBe(2);
  });

  // Test 3: Direct DB Query testing (Tasks by priority)
  it('should query DB directly and filter by priority correctly', () => {
    db.prepare("INSERT INTO tasks (column_id, title, priority) VALUES (1, 'High Task', 'High')").run();
    const rows = db.prepare("SELECT * FROM tasks WHERE priority = ?").all('High');
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].priority).toBe('High');
  });
});
