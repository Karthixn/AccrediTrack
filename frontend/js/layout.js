// Inject sidebar + topbar into any page
function renderLayout(pageTitle, activeNav) {
  if (!requireAuth()) return;
  const user = getUser();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`, roles: ['Admin','Faculty','HOD','Auditor'] },
    { id: 'faculty', label: 'Faculty', href: 'faculty.html', icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, roles: ['Admin','Faculty','HOD','Auditor'] },
    { id: 'students', label: 'Student Achievements', href: 'students.html', icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`, roles: ['Admin','Faculty','HOD','Auditor'] },
    { id: 'documents', label: 'Documents', href: 'documents.html', icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`, roles: ['Admin','Faculty','HOD','Auditor'] },
    { id: 'reports', label: 'Reports', href: 'reports.html', icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`, roles: ['Admin','Faculty','HOD','Auditor'] },
    { id: 'users', label: 'Manage Users', href: 'users.html', icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`, roles: ['Admin'] },
  ];

  const visibleNav = navItems.filter(n => n.roles.includes(user.role));
  const navHTML = visibleNav.map(n => `
    <a href="${n.href}" class="nav-item ${activeNav === n.id ? 'active' : ''}">
      ${n.icon} ${n.label}
    </a>`).join('');

  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div class="sidebar-title">AccrediTrack</div>
            <div class="sidebar-subtitle">Accreditation System</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-label">Navigation</div>
            ${navHTML}
          </div>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">${initials}</div>
            <div style="flex:1;min-width:0">
              <div class="user-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.name}</div>
              <div class="user-role">${user.role}</div>
            </div>
          </div>
          <button class="nav-item" onclick="logout()" style="margin-top:4px;color:var(--danger)">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>
      <div class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <button class="hamburger" id="hamburger" aria-label="Menu">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span class="topbar-title">${pageTitle}</span>
          </div>
          <div class="topbar-right">
            <span style="font-size:12px;color:var(--text-muted);background:var(--bg);padding:4px 10px;border-radius:20px;border:1px solid var(--border)">${user.role}</span>
          </div>
        </header>
        <div class="page-content" id="page-content"></div>
      </div>
    </div>
  `);

  // Re-init sidebar toggle after injection
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  hamburger?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); });
  overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
}

function logout() {
  localStorage.clear();
  window.location.href = '/index.html';
}
