import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faGraduationCap, faBars } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import '../App.css';
import StudentEnrollment from './StudentEnrollment';
import StudentSchedule from './StudentSchedule';
import StudentGrades from './StudentGrades';
import { UserContext } from '../Context/UserContext';
import StudentProfile from './StudentProfile';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Get user context
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('enrollment'); // Default section
  const dropdownRef = useRef(null);
  const location = useLocation();

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
              <div className="welcome-message mb-3 text-center">Hello, {user ? user.studentNameFirst : 'Student'}!</div>
              <nav className="menu mb-3">
                <Link
                    to="/student-dashboard/enrollment" 
                    className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/student-dashboard/enrollment' ? 'active' : ''}`}
                    onClick={() => {setShowSidebar(false);}}
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    ENROLLMENT
                </Link>
                <Link
                    to="/student-dashboard/schedule" 
                    className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/student-dashboard/schedule' ? 'active' : ''}`}
                    onClick={() => {setShowSidebar(false);}}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    SCHEDULE
                </Link>
                <Link
                    to="/student-dashboard/grades"
                    className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/student-dashboard/grades' ? 'active' : ''}`}
                    onClick={() => {setShowSidebar(false);}}
                  >
                    <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                    GRADES
                </Link>

            </nav>

      </div>

      <div className="main-content flex-grow-1">
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom rounded">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">
            STUDENT
          </h1>
          <button className="btn btn-link custom-color-green-font d-md-none" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>

          <div className="user-info d-flex align-items-center position-relative" ref={dropdownRef}>
            <span className="me-2">{user ? user.studentNameFirst : 'Student'} ({user ? user.studentNumber : 'Unknown'})</span>
            <FontAwesomeIcon
              icon={faUser}
              className="user-icon"
              onClick={toggleDropdown}
              aria-label="User Menu"
              style={{ cursor: 'pointer' }}
            />
            {showDropdown && (
              <div className="dropdown-menu position-absolute end-0 mt-2 show">
                <button className="dropdown-item" onClick={() => navigate('/student-dashboard/profile')}>
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



        {/*selectedSection === 'change-password' && (
          <section className="card border-success p-3">
            <h2 className="custom-color-green-font custom-font">Change Password</h2>
            <input type="password" placeholder="New Password" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Password changed successfully!')}>
              Save
            </button>
          </section>
        )*/}

        <Routes>
          <Route path="enrollment" element={<StudentEnrollment />} />
          <Route path="schedule" element={<StudentSchedule />} /> {/* Sections as submenu */}
          <Route path="grades" element={<StudentGrades />} />
          <Route path="profile" element={<StudentProfile />} />
        </Routes>   
      </div>
    </div>
  );
}
