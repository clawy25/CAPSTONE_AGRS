import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import StudentModel from '../ReactModels/StudentModel';
import Forgotpassword from '../ForgotPassword';
import { UserContext } from '../Context/UserContext';

export default function StudentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('2021-000001');
  const [password, setPassword] = useState('ClintJayven2021Pepito');
  const { setUser } = useContext(UserContext);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentImage, setCurrentImage] = useState('pccCover.png');
  const images = ['pccCover.png', 'pccCover1.png', 'pccCover2.png']; // list of images
  const timeLimit = 8000;

  const handleLogin = async (e) => {
    e.preventDefault();
  
    // Reset error message
    setError('');
    
    // Clear previous error when user starts typing
    setUser(null); // Reset the user state if needed
  
    // Show loading state
    setLoading(true);
  
    // Student ID validation
    const studentIdPattern = /^\d{4}-\d{6}$/;
    if (!studentIdPattern.test(studentId)) {
      setError('Student ID must follow the format (e.g., 2024-123456)');
      setLoading(false);  // Stop loading when error occurs
      return;
    }
  
    // Password validation
    if (/\s/.test(password)) {
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
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      setLoading(false);
      return;
    }
  
    try {
      // Fetch the personnel data using the account number
      const user = await StudentModel.fetchStudentData(studentId, password);
  
      if (user) {
        const credentials = {
          studentNumber: user.studentNumber,
          studentType: user.studentType,
          studentNameFirst: user.studentNameFirst,
          studentNameMiddle: user.studentNameMiddle,
          studentNameLast: user.studentNameLast,
          programNumber: user.studentProgramNumber
        };
  
        // Set user credentials and navigate to dashboard
        setUser(credentials);
        navigate('/student-dashboard');
        console.log('Login successful:', user);
      } else {
        setError('Invalid credentials.');
      }
    } catch (error) {
      setError('Account does not exist. Try again.');
    } finally {
      setLoading(false);  // Stop loading after API call
    }
  };
  

  const handleForgotpassword = () => {
    navigate('/ForgotPassword');
  }

  const handleBackClick = () => {
    navigate('/login');
  };

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
            src="pcc.png"
            alt="PCC Logo"
            className="logo position-absolute top-0 start-0 m-3"
            style={{ maxWidth: "150px" }}
          />
        </div>

        <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
          <img
            className="miniPCClogo img-fluid rounded mt-4 mb-3 pt-md-3"
            src="pcc.png"
            alt="PCC Logo"
            style={{ maxWidth: "17%", height: "auto" }}
          />
          <h1 className="custom-font text-light fs-1 fw-bold text-center mb-4">
            PARCOL-SIS <br />Student Module
          </h1>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form className="d-grid gap-2 col-8 mx-auto mt-2" onSubmit={handleLogin}>
            <input
              type="text"
              className={`form-control custom-input custom-font fs-5 ${error ? "is-invalid" : ""}`}
              id="studentId"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control custom-input custom-font fs-5 ${error ? "is-invalid" : ""}`}
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn"
                onClick={togglePasswordVisibility}
                style={{ backgroundColor: "white", color: "green" }}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <button
              className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold"
              type="submit"
              disabled={loading} // Disable button when loading
            >
              {loading ? "Logging In..." : "Login"}
            </button>

            <span
              className="bg-transparent custom-color-font fs-5 fw-semibold mt-3 text-center pe-auto"
              onClick={handleForgotpassword}
              style={{ cursor: "pointer" }}
            >
              Forgot Password
            </span>
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
}
