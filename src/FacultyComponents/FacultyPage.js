import React, { useState, useContext, useEffect } from 'react'; //Added useContext here
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import PersonnelModel from '../ReactModels/PersonnelModel'; // Adjust the path as necessary
import '../App.css';

import { UserContext } from '../Context/UserContext';


export default function FacultyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [accountNumber, setAccountNumber] = useState('0000-000-PCC-0');
  const [password, setAccountPassword] = useState('Agrspcc2024');
  const { setUser } = useContext(UserContext);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentImage, setCurrentImage] = useState('pccCover.png');
  const images = ['pccCover.png', 'pccCover1.png', 'pccCover2.png']; // list of images
  const timeLimit = 5000;
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  let devtoolsOpen = false;

  const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 200;
      const heightThreshold = window.outerHeight - window.innerHeight > 200;
  
      if (widthThreshold || heightThreshold) {
          if (!devtoolsOpen) {
              devtoolsOpen = true;
              alert("DevTools is open! Please close it to continue.");
          }
      } else {
          devtoolsOpen = false;
      }
  };
  
  setInterval(checkDevTools, 500);
  document.addEventListener("keydown", (event) => {
    if (
        event.key === "F12" || 
        (event.ctrlKey && event.shiftKey && event.key === "I") || 
        (event.ctrlKey && event.key === "U")
    ) {
        event.preventDefault();
        alert("Developer tools access is disabled.");
    }
});
(function() {
  const originalConsoleLog = console.log;
  console.log = function(...args) {
      if (args.includes("DevTools")) {
          throw new Error("Access to console is restricted.");
      }
      originalConsoleLog(...args);
  };
})();
  const handleForgotpassword = () => {
    navigate('/ForgotPassword');
  }
    

    const handleLogin = async (e) => {
        e.preventDefault();
    
    // Reset error message
    setError('');
      setLoading(true);
    // Student ID validation
    const personnelNumberPattern = /^\d{4}-\d{3}-PCC-\d{1}$/;
    if (!personnelNumberPattern.test(accountNumber)) {
      setError('Faculty ID must follow the format (e.g., 2024-123-PCC-1)');
      return;
    }

    // Password validation
    if (/\s/.test(password)) {
      // If password contains any space, prevent form submission
      setError('Password must not have spaces.');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one digit.');
      setLoading(false);
      return;
    }

    
    //Debugging
    console.log('Account Number:', accountNumber);
    
    try {
      // Fetch the personnel data using the account number
      const user = await PersonnelModel.LoginPersonnelData(accountNumber, password);

      if (user) {
        const credentials = {
            personnelNumber: user.personnelNumber,
            personnelType: user.personnelType,
            personnelNameFirst: user.personnelNameFirst,
            personnelNameMiddle: user.personnelNameMiddle,
            personnelNameLast: user.personnelNameLast,
            programNumber: user.programNumber,
            academicYear: user.academicYear
        };
      setUser(credentials); // Store the current user's credentials to UserContext

      // Navigate based on personnel type
      if (user.personnelType === 'Faculty') {
        navigate('/faculty-dashboard/classes');
      } else if (user.personnelType === 'Head') {
        navigate('/programHead-dashboard/csog');
      } else if (user.personnelType === 'Registrar' || user.personnelType === 'Admin') {
        navigate('/registrar-dashboard/students');
      } else {
        setError('Unauthorized personnel type.');
      }
    } else {
      setError('Invalid credentials.'); // This will be handled by the backend now
    }
    } catch (error) {
      setError('Account does not exist. Try again.');
    } finally {
      setLoading(false);
    }
    };

    //Back Button
  const handleBackClick = () => {
    navigate('/login'); 
  };
    //Hide or Show Password button
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the password visibility
  };

  useEffect(() => {
    const imageSwitchInterval = setInterval(() => {
      setCurrentImage((prevImage) => {
        // Find current image index and get next image in array
        const currentIndex = images.indexOf(prevImage);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
    }, timeLimit);

    // Cleanup the interval on component unmount
    return () => clearInterval(imageSwitchInterval);
  }, []);

  return (
    <div className="container-fluid hide-scrollbar">
        <div className="row no-gutters">
            <div className="col-12 col-md-6 p-0 position-relative d-none d-md-block">
            <div className="image-container">
            <img
              className="img-fluid w-100 h-100 fade"
              src={currentImage}
              alt="Image Switcher"
              style={{ objectFit: "cover", minHeight: "100vh" }}
            />
          </div>
                <img 
                    src='pcc.png' 
                    alt="PCC Logo" 
                    className="logo position-absolute top-0 start-0 m-3" />
            </div>

             
            <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
                <img
                    className="miniPCClogo img-fluid rounded mt-4 mb-3 pt-md-3"
                    src="pcc.png"
                    alt="PCC Logo"
                    style={{ maxWidth: '17%', height: 'auto' }}/>
                <h1 className="custom-font text-light fs-1 fw-bold text-center mb-4">
                    PARCOL-SIS <br />Faculty Module
                </h1>

                {error && ( // Conditionally render error message
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
            
            <form className="d-grid gap-2 col-8 mx-auto mt-2" onSubmit={handleLogin}>
                <input 
                    type="text" 
                    className="form-control custom-input custom-font fs-5 " 
                    id="accountNumber" 
                    placeholder="Account Number" 
                    value={accountNumber} 
                    onChange={(e) => setAccountNumber(e.target.value)} 
                    required />
                    
                <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'} // Toggle between 'text' and 'password'
                  className="form-control custom-input custom-font fs-5"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn "
                  onClick={togglePasswordVisibility}
                  style={{ backgroundColor: 'white', color: 'green' }} // Set background to white and text color to green
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
            </div>

                <button
                    className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold"
                    type="submit"
                    disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                </button>

                <span
                  className="bg-transparent custom-color-font fs-5 fw-semibold mt-3 text-center pe-auto"
                  onClick={handleForgotpassword}
                  style={{ cursor: 'pointer' }}
                >
                  Forgot Password
                </span>

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
};




