// Remove old localStorage functions, replace with async API calls
export async function saveCandidate(formData, exceptions = {}, exceptionCount = 0, systemFlags = []) {
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
        console.error('Save error:', error);
        throw error;
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
    try {
        const url = type && type !== 'ALL' ? `/api/audit?type=${type}` : '/api/audit';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch audit log');
        return await res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
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
