import { getStats, getCandidates } from '../engine/store.js';
import { getRulesConfig } from '../engine/validator.js';

export function renderDashboardView(container, onNavigate) {
  container.innerHTML = '<div class="dashboard-container"><div class="card"><div class="empty-state" style="padding: 4rem;">⏳ Loading dashboard data...</div></div></div>';

  Promise.all([getStats(), getCandidates()]).then(([stats, candidates]) => {
    const rules = getRulesConfig();
    const fieldLabels = {};
    rules.fields.forEach(f => { fieldLabels[f.fieldId] = f.label; });
    container.innerHTML = `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h2>📈 Dashboard</h2>
        <div class="quick-actions">
          <button class="btn btn-primary btn-sm" id="dash-add-new">➕ Add Candidate</button>
          <button class="btn btn-secondary btn-sm" id="dash-view-audit">📜 Audit Log</button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stat-grid">
        <div class="stat-card accent">
          <span class="stat-icon">📊</span>
          <span class="stat-label">Total Submissions</span>
          <span class="stat-value">${stats.total}</span>
        </div>
        <div class="stat-card success">
          <span class="stat-icon">✅</span>
          <span class="stat-label">Clean Entries</span>
          <span class="stat-value">${stats.clean}</span>
        </div>
        <div class="stat-card warning">
          <span class="stat-icon">⚠️</span>
          <span class="stat-label">Exception Rate</span>
          <span class="stat-value">${stats.exceptionRate}%</span>
        </div>
        <div class="stat-card error">
          <span class="stat-icon">🚨</span>
          <span class="stat-label">Flagged for Review</span>
          <span class="stat-value">${stats.flagged}</span>
        </div>
      </div>

      <!-- Charts -->
      <div class="chart-section">
        <!-- Exceptions by Field -->
        <div class="chart-card">
          <div class="chart-card-title">Exceptions by Field</div>
          ${renderBarChart(stats.exceptionsByField, fieldLabels, stats.total)}
        </div>

        <!-- Status Distribution -->
        <div class="chart-card">
          <div class="chart-card-title">Status Distribution</div>
          ${renderDonut(stats)}
        </div>
      </div>

      <!-- Recent Entries -->
      <div class="recent-entries">
        <div class="recent-entries-title">Recent Entries</div>
        ${renderRecentEntries(candidates)}
      </div>
    </div>
  `;

    document.getElementById('dash-add-new')?.addEventListener('click', () => onNavigate('form'));
    document.getElementById('dash-view-audit')?.addEventListener('click', () => onNavigate('audit'));
  });
}

function renderBarChart(exceptionsByField, fieldLabels, total) {
  const entries = Object.entries(exceptionsByField);
  if (entries.length === 0) {
    return '<div class="empty-state" style="padding: var(--space-lg);"><div class="empty-state-icon" style="font-size:32px;">📊</div><div class="empty-state-text" style="font-size:13px;">No exceptions recorded yet</div></div>';
  }

  const maxCount = Math.max(...entries.map(([, count]) => count), 1);

  return `
    <div class="bar-chart">
      ${entries.map(([fieldId, count]) => {
    const pct = Math.max((count / maxCount) * 100, 8);
    return `
          <div class="bar-row">
            <span class="bar-label">${fieldLabels[fieldId] || fieldId}</span>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${pct}%">
                ${pct > 25 ? `<span class="bar-value">${count}</span>` : ''}
              </div>
            </div>
            ${pct <= 25 ? `<span class="bar-value-outside">${count}</span>` : ''}
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function renderDonut(stats) {
  const total = stats.total || 1;
  const segments = [
    { label: 'Clean', count: stats.clean, cls: 'clean', color: '#10b981' },
    { label: 'Exceptions', count: stats.withExceptions, cls: 'exception', color: '#f59e0b' },
    { label: 'Flagged', count: stats.flagged, cls: 'flagged', color: '#ef4444' }
  ];

  // Build conic gradient
  let accumulated = 0;
  const gradientParts = [];
  segments.forEach(s => {
    const pct = (s.count / total) * 100;
    if (pct > 0) {
      gradientParts.push(`${s.color} ${accumulated}% ${accumulated + pct}%`);
    }
    accumulated += pct;
  });

  // Handle empty case
  const gradient = gradientParts.length > 0
    ? `conic-gradient(${gradientParts.join(', ')})`
    : 'conic-gradient(var(--border) 0% 100%)';

  return `
    <div class="donut-container">
      <div class="donut" style="background: ${gradient}">
        <div class="donut-center">
          <span class="donut-total">${stats.total}</span>
          <span class="donut-label">Total</span>
        </div>
      </div>
      <div class="donut-legend">
        ${segments.map(s => `
          <div class="legend-item">
            <div class="legend-dot ${s.cls}"></div>
            <span class="legend-count">${s.count}</span>
            <span class="legend-label">${s.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRecentEntries(candidates) {
  const recent = candidates.slice(-5).reverse();
  if (recent.length === 0) {
    return '<div style="color: var(--text-muted); font-size: 14px; padding: var(--space-md);">No entries yet</div>';
  }

  return `
    <div class="recent-list">
      ${recent.map(c => {
    const time = new Date(c.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const badge = c.status === 'flagged'
      ? '<span class="badge badge-error">Flagged</span>'
      : c.status === 'exception'
        ? '<span class="badge badge-warning">Exception</span>'
        : '<span class="badge badge-success">Clean</span>';

    return `
          <div class="recent-item">
            <span class="recent-item-name">${c.data.fullName}</span>
            <div class="recent-item-meta">
              ${badge}
              <span class="recent-item-time">${time}</span>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}
