require('dotenv').config({ path: './backend/.env' }); // Load environment variables
const express = require('express');
const cors = require('cors');
const path = require('path');
const personnelRoutes = require('./api/personnel.js'); // Import personnel router
const studentRoutes = require('./api/student.js'); // Import personnel router

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'https://paranaquecitycollege.onrender.com' }));
app.use(express.json());

// Mount routers
app.use('/personnel', personnelRoutes);
app.use('/student', studentRoutes);

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
