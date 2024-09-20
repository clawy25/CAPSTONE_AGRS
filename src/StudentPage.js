import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function StudentPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Student ID:', studentId);
    console.log('Password:', password);
    navigate('/dashboard');
  };

  const handleBackClick = () => {
    navigate('/login'); // Navigate back to the LoginPage
  };

  return (
    <div className="container-fluid">
      <div className="row no-gutters">
        {/* Column for image and logo, shown on larger screens only */}
        <div className="col-12 col-md-6 p-0 position-relative d-none d-md-block">
          <img 
            className="img-fluid w-100 h-100" 
            src='pccCover.jpg'
            alt="PCC Building" 
            style={{ objectFit: 'cover', minHeight: '100vh' }} 
          />
          <img 
            src='pcc.png' 
            alt="PCC Logo" 
            className="logo position-absolute top-0 start-0 m-3" 
            style={{ maxWidth: '150px' }} // Adjust size as needed
          />
        </div>

        {/* Column for input and buttons, displayed on all screen sizes */}
        <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
          <h1 className="custom-font text-light fs-1 fw-bold text-center mb-4">
            PARCOL-SIS <br />Student Module
          </h1>

          <form className="d-grid gap-2 col-8 mx-auto mt-2" onSubmit={handleLogin}>
            <input 
              type="text" 
              className="form-control custom-input custom-font fs-5" 
              id="studentId" 
              placeholder="Student ID" 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              className="form-control custom-input custom-font fs-5" 
              id="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <button 
              className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold" 
              type="submit">
              Login
            </button>
          </form>
          <button 
            className="btn btn-back custom-font fs-6 mt-3 custom-color-font fw-semibold" 
            onClick={handleBackClick}>
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}
