const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

// Fetch deadlines by scheduleNumber
router.post('/bySchedules', async (req, res) => {
    const { scheduleNumbers } = req.body;
    
    // Check if scheduleNumbers is an array
    if (!Array.isArray(scheduleNumbers) || scheduleNumbers.length === 0) {
        return res.status(400).json({ error: 'scheduleNumbers must be an array and cannot be empty' });
    }

    try {
        const { data, error } = await supabase
            .from('deadline')
            .select('*')
            .in('scheduleNumber', scheduleNumbers);  // Ensure you're using the correct column name

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);  // Send the fetched deadlines to the client
    } catch (error) {
        console.error('Error fetching deadlines:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Upload new deadlines
router.post('/upload', async (req, res) => {
  try {
    const newDeadlineData = req.body.data;

    if (!newDeadlineData || !Array.isArray(newDeadlineData) || newDeadlineData.length === 0) {
      return res.status(400).json({ message: 'Invalid data format or no deadline to insert' });
    }

    const { data, error } = await supabase
      .from('deadline')
      .insert(newDeadlineData);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: `Error inserting deadline: ${error.message}` });
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error inserting deadline:', error);
    res.status(500).json({ message: `Error inserting deadline: ${error.message || 'Unknown error'}` });
  }
});

// Update deadlines
router.put('/update', async (req, res) => {
  const { updatedDeadlines } = req.body;

  try {
    const updatePromises = updatedDeadlines.map(deadline => {
      return supabase
        .from('deadline')
        .update(deadline)
        .eq('id', deadline.id); // Ensure we update the correct row
    });

    const results = await Promise.all(updatePromises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      console.error('Error updating deadlines:', errors);
      return res.status(500).json({ error: 'Failed to update some deadlines' });
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error updating deadlines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
