const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.get('/all', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('academicYear')
            .select('*');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching academic year:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    const { academicYearData } = req.body; // Assuming req.body contains academicYearData directly
  
    if (!academicYearData) {
        return res.status(400).json({ error: 'Academic year data is required.' });
    }
  
    try {
        const { data, error } = await supabase
            .from('academicYear')
            .insert(academicYearData) // Insert the data directly
            .single(); // Ensures we get the inserted record
  
        if (error) {
            console.error('Error creating academic year:', error);
            return res.status(400).json({ error: 'Error creating academic year' });
        }
  
        res.status(201).json(data); // Return the created record
    } catch (err) {
        console.error('Unexpected error creating academic year:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { academicYear, isCurrent} = req.body;

    try {
        const { data, error } = await supabase
            .from('academicYear')
            .update({ academicYear, isCurrent})
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Failed to update academicYear' });
        }

        res.json({ message: 'Course updated successfully', data });
    } catch (error) {
        console.error('Error updating academic year:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
