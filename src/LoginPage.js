import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './App.css';

export default function LoginPage() {
  const navigate = useNavigate(); 

  const handleStudentClick = () => {
    navigate('/student'); 
  };

  const handleFacultyClick = () => {
    navigate('/faculty'); 
  };

  return (
    <div className="container-fluid">
      <div className="row d-flex flex-column flex-md-row">
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center flex-column order-2 order-md-1">
          <img
            className="PCClogo img-fluid rounded mt-4 pt-md-3"
            src="pcc.png"
            alt="PCC Logo"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
          <h1 className="custom-font text-light fs-1 fw-bold text-center mb-4">
            Select your <br />
            destination.
          </h1>

          <div className="d-grid gap-2 col-8 mx-auto mt-2">
            <button
              className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold"
              type="button"
              onClick={handleStudentClick}
            >
              Student
            </button>
            <button
              className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold"
              type="button"
              onClick={handleFacultyClick}
            >
              Faculty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
