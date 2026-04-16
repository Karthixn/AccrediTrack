const API = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('at_token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('at_user')); } catch { return null; } }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  if (options.body instanceof FormData) delete headers['Content-Type'];
  const res = await fetch(API + path, { ...options, headers });
  if (res.status === 401) { localStorage.clear(); window.location.href = '/index.html'; return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function requireAuth() {
  if (!getToken()) { window.location.href = '/index.html'; return false; }
  return true;
}

function applyRoleVisibility() {
  const user = getUser();
  if (!user) return;
  document.querySelectorAll('[data-roles]').forEach(el => {
    const roles = el.dataset.roles.split(',').map(r => r.trim());
    el.style.display = roles.includes(user.role) ? '' : 'none';
  });
}

function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) { container = document.createElement('div'); container.id = 'toast-container'; container.className = 'toast-container'; document.body.appendChild(container); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type === 'success' ? iconCheck() : iconX()} ${msg}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function iconCheck() { return `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`; }
function iconX() { return `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`; }

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.getElementById(id).querySelector('form')?.reset(); }

function roleBadge(role) {
  const map = { Admin: 'badge-admin', Faculty: 'badge-faculty', HOD: 'badge-hod', Auditor: 'badge-auditor' };
  return `<span class="badge ${map[role] || ''}">${role}</span>`;
}

function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

function debounce(fn, ms = 300) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

// Sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (hamburger) {
    hamburger.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); });
    overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
  }
  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });
});
