import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.get('/csv', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !rows || rows.length === 0) {
            return res.status(error ? 500 : 404).send(error ? error.message : 'No candidates found');
        }

        const headers = [
            'ID', 'Full Name', 'Email', 'Phone', 'Date of Birth', 'Highest Qualification',
            'Graduation Year', 'Percentage/CGPA', 'Screening Test Score', 'Interview Status',
            'Aadhaar Number', 'Offer Letter Sent', 'Exception Count', 'Status',
            'Requires Manager Review', 'Created At'
        ];

        const csvRows = rows.map(r => {
            const data = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
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
                (r.requires_manager_review === 1 || r.requires_manager_review === true) ? 'Yes' : 'No',
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

router.get('/json', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !rows || rows.length === 0) {
            return res.status(error ? 500 : 404).json({ message: error ? error.message : 'No candidates found' });
        }

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

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=candidates_export.json');
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
