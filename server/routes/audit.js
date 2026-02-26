import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM audit_log ORDER BY timestamp DESC';
        let params = [];

        if (type) {
            query = 'SELECT * FROM audit_log WHERE type = ? ORDER BY timestamp DESC';
            params.push(type);
        }

        const rows = db.prepare(query).all(...params);
        const logs = rows.map(r => ({
            id: r.id,
            type: r.type,
            details: JSON.parse(r.details),
            timestamp: r.timestamp
        }));

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
