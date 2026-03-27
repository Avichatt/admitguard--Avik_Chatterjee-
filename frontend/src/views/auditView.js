import { getAuditLog } from '../engine/store.js';

export function renderAuditView(container) {
  let activeFilter = 'ALL';
  let searchTerm = '';
  let currentLog = [];

  function render() {
    if (!document.getElementById('audit-layout-initialized')) {
      container.innerHTML = `
        <div class="audit-container" id="audit-layout-initialized">
          <div class="audit-header" style="flex-wrap: wrap;">
            <h2>📜 Audit Trail</h2>
            <div class="grid-search" style="flex-grow: 1; max-width: 400px; margin-left: auto;">
              <span class="grid-search-icon">🔍</span>
              <input type="text" class="grid-search-input" id="audit-search" placeholder="Search by date, email, or phone..." value="${searchTerm}" />
            </div>
            <div class="audit-filters" style="width: 100%; margin-top: var(--space-md);">
              ${renderFilterChip('ALL', 'All Events')}
              ${renderFilterChip('SUBMISSION', 'Submissions')}
              ${renderFilterChip('EXCEPTION_GRANTED', 'Exceptions')}
              ${renderFilterChip('MANAGER_REVIEW_FLAGGED', 'Flagged')}
            </div>
          </div>
          <div id="audit-timeline-target"></div>
        </div>
      `;
      attachListeners();
    }

    const terms = searchTerm.trim().split(/\s+/).filter(t => t.length > 0);

    const filtered = currentLog.filter(e => {
      if (activeFilter !== 'ALL' && e.type !== activeFilter) return false;

      if (terms.length > 0) {
        const timeStr = new Date(e.timestamp).toLocaleString().toLowerCase();
        const dateStr = new Date(e.timestamp).toLocaleDateString().toLowerCase();
        const email = (e.details.email || '').toLowerCase();
        const phone = (e.details.phone || '').toLowerCase();
        const searchable = `${timeStr} ${dateStr} ${email} ${phone} ${e.details.candidateName || ''}`.toLowerCase();
        if (!terms.every(term => searchable.includes(term))) {
          return false;
        }
      }
      return true;
    });

    const timelineTarget = document.getElementById('audit-timeline-target');
    if (timelineTarget) {
      timelineTarget.innerHTML = filtered.length === 0 ? renderEmpty() : renderTimeline(filtered);
    }
  }

  function renderFilterChip(value, label) {
    return `<button class="filter-chip ${activeFilter === value ? 'active' : ''}" data-filter="${value}">${label}</button>`;
  }

  function renderEmpty() {
    return `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">📜</div>
          <div class="empty-state-text">No audit events recorded yet</div>
        </div>
      </div>
    `;
  }

  function renderTimeline(events) {
    return `
      <div class="audit-timeline">
        ${events.map(e => renderEvent(e)).join('')}
      </div>
    `;
  }

  function renderEvent(event) {
    const time = new Date(event.timestamp).toLocaleString();
    const typeMap = {
      'SUBMISSION': { icon: '📝', dotClass: 'submission', label: 'Submission' },
      'EXCEPTION_GRANTED': { icon: '⚠️', dotClass: 'exception', label: 'Exception Granted' },
      'MANAGER_REVIEW_FLAGGED': { icon: '🚨', dotClass: 'flagged', label: 'Flagged for Review' }
    };

    const config = typeMap[event.type] || { icon: '📋', dotClass: 'submission', label: event.type };
    const d = event.details;

    let bodyHtml = '';
    let detailHtml = '';

    switch (event.type) {
      case 'SUBMISSION':
        bodyHtml = `<strong>${d.candidateName}</strong> (${d.email}) was submitted with status: <span class="badge badge-${d.status === 'clean' ? 'success' : d.status === 'flagged' ? 'error' : 'warning'}">${d.status}</span>`;
        if (d.exceptionCount > 0) {
          detailHtml = `${d.exceptionCount} exception(s) granted`;
        }
        break;
      case 'EXCEPTION_GRANTED':
        bodyHtml = `Exception granted for <strong>${d.candidateName}</strong> on field: <strong>${d.field}</strong>`;
        if (d.rationale) {
          detailHtml = `"${d.rationale}"`;
        }
        break;
      case 'MANAGER_REVIEW_FLAGGED':
        bodyHtml = `<strong>${d.candidateName}</strong> flagged for manager review with ${d.exceptionCount} exceptions`;
        if (d.reason) {
          detailHtml = d.reason;
        }
        break;
      default:
        bodyHtml = JSON.stringify(d);
    }

    return `
      <div class="audit-event">
        <div class="audit-event-dot ${config.dotClass}">${config.icon}</div>
        <div class="audit-event-content">
          <div class="audit-event-header">
            <span class="audit-event-type ${config.dotClass}">${config.label}</span>
            <span class="audit-event-time">${time}</span>
          </div>
          <div class="audit-event-body">${bodyHtml}</div>
          ${detailHtml ? `<div class="audit-event-detail">${detailHtml}</div>` : ''}
        </div>
      </div>
    `;
  }

  function attachListeners() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;

        // Update active class locally
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        render();
      });
    });

    document.getElementById('audit-search')?.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase();
      render();
    });
  }

  container.innerHTML = '<div class="audit-container"><div class="card"><div class="empty-state" style="padding: 4rem;">⏳ Loading audit trail...</div></div></div>';

  getAuditLog().then(data => {
    currentLog = data;
    render();
  });
}
