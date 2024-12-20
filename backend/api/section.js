const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.post('/all', async (req, res) => {
    try {
        // Log the request body for debugging purposes (optional)
        console.log('Request Body:', req.body); // This can be empty since no filters are used

        // Fetch all section data from the Supabase table
        const { data: sectionData, error: sectionError } = await supabase
            .from('section')
            .select('*'); // Fetch all sections without any filtering

        // Handle any errors while fetching data
        if (sectionError || !sectionData) {
            return res.status(500).json({ error: sectionError.message || 'Failed to fetch section data' });
        }

        // Return the array of sections
        res.json(sectionData);
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/filter', async (req, res) => {
    try {
        const { academicYear, yearLevel, semester, programNumber } = req.body;

        const { data: sectionData, error: sectionError } = await supabase
            .from('section')
            .select('*')
            .eq('academicYear', academicYear)
            .eq('yearLevel', yearLevel)
            .eq('sectionSemester', semester)
            .eq('programNumber', programNumber);

        if (sectionError || !sectionData) {
            return res.status(500).json({ error: sectionError.message || 'Failed to fetch section data' });
        }

        res.json(sectionData); // Return the array of sections
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        const sectionData = req.body.data; // This is an object
  
        // Validate timelineData
        if (!sectionData || typeof sectionData !== 'object') {
            return res.status(400).json({ message: 'Invalid data format or no section to insert' });
        }
  
        // Perform insertion using Supabase
        const { data, error } = await supabase
            .from('section')
            .insert([sectionData]); // Wrap in an array for Supabase
  
        if (error) {
            throw error;
        }
  
        res.status(200).json(data);
    } catch (error) {
        console.error('Error inserting section:', error);
        res.status(500).json({ message: `Error inserting timeline: ${error.message || 'Unknown error'}` });
    }
});

module.exports = router;