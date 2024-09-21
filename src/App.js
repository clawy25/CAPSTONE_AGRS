// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import StudentPage from './StudentPage'; 
import FacultyPage from './FacultyPage'; 
import Dashboard from './Dashboard'; 
import Schedule from './Schedule';
import Grades from './Grades'; 
import FacultyDashboard from './FacultyDashboard';
import FacultySchedulePage from './FacultySchedulePage';
import ClassDetails from './ClassDetails';
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
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default App;
