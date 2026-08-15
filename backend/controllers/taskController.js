const db = require('../config/db');

// 1. Board ke Columns + Tasks fetch karna
exports.getBoardData = (req, res) => {
  try {
    const board = db.prepare('SELECT * FROM boards LIMIT 1').get();
    if (!board) return res.status(404).json({ error: 'No board found. Run seed script.' });

    const columns = db.prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC').all(board.id);
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();

    const formattedColumns = columns.map(col => ({
      ...col,
      tasks: tasks.filter(t => t.column_id === col.id)
    }));

    res.json({ board, columns: formattedColumns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Task create karna (Validation included)
exports.createTask = (req, res) => {
  try {
    const { column_id, title, description, priority } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    if (!column_id) {
      return res.status(400).json({ error: 'Column ID is required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (column_id, title, description, priority)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(column_id, title.trim(), description || '', priority || 'Medium');

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Task edit karna
exports.updateTask = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title cannot be empty.' });
    }

    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, priority = ?
      WHERE id = ?
    `);
    const info = stmt.run(title.trim(), description || '', priority || 'Medium', id);

    if (info.changes === 0) return res.status(404).json({ error: 'Task not found' });

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Move Task to another column
exports.moveTask = (req, res) => {
  try {
    const { id } = req.params;
    const { column_id } = req.body;

    if (!column_id) return res.status(400).json({ error: 'Target column_id is required' });

    const stmt = db.prepare('UPDATE tasks SET column_id = ? WHERE id = ?');
    const info = stmt.run(column_id, id);

    if (info.changes === 0) return res.status(404).json({ error: 'Task not found' });

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Delete Task
exports.deleteTask = (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully', id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Required SQL Query 1: Tasks per Column count
exports.getTaskCountsPerColumn = (req, res) => {
  try {
    const sql = `
      SELECT c.id AS column_id, c.name AS column_name, COUNT(t.id) AS task_count
      FROM columns c
      LEFT JOIN tasks t ON c.id = t.column_id
      GROUP BY c.id, c.name
      ORDER BY c.position ASC
    `;
    const results = db.prepare(sql).all();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Required SQL Query 2: Filter by Priority (Newest First)
exports.getTasksByPriority = (req, res) => {
  try {
    const { priority } = req.query;
    let sql = 'SELECT * FROM tasks';
    const params = [];

    if (priority && priority !== 'All') {
      sql += ' WHERE priority = ?';
      params.push(priority);
    }
    sql += ' ORDER BY created_at DESC';

    const results = db.prepare(sql).all(...params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
