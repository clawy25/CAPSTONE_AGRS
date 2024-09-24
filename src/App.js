// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
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
import ProgramHeadDashboard from './ProgramHeadComponents/ProgramHeadDashboard';
import ErrorPage from './ErrorPage';


const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/student" element={<StudentPage />} /> 
      <Route path="/faculty" element={<FacultyPage />} /> 
      <Route path="/dashboard" element={<Dashboard />} /> 
      <Route path="/schedule" element={<Schedule />} /> 
      <Route path="/faculty-schedule" element={<FacultySchedulePage />} /> 
      <Route path="/faculty-dashboard" element={<FacultyDashboard />} /> 
      <Route path="/grades" element={<Grades />} /> 
      <Route path="/class-details/:className" element={<ClassDetails />} />
      <Route path="/registrar-dashboard" element={<RegistrarDashboard />} /> 
      <Route path="/registrar-students" element={<RegistrarStudents />} /> 
      <Route path="/programHead-dashboard" element={<ProgramHeadDashboard />} /> 

      <Route path="*" element={<ErrorPage />} />

    </Routes>
  );
};

export default App;
