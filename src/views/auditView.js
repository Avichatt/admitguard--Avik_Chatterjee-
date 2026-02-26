import { getAuditLog } from '../engine/store.js';

export function renderAuditView(container) {
  let activeFilter = 'ALL';

  function render(logData = []) {
    const log = logData;
    const filtered = activeFilter === 'ALL'
      ? log
      : log.filter(e => e.type === activeFilter);

    container.innerHTML = `
      <div class="audit-container">
        <div class="audit-header">
          <h2>📜 Audit Trail</h2>
          <div class="audit-filters">
            ${renderFilterChip('ALL', 'All Events')}
            ${renderFilterChip('SUBMISSION', 'Submissions')}
            ${renderFilterChip('EXCEPTION_GRANTED', 'Exceptions')}
            ${renderFilterChip('MANAGER_REVIEW_FLAGGED', 'Flagged')}
          </div>
        </div>
        ${filtered.length === 0 ? renderEmpty() : renderTimeline(filtered)}
      </div>
    `;

    attachListeners();
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
        render();
      });
    });
  }

  container.innerHTML = '<div class="audit-container"><div class="card"><div class="empty-state" style="padding: 4rem;">⏳ Loading audit trail...</div></div></div>';

  getAuditLog().then(data => {
    const currentLog = data.reverse();

    // Re-define render to use the fetched data so filters work without re-fetching
    render = function () {
      const filtered = activeFilter === 'ALL'
        ? currentLog
        : currentLog.filter(e => e.type === activeFilter);

      container.innerHTML = `
      <div class="audit-container">
        <div class="audit-header">
          <h2>📜 Audit Trail</h2>
          <div class="audit-filters">
            ${renderFilterChip('ALL', 'All Events')}
            ${renderFilterChip('SUBMISSION', 'Submissions')}
            ${renderFilterChip('EXCEPTION_GRANTED', 'Exceptions')}
            ${renderFilterChip('MANAGER_REVIEW_FLAGGED', 'Flagged')}
          </div>
        </div>
        ${filtered.length === 0 ? renderEmpty() : renderTimeline(filtered)}
      </div>
    `;
      attachListeners();
    };

    render();
  });
}
