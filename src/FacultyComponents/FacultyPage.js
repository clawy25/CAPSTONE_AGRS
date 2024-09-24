import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function FacultyPage() {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setAccountPassword] = useState('');
    

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Account Number:', accountNumber);
        console.log('Password:', password);
        navigate('/faculty-dashboard');
    };

  const handleBackClick = () => {
    navigate('/login'); 
  };

  return (
    <div className="container-fluid">
            <div className="row no-gutters">
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
                    />
                </div>

             
                    <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
                        <img
                            className="miniPCClogo img-fluid rounded mt-4 mb-3 pt-md-3"
                            src="pcc.png"
                            alt="PCC Logo"
                            style={{ maxWidth: '17%', height: 'auto' }}
                        />
                        <h1 className="custom-font text-light fs-1 fw-bold text-center mb-4">
                           PARCOL-SIS <br />Faculty Module
                        </h1>

                        <form className="d-grid gap-2 col-8 mx-auto mt-2" onSubmit={handleLogin}>
                            <input 
                                type="text" 
                                className="form-control custom-input custom-font fs-5 " 
                                id="accountNumber" 
                                placeholder="Account Number" 
                                value={accountNumber} 
                                onChange={(e) => setAccountNumber(e.target.value)} 
                                required 
                            />
                            <input 
                                type="password" 
                                className="form-control custom-input custom-font fs-5 " 
                                id="password" 
                                placeholder="Password" 
                                value={password} 
                                onChange={(e) => setAccountPassword(e.target.value)} 
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
                        onClick={handleBackClick}
                    >
                        BACK
                    </button>
                    </div>
                    
                </div>
            </div>
       
  );
};


