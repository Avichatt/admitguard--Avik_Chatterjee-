import express from 'express';
import db from '../db.js';

const router = express.Router();

function logAuditEvent(type, details) {
    const id = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const stmt = db.prepare(`
    INSERT INTO audit_log (id, type, details, timestamp)
    VALUES (?, ?, ?, ?)
  `);
    stmt.run(id, type, JSON.stringify(details), new Date().toISOString());
}

router.get('/', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all();
        const candidates = rows.map(r => ({
            id: r.id,
            data: JSON.parse(r.data),
            exceptions: JSON.parse(r.exceptions),
            exceptionCount: r.exception_count,
            requiresManagerReview: r.requires_manager_review === 1,
            systemFlags: JSON.parse(r.system_flags),
            status: r.status,
            createdAt: r.created_at
        }));
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', (req, res) => {
    try {
        const { formData, exceptions = {}, exceptionCount = 0, systemFlags = [] } = req.body;

        const id = 'cand_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const createdAt = new Date().toISOString();
        const requiresManagerReview = systemFlags.length > 0;
        const status = requiresManagerReview ? 'flagged' : exceptionCount > 0 ? 'exception' : 'clean';

        const stmt = db.prepare(`
      INSERT INTO candidates (id, data, exceptions, exception_count, requires_manager_review, system_flags, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            id,
            JSON.stringify(formData),
            JSON.stringify(exceptions),
            exceptionCount,
            requiresManagerReview ? 1 : 0,
            JSON.stringify(systemFlags),
            status,
            createdAt
        );

        // Write audit logs
        logAuditEvent('SUBMISSION', {
            candidateId: id,
            candidateName: formData.fullName,
            email: formData.email,
            exceptionCount,
            status,
            requiresManagerReview
        });

        if (exceptionCount > 0) {
            Object.entries(exceptions).forEach(([fieldId, exc]) => {
                if (exc?.enabled) {
                    logAuditEvent('EXCEPTION_GRANTED', {
                        candidateId: id,
                        candidateName: formData.fullName,
                        field: fieldId,
                        rationale: exc.rationale
                    });
                }
            });
        }

        if (systemFlags.length > 0) {
            systemFlags.forEach(flag => {
                logAuditEvent('MANAGER_REVIEW_FLAGGED', {
                    candidateId: id,
                    candidateName: formData.fullName,
                    reason: flag.message,
                    exceptionCount
                });
            });
        }

        res.status(201).json({
            id,
            data: formData,
            exceptions,
            exceptionCount,
            requiresManagerReview,
            systemFlags,
            status,
            createdAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json({
            id: row.id,
            data: JSON.parse(row.data),
            exceptions: JSON.parse(row.exceptions),
            exceptionCount: row.exception_count,
            requiresManagerReview: row.requires_manager_review === 1,
            systemFlags: JSON.parse(row.system_flags),
            status: row.status,
            createdAt: row.created_at
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
