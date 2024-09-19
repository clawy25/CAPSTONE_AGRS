import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBook, faCalendarAlt, faGraduationCap, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Grades.css';

const Grades = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
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

  return (
    <div className="grades-container">
      {/* Sidebar with user info and menu */}
      <div className="sidebar">
        <img src="pcc.png" alt="Logo" className="college-logo" />
        <div className="welcome-message">Hello, Abigail!</div>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item">
           <FontAwesomeIcon icon={faBook} className="me-2" /> ENROLLMENT
          </Link>
          <Link to="/schedule" className="menu-item">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" /> SCHEDULE
          </Link>
          <Link to="/grades" className="menu-item active">
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" /> GRADES
          </Link>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />  LOGOUT
        </button>
      </div>

      <div className="main-content">
        <header className="header">
          <h1>PARAÑAQUE CITY COLLEGE</h1>
          <div className="user-info">
            CRUZ, ABIGAIL (2020-00202-PQ-O)
            <FontAwesomeIcon
              icon={faUser}
              className="user-icon"
              onClick={toggleDropdown}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={handleProfileClick}>Profile</div>
                <div className="dropdown-item" onClick={handleChangePasswordClick}>Change Password</div>
              </div>
            )}
          </div>
        </header>

        {/* Conditionally render content based on the selected section */}
        {selectedSection === 'grades' && (
          <section className="grades-section">
            <h2>Grades AY 2024-2025</h2>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject</th>
                  <th>Total Units</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IT101</td>
                  <td>Introduction to Information Technology</td>
                  <td>3</td>
                  <td>1.5</td>
                  <td>P</td>
                </tr>
                <tr>
                  <td>CS102</td>
                  <td>Computer Programming</td>
                  <td>3</td>
                  <td>1.2</td>
                  <td>P</td>
                </tr>
                <tr>
                  <td>DM103</td>
                  <td>Discrete Mathematics</td>
                  <td>3</td>
                  <td>1.0</td>
                  <td>P</td>
                </tr>
                <tr>
                  <td>DB104</td>
                  <td>Database Systems</td>
                  <td>3</td>
                  <td>1.7</td>
                  <td>P</td>
                </tr>
                <tr>
                  <td>OS105</td>
                  <td>Operating Systems</td>
                  <td>3</td>
                  <td>2.0</td>
                  <td>P</td>
                </tr>
                <tr>
                  <td>WN106</td>
                  <td>Web Development</td>
                  <td>3</td>
                  <td>1.3</td>
                  <td>P</td>
                </tr>
                <tr>
                  <td>SE107</td>
                  <td>Software Engineering</td>
                  <td>3</td>
                  <td>1.4</td>
                  <td>P</td>
                </tr>
                <tr>
                  <td>AE108</td>
                  <td>Advanced Algorithms</td>
                  <td>3</td>
                  <td>1.6</td>
                  <td>P</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {selectedSection === 'profile' && (
          <section className="profile-section">
            <h2>Profile</h2>
            <div className="profile-info">Student Number: 2020-00202-PQ-O</div>
            <input type="text" placeholder="First Name" className="profile-input" />
            <input type="text" placeholder="Last Name" className="profile-input" />
            <input type="email" placeholder="Email" className="profile-input" />
            <button className="save-button" onClick={handleSaveProfile}>Save</button>
          </section>
        )}

        {selectedSection === 'change-password' && (
          <section className="change-password-section">
            <h2>Change Password</h2>
            <input type="password" placeholder="New Password" className="profile-input" />
            <button className="save-button" onClick={handleSavePassword}>Save</button>
          </section>
        )}

        {/* Add the Print Certificate button */}
        <button className="print-button" onClick={handlePrintCertificate}>Print Certificate of Grades</button>
      </div>
    </div>
  );
};

export default Grades;
