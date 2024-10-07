require('dotenv').config(); // Load .env
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseServer');

// Initialize
const app = express();
const port = process.env.PORT || 5000; // Use the PORT from .env or default to 5000
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this for your frontend URL
}));


app.use(express.json());

// Redirect root URL to /faculty
app.get('/', (req, res) => {
    res.redirect('/student');
});

// Login as Personnel
app.get('/personnel/:personnelNumber', async (req, res) => {
    const { personnelNumber } = req.params; // Get personnelNumber from the URL parameter
  
    try {
      // Fetch faculty data
      const { data: personnelData, error: personnelError } = await supabase
        .from('personnel') // Ensure this is your actual table name
        .select('*')
        .eq('personnelNumber', personnelNumber) // Match the personnelNumber
        .single(); // Expect a single result
  
      if (personnelError || !personnelData) {
        return res.status(404).json({ error: 'Personnel not found' });
      }

      // Fetch program data based on the faculty's programHeadNumber
      const { data: programData, error: programError } = await supabase
        .from('program') // Ensure this is your actual table name
        .select('*')
        .eq('programNumber', personnelData.programNumber) // Match with the faculty's personnelNumber
        .single(); // Expect a single result
  
      if (programError || !programData) {
        return res.status(404).json({ error: 'Program not found' });
      }
  
      // Combine faculty and program data
      const responseData = {
        ...personnelData,
        programName: programData.programName, // Add program name
        // You can add any other fields from the programData as needed
      };
  
      res.json(responseData); // Send the combined data as a response
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Login as Student
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

// All students
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

// Get all timeline entries
app.get('/timeline', async (req, res) => {
  try {
      // Fetch all timeline data
      const { data: timelineData, error: timelineError } = await supabase
          .from('timeline') // Ensure this is your actual table name
          .select('*');

      if (timelineError || !timelineData) {
          return res.status(500).json({ error: timelineError.message || 'Failed to fetch timeline data' });
      }

      res.json(timelineData); // Return the array of timeline entries
  } catch (error) {
      console.error('Error fetching timeline:', error); // Log the error
      res.status(500).json({ error: 'Internal server error' });
  }
});


// All personnels
app.get('/personnel', async (req, res) => {
  try {
      // Fetch all personnel data
      const { data: personnelData, error: personnelError } = await supabase
          .from('personnel')
          .select('*');

      if (personnelError || !personnelData) {
          return res.status(500).json({ error: personnelError.message || 'Failed to fetch personnel data' });
      }

      // Prepare an array to hold personnel data with program names
      const personnelWithPrograms = await Promise.all(personnelData.map(async (personnel) => {
          // Fetch program data based on the student's program number
          const { data: programData, error: programError } = await supabase
              .from('program')
              .select('*')
              .eq('programNumber', personnel.programNumber) // Match with the programNumber
              .single(); // Expect a single result

          if (programError || !programData) {
              return {
                  ...personnel,
                  programName: null, // If program is not found, set name to null
              };
          }

          return {
              ...personnel,
              programName: programData.programName, // Add program name
          };
      }));

      res.json(personnelWithPrograms); // Return the array of personnels with program names
  } catch (error) {
      console.error('Error fetching personnel:', error); // Log the error
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Insert new students
app.post('/student/upload', async (req, res) => {
  try {
      const studentsData = req.body.data;//This is in array format

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

app.post('/timeline/upload', async (req, res) => {
  try {
      const timelineData = req.body.data; // This is an object

      // Validate timelineData
      if (!timelineData || typeof timelineData !== 'object') {
          return res.status(400).json({ message: 'Invalid data format or no timeline to insert' });
      }

      // Perform insertion using Supabase
      const { data, error } = await supabase
          .from('timeline')
          .insert([timelineData]); // Wrap in an array for Supabase

      if (error) {
          throw error;
      }

      res.status(200).json(data);
  } catch (error) {
      console.error('Error inserting timeline:', error);
      res.status(500).json({ message: `Error inserting timeline: ${error.message || 'Unknown error'}` });
  }
});

//FETCHING PROGRAM DATA FROM SUPABASE
app.get('/program', async (req, res) => {
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


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
