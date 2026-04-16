const router = require('express').Router();
const { queryAll, queryGet, queryRun } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  const { search, department, achievement_type } = req.query;
  let sql = 'SELECT * FROM students WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND (name LIKE ? OR roll_number LIKE ? OR achievement_title LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (department) { sql += ' AND department = ?'; params.push(department); }
  if (achievement_type) { sql += ' AND achievement_type = ?'; params.push(achievement_type); }
  sql += ' ORDER BY id DESC';
  res.json(queryAll(sql, params));
});

router.post('/', authenticate, authorize('Admin', 'HOD', 'Faculty'), (req, res) => {
  const { name, roll_number, department, year, achievement_type, achievement_title, achievement_date, description } = req.body;
  if (!name || !roll_number) return res.status(400).json({ error: 'Name and roll number required' });
  const existing = queryGet('SELECT id FROM students WHERE roll_number = ?', [roll_number]);
  if (existing) return res.status(400).json({ error: 'Roll number already exists' });
  const result = queryRun('INSERT INTO students (name, roll_number, department, year, achievement_type, achievement_title, achievement_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, roll_number, department || '', parseInt(year) || 1, achievement_type || '', achievement_title || '', achievement_date || '', description || '']);
  res.json({ message: 'Achievement added', id: result.lastInsertRowid });
});

router.put('/:id', authenticate, authorize('Admin', 'HOD', 'Faculty'), (req, res) => {
  const { name, roll_number, department, year, achievement_type, achievement_title, achievement_date, description } = req.body;
  queryRun('UPDATE students SET name=?, roll_number=?, department=?, year=?, achievement_type=?, achievement_title=?, achievement_date=?, description=? WHERE id=?', [name, roll_number, department || '', parseInt(year) || 1, achievement_type || '', achievement_title || '', achievement_date || '', description || '', req.params.id]);
  res.json({ message: 'Student updated' });
});

router.delete('/:id', authenticate, authorize('Admin', 'HOD'), (req, res) => {
  queryRun('DELETE FROM students WHERE id = ?', [req.params.id]);
  res.json({ message: 'Student deleted' });
});

module.exports = router;
