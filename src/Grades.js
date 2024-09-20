import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faGraduationCap, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import './Grades.css';
import './App.css';

export default function Grades() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // State to control sidebar visibility
  const [selectedSection, setSelectedSection] = useState('grades'); // State to track the selected section

  // Function to handle logout
  const handleLogout = () => {
    navigate('/login');
  };

  // Function to toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  // Function to handle Profile section display
  const handleProfileClick = () => {
    setSelectedSection('profile'); // Set the selected section to 'profile'
    setShowDropdown(false); // Hide the dropdown menu
  };

  // Function to handle Change Password section display
  const handleChangePasswordClick = () => {
    setSelectedSection('change-password'); // Set the selected section to 'change-password'
    setShowDropdown(false); // Hide the dropdown menu
  };

  // Function to handle save button click for profile
  const handleSaveProfile = () => {
    alert('Profile information saved!');
  };

  // Function to handle save button click for change password
  const handleSavePassword = () => {
    alert('Password changed successfully!');
  };

  // Function to handle print certificate of grades button click
  const handlePrintCertificate = () => {
    window.print(); // For demonstration, you can implement custom print logic here
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  

  return (
    <div className="grades-container">
      {/* Sidebar with user info and menu */}
      <div
        className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}
      >
        <img src="pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3 " />
        <div className="welcome-message mb-3 text-center">Hello, Abigail!</div>
        <nav className="menu mb-3">
          <Link to="/dashboard" className="menu-item  d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            ENROLLMENT
          </Link>
          <Link to="/schedule" className="menu-item d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            SCHEDULE
          </Link>
          <Link to="/grades" className="menu-item active d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            GRADES
          </Link>
        </nav>
        <div className='container mt-5 pt-5'>
          <button className="btn bg-transparent custom-color-font mb-auto" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
        LOGOUT
      </button>
        </div>
        
      </div>

      <div className="main-content flex-grow-1">
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom">
          {/* Show H1 on larger screens and burger icon on smaller screens */}
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">
            PARAÑAQUE CITY COLLEGE
          </h1>
          <button className="btn btn-link text-dark d-md-none" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>

          <div className="user-info d-flex align-items-center">
            <span className="me-2">CRUZ, ABIGAIL (2020-00202-PQ-O)</span>
            <FontAwesomeIcon
              icon={faUser}
              className="user-icon"
              onClick={toggleDropdown}
              aria-label="User Menu"
              style={{ cursor: 'pointer' }}
            />
            {showDropdown && (
              <div className="dropdown-menu position-absolute end-0 mt-2">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={handleChangePasswordClick}>
                  Change Password
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Conditionally render content based on the selected section */}
        {selectedSection === 'grades' && (
          <section className="m-3">
            <h2 className='custom-font custom-color-green-font'>Grades AY 2024-2025</h2>
            <div className='card card-success border-success rounded'>
              <table className="table">
                <thead className='table-success'>
                  <tr>
                    <th className='text-success custom-font'>Code</th>
                    <th className='text-success custom-font'>Subject</th>
                    <th className='text-success custom-font'>Total Units</th>
                    <th className='text-success custom-font'>Grade</th>
                    <th className='text-success custom-font'>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='custom-font'>IT101</td>
                    <td className='custom-font'>Introduction to Information Technology</td>
                    <td className='custom-font'>3</td>
                    <td className='custom-font'>1.5</td>
                    <td className='custom-font'>P</td>
                  </tr>
                  <tr>
                    <td className='custom-font'>CS102</td>
                    <td className='custom-font'>Computer Programming</td>
                    <td className='custom-font'>3</td>
                    <td className='custom-font'>1.2</td>
                    <td className='custom-font'>P</td>
                  </tr>
                  <tr>
                    <td className='custom-font'>DM103</td>
                    <td className='custom-font'>Discrete Mathematics</td>
                    <td className='custom-font'>3</td>
                    <td className='custom-font'>1.0</td>
                    <td className='custom-font'>P</td>
                  </tr>
                  <tr>
                    <td className='custom-font'>DB104</td>
                    <td className='custom-font'>Database Systems</td>
                    <td className='custom-font'>3</td>
                    <td className='custom-font'>1.7</td>
                    <td className='custom-font'>P</td>
                  </tr>
                  <tr>
                    <td className='custom-font'>OS105</td>
                    <td className='custom-font'>Operating Systems</td>
                    <td className='custom-font'>3</td>
                    <td className='custom-font'>2.0</td>
                    <td className='custom-font'>P</td>
                  </tr>
                  <tr>
                    <td className='custom-font'>WN106</td>
                    <td className='custom-font'>Web Development</td>
                    <td className='custom-font'>3</td>
                    <td className='custom-font'>1.3</td>
                    <td className='custom-font'>P</td>
                  </tr>
                  <tr>
                    <td className='custom-font'>SE107</td>
                    <td className='custom-font'>Software Engineering</td>
                    <td className='custom-font'>3</td>
                    <td className='custom-font'>1.4</td>
                    <td className='custom-font'>P</td>
                  </tr>
                  <tr>
                    <td className='custom-font'>AE108</td>
                    <td className='custom-font'>Advanced Algorithms</td>
                    <td className='custom-font'>3</td>
                    <td className='custom-font'>1.6</td>
                    <td className='custom-font'>P</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {selectedSection === 'profile' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Profile</h2>
            <div className="custome-font custom-color-green-font fs-6 mb-2">Student Number: 2020-00202-PQ-O</div>
            <input type="text" placeholder="First Name" className="form-control custom-color-green-font mb-2" required />
            <input type="text" placeholder="Last Name" className="form-control custom-color-green-font mb-2" required />
            <input type="email" placeholder="Email" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Profile information saved!')}>
              Save
            </button>
          </section>
        )}

        {selectedSection === 'change-password' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Change Password</h2>
            <input type="password" placeholder="New Password" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Password changed successfully!')}>
              Save
            </button>
          </section>
        )}

        {/* Add the Print Certificate button */}
        <div className='row'>
  <div className='col-12 col-md-4'>
    <button className="btn custom-font custom-color-font bg-custom-color-green mt-2 ms-md-3 mt-md-0 w-100 w-md-auto p-2" onClick={handlePrintCertificate}>
      Print Certificate of Grades
    </button>
  </div>
</div>

        
      </div>
    </div>
  );
};


