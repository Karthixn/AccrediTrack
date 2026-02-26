// Data Models
const NAAC_CHECKLIST = {
    "C1": { name: "Curricular Aspects", items: ["Curriculum plan & syllabus", "Value-added courses proof"] },
    "C2": { name: "Teaching-Learning and Evaluation", items: ["Faculty profiles", "Attendance & internal marks"] },
    "C3": { name: "Research, Innovations and Extension", items: ["Publications list", "Workshops/seminars evidence"] },
    "C4": { name: "Infrastructure and Learning Resources", items: ["Lab facilities photos"] },
    "C5": { name: "Student Support and Progression", items: ["Placement proof & summary"] },
    "C6": { name: "Governance, Leadership and Management", items: ["IQAC minutes & policies"] },
    "C7": { name: "Institutional Values and Best Practices", items: ["Best practices proof"] }
};

// State
let currentUser = JSON.parse(localStorage.getItem('accreditrack_user')) || null;
let documents = [];

const API_BASE = 'http://localhost:3000/api';

// DOM Elements
const loginPage = document.getElementById('login-page');
const mainLayout = document.getElementById('main-layout');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

const userNameEl = document.getElementById('user-name');
const userRoleEl = document.getElementById('user-role');
const userInitialEl = document.getElementById('user-initial');

const navLinks = document.querySelectorAll('.nav-link[data-target]');
const views = document.querySelectorAll('.view');
const criteriaCards = document.getElementById('criteria-cards');
const overviewMetrics = document.getElementById('overview-metrics');

const sidebar = document.getElementById('sidebar');
const menuOpen = document.getElementById('menu-open');
const menuClose = document.getElementById('menu-close');

// Upload Form Elements
const uploadForm = document.getElementById('upload-form');
const uploadCriterion = document.getElementById('upload-criterion');
const uploadChecklist = document.getElementById('upload-checklist');
const fileInput = document.getElementById('upload-file');
const fileMsg = document.querySelector('.file-msg');

// Docs Elements
const docsTbody = document.getElementById('docs-tbody');
const searchDocs = document.getElementById('search-docs');

// Initialize
async function init() {
    lucide.createIcons(); // Initialize Lucide Icons
    if (currentUser) {
        await fetchDocuments();
        showMainApp();
    } else {
        showLogin();
    }
    setupEventListeners();
}

async function fetchDocuments() {
    try {
        const res = await fetch(`${API_BASE}/documents`);
        documents = await res.json();
    } catch (err) {
        console.error("Failed to fetch documents", err);
    }
}

