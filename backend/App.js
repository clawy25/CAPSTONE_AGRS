require('dotenv').config({ path: './backend/.env' }); // Added path to specify .env
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseServer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.SUPA_PORT; // Use the PORT from .env or default to 5000
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this for your frontend URL
}));
app.use(express.json());

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Bearer header
  
    if (!token) return res.sendStatus(401); // No token, unauthorized
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token, forbidden
        req.user = user; // Attach user data to request
        next(); // Proceed to the next middleware or route handler
    });
  };



// Redirect root URL to /faculty
app.get('/', (req, res) => {
    res.redirect('/student');
});

app.get('/protected-route', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

const generateToken = (personnel) => {
  return jwt.sign(
      { personnelNumber: personnel.personnelNumber, type: personnel.personnelType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
  );
};

// Login as Personnel
app.get('/personnel/:personnelNumber', async (req, res) => {
  const { personnelNumber } = req.params;

  try {
      // Fetch faculty data
      const { data: personnelData, error: personnelError } = await supabase
          .from('personnel')
          .select('*')
          .eq('personnelNumber', personnelNumber)
          .single();

      if (personnelError || !personnelData) {
          return res.status(404).json({ error: 'Personnel not found' });
      }

      const token = generateToken(personnelData); // Generate token
      
      res.cookie('token', token, {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === 'production',   // Sends the cookie only over HTTPS (set to false for local development)
        sameSite: 'Strict', // Helps prevent CSRF attacks
      });

      res.json(personnelData); // Send personnel data along with token
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

      const token = generateToken(responseData);

      res.cookie('token', token, {
        httpOnly: true, // Prevents JavaScript access
        secure: true,   // Sends the cookie only over HTTPS (set to false for local development)
        sameSite: 'Strict', // Helps prevent CSRF attacks
      });

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

// Retrieve personnel by personnelNumber
app.get('/personnel/:personnelNumber', async (req, res) => {
    const { personnelNumber } = req.params;

    try {
        const { data: personnelData, error } = await supabase
            .from('personnel')
            .select('*')
            .eq('personnelNumber', personnelNumber)
            .single();

        if (error || !personnelData) {
            return res.status(404).json({ error: 'Personnel not found' });
        }

        const token = generateToken(personnelData);
        res.json({ ...personnelData, token });
    } catch (error) {
        console.error('Error fetching personnel data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update personnel by personnelNumber
app.put('/personnel/:personnelNumber', async (req, res) => {
    const { personnelNumber } = req.params;
    const updatedPersonnelData = req.body;

    try {
        const { data, error } = await supabase
            .from('personnel')
            .update(updatedPersonnelData)
            .eq('personnelNumber', personnelNumber);

        if (error) {
            return res.status(500).json({ error: 'Failed to update personnel data' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating personnel data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete personnel by personnelNumber
app.delete('/personnel/:personnelNumber', async (req, res) => {
    const { personnelNumber } = req.params;

    try {
        const { data, error } = await supabase
            .from('personnel')
            .delete('*')
            .eq('personnelNumber', personnelNumber);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete personnel' });
        }

        res.json({ message: 'Personnel deleted successfully', data });
    } catch (error) {
        console.error('Error deleting personnel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Insert new personnel
app.post('/personnel/upload', async (req, res) => {
    try {
        const personnelData = req.body.data;

        // Check if personnelData is defined and is an array
        if (!personnelData || !Array.isArray(personnelData) || personnelData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or no personnel to insert' });
        }

        const personnelWithHashedPasswords = await Promise.all(personnelData.map(async (person) => {
            const hashedPassword = await bcrypt.hash(person.personnelPassword, 10);
            return {
                ...person,
                personnelPassword: hashedPassword
            };
        }));

        const { data, error } = await supabase
            .from('personnel')
            .insert(personnelWithHashedPasswords);

        if (error) {
            throw error; // Log the error for debugging
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error inserting personnel:', error);
        res.status(500).json({ message: `Error inserting personnel: ${error.message || 'Unknown error'}` });
    }
});


  
//Insert new timeline
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

//Fetch all programs
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


// Get all subjects
app.get('/course', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('course')
            .select('*');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get course by ID
app.get('/course/:id', async (req, res) => {
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


// Add new course
app.post('/course/upload', async (req, res) => {
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

  
// Update course by ID
app.put('/course/:id', async (req, res) => {
    const { id } = req.params;
    const { courseDescriptiveTitle, courseLecture, courseLaboratory, coursePreRequisite, courseUnits } = req.body;

    try {
        const { data, error } = await supabase
            .from('course')
            .update({ courseDescriptiveTitle, courseLecture, courseLaboratory, coursePreRequisite, courseUnits })
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Failed to update course' });
        }

        res.json({ message: 'Course updated successfully', data });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete course by ID
app.delete('/course/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('course')
            .delete("*")
            .eq('id', id); // Change "*" to use the default delete behavior

        if (error) {
            return res.status(500).json({ error: 'Failed to delete course' });
        }

        res.json({ message: 'Course deleted successfully', data });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




  // Fetch all year levels
app.get('/yearLevel', async (req, res) => {
    try {
        // Fetch all year level data
        const { data: yearLevelData, error: yearLevelError } = await supabase
            .from('yearLevel') // Replace with your actual table name
            .select('*'); // Select all columns

        if (yearLevelError || !yearLevelData) {
            return res.status(500).json({ error: yearLevelError.message || 'Failed to fetch year level data' });
        }

        res.json(yearLevelData); // Return the array of year level data
    } catch (error) {
        console.error('Error fetching year level data:', error); // Log the error
        res.status(500).json({ error: 'Internal server error' });
    }
});


// All sections
app.get('/section', async (req, res) => {
    try {
        const { data: sectionData, error: sectionError } = await supabase
            .from('section')
            .select('*');

        if (sectionError || !sectionData) {
            return res.status(500).json({ error: sectionError.message || 'Failed to fetch section data' });
        }

        res.json(sectionData); // Return the array of sections
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


  //Insert new section
app.post('/section/upload', async (req, res) => {
    try {
        const sectionData = req.body.data; // This is an object
  
        // Validate timelineData
        if (!sectionData || typeof sectionData !== 'object') {
            return res.status(400).json({ message: 'Invalid data format or no section to insert' });
        }
  
        // Perform insertion using Supabase
        const { data, error } = await supabase
            .from('section')
            .insert([sectionData]); // Wrap in an array for Supabase
  
        if (error) {
            throw error;
        }
  
        res.status(200).json(data);
    } catch (error) {
        console.error('Error inserting section:', error);
        res.status(500).json({ message: `Error inserting timeline: ${error.message || 'Unknown error'}` });
    }
  });

  
// Get all schedules
app.get('/schedule', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('schedule')
            .select('*');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get schedule by ID
app.get('/schedule/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('schedule')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Add new schedule (multiple schedules at once)
app.post('/schedule/upload', async (req, res) => {
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


// Update schedule by ID
app.put('/schedule/:id', async (req, res) => {
    const { id } = req.params;
    const { scheduleNumber, courseCode, courseDescriptiveTitle, courseLecture, courseLaboratory, personnelNumber, professorName, scheduleDay, startTime, endTime, numberOfHours, units, yearNumber, sectionNumber } = req.body;

    try {
        const { data, error } = await supabase
            .from('schedule')
            .update({
                scheduleNumber,
                courseCode,
                courseDescriptiveTitle,
                courseLecture,
                courseLaboratory,
                personnelNumber,
                professorName,
                scheduleDay,
                startTime,
                endTime,
                numberOfHours,
                units,
                yearNumber,
                sectionNumber
            })
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Failed to update schedule' });
        }

        res.json({ message: 'Schedule updated successfully', data });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete schedule by ID
app.delete('/schedule/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('schedule')
            .delete("*")
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete schedule' });
        }

        res.json({ message: 'Schedule deleted successfully', data });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});







// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
