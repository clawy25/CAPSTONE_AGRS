require('dotenv').config({ path: './backend/.env' }); // Load environment variables
const express = require('express');
const cors = require('cors');
const path = require('path');
const personnelRoutes = require('./api/personnel.js'); // Import personnel router
//const studentsRoutes = require('./api/student.js');   // Import students router

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'https://paranaquecitycollege.onrender.com' }));
app.use(express.json());

// Mount routers
app.use('/personnel', personnelRoutes);
//app.use('/api/students', studentsRoutes);

// // Serve static React app
// app.use(express.static(path.join(__dirname, 'build')));
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