// Auth & Nav Logic
function setupEventListeners() {
    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = document.getElementById('login-role').value;
        const email = document.getElementById('login-email').value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role })
            });
            const data = await res.json();

            if (res.ok) {
                currentUser = data.user;
                localStorage.setItem('accreditrack_user', JSON.stringify(currentUser));
                loginForm.reset();
                await fetchDocuments();
                showMainApp();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error', err);
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('accreditrack_user');
        currentUser = null;
        showLogin();
    });

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget.getAttribute('data-target');
            if (target) switchView(target);

            // update active link
            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Sidebar Toggle
    if (menuOpen) menuOpen.addEventListener('click', () => sidebar.classList.add('open'));
    if (menuClose) menuClose.addEventListener('click', () => sidebar.classList.remove('open'));

    // Upload Form Handlers
    uploadCriterion.addEventListener('change', (e) => {
        const cCode = e.target.value;
        uploadChecklist.innerHTML = '<option value="">Select Checklist Item</option>';
        if (cCode && NAAC_CHECKLIST[cCode]) {
            NAAC_CHECKLIST[cCode].items.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item;
                opt.textContent = item;
                uploadChecklist.appendChild(opt);
            });
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileMsg.textContent = e.target.files[0].name;
            fileMsg.style.color = "var(--primary)";
        } else {
            fileMsg.textContent = "Drag & drop or click to browse";
            fileMsg.style.color = "var(--text-muted)";
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const docData = {
            title: document.getElementById('upload-title').value,
            criterionCode: uploadCriterion.value,
            checklistTitle: uploadChecklist.value,
            year: document.getElementById('upload-year').value,
            fileName: fileInput.files[0]?.name || 'Internal Record',
            uploadedBy: currentUser.email
        };

        try {
            const res = await fetch(`${API_BASE}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docData)
            });

            if (res.ok) {
                await fetchDocuments(); // Refresh data
                uploadForm.reset();
                uploadChecklist.innerHTML = '<option value="">Select Criterion First</option>';
                fileMsg.textContent = "Drag & drop or click to browse";
                fileMsg.style.color = "var(--text-muted)";

                showToast('Document uploaded successfully!');
                renderDashboard();
                renderDocsTable();
                document.querySelector('[data-target="dashboard-page"]').click();
            } else {
                const data = await res.json();
                alert(data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload Error', err);
        }
    });

    // Search
    searchDocs.addEventListener('input', (e) => {
        renderDocsTable(e.target.value);
    });
}

// Helpers
function showLogin() {
    loginPage.classList.add('active');
    mainLayout.classList.remove('active');
}

function showMainApp() {
    loginPage.classList.remove('active');
    mainLayout.classList.add('active');

    userNameEl.textContent = currentUser.name;
    userRoleEl.textContent = currentUser.role;
    userInitialEl.textContent = currentUser.name.charAt(0).toUpperCase();

    renderDashboard();
    renderDocsTable();

    // Trigger dashboard view
    document.querySelector('[data-target="dashboard-page"]').click();
}

function switchView(targetId) {
    views.forEach(view => {
        if (view.id === targetId) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });
}

// function saveDocs() {
//      localStorage.setItem('accreditrack_docs', JSON.stringify(documents));
// }

// Dashboard Logic
function renderDashboard() {
    criteriaCards.innerHTML = '';

    let totalReqItems = 0;
    let totalCompleted = 0;

    Object.keys(NAAC_CHECKLIST).forEach(cCode => {
        const criterion = NAAC_CHECKLIST[cCode];
        const requiredItems = criterion.items;
        totalReqItems += requiredItems.length;

        const completedItems = requiredItems.filter(item => {
            return documents.some(d => d.criterionCode === cCode && d.checklistTitle === item);
        });

        totalCompleted += completedItems.length;
        const missingItems = requiredItems.filter(item => !completedItems.includes(item));

        const completedCount = completedItems.length;
        const total = requiredItems.length;
        const readinessPercent = Math.round((completedCount / total) * 100) || 0;

        let statusClass = '';
        let statusText = '';
        let progressClass = '';
        let borderClass = '';
        let iconName = '';

        if (readinessPercent >= 80) {
            statusClass = 'tag-green';
            progressClass = 'progress-green';
            borderClass = 'card-border-green';
            statusText = 'On Track';
            iconName = 'check-circle';
        } else if (readinessPercent >= 50) {
            statusClass = 'tag-yellow';
            progressClass = 'progress-yellow';
            borderClass = 'card-border-yellow';
            statusText = 'In Progress';
            iconName = 'alert-circle';
        } else {
            statusClass = 'tag-red';
            progressClass = 'progress-red';
            borderClass = 'card-border-red';
            statusText = 'At Risk';
            iconName = 'alert-triangle';
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-decoration ${borderClass}"></div>
            <div class="card-header">
                <div class="card-title-wrap">
                    <span class="card-code">${cCode}</span>
                    <span class="card-name">${criterion.name}</span>
                </div>
                <div class="status-tag ${statusClass}">
                    <i data-lucide="${iconName}"></i> ${statusText}
                </div>
            </div>
            <div class="card-stats">
                <span>Readiness Score</span>
                <span class="stat-value">${readinessPercent}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar ${progressClass}" style="width: 0%" data-width="${readinessPercent}%"></div>
            </div>
            <div class="missing-items" style="margin-top:auto">
                ${missingItems.length > 0 ? `
                    <h4><i data-lucide="crosshair"></i> Gap Tracker</h4>
                    <ul class="missing-list">
                        ${missingItems.map(i => `<li><i data-lucide="x-circle"></i> ${i}</li>`).join('')}
                    </ul>
                ` : `
                    <div class="complete-msg">
                        <i data-lucide="check-circle-2"></i> Requirements fulfilled
                    </div>
                `}
            </div>
        `;
        criteriaCards.appendChild(card);
    });

    // Render Overview Metrics
    const overallReadiness = totalReqItems ? Math.round((totalCompleted / totalReqItems) * 100) : 0;

    overviewMetrics.innerHTML = `
        <div class="metric-card">
            <div class="metric-icon icon-blue"><i data-lucide="file-text"></i></div>
            <div class="metric-info">
                <h3>${documents.length}</h3>
                <p>Total Documents</p>
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-icon icon-green"><i data-lucide="check-square"></i></div>
            <div class="metric-info">
                <h3>${totalCompleted} / ${totalReqItems}</h3>
                <p>Items Completed</p>
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-icon icon-orange"><i data-lucide="activity"></i></div>
            <div class="metric-info">
                <h3>${overallReadiness}%</h3>
                <p>Overall Readiness</p>
            </div>
        </div>
    `;

    lucide.createIcons(); // Re-init icons for dynamic content

    // Animate progress bars
    setTimeout(() => {
        document.querySelectorAll('.progress-bar').forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
        });
    }, 100);
}

// Docs Table Logic
function renderDocsTable(searchTerm = '') {
    docsTbody.innerHTML = '';
    const filteredDocs = documents.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.checklistTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredDocs.length === 0) {
        docsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
            <i data-lucide="inbox" style="width:40px;height:40px;opacity:0.5;margin-bottom:1rem"></i>
            <p>No documents found matching your criteria.</p>
        </td></tr>`;
        lucide.createIcons();
        return;
    }

    filteredDocs.forEach(doc => {
        const tr = document.createElement('tr');
        const dateStr = new Date(doc.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        tr.innerHTML = `
            <td>
                <div class="doc-title-cell">
                    <div class="doc-icon"><i data-lucide="file"></i></div>
                    <div>
                        <div class="doc-name">${doc.title}</div>
                        <div class="doc-meta">${doc.fileName}</div>
                    </div>
                </div>
            </td>
            <td><span style="font-weight:600; color:var(--text-main)">${doc.criterionCode}</span></td>
            <td>${doc.checklistTitle}</td>
            <td>${doc.year}</td>
            <td>
                <div>${doc.uploadedBy}</div>
                <div class="doc-meta">${dateStr}</div>
            </td>
            <td class="text-right">
                <button class="btn btn-sm btn-danger-ghost" onclick="deleteDoc('${doc.id}')" title="Delete">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </td>
        `;
        docsTbody.appendChild(tr);
    });
    lucide.createIcons();
}

window.deleteDoc = async function (id) {
    if (confirm('Are you sure you want to remove this document? This will affect your readiness score.')) {
        try {
            const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchDocuments(); // Refresh data from backend
                renderDashboard();
                renderDocsTable(searchDocs.value);
                showToast('Document removed.');
            }
        } catch (err) {
            console.error('Delete error', err);
        }
    }
};

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i data-lucide="check-circle-2"></i> ${message}`;
    lucide.createIcons();

    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Run
init();
