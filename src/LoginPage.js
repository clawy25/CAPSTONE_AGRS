// src/LoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleStudentClick = () => {
    navigate('/student'); // Navigate to the student page
  };

  const handleFacultyClick = () => {
    navigate('/faculty'); // Navigate to the faculty login page
  };

  return (
    <div className="login-page">
      <div className="logo-section">
        <img 
          src={`${process.env.PUBLIC_URL}/pcc.png`} 
          alt="Parañaque City College Logo" 
          style={{ width: 'auto', height: 'auto' }} // Apply inline styles here
        />
      </div>
      <div className="login-section">
        <h1>Select your destination.</h1>
        <button className="login-button" onClick={handleStudentClick}>Student</button>
        <button className="login-button" onClick={handleFacultyClick}>Faculty</button>
      </div>
    </div>
  );
};

export default LoginPage;
