import express from 'express';
import cors from 'cors';
import candidatesRouter from './routes/candidates.js';
import auditRouter from './routes/audit.js';
import exportRouter from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/candidates', candidatesRouter);
app.use('/api/audit', auditRouter);
app.use('/api/export', exportRouter);

// Specific routes
app.get('/api/stats', (req, res) => {
    import('./db.js').then(({ default: db }) => {
        try {
            const candidates = db.prepare('SELECT status, exceptions, exception_count FROM candidates').all();
            const total = candidates.length;
            let clean = 0;
            let withExceptions = 0;
            let flagged = 0;
            const exceptionsByField = {};

            candidates.forEach(c => {
                if (c.status === 'clean') clean++;
                else if (c.status === 'exception') withExceptions++;
                else if (c.status === 'flagged') flagged++;

                const excs = JSON.parse(c.exceptions || '{}');
                Object.entries(excs).forEach(([fieldId, exc]) => {
                    if (exc?.enabled) {
                        exceptionsByField[fieldId] = (exceptionsByField[fieldId] || 0) + 1;
                    }
                });
            });

            const exceptionRate = total > 0 ? (((withExceptions + flagged) / total) * 100).toFixed(1) : '0.0';

            res.json({ total, clean, withExceptions, flagged, exceptionRate, exceptionsByField });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

app.get('/api/emails', (req, res) => {
    import('./db.js').then(({ default: db }) => {
        try {
            const { excludeId } = req.query;
            let query = 'SELECT data FROM candidates';
            let params = [];
            if (excludeId) {
                query += ' WHERE id != ?';
                params.push(excludeId);
            }

            const rows = db.prepare(query).all(...params);
            const emails = rows
                .map(row => JSON.parse(row.data).email?.toLowerCase())
                .filter(Boolean);
            res.json(emails);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
