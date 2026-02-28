import './styles/index.css';
import './styles/form.css';
import './styles/grid.css';
import './styles/dashboard.css';
import './styles/audit.css';
import './styles/login.css';

import { renderFormView } from './views/formView.js';
import { renderGridView } from './views/gridView.js';
import { renderAuditView } from './views/auditView.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderLoginView } from './views/loginView.js';

const VIEWS = {
  form: { label: 'New Entry', icon: '📝' },
  entries: { label: 'Entries', icon: '📊' },
  audit: { label: 'Audit Log', icon: '📜' },
  dashboard: { label: 'Dashboard', icon: '📈' },
};

let currentView = 'form';

function checkAuth() {
  const session = sessionStorage.getItem('admitguard_session');
  const app = document.getElementById('app');

  if (!session) {
    renderLoginView(app, () => {
      sessionStorage.setItem('admitguard_session', 'true');
      init();
    });
    return false;
  }
  return true;
}

function init() {
  if (!checkAuth()) return;

  const app = document.getElementById('app');

  // Default to dark theme (matches Futurense homepage)
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const isDark = savedTheme === 'dark';

  app.innerHTML = `
    <header class="app-header">
      <div class="header-inner">
        <div class="app-logo">
          <div class="app-logo-icon">AV</div>
          <span class="app-logo-text">Admitguard</span>
        </div>
        <nav class="nav-tabs" id="nav-tabs">
          ${Object.entries(VIEWS).map(([id, v]) => `
            <button class="nav-tab ${id === currentView ? 'active' : ''}" data-view="${id}" id="nav-${id}">
              <span class="nav-tab-icon">${v.icon}</span>
              <span>${v.label}</span>
            </button>
          `).join('')}
        </nav>
        <div class="header-actions">
          <button id="logout-btn" class="btn btn-secondary btn-sm" style="margin-right: 10px;">Logout</button>
          <button class="theme-toggle" id="theme-toggle" title="Toggle dark/light mode">
            ${isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
    <main class="main-content" id="main-content"></main>
  `;

  // Navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => navigateTo(tab.dataset.view));
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('admitguard_session');
    window.location.reload();
  });

  // Render initial view
  renderView(currentView);
}

function navigateTo(view) {
  currentView = view;
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  renderView(view);
}

function renderView(view) {
  const content = document.getElementById('main-content');
  if (!content) return;
  content.innerHTML = '';

  switch (view) {
    case 'form': renderFormView(content, navigateTo); break;
    case 'entries': renderGridView(content, navigateTo); break;
    case 'audit': renderAuditView(content); break;
    case 'dashboard': renderDashboardView(content, navigateTo); break;
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);

  const btn = document.getElementById('theme-toggle');
  btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

// Init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
