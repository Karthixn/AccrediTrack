const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { queryAll, queryGet, queryRun } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('Admin'), (req, res) => {
  res.json(queryAll('SELECT id, name, email, role, department, created_at FROM users ORDER BY created_at DESC'));
});

router.put('/:id/role', authenticate, authorize('Admin'), (req, res) => {
  const { role } = req.body;
  const allowed = ['Admin', 'Faculty', 'HOD', 'Auditor'];
  if (!allowed.includes(role)) return res.status(400).json({ error: 'Invalid role' });
  queryRun('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  res.json({ message: 'Role updated' });
});

router.delete('/:id', authenticate, authorize('Admin'), (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  queryRun('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deleted' });
});

router.post('/', authenticate, authorize('Admin'), (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });
  const existing = queryGet('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(400).json({ error: 'Email already exists' });
  const hash = bcrypt.hashSync(password, 10);
  const result = queryRun('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)', [name, email, hash, role, department || '']);
  res.json({ message: 'User created', id: result.lastInsertRowid });
});

module.exports = router;
