const express = require('express');
const router = express.Router();
const supabase = require('../supabaseServer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (personnel) => {
    return jwt.sign(
        { personnelNumber: personnel.personnelNumber, type: personnel.personnelType },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Login route for personnel
// Login as Personnel
router.post('/login', async (req, res) => {
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

router.post('/byProgram', async (req, res) => {
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

router.post('/all', async (req, res) => {
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

router.get('/:personnelNumber', async (req, res) => {
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

router.put('/:personnelNumber', async (req, res) => {
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
router.delete('/:personnelNumber', async (req, res) => {
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
router.post('/personnel/upload', async (req, res) => {
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


module.exports = router;
