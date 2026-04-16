const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryGet, queryRun } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

router.post('/register', (req, res) => {
  const { name, email, password, role = 'Faculty', department } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const allowed = ['Faculty', 'HOD', 'Auditor'];
  if (!allowed.includes(role)) return res.status(400).json({ error: 'Invalid role for self-registration' });
  try {
    const existing = queryGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = bcrypt.hashSync(password, 10);
    const result = queryRun('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)', [name, email, hash, role, department || '']);
    res.json({ message: 'Registered successfully', id: result.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = queryGet('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department } });
});

module.exports = router;
