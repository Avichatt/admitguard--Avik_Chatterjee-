import { getRulesConfig, validateField, validateForm, validateRationale } from '../engine/validator.js';
import { saveCandidate, fetchAllEmails } from '../engine/store.js';
import { showToast } from '../components/toast.js';

export function renderFormView(container, onNavigate) {
  const rules = getRulesConfig();
  const formData = {};
  const exceptions = {};
  const touched = {};
  let existingEmails = [];

  // Fetch emails in background
  fetchAllEmails().then(emails => {
    existingEmails = emails;
    if (touched['email'] && formData['email']) {
      handleFieldChange('email', formData['email']);
    }
  });

  container.innerHTML = `
    <div class="form-container">
      <div class="form-header">
        <h2>📋 New Candidate Entry</h2>
        <p>Fill in candidate details. Fields are validated in real-time against eligibility rules.</p>
      </div>
      <div id="exception-banner" class="exception-banner level-0" style="display:none;"></div>
      <form id="candidate-form" novalidate>
        <div class="form-grid" id="form-fields"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btn-reset">🔄 Reset Form</button>
          <button type="submit" class="btn btn-primary" id="btn-submit" disabled>✅ Submit Candidate</button>
        </div>
      </form>
    </div>
  `;

  const fieldsContainer = document.getElementById('form-fields');
  const form = document.getElementById('candidate-form');
  const submitBtn = document.getElementById('btn-submit');
  const exceptionBanner = document.getElementById('exception-banner');

  // Render all fields
  rules.fields.forEach(field => {
    formData[field.fieldId] = '';
    const group = document.createElement('div');
    group.className = 'form-group';
    if (field.fieldId === 'aadhaarNumber') group.classList.add('full-width');

    const ruleBadge = `<span class="rule-badge ${field.ruleCategory}">${field.ruleCategory}</span>`;

    group.innerHTML = `
      <label class="form-label" for="field-${field.fieldId}">
        ${field.label} <span class="required">*</span> ${ruleBadge}
      </label>
      <div class="field-wrapper">
        ${renderInput(field)}
      </div>
      <div id="msg-${field.fieldId}" class="field-messages"></div>
      ${field.exceptionAllowed ? `<div id="exc-${field.fieldId}" class="exception-container"></div>` : ''}
    `;

    fieldsContainer.appendChild(group);

    // Attach input listeners
    const input = group.querySelector(`#field-${field.fieldId}`);
    input.addEventListener('input', () => handleFieldChange(field.fieldId, input.value));
    input.addEventListener('change', () => handleFieldChange(field.fieldId, input.value));
    input.addEventListener('blur', () => {
      touched[field.fieldId] = true;
      handleFieldChange(field.fieldId, input.value);
    });
  });

  // Reset button
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
      renderFormView(container, onNavigate);
    }
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(onNavigate);
  });

  function renderInput(field) {
    if (field.type === 'select') {
      const options = field.options.map(o => `<option value="${o}">${o}</option>`).join('');
      return `<select id="field-${field.fieldId}" class="form-select">
        <option value="">Select ${field.label}...</option>
        ${options}
      </select>`;
    }

    const attrs = [];
    if (field.placeholder) attrs.push(`placeholder="${field.placeholder}"`);
    if (field.step) attrs.push(`step="${field.step}"`);
    if (field.type === 'number') attrs.push('inputmode="decimal"');

    return `<input type="${field.type === 'number' ? 'text' : field.type}" id="field-${field.fieldId}" class="form-input" ${attrs.join(' ')} autocomplete="off" />`;
  }

  function handleFieldChange(fieldId, value) {
    formData[fieldId] = value;
    touched[fieldId] = true;

    const result = validateField(fieldId, value, formData, null, existingEmails);
    const input = document.getElementById(`field-${fieldId}`);
    const msgEl = document.getElementById(`msg-${fieldId}`);
    const excEl = document.getElementById(`exc-${fieldId}`);

    // Update input styling
    input.classList.remove('valid', 'invalid', 'exception');
    if (value && touched[fieldId]) {
      if (result.valid) {
        input.classList.add('valid');
      } else if (result.exceptionAllowed && exceptions[fieldId]?.enabled) {
        input.classList.add('exception');
      } else {
        input.classList.add('invalid');
      }
    }

    // Update messages
    if (touched[fieldId]) {
      if (result.valid) {
        msgEl.innerHTML = `<div class="field-success">✅ Valid</div>`;
      } else {
        msgEl.innerHTML = result.errors.map(e =>
          `<div class="field-error"><span class="field-error-icon">⚠️</span> ${e}</div>`
        ).join('');
      }
    } else {
      msgEl.innerHTML = '';
    }

    // Show/hide exception area for soft rules
    if (excEl && !result.valid && result.exceptionAllowed && touched[fieldId]) {
      renderExceptionArea(fieldId, excEl);
    } else if (excEl && (result.valid || !touched[fieldId])) {
      excEl.innerHTML = '';
      if (exceptions[fieldId]) {
        exceptions[fieldId].enabled = false;
        exceptions[fieldId].rationale = '';
      }
    }

    // Cross-field: re-validate offerLetterSent when interviewStatus changes
    if (fieldId === 'interviewStatus') {
      const offerVal = formData.offerLetterSent;
      if (offerVal) handleFieldChange('offerLetterSent', offerVal);
    }

    updateFormState();
  }

  function renderExceptionArea(fieldId, container) {
    if (!exceptions[fieldId]) {
      exceptions[fieldId] = { enabled: false, rationale: '' };
    }
    const exc = exceptions[fieldId];

    container.innerHTML = `
      <div class="exception-area">
        <div class="exception-toggle-row">
          <input type="checkbox" class="exception-checkbox" id="exc-toggle-${fieldId}" ${exc.enabled ? 'checked' : ''} />
          <label class="exception-label" for="exc-toggle-${fieldId}">Grant exception for this field</label>
        </div>
        ${exc.enabled ? `
          <div class="rationale-area">
            <textarea class="rationale-textarea ${isRationaleValid(exc.rationale) ? 'valid' : ''}"
              id="rationale-${fieldId}"
              placeholder="Provide a detailed rationale (min 30 chars). Must include: &quot;approved by&quot;, &quot;special case&quot;, &quot;documentation pending&quot;, or &quot;waiver granted&quot;."
            >${exc.rationale}</textarea>
            <div class="rationale-char-count ${(exc.rationale || '').length >= 30 ? 'sufficient' : ''}">
              ${(exc.rationale || '').length} / 30 characters minimum
            </div>
            <div class="rationale-hint">
              Required keywords: "approved by" · "special case" · "documentation pending" · "waiver granted"
            </div>
            <div id="rationale-errors-${fieldId}" class="rationale-errors"></div>
          </div>
        ` : ''}
      </div>
    `;

    const toggle = document.getElementById(`exc-toggle-${fieldId}`);
    toggle.addEventListener('change', () => {
      exc.enabled = toggle.checked;
      if (!exc.enabled) exc.rationale = '';
      renderExceptionArea(fieldId, container);
      updateFormState();
    });

    if (exc.enabled) {
      const textarea = document.getElementById(`rationale-${fieldId}`);
      const errorsEl = document.getElementById(`rationale-errors-${fieldId}`);

      textarea.addEventListener('input', () => {
        exc.rationale = textarea.value;
        const result = validateRationale(exc.rationale);
        const charCount = textarea.parentElement.querySelector('.rationale-char-count');
        charCount.textContent = `${exc.rationale.length} / 30 characters minimum`;
        charCount.className = `rationale-char-count ${exc.rationale.length >= 30 ? 'sufficient' : ''}`;
        textarea.classList.toggle('valid', result.valid);

        if (exc.rationale.length > 0) {
          errorsEl.innerHTML = result.errors.map(e =>
            `<div class="field-error"><span class="field-error-icon">⚠️</span> ${e}</div>`
          ).join('');
        } else {
          errorsEl.innerHTML = '';
        }

        // Update input styling
        const input = document.getElementById(`field-${fieldId}`);
        input.classList.remove('invalid', 'exception');
        input.classList.add(result.valid ? 'exception' : 'invalid');

        updateFormState();
      });
    }
  }

  function isRationaleValid(rationale) {
    return validateRationale(rationale).valid;
  }

  function updateFormState() {
    const validation = validateForm(formData, exceptions, null, existingEmails);
    submitBtn.disabled = !validation.valid;

    // Update exception banner
    const count = validation.exceptionCount;
    if (count === 0) {
      const anyTouched = Object.values(touched).some(v => v);
      if (anyTouched) {
        exceptionBanner.style.display = 'flex';
        exceptionBanner.className = 'exception-banner level-0';
        exceptionBanner.innerHTML = `<span class="exception-banner-icon">✅</span> No exceptions granted — all rules satisfied`;
      } else {
        exceptionBanner.style.display = 'none';
      }
    } else if (count <= 2) {
      exceptionBanner.style.display = 'flex';
      exceptionBanner.className = 'exception-banner level-' + Math.min(count, 2);
      exceptionBanner.innerHTML = `<span class="exception-banner-icon">⚠️</span> ${count} exception${count > 1 ? 's' : ''} granted`;
    }

    if (validation.requiresManagerReview) {
      exceptionBanner.style.display = 'flex';
      exceptionBanner.className = 'exception-banner level-3';
      exceptionBanner.innerHTML = `<span class="exception-banner-icon">🚨</span> ${count} exceptions — <strong>Manager Review Required</strong>`;
    }
  }

  async function handleSubmit(onNavigate) {
    // Mark all fields as touched
    rules.fields.forEach(f => { touched[f.fieldId] = true; });

    try {
      existingEmails = await fetchAllEmails();
    } catch (e) { }

    const validation = validateForm(formData, exceptions, null, existingEmails);

    if (!validation.valid) {
      // Re-validate all fields to show errors
      rules.fields.forEach(f => handleFieldChange(f.fieldId, formData[f.fieldId]));
      showToast('Please fix all validation errors before submitting', 'error');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Submitting...';
      const candidate = await saveCandidate(formData, exceptions, validation.exceptionCount, validation.systemFlags);
      showSuccessModal(candidate, formData, validation, onNavigate);
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '✅ Submit Candidate';
      showToast('Error saving candidate. Please try again.', 'error');
    }
  }

  function showSuccessModal(candidate, data, validation, onNavigate) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const fieldLabels = {};
    rules.fields.forEach(f => { fieldLabels[f.fieldId] = f.label; });

    const summaryRows = rules.fields.map(f => {
      const hasException = exceptions[f.fieldId]?.enabled;
      const valueClass = hasException ? 'exception' : '';
      return `
        <div class="summary-row">
          <span class="summary-label">${fieldLabels[f.fieldId]}</span>
          <span class="summary-value ${valueClass}">
            ${data[f.fieldId]}
            ${hasException ? ' ⚠️' : ''}
          </span>
        </div>
      `;
    }).join('');

    const statusBadge = candidate.status === 'flagged'
      ? '<span class="badge badge-error">🚨 Flagged for Manager Review</span>'
      : candidate.status === 'exception'
        ? `<span class="badge badge-warning">⚠️ ${validation.exceptionCount} Exception(s)</span>`
        : '<span class="badge badge-success">✅ Clean Entry</span>';

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">✅ Candidate Submitted Successfully</h3>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: var(--space-md); text-align: center;">
            ${statusBadge}
          </div>
          <div class="success-summary">
            ${summaryRows}
            <div class="summary-row">
              <span class="summary-label">Submitted At</span>
              <span class="summary-value">${new Date(candidate.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-view-entries">📊 View All Entries</button>
          <button class="btn btn-primary" id="modal-add-another">➕ Add Another</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('modal-add-another').addEventListener('click', () => {
      document.body.removeChild(overlay);
      renderFormView(container, onNavigate);
    });

    document.getElementById('modal-view-entries').addEventListener('click', () => {
      document.body.removeChild(overlay);
      onNavigate('entries');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        renderFormView(container, onNavigate);
      }
    });
  }
}
