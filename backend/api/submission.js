const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.post('/bySchedule', async (req, res) => {
    const { scheduleNumber } = req.body;
    try {
        const { data, error } = await supabase
            .from('submission')
            .select('*')
            .eq('scheduleNumber', scheduleNumber);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        const newSubmissionData = req.body.data;

        // Check if newSubmissionData is defined and is an array
        if (!newSubmissionData || !Array.isArray(newSubmissionData) || newSubmissionData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or no submission to insert' });
        }

        // Insert multiple schedules into the database (e.g., Supabase)
        const { data, error } = await supabase
            .from('submission')
            .insert(newSubmissionData);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ message: `Error inserting submission: ${error.message}` });
        }

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error inserting submission:', error);
        res.status(500).json({ message: `Error inserting submission: ${error.message || 'Unknown error'}` });
    }
});

router.put('/update', async (req, res) => {
    const { submissionData } = req.body;
    try {
      // Create a batch of updates by matching 'id' for each schedule
      const updatePromises = submissionData.map(data => {
        return supabase
          .from('submission')
          .update(data)  // Update using the id which is guaranteed to be unique
          .eq('id', data.id); // Ensure we're updating the specific row with this id
      });
  
      // Await all updates
      const results = await Promise.all(updatePromises);
  
      // Check if any of the updates failed
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Error updating submission:', errors);
        return res.status(500).json({ error: 'Failed to update submission data' });
      }

      res.json(results);
    } catch (error) {
      console.error('Error updating submission data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;