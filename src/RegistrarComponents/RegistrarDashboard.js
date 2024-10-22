import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserTie, faGraduationCap, faBars, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import HeadRegistrarAcademicYear from './HeadRegistrarAcademicYear'
import RegistrarStudents from './RegistrarStudents';
import RegistrarGrades from './RegistrarGrades';
import RegistrarProfessor from './RegistrarProfessor';
import RegistrarStaff from './RegistrarStaff';
import '../App.css';
import { UserContext } from '../Context/UserContext';

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Get user context
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation(); // Use useLocation to track the current URL

  const handleLogout = () => {
    navigate('/login');
    sessionStorage.clear();
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
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
        <button 
          className="close-sidebar-btn" 
          onClick={() => setShowSidebar(false)}
          aria-label="Close Sidebar"
        >
          &times;
        </button>
        <img src="pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">Hello, {user ? user.personnelNameFirst : 'Guest'}!</div>
        <nav className="menu mb-3">
          {/* Add the "active" class if the current path matches the Link */}
          <Link 
            to="/registrar-dashboard/students" 
            className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/students' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUser} className="me-2" />
            STUDENTS
          </Link>
          <Link 
            to="/registrar-dashboard/grades" 
            className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/grades' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            GRADES
          </Link>
          <Link 
            to="/registrar-dashboard/professors" 
            className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/professors' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            PROFESSORS
          </Link>
          <Link 
            to="/registrar-dashboard/staff" 
            className={`menu-item d-flex align-items-center mb-2 ${location.pathname.startsWith('/registrar-dashboard/staff') ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUserTie} className="me-2" />
            STAFFS
          </Link>
          <Link 
            to="/registrar-dashboard/academicYear" 
            className={`menu-item d-flex align-items-center mb-2 ${location.pathname.startsWith('/registrar-dashboard/academicYear') ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUserTie} className="me-2" />
            ACADEMIC YEAR
          </Link>
        </nav>
      </div>

      <div className="main-content flex-grow-1">
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom rounded">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">PARAÑAQUE CITY COLLEGE</h1>
          <button className="btn btn-link custom-color-green-font d-md-none" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>

          <div className="user-info d-flex align-items-center position-relative" ref={dropdownRef}>
            <span className="me-2">{user ? user.personnelNameFirst : 'Guest'} ({user ? user.personnelNumber : 'Unknown'})</span>
            <FontAwesomeIcon
              icon={faUser}
              className="user-icon"
              onClick={toggleDropdown}
              aria-label="User Menu"
              style={{ cursor: 'pointer' }}
            />
            {showDropdown && (
              <div className="dropdown-menu position-absolute end-0 mt-2 show">
                <button className="dropdown-item" onClick={() => navigate('/dashboard/profile')}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={() => navigate('/dashboard/change-password')}>
                  Change Password
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Route-based rendering for the dashboard content */}
        <Routes>
          <Route path="students" element={<RegistrarStudents />} />
          <Route path="grades" element={<RegistrarGrades />} />
          <Route path="professors" element={<RegistrarProfessor />} />
          <Route path="staff/*" element={<RegistrarStaff />} />
          <Route path="academicYear" element={<HeadRegistrarAcademicYear />} />
          <Route path="profile" element={<ProfileSection />} />
          <Route path="change-password" element={<ChangePasswordSection />} />
        </Routes>
      </div>
    </div>
  );
}

// Dummy components for profile and change-password sections
const ProfileSection = () => (
  <section className="card border-success p-3">
    <h2 className='custom-color-green-font custom-font'>Profile</h2>
    <div className="custom-font custom-color-green-font fs-6 mb-2">Student Number: 2020-00202-PQ-O</div>
    <input type="text" placeholder="First Name" className="form-control custom-color-green-font mb-2" required />
    <input type="text" placeholder="Last Name" className="form-control custom-color-green-font mb-2" required />
    <input type="email" placeholder="Email" className="form-control custom-color-green-font mb-2" required />
    <button className="btn custom-color-font bg-custom-color-green p-2">
      Save
    </button>
  </section>
);

const ChangePasswordSection = () => (
  <section className="card border-success p-3">
    <h2 className='custom-color-green-font custom-font'>Change Password</h2>
    <input type="password" placeholder="New Password" className="form-control custom-color-green-font mb-2" required />
    <button className="btn custom-color-font bg-custom-color-green p-2">
      Save
    </button>
  </section>
);
