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
  
// Correct the route to use the request query instead of params for fetching student details
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

// Fetch all students
app.get('/student', async (req, res) => {
  try {
      // Fetch all student data
      const { data: studentData, error: studentError } = await supabase
          .from('student')
          .select('*');

      if (studentError || !studentData) {
          return res.status(500).json({ error: studentError.message || 'Failed to fetch student data' });
      }

      // Prepare an array to hold student data with program names
      const studentsWithPrograms = await Promise.all(studentData.map(async (student) => {
          // Fetch program data based on the student's program number
          const { data: programData, error: programError } = await supabase
              .from('program')
              .select('*')
              .eq('programNumber', student.studentProgramNumber) // Match with the programNumber
              .single(); // Expect a single result

          if (programError || !programData) {
              return {
                  ...student,
                  studentProgramName: null, // If program is not found, set name to null
              };
          }

          return {
              ...student,
              studentProgramName: programData.programName, // Add program name
          };
      }));

      res.json(studentsWithPrograms); // Return the array of students with program names
  } catch (error) {
      console.error('Error fetching students:', error); // Log the error
      res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/student/upload', async (req, res) => {
  try {
      const studentsData = req.body.data;

      // Validate studentsData
      if (!Array.isArray(studentsData) || studentsData.length === 0) {
          return res.status(400).json({ message: 'Invalid data format or no students to insert' });
      }

      // Perform bulk insertion using Supabase
      const { data, error } = await supabase
          .from('student') // Replace with your table name
          .insert(studentsData);

      if (error) {
          throw error;
      }

      res.status(200).json(data);
  } catch (error) {
      console.error('Error inserting students:', error);
      res.status(500).json({ message: `Error inserting students: ${error.message || 'Unknown error'}` });
  }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
