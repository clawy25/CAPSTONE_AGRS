const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.get('/all', async (req, res) => {
    try {
        // Fetch all year level data
        const { data, error} = await supabase
            .from('schedule') // Replace with your actual table name
            .select('*'); // Select all columns

        if (error) {
            return res.status(500).json({ error: error.message || 'Failed to fetch year level data' });
        }

        res.json(data); // Return the array of schedule
    } catch (error) {
        console.error('Error fetchingschedule:', error); // Log the error
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/byAcadYear', async (req, res) => {
    const { academicYear } = req.body;
    try {
        const { data, error } = await supabase
            .from('schedule')
            .select('*')
            .eq('academicYear', academicYear);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/section', async (req, res) => {
    const { section } = req.body;
    try {
        const { data, error } = await supabase
            .from('schedule')
            .select('*')
            .eq('sectionNumber', section);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        const scheduleData = req.body.data;

        // Check if scheduleData is defined and is an array
        if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or no schedules to insert' });
        }

        // Insert multiple schedules into the database (e.g., Supabase)
        const { data, error } = await supabase
            .from('schedule')
            .insert(scheduleData);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ message: `Error inserting schedules: ${error.message}` });
        }

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error inserting schedules:', error);
        res.status(500).json({ message: `Error inserting schedules: ${error.message || 'Unknown error'}` });
    }
});

router.put('/update', async (req, res) => {
    const { updatedSchedules } = req.body;
  
    try {
      // Create a batch of updates by matching 'id' for each schedule
      const updatePromises = updatedSchedules.map(schedule => {
        return supabase
          .from('schedule')
          .update(schedule)  // Update using the id which is guaranteed to be unique
          .eq('id', schedule.id); // Ensure we're updating the specific row with this id
      });
  
      // Await all updates
      const results = await Promise.all(updatePromises);
  
      // Check if any of the updates failed
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Error updating schedules:', errors);
        return res.status(500).json({ error: 'Failed to update schedule data' });
      }
  
      // Return the updated data
      res.json(results);
    } catch (error) {
      console.error('Error updating schedule data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;