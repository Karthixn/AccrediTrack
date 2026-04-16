const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/students', require('./routes/students'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));

// Fallback to frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

const PORT = process.env.PORT || 3000;

initDb().then(() => {
  app.listen(PORT, () => console.log(`\n✅ AccrediTrack running at http://localhost:${PORT}\n\nDemo accounts:\n  Admin:   admin@accreditrack.com / admin123\n  Faculty: faculty@accreditrack.com / faculty123\n  HOD:     hod@accreditrack.com / hod123\n  Auditor: auditor@accreditrack.com / audit123\n`));
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
