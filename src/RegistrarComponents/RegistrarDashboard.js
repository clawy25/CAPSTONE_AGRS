import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserTie, faGraduationCap, faBars, faChalkboardTeacher, faChevronDown, faChevronUp, faTable, faClipboardList } from '@fortawesome/free-solid-svg-icons'; // Import the necessary icons
import HeadRegistrarAcademicYear from './HeadRegistrarAcademicYear';
import RegistrarStudents from './RegistrarStudents';
import RegistrarGrades from './RegistrarGrades';
import RegistrarProfessor from './RegistrarProfessor';
import RegistrarStaff from './RegistrarStaff';
import RegistrarProfile from './RegistrarProfile';
import '../App.css';
import { UserContext } from '../Context/UserContext';
import CSOG from './CSOG';
import MOG from './MOG';
import Sections from './Sections'; // Import Sections component

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGradesSubMenu, setShowGradesSubMenu] = useState(false);
  const [showStudentsSubMenu, setShowStudentsSubMenu] = useState(false); // State for showing Sections submenu
  const dropdownRef = useRef(null);
  const location = useLocation();

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
        <div 
            className="menu-item d-flex align-items-center mb-2" 
            onClick={() => {
              setShowStudentsSubMenu(!showStudentsSubMenu);
              navigate('/registrar-dashboard/students'); // Directly navigate to RegistrarStudents
            }}
          >
            <FontAwesomeIcon icon={faUser} className="me-2" />
            STUDENTS
            <FontAwesomeIcon icon={showStudentsSubMenu ? faChevronUp : faChevronDown} className="ms-auto" />
          </div>
          
          {showStudentsSubMenu && (
            <div className="submenu">
              <Link 
                to="/registrar-dashboard/sections" 
                className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/sections' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faTable} className="me-2" />
                SECTIONS
              </Link>
            </div>
          )}
          <div className="menu-item d-flex align-items-center mb-2" onClick={() => setShowGradesSubMenu(!showGradesSubMenu)}>
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            GRADES
            <FontAwesomeIcon icon={showGradesSubMenu ? faChevronUp : faChevronDown} className="ms-auto" />
          </div>
          {showGradesSubMenu && (
            <div className="submenu">
              <Link 
                to="/registrar-dashboard/csog"
                className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/csog' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faTable} className="me-2" /> {/* CSOG icon */}
                CSOG
              </Link>
              <Link 
                to="/registrar-dashboard/mog"
                className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/mog' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faClipboardList} className="me-2" /> {/* MOG icon */}
                MOG
              </Link>
            </div>
          )}
          <Link 
            to="/registrar-dashboard/grades-submission" 
            className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/grades-submission' ? 'active' : ''}`}
            onClick={() => setShowGradesSubMenu(false)}
          >
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            GRADES SUBMISSION
          </Link>

          {user?.personnelType === 'Admin' && ( 
            <>
              <Link 
                to="/registrar-dashboard/staff" 
                className={`menu-item d-flex align-items-center mb-2 ${location.pathname.startsWith('/registrar-dashboard/staff') ? 'active' : ''}`}
                onClick={() => setShowGradesSubMenu(false)}
              >
                <FontAwesomeIcon icon={faUserTie} className="me-2" />
                STAFFS
              </Link>
              <Link 
                to="/registrar-dashboard/academicYear" 
                className={`menu-item d-flex align-items-center mb-2 ${location.pathname.startsWith('/registrar-dashboard/academicYear') ? 'active' : ''}`}
                onClick={() => setShowGradesSubMenu(false)}
              >
                <FontAwesomeIcon icon={faUserTie} className="me-2" />
                ACADEMIC YEAR
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="main-content flex-grow-1">
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom rounded">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">REGISTRAR</h1>
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
                <button className="dropdown-item" onClick={() => navigate('/registrar-dashboard/profile')}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={() => navigate('/registrar-dashboard/change-password')}>
                  Change Password
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <Routes>
          <Route path="students" element={<RegistrarStudents />} />
          <Route path="sections" element={<Sections />} /> {/* Sections as submenu */}
          <Route path="grades" element={<RegistrarGrades />} />
          <Route path="csog" element={<CSOG />} />
          <Route path="mog" element={<MOG />} />
          <Route path="grades-submission" element={<RegistrarProfessor />} />
          <Route path="staff/*" element={<RegistrarStaff />} />
          <Route path="academicYear" element={<HeadRegistrarAcademicYear />} />
          <Route path="profile" element={<RegistrarProfile />} />
        </Routes>
      </div>
    </div>
  );
}
