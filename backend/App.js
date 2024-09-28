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
    const { data, error } = await supabase
        .from('faculty') // Ensure this is your actual table name
        .select('*')
        .eq('personnelNumber', personnelNumber) // Match the personnelNumber
        .single(); // Expect a single result since personnel numbers should be unique

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    if (!data) {
        return res.status(404).json({ error: 'Faculty not found' });
    }

    res.json(data); // Send the found data as a response
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
