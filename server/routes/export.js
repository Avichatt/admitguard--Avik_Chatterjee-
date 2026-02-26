import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/csv', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all();
        if (rows.length === 0) {
            return res.status(404).send('No candidates found');
        }

        const headers = [
            'ID', 'Full Name', 'Email', 'Phone', 'Date of Birth', 'Highest Qualification',
            'Graduation Year', 'Percentage/CGPA', 'Screening Test Score', 'Interview Status',
            'Aadhaar Number', 'Offer Letter Sent', 'Exception Count', 'Status',
            'Requires Manager Review', 'Created At'
        ];

        const csvRows = rows.map(r => {
            const data = JSON.parse(r.data);
            return [
                r.id,
                data.fullName,
                data.email,
                data.phone,
                data.dateOfBirth,
                data.highestQualification,
                data.graduationYear,
                data.percentageCgpa,
                data.screeningTestScore,
                data.interviewStatus,
                data.aadhaarNumber,
                data.offerLetterSent,
                r.exception_count,
                r.status,
                r.requires_manager_review === 1 ? 'Yes' : 'No',
                r.created_at
            ];
        });

        const csvContent = [headers, ...csvRows]
            .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=candidates_export.csv');
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/json', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all();
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No candidates found' });
        }

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

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=candidates_export.json');
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
