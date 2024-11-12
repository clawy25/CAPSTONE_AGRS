require('dotenv').config({ path: './backend/.env' }); // Added path to specify .env
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseServer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.SUPA_PORT; // Use the PORT from .env
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

const generatepersonnelToken = (personnel) => {
  return jwt.sign(
      { personnelNumber: personnel.personnelNumber, type: personnel.personnelType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
  );
};

const generatestudentToken = (student) => {
    return jwt.sign(
        { studentNumber: student.studentNumber, type: student.studentType },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
  };
  

// Login as Personnel
app.post('/personnel/login', async (req, res) => {
    const { personnelNumber, password } = req.body;
    try {
        // Fetch personnel data based on personnelNumber
        const { data: personnelData, error: personnelError } = await supabase
            .from('personnel')
            .select('*')
            .eq('personnelNumber', personnelNumber)
            .single();
  
        if (personnelError || !personnelData) {
            return res.status(404).json({ error: 'Personnel not found' });
        }
        // Compare the provided password with the hashed password from the database
        const isMatch = await bcrypt.compare(password, personnelData.personnelPassword);
  
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' }); // Invalid password response
        }
        // If password is correct, generate a token
        const token = generatepersonnelToken(personnelData); // Replace this with your token generation logic
        
        // Set the token in a secure cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevent JavaScript access
            secure: process.env.NODE_ENV === 'production', // Send over HTTPS in production
            sameSite: 'Strict', // Helps prevent CSRF attacks
        });
  
        // Fetch academic year data
        const { data: academicYear, error: academicYearError } = await supabase
            .from('academicYear')
            .select('academicYear')
            .eq('isCurrent', true)
            .single();
  
        if (academicYearError || !academicYear) {
            console.log('Academic year not found');
        }
  
        // Combine personnel data with academic year
        const personnelWithAcadYear = {
            personnelNumber: personnelData.personnelNumber,
            personnelType: personnelData.personnelType,
            personnelNameFirst: personnelData.personnelNameFirst,
            personnelNameMiddle: personnelData.personnelNameMiddle,
            personnelNameLast: personnelData.personnelNameLast,
            programNumber: personnelData.programNumber,
            academicYear: academicYear.academicYear // Attach academic year data
        };

        res.json(personnelWithAcadYear); // Send the combined response
  
    } catch (error) {
        console.error('Error fetching personnel data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login as Student
app.post('/student/login', async (req, res) => {
    const { studentNumber, password } = req.body; // Get studentNumber from the URL parameter
    try {

        console.log(studentNumber);
        console.log(password);
      const { data: studentData, error: studentError } = await supabase
        .from('student') // Ensure this is your actual table name
        .select('*')
        .eq('studentNumber', studentNumber) // Match the personnelNumber
        .single(); // Expect a single result

        console.log(studentData);
      if (studentError || !studentData) {
        return res.status(404).json({ error: 'Student not found' });
      }
       // Compare the provided password with the hashed password from the database
      const isMatch = await bcrypt.compare(password, studentData.studentPassword);
      console.log('Password Match Result:', isMatch);
    
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' }); // Invalid password response
      }
      // If password is correct, generate a token
      const token = generatestudentToken(studentData); // Replace this with your token generation logic

      // Set the token in a secure cookie
      res.cookie('token', token, {
          httpOnly: true, // Prevent JavaScript access
          secure: process.env.NODE_ENV === 'production', // Send over HTTPS in production
          sameSite: 'Strict', // Helps prevent CSRF attacks
      });

      console.log(token);

      res.json(studentData); // Send the combined data as a response
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
  
  // All personnels by Program + Current Academic Year
app.post('/personnel/byProgram', async (req, res) => {
    const { programNumber, currentAcadYear } = req.body;
    try {
        // Fetch all personnel data by programNumber and personnelType
        const { data: personnelData, error: personnelError } = await supabase
            .from('personnel')
            .select('*')
            .eq('programNumber', programNumber)
            .eq('academicYear',currentAcadYear);
  
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
                    programName: null, // If program is not found, set to null
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
 // All personnels by Current Academic Year
 app.post('/personnel', async (req, res) => {
    const { currentAcadYear } = req.body;
    try {
        const { data: personnelData, error: personnelError } = await supabase
            .from('personnel')
            .select('*')
            .eq('academicYear', currentAcadYear);

        if (personnelError || !personnelData) {
            return res.status(500).json({ error: personnelError ? personnelError.message : 'No personnel found' });
        }

        // Prepare an array to hold personnel data with program names
        const personnelWithPrograms = await Promise.all(personnelData.map(async (personnel) => {
            // Fetch program data based on the programNumber
            const { data: programData, error: programError } = await supabase
                .from('program')
                .select('*')
                .eq('programNumber', personnel.programNumber); // Match with the programNumber

            if (programError || !programData || programData.length === 0) {
                return {
                    ...personnel,
                    programName: null, // If program is not found, set to null
                };
            }

            // Select the first program name from the list (if multiple programs exist for the same programNumber)
            const programName = programData[0].programName;

            return {
                ...personnel,
                programName: programName, // Add program name from the first matching record
            };
        }));
  
        res.json(personnelWithPrograms); // Return the array of personnel with program names
    } catch (error) {
        console.error('Error fetching personnel details:', error);
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

      const studentWithHashedPasswords = await Promise.all(studentsData.map(async (person) => {
        const hashedPassword = await bcrypt.hash(person.studentPassword, 10);
        return {
            ...person,
            studentPassword: hashedPassword
        };
    }));

      // Perform bulk insertion using Supabase
      const { data, error } = await supabase
          .from('student') // Replace with your table name
          .insert(studentWithHashedPasswords);

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

//DELETE PROGRAM BY PROGRAM NUMBER
app.delete('/program/:programNumber', async (req, res) => {
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



app.post('/program/upload', async (req, res) => {
    try {
        const newProgramData = req.body.data;//This is in array format
  
        // Validate newProgramData
        if (!Array.isArray(newProgramData) || newProgramData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or no students to insert' });
        }
  
        // Perform bulk insertion using Supabase
        const { data, error } = await supabase
            .from('program') // Replace with your table name
            .insert(newProgramData);
  
        if (error) {
            throw error;
        }
  
        res.status(200).json(data);
    } catch (error) {
        console.error('Error inserting programs:', error);
        res.status(500).json({ message: `Error inserting programs: ${error.message || 'Unknown error'}` });
    }
  });


app.get('/courses', async (req, res) => {
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

// Get all course by Program + Current Academic Year
app.post('/course/byProgram', async (req, res) => {
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
app.put('/course/update', async (req, res) => {
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


// Delete course by ID
app.delete('/course/delete', async (req, res) => {
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

app.delete('/schedule/:id', async (req, res) => {
    const scheduleId = req.params.id;
  
    try {
      const deletedSchedule = await ScheduleModel.deleteById(scheduleId);
      
      if (deletedSchedule) {
        return res.json({ success: true, message: 'Schedule deleted' });
      } else {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete schedule' });
    }
  });



  // Get all academicYear
app.get('/academicYear', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('academicYear')
            .select('*');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching academic year:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





  //Insert new section
  app.post('/academicYear/upload', async (req, res) => {
    const { data } = req.body;

    try {
        const { data: newYear, error } = await supabase
            .from('academicYear')
            .insert([data])
            .single(); // Ensures we get the inserted record

        if (error || !newYear) {
            return res.status(400).json({ error: 'Error creating academic year' });
        }

        res.status(201).json(newYear); // Return the created year
    } catch (error) {
        console.error('Error creating academic year:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


  // Update academicYear by ID
app.put('/academicYear/:id', async (req, res) => {
    const { id } = req.params;
    const { academicYear, isCurrent} = req.body;

    try {
        const { data, error } = await supabase
            .from('academicYear')
            .update({ academicYear, isCurrent})
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Failed to update academicYear' });
        }

        res.json({ message: 'Course updated successfully', data });
    } catch (error) {
        console.error('Error updating academic year:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
