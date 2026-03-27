// Local Audit Log functions
const AUDIT_LOG_KEY = 'admitguard_audit_log';

export function getLocalAuditLog() {
    const log = localStorage.getItem(AUDIT_LOG_KEY);
    return log ? JSON.parse(log) : [];
}

export function saveToLocalAuditLog(entry) {
    const log = getLocalAuditLog();
    log.unshift({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        ...entry
    });
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log));
}

export function clearAuditLog() {
    localStorage.removeItem(AUDIT_LOG_KEY);
}

// Existing functions (Modified to include local logging)
export async function saveCandidate(formData, exceptions = {}, exceptionCount = 0, systemFlags = []) {
    // Log to audit trail
    const auditEntry = {
        candidateName: formData.fullName,
        data: formData,
        exceptionCount,
        exceptions: Object.entries(exceptions)
            .filter(([, exc]) => exc.enabled)
            .map(([field, exc]) => ({ field, rationale: exc.rationale })),
        flagged: systemFlags.length > 0,
        status: systemFlags.length > 0 ? 'flagged' : (exceptionCount > 0 ? 'exception' : 'clean')
    };
    saveToLocalAuditLog(auditEntry);

    try {
        const response = await fetch('/api/candidates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                formData,
                exceptions,
                exceptionCount,
                systemFlags
            })
        });
        if (!response.ok) throw new Error('Failed to save candidate');
        return await response.json();
    } catch (error) {
        console.error('Save error (Server):', error);
        // We still have it in local audit log!
        return {
            id: 'local-' + Date.now(),
            createdAt: new Date().toISOString(),
            status: auditEntry.status
        };
    }
}

export async function getCandidates() {
    try {
        const res = await fetch('/api/candidates');
        if (!res.ok) throw new Error('Failed to fetch candidates');
        return await res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

export async function getAuditLog(type = null) {
    const candidates = await getCandidates();
    let events = [];

    candidates.forEach(c => {
        // Submission Event
        events.push({
            id: c.id + '-sub',
            timestamp: c.createdAt,
            type: 'SUBMISSION',
            details: {
                candidateName: c.data.fullName,
                email: c.data.email,
                phone: c.data.phone,
                status: c.status,
                exceptionCount: c.exceptionCount
            }
        });

        // Exceptions
        if (c.exceptions) {
            try {
                const parsedExceptions = typeof c.exceptions === 'string' ? JSON.parse(c.exceptions) : c.exceptions;
                Object.entries(parsedExceptions).forEach(([field, exc]) => {
                    if (exc && exc.enabled) {
                        events.push({
                            id: c.id + '-exc-' + field,
                            timestamp: new Date(new Date(c.createdAt).getTime() + 1000).toISOString(),
                            type: 'EXCEPTION_GRANTED',
                            details: {
                                candidateName: c.data.fullName,
                                email: c.data.email,
                                phone: c.data.phone,
                                field: field,
                                rationale: exc.rationale || 'No rationale provided'
                            }
                        });
                    }
                });
            } catch (e) { console.error('Error parsing exceptions', e); }
        }

        // Manager Review Flagged
        if (c.requiresManagerReview || c.status === 'flagged') {
            events.push({
                id: c.id + '-flag',
                timestamp: new Date(new Date(c.createdAt).getTime() + 2000).toISOString(),
                type: 'MANAGER_REVIEW_FLAGGED',
                details: {
                    candidateName: c.data.fullName,
                    email: c.data.email,
                    phone: c.data.phone,
                    exceptionCount: c.exceptionCount,
                    reason: `Candidate has ${c.exceptionCount} anomalies exceeding rule thresholds.`
                }
            });
        }
    });

    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (type && type !== 'ALL') {
        events = events.filter(e => e.type === type);
    }

    return events;
}

export async function getStats() {
    try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        return await res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return { total: 0, clean: 0, withExceptions: 0, flagged: 0, exceptionRate: '0.0', exceptionsByField: {} };
    }
}

export async function fetchAllEmails(excludeId = null) {
    try {
        const url = excludeId ? `/api/emails?excludeId=${excludeId}` : '/api/emails';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch emails');
        return await res.json();
    } catch (error) {
        console.error('Fetch emails error:', error);
        return [];
    }
}

export function exportToCSV() {
    window.open('/api/export/csv', '_blank');
}

export function exportToJSON() {
    window.open('/api/export/json', '_blank');
}
