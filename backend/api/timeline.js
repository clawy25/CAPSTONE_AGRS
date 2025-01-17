const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.post('/all', async (req, res) => {

    const { academicYear } = req.body;
    try {
        // Fetch all timeline data
        const { data: timelineData, error: timelineError } = await supabase
            .from('timeline') // Ensure this is your actual table name
            .select('*')
            .eq('academicYear', academicYear);
  
        if (timelineError || !timelineData) {
            return res.status(500).json({ error: timelineError.message || 'Failed to fetch timeline data' });
        }
  
        res.json(timelineData); // Return the array of timeline entries
    } catch (error) {
        console.error('Error fetching timeline:', error); // Log the error
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/student', async (req, res) => {

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
            .insert(timelineData); // Wrap in an array for Supabase
  
        if (error) {
            throw error;
        }
  
        res.status(200).json(data);
    } catch (error) {
        console.error('Error inserting timeline:', error);
        res.status(500).json({ message: `Error inserting timeline: ${error.message || 'Unknown error'}` });
    }
});

router.put('/update', async (req, res) => {
    try {
        const timelineData = req.body.data;

        // Validate timelineData
        if (!timelineData || !Array.isArray(timelineData)) {
            return res.status(400).json({ success: false, message: 'Invalid data format or missing timeline data' });
        }

        // Perform updates for each row
        const updatePromises = timelineData.map(async (item) => {
            const { id, ...updateFields } = item;

            if (!id) {
                throw new Error(`Missing id for item: ${JSON.stringify(item)}`);
            }

            const { error } = await supabase
                .from('timeline')
                .update(updateFields)
                .eq('id', id);

            if (error) {
                throw new Error(`Failed to update timelineData with id: ${id}`);
            }

            // Return updated item for confirmation, if needed
            return { id, updatedFields: updateFields };
        });

        // Wait for all updates to complete
        const updatedData = await Promise.all(updatePromises);

        res.status(200).json({ success: true, updatedData });
    } catch (error) {
        console.error('Error updating timeline:', error);
        res.status(500).json({ success: false, message: `Error updating timeline: ${error.message || 'Unknown error'}` });
    }
});



module.exports = router;