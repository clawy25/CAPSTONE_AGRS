import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faGraduationCap, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import './App.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSection, setSelectedSection] = useState('enrollment');

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleProfileClick = () => {
    setSelectedSection('profile');
    setShowDropdown(false);
  };

  const handleChangePasswordClick = () => {
    setSelectedSection('change-password');
    setShowDropdown(false);
  };

  const handleSaveProfile = () => {
    alert('Profile information saved!');
  };

  const handleSavePassword = () => {
    alert('Password changed successfully!');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar with user info and menu */}
      <div className="sidebar bg-custom-color-green">
        <img src="pcc.png" alt="Logo" className="college-logo" />
        <div className="welcome-message">Hello, Abigail!</div>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item active">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            ENROLLMENT
          </Link>
          <Link to="/schedule" className="menu-item">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            SCHEDULE
          </Link>
          <Link to="/grades" className="menu-item">
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            GRADES
          </Link>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          LOGOUT
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
                <div className="dropdown-item" onClick={handleProfileClick}>
                  Profile
                </div>
                <div className="dropdown-item" onClick={handleChangePasswordClick}>
                  Change Password
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Conditionally render content based on the selected section */}
        {selectedSection === 'enrollment' && (
          <section className="card enrollment-status border-3 rounded">
            <h2 className='custom-font'>Enrollment</h2>
            <div className="card bg-custom-color-green text-white fw-bold border-1 rounded">
              <span className="card-header">STATUS: Grades not complete</span>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <p className="card-text custom-font fs-2 border-1 fw-bold text-success m-0">
                Online Enrollment is not open yet.
              </p>
            </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
