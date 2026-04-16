const router = require('express').Router();
const { queryAll, queryGet } = require('../db');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  const totalFaculty = queryGet('SELECT COUNT(*) as c FROM faculty').c;
  const totalStudents = queryGet('SELECT COUNT(*) as c FROM students').c;
  const totalDocuments = queryGet('SELECT COUNT(*) as c FROM documents').c;
  const totalReports = queryGet('SELECT COUNT(*) as c FROM reports').c;
  const totalUsers = queryGet('SELECT COUNT(*) as c FROM users').c;
  const byDept = queryAll('SELECT department, COUNT(*) as count FROM faculty GROUP BY department');
  const byAchievement = queryAll('SELECT achievement_type, COUNT(*) as count FROM students GROUP BY achievement_type');
  const byRole = queryAll('SELECT role, COUNT(*) as count FROM users GROUP BY role');
  res.json({ totalFaculty, totalStudents, totalDocuments, totalReports, totalUsers, byDept, byAchievement, byRole });
});

module.exports = router;
