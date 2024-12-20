require('dotenv').config({ path: './backend/.env' }); // Load environment variables
const express = require('express');
const cors = require('cors');
const path = require('path');
const personnelRoutes = require('./api/personnel.js');
const studentRoutes = require('./api/student.js'); 
const academicYearRoutes = require('./api/academicYear.js');
const attendanceRoutes = require('./api/attendance.js');
const componentRoutes = require('./api/component.js');
const courseRoutes = require('./api/course.js');
const enrollmentRoutes = require('./api/enrollment.js');
const examRoutes = require('./api/exam.js');
const gradeRoutes = require('./api/grade.js');
const pbaRoutes = require('./api/pba.js');
const programRoutes = require('./api/program.js');
const quizRoutes = require('./api/quiz.js');
const scheduleRoutes = require('./api/schedule.js');
const sectionRoutes = require('./api/section.js');
const submissionRoutes = require('./api/submission.js');
const timelineRoutes = require('./api/timeline.js');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['https://paranaquecitycollege.onrender.com', 'http://localhost:3001'] }));
app.use(express.json());

// Mount routers
app.use('/personnel', personnelRoutes);
app.use('/student', studentRoutes);
app.use('/academicYear', academicYearRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/component', componentRoutes);// DONE
app.use('/course', courseRoutes);
app.use('/enrollment', enrollmentRoutes);
app.use('/exam', examRoutes);
app.use('/grade', gradeRoutes);
app.use('/pba', pbaRoutes);
app.use('/program', programRoutes);
app.use('/quiz', quizRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/section', sectionRoutes);
app.use('/submission', submissionRoutes);
app.use('/timeline', timelineRoutes);

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
