const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.post('/all', async (req, res) => {
    const { scheduleNumber } = req.body;
    try {
        const { data, error } = await supabase
            .from('pbaLabels')
            .select('*')
            .eq('scheduleNumber', scheduleNumber);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching pba:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/update', async (req, res) => {
    const { pbaData } = req.body;
    try {
      // Create a batch of updates by matching 'id' for each schedule
      const updatePromises = pbaData.map(data => {
        return supabase
          .from('pbaLabels')
          .upsert(data, { onConflict: ['scheduleNumber', 'period', 'instanceNumber'] });
      });
  
      const results = await Promise.all(updatePromises);
  
      // Check if any of the updates failed
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Error updating pba:', errors);
        return res.status(500).json({ error: 'Failed to update pba data' });
      }

      res.json(results);
    } catch (error) {
      console.error('Error updating pba data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;