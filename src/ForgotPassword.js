import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function Forgotpassword(){
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('ClintJayven2021Pepito');
    const [showPassword, setShowPassword] = useState(false);

    const handleBackClick = () => {
        navigate('/login');
      };
    

    const togglePasswordVisibility = () => {
       
        setShowPassword(!showPassword); // Toggle the password visibility
      };
    return(
        <div className="container-fluid hide-scrollbar">
      <div className="row d-flex flex-column flex-md-row">
        
        <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
        <img
            className="miniPCClogo img-fluid rounded mt-4 mb-3 pt-md-3"
            src="pcc.png"
            alt="PCC Logo"
            style={{ maxWidth: '17%', height: 'auto' }}
          />
          <p className="custom-font text-light fs-1 fw-bold text-center mb-4">
            Request New Password
          </p>

          <div className="d-grid gap-2 col-8 mx-auto mt-2">
          <form className="d-grid gap-2 col-8 mx-auto mt-2">
            <input
              type="text"
              className="form-control custom-input custom-font fs-5"
              id="StudentEmail"
              placeholder="Email Address"
              required
            />

            <button
              className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold"
              type="submit">
              Request New Password
            </button>
          </form>
          <button
            className="btn btn-back custom-font fs-6 mt-3 custom-color-font fw-semibold"
            onClick={handleBackClick}>
            BACK
          </button>
            
          </div>
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center flex-column order-2 order-md-1">
          <img
            className="PCClogo img-fluid rounded mt-4 pt-md-3"
            src="pcc.png"
            alt="PCC Logo"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
    
}