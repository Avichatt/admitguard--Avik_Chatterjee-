import { getCandidates } from '../engine/store.js';
import { getRulesConfig } from '../engine/validator.js';
import { exportToCSV, exportToJSON } from '../engine/store.js';
import { showToast } from '../components/toast.js';

export function renderGridView(container, onNavigate) {
  const rules = getRulesConfig();
  let candidates = [];
  let filteredCandidates = [];

  getCandidates().then(data => {
    candidates = data;
    filteredCandidates = [...candidates].reverse();
    render();
  });
  let expandedRow = null;
  let searchTerm = '';

  const fieldLabels = {};
  rules.fields.forEach(f => { fieldLabels[f.fieldId] = f.label; });

  function render() {
    container.innerHTML = `
      <div class="grid-container">
        <div class="grid-toolbar">
          <div style="display:flex; align-items:center; gap: var(--space-md);">
            <h2 style="font-family:var(--font-heading); font-weight:700; font-size:24px;">📊 Candidate Entries</h2>
            <span class="entry-count">${filteredCandidates.length} entries</span>
          </div>
          <div class="grid-actions">
            <div class="grid-search">
              <span class="grid-search-icon">🔍</span>
              <input type="text" class="grid-search-input" id="grid-search" placeholder="Search by name, email, or status..." value="${searchTerm}" />
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-export-csv" title="Export as CSV">📄 CSV</button>
            <button class="btn btn-secondary btn-sm" id="btn-export-json" title="Export as JSON">📋 JSON</button>
            <button class="btn btn-primary btn-sm" id="btn-add-new">➕ Add New</button>
          </div>
        </div>
        ${filteredCandidates.length === 0 ? renderEmpty() : renderTable()}
      </div>
    `;

    attachListeners();
  }

  function renderEmpty() {
    return `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">No candidate entries yet</div>
          <button class="btn btn-primary" id="btn-add-first">➕ Add First Candidate</button>
        </div>
      </div>
    `;
  }

  function renderTable() {
    const headerCols = [
      'Name', 'Email', 'Phone', 'Qualification', 'Grad Year',
      '%/CGPA', 'Test Score', 'Interview', 'Exceptions', 'Status', 'Date'
    ];

    return `
      <div class="table-wrapper">
        <table class="data-table" id="entries-table">
          <thead>
            <tr>
              ${headerCols.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${filteredCandidates.map((c, i) => renderRow(c, i)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRow(c, index) {
    const statusBadge = c.status === 'flagged'
      ? '<span class="badge badge-error">🚨 Flagged</span>'
      : c.status === 'exception'
        ? '<span class="badge badge-warning">⚠️ Exception</span>'
        : '<span class="badge badge-success">✅ Clean</span>';

    const rowClass = `row-${c.status}`;
    const date = new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

    let html = `
      <tr class="${rowClass}" data-index="${index}" data-id="${c.id}">
        <td><strong>${c.data.fullName || '—'}</strong></td>
        <td>${c.data.email || '—'}</td>
        <td>${c.data.phone || '—'}</td>
        <td>${c.data.highestQualification || '—'}</td>
        <td>${c.data.graduationYear || '—'}</td>
        <td>${c.data.percentageCgpa || '—'}</td>
        <td>${c.data.screeningTestScore || '—'}</td>
        <td>${c.data.interviewStatus || '—'}</td>
        <td>${c.exceptionCount}</td>
        <td>${statusBadge}</td>
        <td>${date}</td>
      </tr>
    `;

    if (expandedRow === index) {
      html += renderRowDetail(c);
    }

    return html;
  }

  function renderRowDetail(c) {
    const details = rules.fields.map(f => `
      <div class="detail-item">
        <span class="detail-label">${fieldLabels[f.fieldId]}</span>
        <span class="detail-value">${c.data[f.fieldId] || '—'}</span>
      </div>
    `).join('');

    let exceptionHtml = '';
    if (c.exceptionCount > 0) {
      const exceptionItems = Object.entries(c.exceptions || {})
        .filter(([, exc]) => exc?.enabled)
        .map(([fieldId, exc]) => `
          <div class="exception-detail-item">
            <strong>${fieldLabels[fieldId] || fieldId}:</strong> ${exc.rationale}
          </div>
        `).join('');

      exceptionHtml = `
        <div class="exception-detail">
          <div class="exception-detail-title">⚠️ Exceptions Granted (${c.exceptionCount})</div>
          ${exceptionItems}
        </div>
      `;
    }

    return `
      <tr class="row-detail">
        <td colspan="11">
          <div class="detail-grid">${details}</div>
          ${exceptionHtml}
          <div style="margin-top: var(--space-md); font-size: 12px; color: var(--text-muted);">
            Submitted: ${new Date(c.createdAt).toLocaleString()} · ID: ${c.id}
          </div>
        </td>
      </tr>
    `;
  }

  function attachListeners() {
    document.getElementById('grid-search')?.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase();
      filteredCandidates = candidates.filter(c => {
        const searchable = `${c.data.fullName} ${c.data.email} ${c.status} ${c.data.interviewStatus}`.toLowerCase();
        return searchable.includes(searchTerm);
      }).reverse();
      expandedRow = null;
      render();
    });

    document.getElementById('btn-add-new')?.addEventListener('click', () => onNavigate('form'));
    document.getElementById('btn-add-first')?.addEventListener('click', () => onNavigate('form'));

    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      if (candidates.length === 0) {
        showToast('No data to export', 'warning');
        return;
      }
      exportToCSV();
      showToast('CSV exported successfully', 'success');
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      if (candidates.length === 0) {
        showToast('No data to export', 'warning');
        return;
      }
      exportToJSON();
      showToast('JSON exported successfully', 'success');
    });

    // Row click to expand
    document.querySelectorAll('#entries-table tbody tr:not(.row-detail)').forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.dataset.index);
        expandedRow = expandedRow === idx ? null : idx;
        render();
      });
    });
  }

  container.innerHTML = '<div class="grid-container"><div class="card"><div class="empty-state" style="padding: 4rem;">⏳ Loading data from server...</div></div></div>';
}
