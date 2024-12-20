const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');

router.get('/all', async (req, res) => {
    try {
        // Fetch data from the program table using correct column names
        const { data: courseData, error: courseError } = await supabase
            .from('course') // Ensure this is your actual table name
            .select('*'); // Use the correct column names
  
        if (courseError) {
            return res.status(500).json({ error: courseError.message || 'Failed to fetch course data' });
        }
  
        res.json(courseData); // Send the fetched data as JSON response
    } catch (error) {
        console.error('Error fetching course data:', error); // Log the error
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/byProgram', async (req, res) => {
    const { academicYear, yearLevel, semester, programNumber } = req.body;
    try {
        const { data, error } = await supabase
            .from('course')
            .select('*')
            .eq('programNumber', programNumber)
            .eq('courseSemester', semester)
            .eq('courseYearLevel', yearLevel)
            .eq('academicYear', academicYear);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('course')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        const courseData = req.body.data;

        // Check if courseData is defined and is an array
        if (!courseData || !Array.isArray(courseData) || courseData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or no courses to insert' });
        }

        const { data, error } = await supabase
            .from('course')
            .insert(courseData);

        if (error) {
            console.error('Supabase error:', error); // Log the Supabase error for debugging
            return res.status(500).json({ message: `Error inserting courses: ${error.message}` });
        }

        res.status(201).json({ success: true, data }); // Return success with a 201 status
    } catch (error) {
        console.error('Error inserting courses:', error);
        res.status(500).json({ message: `Error inserting courses: ${error.message || 'Unknown error'}` });
    }
});

router.put('/update', async (req, res) => {
    const courseData = req.body.data;

    // Log courseData to confirm its structure
    console.log('Received courseData:', courseData);

    try {
        const { data, error } = await supabase
            .from('course')
            .update(courseData)
            .eq('id', courseData.id); // Ensure courseCode is accessible

        if (error) {
            console.error('Supabase update error:', error); // Log Supabase error details
            return res.status(500).json({ error: 'Failed to update course', details: error });
        }

        res.json({ message: 'Course updated successfully', data });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.delete('/delete', async (req, res) => {
    const courseData = req.body.data;

    try {
        const { data, error } = await supabase
            .from('course')
            .delete("*")
            .eq('courseCode', courseData.courseCode)
            .eq('id', courseData.id); // Change "*" to use the default delete behavior

        if (error) {
            return res.status(500).json({ error: 'Failed to delete course' });
        }

        res.json({ message: 'Course deleted successfully', data });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;