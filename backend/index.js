import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import supabase from './db.js';
import candidatesRouter from './routes/candidates.js';
import auditRouter from './routes/audit.js';
import exportRouter from './routes/export.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/candidates', candidatesRouter);
app.use('/api/audit', auditRouter);
app.use('/api/export', exportRouter);

// Stats route (Refactored for Supabase)
app.get('/api/stats', async (req, res) => {
    try {
        const { data: candidates, error } = await supabase
            .from('candidates')
            .select('status, exceptions, exception_count');

        if (error) throw error;

        const total = candidates.length;
        let clean = 0;
        let withExceptions = 0;
        let flagged = 0;
        const exceptionsByField = {};

        candidates.forEach(c => {
            if (c.status === 'clean') clean++;
            else if (c.status === 'exception') withExceptions++;
            else if (c.status === 'flagged') flagged++;

            const excs = typeof c.exceptions === 'string' ? JSON.parse(c.exceptions || '{}') : (c.exceptions || {});
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

// Debug route for environment mapping
app.get('/api/debug', (req, res) => {
    import('./db.js').then(({ envStatus }) => {
        res.json({
            status: 'running',
            env: envStatus
        });
    });
});

// Emails route (Refactored for Supabase)
app.get('/api/emails', async (req, res) => {
    try {
        const { excludeId } = req.query;
        let query = supabase.from('candidates').select('data');

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data: rows, error } = await query;
        if (error) throw error;

        const emails = rows
            .map(row => {
                const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                return data.email?.toLowerCase();
            })
            .filter(Boolean);
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

// Export for Netlify Functions
export const handler = serverless(app);
export default app;
