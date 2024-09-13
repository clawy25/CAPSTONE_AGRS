import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentPage.css';

const StudentPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Here you can add your login logic before navigating
    navigate('/dashboard');
  };

  const handleBackClick = () => {
    navigate('/login'); // Navigate back to the LoginPage
  };

  return (
    <div className="student-page">
      {/* Left side with image */}
      <div className="left-section">
        <img 
          src="pccCover.jpg" 
          alt="Parañaque City College" 
          className="background-image"
        />
      </div>

      {/* Right side with form */}
      <div className="right-section">
        <div className="login-form">
          <h1>PARCOL-SIS</h1>
          <h2>Student Module</h2>
          <input 
            type="text" 
            placeholder="Student Number" 
            className="input-field"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field"
          />
          <button className="login-button" onClick={handleLogin}>LOGIN</button>
        </div>
        <button className="back-button" onClick={handleBackClick}>BACK</button>
      </div>
    </div>
  );
};

export default StudentPage;
