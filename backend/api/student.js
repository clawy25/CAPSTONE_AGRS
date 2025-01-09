const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (student) => {
    return jwt.sign(
        { studentNumber: student.studentNumber, type: student.studentType },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

function convertToE164(localNumber) {
    // Remove non-numeric characters and leading zero
    const cleanedNumber = localNumber.replace(/^0/, '');
    // Add country code and return the E.164 format
    return `+63${cleanedNumber}`;
}

router.post('/login', async (req, res) => {
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
      const token = generateToken(studentData); // Replace this with your token generation logic

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

router.get('/all', async (req, res) => {
    try {
        // Fetch all student data
        const { data: studentData, error: studentError } = await supabase
            .from('student')
            .select('*');
  
        if (studentError || !studentData) {
            return res.status(500).json({ error: studentError.message || 'Failed to fetch student data' });
        }

        res.json(studentData); // Return the array of students with program names
    } catch (error) {
        console.error('Error fetching students:', error); // Log the error
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        const studentsData = req.body.data; // This is in array format

        // Validate studentsData
        if (!Array.isArray(studentsData) || studentsData.length === 0) {
            return res.status(400).json({ message: 'Invalid data format or no students to insert' });
        }

        // Prepare student data with hashed passwords
        const studentWithHashedPasswords = await Promise.all(studentsData.map(async (person) => {
            const hashedPassword = await bcrypt.hash(person.studentPassword, 10);
            return {
                ...person,
                studentPassword: hashedPassword
            };
        }));

        // Insert into auth.users via Supabase Auth API
        const authData = await Promise.all(
            studentWithHashedPasswords.map(async (person) => {
                const { data, error } = await supabase.auth.admin.createUser({
                    email: person.studentEmail, // Email for authentication
                    password: person.studentPassword, // Hashed password (handled by Supabase)
                    phone: convertToE164(person.studentContact), // Optional phone
                    user_metadata: {
                        name: `${person.studentNameFirst} ${person.studentNameMiddle || ''} ${person.studentNameLast}`,
                        studentNumber: person.studentNumber,
                        sex: person.studentSex,
                        birthDate: person.studentBirthDate,
                        address: person.studentAddress,
                    },
                });

                if (error) {
                    throw new Error(`Error creating user in auth.users: ${error.message}`);
                }

                return data; // Returns the created user data
            })
        );

        // Map auth.user IDs back to the student data
        const studentTableData = studentWithHashedPasswords.map((person, index) => ({
            studentNumber: person.studentNumber,
            studentEmail: person.studentEmail,
            studentNameFirst: person.studentNameFirst,
            studentNameMiddle: person.studentNameMiddle || null,
            studentNameLast: person.studentNameLast,
            studentSex: person.studentSex,
            studentBirthDate: person.studentBirthDate,
            studentAddress: person.studentAddress,
            studentContact: person.studentContact,
            auth_id: authData[index].id, // Linking auth.users ID
        }));

        // Insert into the public.student table
        const { data: studentData, error: studentError } = await supabase
            .from('student')
            .insert(studentTableData);

        if (studentError) {
            throw new Error(`Error inserting into student table: ${studentError.message}`);
        }

        res.status(200).json(studentData);
    } catch (error) {
        console.error('Error inserting students:', error);
        res.status(500).json({ message: `Error inserting students: ${error.message || 'Unknown error'}` });
    }
});




  router.put('/:studentNumber', async (req, res) => {
    const { studentNumber } = req.params;
    const updatedStudentData = req.body;

    try {
        const { data, error } = await supabase
            .from('student')
            .update(updatedStudentData)
            .eq('studentNumber', studentNumber);

        if (error) {
            return res.status(500).json({ error: 'Failed to update student data' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating student data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;