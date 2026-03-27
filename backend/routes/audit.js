import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        let query = supabase.from('audit_log').select('*').order('timestamp', { ascending: false });

        if (type && type !== 'ALL') {
            query = query.eq('type', type);
        }

        const { data: rows, error } = await query;
        if (error) throw error;

        const logs = rows.map(r => ({
            id: r.id,
            type: r.type,
            details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details,
            timestamp: r.timestamp
        }));

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
