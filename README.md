# AccrediTrack – Role-Based Accreditation Data Management System

A full-stack web application for managing institutional accreditation data including faculty records, student achievements, documents, and report generation — with role-based access control.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite via sql.js (pure JS, no native build) |
| Auth | JWT (JSON Web Tokens) |
| Charts | Chart.js |
| PDF Export | PDFKit |
| File Upload | Multer |

---

## Project Structure

```
accreditrack/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # JWT authentication & role authorization
│   ├── routes/
│   │   ├── auth.js           # Login & registration
│   │   ├── users.js          # User management (Admin only)
│   │   ├── faculty.js        # Faculty CRUD
│   │   ├── students.js       # Student achievements CRUD
│   │   ├── documents.js      # File upload & download
│   │   ├── reports.js        # Report generation & PDF export
│   │   └── stats.js          # Dashboard statistics
│   ├── uploads/              # Uploaded files (auto-created)
│   ├── db.js                 # Database init, seed data, query helpers
│   ├── server.js             # Express app entry point
│   └── package.json
│
└── frontend/
    ├── css/
    │   └── style.css         # Global styles, layout, components
    ├── js/
    │   ├── api.js            # Fetch wrapper, toast, modal helpers
    │   └── layout.js         # Sidebar & topbar renderer
    ├── index.html            # Login / Register
    ├── dashboard.html        # Stats cards + charts
    ├── faculty.html          # Faculty management
    ├── students.html         # Student achievements
    ├── documents.html        # Document upload & preview
    ├── reports.html          # Report generation & PDF viewer
    └── users.html            # User & role management (Admin only)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation

```bash
# Clone or download the project
cd accreditrack/backend

# Install dependencies
npm install

# Start the server
node server.js
```

The app will be available at **http://localhost:3000**

> To run with auto-restart on file changes, install nodemon:
> ```bash
> npm install -g nodemon
> nodemon server.js
> ```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@accreditrack.com | admin123 |
| Faculty | faculty@accreditrack.com | faculty123 |
| HOD | hod@accreditrack.com | hod123 |
| Auditor | auditor@accreditrack.com | audit123 |

---

## Roles & Permissions

| Feature | Admin | HOD | Faculty | Auditor |
|---------|:-----:|:---:|:-------:|:-------:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Faculty | ✅ | ✅ | ✅ | ✅ |
| Add / Edit Faculty | ✅ | ✅ | ❌ | ❌ |
| Delete Faculty | ✅ | ✅ | ❌ | ❌ |
| View Students | ✅ | ✅ | ✅ | ✅ |
| Add / Edit Achievements | ✅ | ✅ | ✅ | ❌ |
| Delete Achievements | ✅ | ✅ | ❌ | ❌ |
| Upload Documents | ✅ | ✅ | ✅ | ✅ |
| Delete Documents | ✅ | ✅ | ❌ | ❌ |
| Generate Reports | ✅ | ✅ | ❌ | ❌ |
| View & Download Reports | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ |

---

## Features

### Authentication
- JWT-based login and registration
- Tokens stored in `localStorage`, sent via `Authorization: Bearer` header
- Role-based route protection on both frontend (UI visibility) and backend (API middleware)
- Session expires after 8 hours

### Dashboard
- Live statistics: total faculty, student achievements, documents, reports, users
- Bar chart — faculty count by department
- Pie chart — student achievements by type
- Doughnut chart — users by role
- Quick action buttons to navigate to key modules

### Faculty Management
- Add, edit, delete faculty records
- Fields: name, department, designation, qualification, experience, publications
- Search by name or designation
- Filter by department

### Student Achievements
- Track academic, sports, cultural, and technical achievements
- Fields: student name, roll number, department, year, achievement type, title, date, description
- Search and multi-filter (department + achievement type)

### Document Management
- Upload PDF, images (JPG, PNG), and Word documents (max 10MB)
- Drag & drop upload zone
- In-browser preview modal for PDFs and images
- Authenticated download (token-protected)
- Filter by category: Accreditation, Faculty, Student, Research, Administrative

### Report Generation
- Generate comprehensive accreditation reports with one click
- Reports include all faculty, student achievements, and document data
- View report in-browser via PDF preview modal
- Download as PDF directly
- Reports stored with author, type, status, and timestamp

### User Management (Admin only)
- View all registered users
- Create new users with any role
- Change user roles via inline dropdown
- Delete users (cannot delete own account)

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user (Faculty/HOD/Auditor) |
| POST | `/api/auth/login` | Public | Login, returns JWT token |

### Faculty
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/faculty` | All | List faculty (supports `?search=&department=`) |
| POST | `/api/faculty` | Admin, HOD | Add faculty |
| PUT | `/api/faculty/:id` | Admin, HOD | Update faculty |
| DELETE | `/api/faculty/:id` | Admin, HOD | Delete faculty |

### Students
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/students` | All | List achievements (supports `?search=&department=&achievement_type=`) |
| POST | `/api/students` | Admin, HOD, Faculty | Add achievement |
| PUT | `/api/students/:id` | Admin, HOD, Faculty | Update achievement |
| DELETE | `/api/students/:id` | Admin, HOD | Delete achievement |

### Documents
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/documents` | All | List documents (supports `?search=&category=`) |
| POST | `/api/documents` | All | Upload document (multipart/form-data) |
| GET | `/api/documents/download/:id` | All | Download file |
| DELETE | `/api/documents/:id` | Admin, HOD | Delete document |

### Reports
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reports` | All | List all reports |
| POST | `/api/reports/generate` | Admin, HOD | Generate new report |
| GET | `/api/reports/:id/pdf` | All | Stream report as PDF |
| DELETE | `/api/reports/:id` | Admin | Delete report |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/:id/role` | Admin | Update user role |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Stats
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/stats` | All | Dashboard statistics & chart data |

---

## Database Schema

```sql
users         — id, name, email, password (bcrypt), role, department, created_at
faculty       — id, user_id, name, department, designation, qualification, experience, publications, created_at
students      — id, name, roll_number, department, year, achievement_type, achievement_title, achievement_date, description, created_at
documents     — id, title, category, filename, original_name, file_type, uploaded_by, created_at
reports       — id, title, type, content (JSON), generated_by, status, created_at
```

The database is stored as `backend/accreditrack.db` and is auto-created with seed data on first run.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | `accreditrack_secret_2024` | JWT signing secret |

For production, set these in a `.env` file:

```env
PORT=3000
JWT_SECRET=your_strong_random_secret_here
```

---

## Security Notes

- Passwords are hashed with bcrypt (salt rounds: 10)
- All API routes except `/api/auth/*` require a valid JWT
- Role checks are enforced server-side on every protected route
- File uploads are restricted to allowed extensions and 10MB max size
- Self-deletion is prevented for admin accounts

---

## License

MIT License — free to use, modify, and distribute.
