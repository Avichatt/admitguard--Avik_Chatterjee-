import express from 'express';
import supabase from '../db.js';

const router = express.Router();

async function logAuditEvent(type, details) {
    const id = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const { error } = await supabase.from('audit_log').insert({
        id,
        type,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        timestamp: new Date().toISOString()
    });
    if (error) console.error('Audit Log Error:', error);
}

// GET all candidates
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const candidates = rows.map(r => ({
            id: r.id,
            data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data,
            exceptions: typeof r.exceptions === 'string' ? JSON.parse(r.exceptions) : r.exceptions,
            exceptionCount: r.exception_count,
            requiresManagerReview: r.requires_manager_review === 1 || r.requires_manager_review === true,
            systemFlags: typeof r.system_flags === 'string' ? JSON.parse(r.system_flags) : r.system_flags,
            status: r.status,
            createdAt: r.created_at
        }));
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new candidate
router.post('/', async (req, res) => {
    try {
        const { formData, exceptions = {}, exceptionCount = 0, systemFlags = [] } = req.body;

        const id = 'cand_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const createdAt = new Date().toISOString();
        const requiresManagerReview = systemFlags.length > 0;
        const status = requiresManagerReview ? 'flagged' : exceptionCount > 0 ? 'exception' : 'clean';

        const { error } = await supabase.from('candidates').insert({
            id,
            data: JSON.stringify(formData),
            exceptions: JSON.stringify(exceptions),
            exception_count: exceptionCount,
            requires_manager_review: requiresManagerReview ? 1 : 0,
            system_flags: JSON.stringify(systemFlags),
            status,
            created_at: createdAt
        });

        if (error) throw error;

        // Write audit logs
        await logAuditEvent('SUBMISSION', {
            candidateId: id,
            candidateName: formData.fullName,
            email: formData.email,
            exceptionCount,
            status,
            requiresManagerReview
        });

        if (exceptionCount > 0) {
            for (const [fieldId, exc] of Object.entries(exceptions)) {
                if (exc?.enabled) {
                    await logAuditEvent('EXCEPTION_GRANTED', {
                        candidateId: id,
                        candidateName: formData.fullName,
                        field: fieldId,
                        rationale: exc.rationale
                    });
                }
            }
        }

        if (systemFlags.length > 0) {
            for (const flag of systemFlags) {
                await logAuditEvent('MANAGER_REVIEW_FLAGGED', {
                    candidateId: id,
                    candidateName: formData.fullName,
                    reason: flag.message,
                    exceptionCount
                });
            }
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

// GET candidate by ID
router.get('/:id', async (req, res) => {
    try {
        const { data: row, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !row) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.json({
            id: row.id,
            data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
            exceptions: typeof row.exceptions === 'string' ? JSON.parse(row.exceptions) : row.exceptions,
            exceptionCount: row.exception_count,
            requiresManagerReview: row.requires_manager_review === 1 || row.requires_manager_review === true,
            systemFlags: typeof row.system_flags === 'string' ? JSON.parse(row.system_flags) : row.system_flags,
            status: row.status,
            createdAt: row.created_at
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
