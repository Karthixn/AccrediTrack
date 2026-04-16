const router = require('express').Router();
const { queryAll, queryRun } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  const { search, department } = req.query;
  let sql = 'SELECT * FROM faculty WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND (name LIKE ? OR designation LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (department) { sql += ' AND department = ?'; params.push(department); }
  sql += ' ORDER BY id DESC';
  res.json(queryAll(sql, params));
});

router.post('/', authenticate, authorize('Admin', 'HOD'), (req, res) => {
  const { name, department, designation, qualification, experience, publications } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const result = queryRun('INSERT INTO faculty (name, department, designation, qualification, experience, publications) VALUES (?, ?, ?, ?, ?, ?)', [name, department || '', designation || '', qualification || '', parseInt(experience) || 0, parseInt(publications) || 0]);
  res.json({ message: 'Faculty added', id: result.lastInsertRowid });
});

router.put('/:id', authenticate, authorize('Admin', 'HOD'), (req, res) => {
  const { name, department, designation, qualification, experience, publications } = req.body;
  queryRun('UPDATE faculty SET name=?, department=?, designation=?, qualification=?, experience=?, publications=? WHERE id=?', [name, department || '', designation || '', qualification || '', parseInt(experience) || 0, parseInt(publications) || 0, req.params.id]);
  res.json({ message: 'Faculty updated' });
});

router.delete('/:id', authenticate, authorize('Admin', 'HOD'), (req, res) => {
  queryRun('DELETE FROM faculty WHERE id = ?', [req.params.id]);
  res.json({ message: 'Faculty deleted' });
});

module.exports = router;
