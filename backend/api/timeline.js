const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.post('/all', async (req, res) => {

    const { academicYear, studentNumber } = req.body;
    try {
        // Fetch all timeline data
        const { data: timelineData, error: timelineError } = await supabase
            .from('timeline') // Ensure this is your actual table name
            .select('*')
            .eq('academicYear', academicYear)
            .eq('studentNumber', studentNumber);
  
        if (timelineError || !timelineData) {
            return res.status(500).json({ error: timelineError.message || 'Failed to fetch timeline data' });
        }
  
        res.json(timelineData); // Return the array of timeline entries
    } catch (error) {
        console.error('Error fetching timeline:', error); // Log the error
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        const timelineData = req.body.data; // This is an object
  
        // Validate timelineData
        if (!timelineData || typeof timelineData !== 'object') {
            return res.status(400).json({ message: 'Invalid data format or no timeline to insert' });
        }
  
        // Perform insertion using Supabase
        const { data, error } = await supabase
            .from('timeline')
            .insert([timelineData]); // Wrap in an array for Supabase
  
        if (error) {
            throw error;
        }
  
        res.status(200).json(data);
    } catch (error) {
        console.error('Error inserting timeline:', error);
        res.status(500).json({ message: `Error inserting timeline: ${error.message || 'Unknown error'}` });
    }
});

module.exports = router;