const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.post('/single', async (req, res) => {
    const { programNumber } = req.body;
    try {
        const { data, error } = await supabase
            .from('program')
            .select('*')
            .eq('programNumber', programNumber);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching program:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Fetch all programs
router.get('/all', async (req, res) => {
  try {
      // Fetch data from the program table using correct column names
      const { data: programData, error: programError } = await supabase
          .from('program') // Ensure this is your actual table name
          .select('*'); // Use the correct column names

      if (programError) {
          return res.status(500).json({ error: programError.message || 'Failed to fetch program data' });
      }

      res.json(programData); // Send the fetched data as JSON response
  } catch (error) {
      console.error('Error fetching program data:', error); // Log the error
      res.status(500).json({ error: 'Internal server error' });
  }
});

//DELETE PROGRAM BY PROGRAM NUMBER
router.delete('/:programNumber', async (req, res) => {
    const { programNumber } = req.params;
    const { academicYear } = req.query; // Use query parameter instead

    try {
        const { data, error } = await supabase
            .from('program')
            .delete()
            .eq('programNumber', programNumber)
            .eq('academicYear', academicYear);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete program' });
        }

        res.json({ message: 'Program deleted successfully', data });
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        const newProgramData = req.body.data;

        // Validate newProgramData
        if (!Array.isArray(newProgramData) || newProgramData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or no students to insert' });
        }

        // Perform bulk insertion using Supabase
        const { data, error } = await supabase
            .from('program')
            .insert(newProgramData);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error inserting programs:', error);
        res.status(500).json({ message: `Error inserting programs: ${error.message || 'Unknown error'}` });
    }
});


module.exports = router;