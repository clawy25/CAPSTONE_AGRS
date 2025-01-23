// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import { UserProvider } from './Context/UserContext'; // Import UserProvider function
import LoginPage from './LoginPage';
import LoginPage2 from './LoginPage2';
import StudentPage from './StudentComponents/StudentPage'; 
import FacultyPage from './FacultyComponents/FacultyPage'; 
import Dashboard from './StudentComponents/StudentDashboard'; 
import Schedule from './StudentComponents/StudentSchedule';
import Grades from './StudentComponents/StudentGrades'; 
import FacultyDashboard from './FacultyComponents/FacultyDashboard';
import FacultySchedulePage from './FacultyComponents/FacultySchedulePage';
import ClassDetails from './FacultyComponents/ClassDetails';
import RegistrarDashboard from './RegistrarComponents/RegistrarDashboard';
import RegistrarStudents from './RegistrarComponents/RegistrarStudents';
import RegistrarPage from './RegistrarComponents/RegistrarPage';
import ProgramHeadDashboard from './ProgramHeadComponents/ProgramHeadDashboard';
import ProgramHeadPage from './ProgramHeadComponents/ProgramHeadPage';
import StudentEnrollmentSchedule from './StudentComponents/StudentEnrollmentSchedule';
import ForgotPassword from './ForgotPassword';
import ErrorPage from './ErrorPage';
import ResetPassword from './ResetPassword';

const App = () => {

  document.addEventListener("contextmenu", (event) => event.preventDefault());

let devtoolsOpen = false; // Keeps track of DevTools state

const checkDevTools = () => {
    const threshold = 160; // Threshold for detecting DevTools
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
            devtoolsOpen = true; // Mark DevTools as open

            // Persistently alert the user using a while loop
          
                alert("DevTools is open! Please close it to continue.");

                // Recheck the state after the alert is dismissed
                const newWidthThreshold = window.outerWidth - window.innerWidth > threshold;
                const newHeightThreshold = window.outerHeight - window.innerHeight > threshold;

                // Break out of the loop if DevTools is closed
                if (!newWidthThreshold && !newHeightThreshold) {
                    devtoolsOpen = false;
                }
            
        }
    } else {
        devtoolsOpen = false; // Reset when DevTools is closed
    }
};

// Check DevTools state every 500ms
setInterval(checkDevTools, 500);

document.addEventListener("keydown", (event) => {
    if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && event.key === "I") ||
        (event.ctrlKey && event.key === "U")
    ) {
        event.preventDefault();
        alert("Developer tools access is disabled.");
    }
});

  return (
    <UserProvider> {/* Wrap the whole app inside UserProvider */}
      <Routes>
        {/* Redirect root URL to /login */}
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login2" element={<LoginPage2 />} />
        <Route path="/student" element={<StudentPage />} /> 
        <Route path="/faculty" element={<FacultyPage />} /> 
        <Route path="/registrar" element={<RegistrarPage />} /> 
        <Route path="/programHead" element={<ProgramHeadPage />} /> 
        <Route path="/student-dashboard/*" element={<Dashboard />} /> 
        <Route path="/schedule" element={<Schedule />} /> 
        <Route path="/faculty-dashboard/*" element={<FacultyDashboard />} /> 
        <Route path="/grades" element={<Grades />} /> 
        <Route path="/class-details/:className" element={<ClassDetails />} />
        <Route path="/registrar-dashboard/*" element={<RegistrarDashboard />} /> 
        <Route path="/programHead-dashboard/*" element={<ProgramHeadDashboard />} /> 
        <Route path="*" element={<ErrorPage />} />
        <Route path="/studentEnrollmentSchedule" element={<StudentEnrollmentSchedule/>} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
      </Routes>
    </UserProvider>
  );
};

export default App;
