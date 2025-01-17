const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.get('/all', async (req, res) => {
    try {
        const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('enrollment')
            .select('*');
  
        if (enrollmentError) {
            return res.status(500).json({ error: enrollmentError.message || 'Failed to fetch enrollment data' });
        }
  
        res.json(enrollmentData); // Send the fetched data as JSON response
    } catch (error) {
        console.error('Error fetching enrollment data:', error); // Log the error
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/byStudent', async (req, res) => {
    const { studentNumber } = req.body;
    try {
        const { data, error } = await supabase
            .from('enrollment')
            .select('*')
            .eq('studentNumber', studentNumber);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        const newEnrollmentData = req.body.data;

        // Check if newEnrollmentData is defined and is an array
        if (!newEnrollmentData || !Array.isArray(newEnrollmentData) || newEnrollmentData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or no enrollment to insert' });
        }

        // Insert multiple schedules into the database (e.g., Supabase)
        const { data, error } = await supabase
            .from('enrollment')
            .insert(newEnrollmentData);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ message: `Error inserting enrollment: ${error.message}` });
        }

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error inserting enrollment:', error);
        res.status(500).json({ message: `Error inserting enrollment: ${error.message || 'Unknown error'}` });
    }
});

router.put('/update', async (req, res) => {
    const updatedEnrollmentData = req.body; // Expecting an array of objects

    try {
        // Validate that the input is an array
        if (!Array.isArray(updatedEnrollmentData)) {
            return res.status(400).json({ error: 'Input data must be an array of enrollment updates' });
        }

        // Perform updates for each row
        const updatePromises = updatedEnrollmentData.map(async (item) => {
            const { studentNumber, scheduleNumber, ...updateFields } = item;

            if (!studentNumber || !scheduleNumber) {
                throw new Error(`Missing studentNumber or scheduleNumber for item: ${JSON.stringify(item)}`);
            }

            const { error } = await supabase
                .from('enrollment')
                .update(updateFields)
                .eq('studentNumber', studentNumber)
                .eq('scheduleNumber', scheduleNumber);

            if (error) {
                throw new Error(`Failed to update studentNumber: ${studentNumber}, scheduleNumber: ${scheduleNumber}`);
            }
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        res.status(200).json({ message: 'Successfully updated enrollment data' });
    } catch (error) {
        console.error('Error updating enrollment data:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});


module.exports = router;