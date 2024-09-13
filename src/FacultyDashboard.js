import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSection, setSelectedSection] = useState('classes');
  const [showClassesSubmenu, setShowClassesSubmenu] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

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
    setSelectedSection('profile');
    setShowClassesSubmenu(false); // Hide submenu
    setShowDropdown(false); // Hide dropdown
  };

  // Function to handle Change Password section display
  const handleChangePasswordClick = () => {
    setSelectedSection('change-password');
    setShowClassesSubmenu(false); // Hide submenu
    setShowDropdown(false); // Hide dropdown
  };

  // Function to handle save button click for profile
  const handleSaveProfile = () => {
    alert('Profile information saved!');
  };

  // Function to handle save button click for change password
  const handleSavePassword = () => {
    alert('Password changed successfully!');
  };

  // Function to navigate to a specific class when clicked
  const handleClassClick = (className) => {
    setSelectedClass(className);
    navigate(`/class-details/${className}`);
  };

  // Function to handle adding a new class
  const handleAddNewClass = () => {
    alert('Add new class functionality here');
  };

  // Function to handle the menu item click and toggle submenu
  const handleMenuClick = (section) => {
    if (section === 'classes') {
      setSelectedSection('classes');
      setShowClassesSubmenu(true); // Show submenu
    } else {
      setSelectedSection(section);
      setShowClassesSubmenu(false); // Hide submenu if not 'classes'
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <img src="pcc.png" alt="Logo" className="college-logo" />
        <div className="welcome-message">Hello, John Doe!</div>
        <nav className="menu">
          <div
            className={`menu-item ${selectedSection === 'classes' ? 'active' : ''}`}
            onClick={() => handleMenuClick('classes')}
          >
            CLASSES
          </div>
          {selectedSection === 'classes' && showClassesSubmenu && (
            <div className="submenu">
              <div className="submenu-item" onClick={() => handleClassClick('BSIT1-1')}>BSIT 1-1</div>
              <div className="submenu-item" onClick={() => handleClassClick('BSIT1-2')}>BSIT 1-2</div>
              <div className="submenu-item" onClick={() => handleClassClick('BSIT2-1')}>BSIT 2-1</div>
              <div className="submenu-item" onClick={() => handleClassClick('BSIT2-2')}>BSIT 2-2</div>
              <div className="submenu-item" onClick={() => handleClassClick('BSIT3-1')}>BSIT 3-1</div>
              <div className="submenu-item" onClick={() => handleClassClick('BSIT3-2')}>BSIT 3-2</div>
              <div className="submenu-item" onClick={() => handleClassClick('BSIT4-1')}>BSIT 4-1</div>
              <div className="submenu-item" onClick={() => handleClassClick('BSIT4-2')}>BSIT 4-2</div>
              <div className="submenu-item" onClick={handleAddNewClass}>+ Add new class</div>
            </div>
          )}
          <Link
            to="/faculty-schedule"
            className={`menu-item ${selectedSection === 'schedule' ? 'active' : ''}`}
            onClick={() => handleMenuClick('schedule')}
          >
            SCHEDULE
          </Link>
          <Link
            to="/hris"
            className={`menu-item ${selectedSection === 'hris' ? 'active' : ''}`}
            onClick={() => handleMenuClick('hris')}
          >
            HRIS
          </Link>
        </nav>
        <button className="logout-button" onClick={handleLogout}>LOGOUT</button>
      </div>

      <div className="main-content">
        <header className="header">
          <h1>PARAÑAQUE CITY COLLEGE</h1>
          <div className="user-info">
            JOHN DOE (Faculty ID: 2020-00123)
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
        {selectedSection === 'classes' && (
          <section className="classes-section">
            <div className="classes-header">
              <h2>Class Records</h2>
              <button className="add-class-button" onClick={handleAddNewClass}>+ Add new class</button>
            </div>
            <div className="class-box-container">
              {selectedClass ? (
                <div className="class-details">
                  {/* Display details for the selected class */}
                  <h3>Details for {selectedClass}</h3>
                </div>
              ) : (
                <>
                  <div className="class-box" onClick={() => handleClassClick('BSIT1-1')}>BSIT 1-1</div>
                  <div className="class-box" onClick={() => handleClassClick('BSIT1-2')}>BSIT 1-2</div>
                  <div className="class-box" onClick={() => handleClassClick('BSIT2-1')}>BSIT 2-1</div>
                  <div className="class-box" onClick={() => handleClassClick('BSIT2-2')}>BSIT 2-2</div>
                  <div className="class-box" onClick={() => handleClassClick('BSIT3-1')}>BSIT 3-1</div>
                  <div className="class-box" onClick={() => handleClassClick('BSIT3-2')}>BSIT 3-2</div>
                  <div className="class-box" onClick={() => handleClassClick('BSIT4-1')}>BSIT 4-1</div>
                  <div className="class-box" onClick={() => handleClassClick('BSIT4-2')}>BSIT 4-2</div>
                </>
              )}
            </div>
          </section>
        )}

        {selectedSection === 'profile' && (
          <section className="profile-section">
            <h2>Profile</h2>
            <div className="profile-info">Faculty ID: 12345</div>
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

export default FacultyDashboard;
