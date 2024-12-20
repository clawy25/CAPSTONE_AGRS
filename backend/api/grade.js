const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.post('/all', async (req, res) => {
    const { scheduleNumber } = req.body;
    try {
        const { data, error } = await supabase
            .from('gradeData')
            .select('*')
            .eq('scheduleNumber', scheduleNumber);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/update', async (req, res) => {
    const { gradeData } = req.body;
    try {
      // Create a batch of updates by matching 'id' for each schedule
      const updatePromises = gradeData.map(data => {
        return supabase
          .from('gradeData')
          .upsert(data, { onConflict: ['scheduleNumber', 'studentNumber', 'period', 'componentNumber', 'instanceNumber'] });
      });
  
      const results = await Promise.all(updatePromises);
  
      // Check if any of the updates failed
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Error updating grade:', errors);
        return res.status(500).json({ error: 'Failed to update grade data' });
      }

      res.json(results);
    } catch (error) {
      console.error('Error updating grade data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;