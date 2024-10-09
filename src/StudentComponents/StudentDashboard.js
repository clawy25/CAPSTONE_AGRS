import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faGraduationCap, faBars } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import '../App.css';
import StudentEnrollment from './StudentEnrollment';
import StudentSchedule from './StudentSchedule';
import StudentGrades from './StudentGrades';
import { UserContext } from '../Context/UserContext';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Get user context
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('enrollment'); // Default section
  const dropdownRef = useRef(null);

  const SECTIONS = {
    ENROLLMENT: 'enrollment',
    SCHEDULE: 'schedule',
    GRADES: 'grades'
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleProfileClick = () => {
    setSelectedSection('profile');
    setShowDropdown(false);
  };

  const handleChangePasswordClick = () => {
    setSelectedSection('change-password');
    setShowDropdown(false);
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
              <div className="welcome-message mb-3 text-center">Hello, {user ? user.studentName : 'Student'}!</div>
              <nav className="menu mb-3">
                <Link
                    to=""
                    className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.ENROLLMENT ? 'active' : ''}`}
                    onClick={() => {setSelectedSection(SECTIONS.ENROLLMENT); setShowSidebar(false);}}
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    ENROLLMENT
                </Link>
                <Link
                    to=""
                    className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.SCHEDULE ? 'active' : ''}`}
                    onClick={() => {setSelectedSection(SECTIONS.SCHEDULE); setShowSidebar(false);}}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    SCHEDULE
                </Link>
                <Link
                    to=""
                    className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.GRADES ? 'active' : ''}`}
                    onClick={() => {setSelectedSection(SECTIONS.GRADES); setShowSidebar(false);}}
                  >
                    <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                    GRADES
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
            <span className="me-2">{user ? user.studentName : 'Student'} ({user ? user.studentNumber : 'Unknown'})</span>
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

        {selectedSection === 'enrollment' && (
          <section>
            <section className="mt-3 ms-0 ">
            <h2 className="custom-font custom-color-green-font">Enrollment</h2>
          
              <StudentEnrollment />
           
           
          </section>

          </section>
          
        )}


        {selectedSection === 'schedule' && (
          <section className="m-3 ms-0">
            <h2 className="custom-font custom-color-green-font">Schedule</h2>
           <StudentSchedule />
          </section>
        )}

        {selectedSection === 'grades' && (
           <section className="m-3 ms-0">
           <h2 className="custom-font custom-color-green-font">Grades</h2>
           <StudentGrades />
         </section>
        )}

        {selectedSection === 'profile' && (
          <section className="card border-success p-3">
            <h2 className="custom-color-green-font custom-font">Profile</h2>
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
            <h2 className="custom-color-green-font custom-font">Change Password</h2>
            <input type="password" placeholder="New Password" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Password changed successfully!')}>
              Save
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
