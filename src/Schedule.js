import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import './Schedule.css';

const Schedule = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSection, setSelectedSection] = useState('schedule'); // State to track the selected section

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

  return (
    <div className="schedule-container">
      {/* Sidebar with user info and menu */}
      <div className="sidebar">
        <img src="pcc.png" alt="Logo" className="college-logo" />
        <div className="welcome-message">Hello, Abigail!</div>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item">ENROLLMENT</Link>
          <Link to="/schedule" className="menu-item active">SCHEDULE</Link>
          <Link to="/grades" className="menu-item">GRADES</Link>
        </nav>
        <button className="logout-button" onClick={handleLogout}>LOGOUT</button>
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
        {selectedSection === 'schedule' && (
          <>
          <section className="grades-section">
            <h2>Schedule</h2>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Time</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Introduction to Information Technology</td>
                  <td>BSIT 3-1</td>
                  <td>08:00 AM - 09:30 AM (Mon, Wed)</td>
                  <td>1.5</td>
                </tr>
                <tr>
                  <td>Computer Programming</td>
                  <td>BSIT 3-1</td>
                  <td>09:40 AM - 11:10 AM (Mon, Wed)</td>
                  <td>1.5</td>
                </tr>
                <tr>
                  <td>Discrete Mathematics</td>
                  <td>BSIT 3-1</td>
                  <td>02:00 PM - 03:00 PM (Mon, Wed)</td>
                  <td>1.5</td>
                </tr>
              </tbody>
            </table>
            </section>
          </>
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
      </div>
    </div>
  );
};

export default Schedule;
