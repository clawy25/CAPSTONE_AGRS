import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FacultyPage.css';

const FacultyPage = () => {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Add your login logic here
    // For now, we're just navigating to the faculty dashboard
    if (accountNumber && password) {
      // Assuming successful login, navigate to the faculty dashboard
      navigate('/faculty-dashboard'); // Update with your actual faculty dashboard route
    } else {
      alert('Please enter both account number and password.');
    }
  };

  const handleBackClick = () => {
    navigate('/login'); // Navigate back to the LoginPage
  };

  return (
    <div className="faculty-page">
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
          <h2>Faculty Module</h2>
          <input 
            type="text" 
            placeholder="Account Number" 
            className="input-field"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" onClick={handleLogin}>LOGIN</button>
        </div>
        <button className="back-button" onClick={handleBackClick}>BACK</button>
      </div>
    </div>
  );
};

export default FacultyPage;
