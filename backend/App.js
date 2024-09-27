// Import required packages
require('dotenv').config(); // Load environment variables from .env file

console.log('Environment Variables Loaded:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
});

const express = require('express');

// Import the Supabase client
const supabase = require('./supabaseServer'); // Ensure the path is correct

// Initialize Express
const app = express();
const port = process.env.PORT || 5000; // Use the PORT from .env or default to 5000

// Middleware to parse JSON requests
app.use(express.json());

// A sample API route using Supabase
app.get('/data', async (req, res) => {
    const { data, error } = await supabase
        .from('testing')  // Replace with your Supabase table name
        .select('Name, StudID');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Redirect root URL to /data
app.get('/', (req, res) => {
    res.redirect('/data');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
