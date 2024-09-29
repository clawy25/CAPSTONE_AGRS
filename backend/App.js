// Import required packages
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseServer'); // Ensure this is correctly exporting your Supabase client

// Initialize
const app = express();
const port = process.env.PORT || 5000; // Use the PORT from .env or default to 5000
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this for your frontend URL
}));

// Middleware to parse JSON requests
app.use(express.json());

// Redirect root URL to /faculty
app.get('/', (req, res) => {
    res.redirect('/faculty');
});

// Correct the route to use the request query instead of params for fetching faculty details
app.get('/faculty/:personnelNumber', async (req, res) => {
    const { personnelNumber } = req.params; // Get personnelNumber from the URL parameter
  
    try {
      // Fetch faculty data
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty') // Ensure this is your actual table name
        .select('*')
        .eq('personnelNumber', personnelNumber) // Match the personnelNumber
        .single(); // Expect a single result
  
      if (facultyError || !facultyData) {
        return res.status(404).json({ error: 'Faculty not found' });
      }

      // Fetch program data based on the faculty's programHeadNumber
      const { data: programData, error: programError } = await supabase
        .from('program') // Ensure this is your actual table name
        .select('*')
        .eq('programNumber', facultyData.programNumber) // Match with the faculty's personnelNumber
        .single(); // Expect a single result
  
      if (programError || !programData) {
        return res.status(404).json({ error: 'Program not found' });
      }
  
      // Combine faculty and program data
      const responseData = {
        ...facultyData,
        programName: programData.programName, // Add program name
        // You can add any other fields from the programData as needed
      };
  
      res.json(responseData); // Send the combined data as a response
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  


// Correct the route to use the request query instead of params for fetching faculty details
app.get('/student/:studentNumber', async (req, res) => {
    const { studentNumber } = req.params; // Get studentNumber from the URL parameter

    try {
      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('student') // Ensure this is your actual table name
        .select('*')
        .eq('studentNumber', studentNumber) // Match the personnelNumber
        .single(); // Expect a single result
  
      if (studentError || !studentData) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Fetch program data based on the faculty's programHeadNumber
      const { data: programData, error: programError } = await supabase
        .from('program') // Ensure this is your actual table name
        .select('*')
        .eq('programNumber', studentData.studentProgramNumber) // Match with the faculty's personnelNumber
        .single(); // Expect a single result
  
      if (programError || !programData) {
        return res.status(404).json({ error: 'Program not found' });
      }
  
      // Combine faculty and program data
      const responseData = {
        ...studentData,
        studentProgramName: programData.programName, // Add program name
        // You can add any other fields from the programData as needed
      };
  
      res.json(responseData); // Send the combined data as a response
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
