const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// File paths for simple JSON DB
const usersFile = path.join(__dirname, 'data', 'users.json');
const docsFile = path.join(__dirname, 'data', 'documents.json');

// Helper to ensure data directory exists
function initDB() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify([]));
    }
    if (!fs.existsSync(docsFile)) {
        fs.writeFileSync(docsFile, JSON.stringify([]));
    }
}
initDB();

// Helper to read/write DB
function readData(file) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        return content.trim() ? JSON.parse(content) : [];
    } catch (err) {
        return [];
    }
}
function writeData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}


// ============== ROUTES ==============

// 1. Basic Login (Without real passwords/JWT for prototype)
app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ error: 'Email and role are required' });
    }

    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    // Create session object
    const userSession = { email, role, name: formattedName };
    res.json({ message: 'Login successful', user: userSession });
});

// 2. Get All Documents
app.get('/api/documents', (req, res) => {
    const docs = readData(docsFile);
    res.json(docs);
});

// 3. Upload Document Record (No actual file upload for this prototype)
app.post('/api/documents', (req, res) => {
    const { title, criterionCode, checklistTitle, year, fileName, uploadedBy } = req.body;

    if (!title || !criterionCode || !checklistTitle) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newDoc = {
        id: Date.now().toString(),
        title,
        criterionCode,
        checklistTitle,
        year: year || '2025-2026',
        fileName: fileName || 'Internal Record',
        uploadedBy: uploadedBy || 'System',
        createdAt: new Date().toISOString()
    };

    const docs = readData(docsFile);
    docs.unshift(newDoc); // Add to top
    writeData(docsFile, docs);

    res.status(201).json({ message: 'Document uploaded', document: newDoc });
});

// 4. Delete Document
app.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    let docs = readData(docsFile);

    const initialLen = docs.length;
    docs = docs.filter(d => d.id !== id);

    if (docs.length === initialLen) {
        return res.status(404).json({ error: 'Document not found' });
    }

    writeData(docsFile, docs);
    res.json({ message: 'Document deleted successfully' });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
