import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { useState } from 'react';

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
            <div className="row">
                <div className="col-6 p-0 position-relative">
                    <img 
                        className="PCC-Building img-fluid w-100 h-100" 
                        src='pccCover.jpg'
                        alt="PCC Building" 
                        style={{ objectFit: 'cover', minHeight: '100vh' }} 
                    />
                    <img 
                        src='pcc.png' 
                        alt="PCC Logo" 
                        className="logo" 
                    />
                </div>

                <div className="col-6 bg-custom-color-green position-relative">
                    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
                        <h1 className="custom-font text-light fs-1 fw-bold text-center">
                           PARCOL-SIS <br />Student Module
                        </h1>

                        <form className="col-8 mx-auto mt-2 gap-2" onSubmit={handleLogin}>
                            <input 
                                type="text" 
                                className="form-control custom-input custom-font fs-5 mb-2" 
                                id="studentId" 
                                placeholder="Student ID" 
                                value={studentId} 
                                onChange={(e) => setStudentId(e.target.value)} 
                                required 
                            />
                            <input 
                                type="password" 
                                className="form-control custom-input custom-font fs-5 mb-2" 
                                id="password" 
                                placeholder="Password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required
                            />
                            <button 
                                className="btn bg-custom-color-yellow custom-font custom-button fs-5" 
                                type="submit">
                                Login
                            </button>
                        </form>
                    </div>
                    <button 
                        className="btn btn-back custom-font fs-6" 
                        onClick={handleBackClick}>
                        BACK
                    </button>
                </div>
            </div>
        </div>
  );
};


