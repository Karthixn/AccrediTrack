const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { queryAll, queryGet, queryRun } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});

router.get('/', authenticate, (req, res) => {
  const { search, category } = req.query;
  let sql = 'SELECT d.*, u.name as uploader FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND (d.title LIKE ? OR d.category LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category) { sql += ' AND d.category = ?'; params.push(category); }
  sql += ' ORDER BY d.id DESC';
  res.json(queryAll(sql, params));
});

router.post('/', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required' });
  const { title, category } = req.body;
  const result = queryRun('INSERT INTO documents (title, category, filename, original_name, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)', [title || req.file.originalname, category || 'Other', req.file.filename, req.file.originalname, req.file.mimetype, req.user.id]);
  res.json({ message: 'Document uploaded', id: result.lastInsertRowid });
});

router.get('/download/:id', authenticate, (req, res) => {
  const doc = queryGet('SELECT * FROM documents WHERE id = ?', [req.params.id]);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.download(path.join(uploadDir, doc.filename), doc.original_name);
});

router.delete('/:id', authenticate, authorize('Admin', 'HOD'), (req, res) => {
  const doc = queryGet('SELECT * FROM documents WHERE id = ?', [req.params.id]);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  try { fs.unlinkSync(path.join(uploadDir, doc.filename)); } catch {}
  queryRun('DELETE FROM documents WHERE id = ?', [req.params.id]);
  res.json({ message: 'Document deleted' });
});

module.exports = router;
