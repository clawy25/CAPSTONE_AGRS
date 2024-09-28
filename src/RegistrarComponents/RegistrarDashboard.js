import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faGraduationCap, faBars, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import RegistrarStudents from './RegistrarStudents'
import RegistrarGrades from './RegistrarGrades'
import '../App.css';

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('students'); // Track the active section
  const dropdownRef = useRef(null);

  // Constants for section names to avoid magic strings
  const SECTIONS = {
    STUDENTS: 'students',
    GRADES: 'grades',
    SCHEDULE: 'schedule',
    PROFESSORS: 'professors',
  };

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

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showDropdown]);

  return (
    <div className="dashboard-container d-flex">
      <div className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}>
        {/* Close button (X) */}
        <button 
          className="close-sidebar-btn" 
          onClick={() => setShowSidebar(false)}
          aria-label="Close Sidebar"
        >
          &times;
        </button>
        <img src="pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">Hello, Registrar!</div>
        <nav className="menu mb-3">
          <Link
            to=""
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.STUDENTS ? 'active' : ''}`}
            onClick={() => {setSelectedSection(SECTIONS.STUDENTS);setShowSidebar(false);}}
          >
            <FontAwesomeIcon icon={faUser} className="me-2" />
            STUDENTS
          </Link>
          <Link
            to=""
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.GRADES ? 'active' : ''}`}
            onClick={() => {setSelectedSection(SECTIONS.GRADES);setShowSidebar(false);}}
          >
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            GRADES
          </Link>
          <Link
            to=""
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.SCHEDULE ? 'active' : ''}`}
            onClick={() => {setSelectedSection(SECTIONS.SCHEDULE);setShowSidebar(false);}}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            SCHEDULE
          </Link>
          <Link
            to=""
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.PROFESSORS ? 'active' : ''}`}
            onClick={() => {setSelectedSection(SECTIONS.PROFESSORS);setShowSidebar(false);}}
          >
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            PROFESSORS
          </Link>
        </nav>
      </div>

      <div className="main-content flex-grow-1">
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom rounded">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">
            PARAÑAQUE CITY COLLEGE
          </h1>
          <button className="btn btn-link custom-color-green-font d-md-none" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>

          <div className="user-info d-flex align-items-center position-relative" ref={dropdownRef}>
            <span className="me-2">CRUZ, ABIGAIL (2020-00202-PQ-O)</span>
            <FontAwesomeIcon
              icon={faUser}
              className="user-icon"
              onClick={toggleDropdown}
              aria-label="User Menu"
              style={{ cursor: 'pointer' }}
            />
            {showDropdown && (
              <div className="dropdown-menu position-absolute end-0 mt-2 show">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={handleChangePasswordClick}>
                  Change Password
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Render content based on the selected section */}
        {selectedSection === SECTIONS.STUDENTS && (
          <section className="m-3">
            <h2 className="custom-font custom-color-green-font">Students Section</h2>
            <RegistrarStudents />
            
          </section>
        )}
        {selectedSection === SECTIONS.GRADES && (
          <section className="m-3">
            <h2 className="custom-font custom-color-green-font">Grades Section</h2>
            <RegistrarGrades />
          </section>
        )}
        {selectedSection === SECTIONS.SCHEDULE && (
          <section className="m-3">
            <h2 className="custom-font custom-color-green-font">Schedule Section</h2>
            {/* Schedule section content */}
          </section>
        )}
        {selectedSection === SECTIONS.PROFESSORS && (
          <section className="m-3">
            <h2 className="custom-font custom-color-green-font">Professors Section</h2>
            {/* Professors section content */}
          </section>
        )}

        {/* Profile and change password sections */}
        {selectedSection === 'profile' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Profile</h2>
            <div className="custom-font custom-color-green-font fs-6 mb-2">Student Number: 2020-00202-PQ-O</div>
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
      </div>
    </div>
  );
};
