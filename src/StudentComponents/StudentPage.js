import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import StudentModel from '../ReactModels/StudentModel';
import { UserContext } from '../Context/UserContext';

export default function StudentPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('2021-000001');
  const [password, setPassword] = useState('ClintJayven2021Pepito');
  const { setUser } = useContext(UserContext);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset error message
    setError('');

    // Student ID validation
    const studentIdPattern = /^\d{4}-\d{6}$/;
    if (!studentIdPattern.test(studentId)) {
      setError('Student ID must follow the format (e.g., 2024-123456)');
      return;
    }

    // Password validation
    if (/\s/.test(password)) {
      setError('Password must not have spaces.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one digit.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }

    //Insert API here for validating credentials to database
    try {
      // Fetch the personnel data using the account number
      const user = await StudentModel.fetchStudentData(studentId, password);
  
      // If the fetched data matches the input credentials (you can implement further validation here)
      if (user) {
        const credentials = {
          studentNumber: user.studentNumber,
          personnelType: user.studentType,
          personnelNameFirst: user.studentNameFirst,
          personnelNameMiddle: user.studentNameMiddle,
          personnelNameLast: user.studentNameLast,
          programNumber: user.studentProgramNumber
        };
      
      setUser(credentials);
      
      navigate('/dashboard');
      console.log('Login successful:', user);
      
      
      } else {
        setError('Invalid credentials.');
      }
    } catch (error) {
      setError('Account does not exist. Try again.');
    }
  };

  const handleBackClick = () => {
    navigate('/login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the password visibility
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
            style={{ maxWidth: '150px' }}
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
            PARCOL-SIS <br />Student Module
          </h1>

          {error && ( // Conditionally render error message
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

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

            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'} // Toggle between 'text' and 'password'
                className="form-control custom-input custom-font fs-5"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
