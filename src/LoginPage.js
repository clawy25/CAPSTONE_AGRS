// src/LoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './App.css';


export default function LoginPage () {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleStudentClick = () => {
    navigate('/student'); // Navigate to the student page
  };

  const handleFacultyClick = () => {
    navigate('/faculty'); // Navigate to the faculty login page
  };

  return (
    <div className="container-fluid">
            <div className="row">
                <div className="col container">
                    <img className="img-fluid rounded mx-auto d-block mt-5 pt-5" src='pcc.png'alt="PCC Logo" width="477px" height="480px" />
                </div>
                <div className="col bg-custom-color-green">
                    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
                        <h1 className="custom-font text-light fs-1 fw-bold text-center">
                            Select your <br />destination.
                        </h1>

                        <div className="d-grid gap-2 col-8 mx-auto mt-2">
                            <button className="btn bg-custom-color-yellow custom-font custom-button fs-5" type="button" onClick={handleStudentClick}>
                                Student
                            </button>
                            <button className="btn bg-custom-color-yellow custom-font custom-button fs-5" type="button" onClick={handleFacultyClick}>
                                Faculty
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  );
};


