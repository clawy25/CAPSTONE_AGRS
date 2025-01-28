import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserTie, faGraduationCap, faSchool,faClock, faBars, faUserClock, faChalkboardTeacher, faChevronDown, faChevronUp, faTable, faClipboardList } from '@fortawesome/free-solid-svg-icons'; // Import the necessary icons
import HeadRegistrarAcademicYear from './HeadRegistrarAcademicYear';
import RegistrarStudents from './RegistrarStudents';
import RegistrarGrades from './RegistrarGrades';
import RegistrarProfessor from './RegistrarProfessor';
import RegistrarStaffAssign from './RegistrarStaffAssign';
import RegistrarProfile from './RegistrarProfile';
import NewPassword from './NewPassword';
import '../App.css';
import { UserContext } from '../Context/UserContext';
import CSOG from './CSOG';
import MOG from './MOG';
import Sections from './Sections'; 
import RegistrarIrregularStudents from './RegistrarIrregularStudents'

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGradesSubMenu, setShowGradesSubMenu] = useState(false);
  const [showStudentsSubMenu, setShowStudentsSubMenu] = useState(false); // State for showing Sections submenu
  const dropdownRef = useRef(null);
  const location = useLocation();
/** 
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  let devtoolsOpen = false;

  const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 200;
      const heightThreshold = window.outerHeight - window.innerHeight > 200;
  
      if (widthThreshold || heightThreshold) {
          if (!devtoolsOpen) {
              devtoolsOpen = true;
              alert("DevTools is open! Please close it to continue.");
          }
      } else {
          devtoolsOpen = false;
      }
  };
  
  setInterval(checkDevTools, 500);
  document.addEventListener("keydown", (event) => {
    if (
        event.key === "F12" || 
        (event.ctrlKey && event.shiftKey && event.key === "I") || 
        (event.ctrlKey && event.key === "U")
    ) {
        event.preventDefault();
        alert("Developer tools access is disabled.");
    }
});
(function() {
  const originalConsoleLog = console.log;
  console.log = function(...args) {
      if (args.includes("DevTools")) {
          throw new Error("Access to console is restricted.");
      }
      originalConsoleLog(...args);
  };
})();

*/
  //On loading the page
  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if user is not present
    }
  }, [user, navigate]);

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
    <div className="dashboard-container d-flex"><div className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}>
    <button 
      className="close-sidebar-btn" 
      onClick={() => setShowSidebar(false)}
      aria-label="Close Sidebar"
    >
      &times;
    </button>
    <div className='d-block align-items-center justify-content-center'>
          <div className='d-flex align-items-center justify-content-center'>
          <img src="/pcc.png" alt="Logo" className="img-fluid mb-3 college-logo" />
          </div>
          <p className="welcome-message mb-3 text-center">Hello, {user ? user.personnelNameFirst : 'Student'}!</p>
        </div>
    <nav className="menu mb-3">
      <div 
        className="submenu-item d-flex align-items-center mb-2" 
        onClick={() => {
          setShowStudentsSubMenu(!showStudentsSubMenu);
          navigate('/registrar-dashboard/students'); // Directly navigate to RegistrarStudents
          if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile
        }}
      >
        <FontAwesomeIcon icon={faSchool} className="me-2" />
        STUDENTS
        <FontAwesomeIcon icon={showStudentsSubMenu ? faChevronUp : faChevronDown} className="ms-auto" />
      </div>
      
      {showStudentsSubMenu && (
        <div className="submenu">
          <Link 
            to="/registrar-dashboard/sections" 
            className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/sections' ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth <= 768) setShowSidebar(false); }}
          >
            <FontAwesomeIcon icon={faTable} className="me-2" />
            SECTIONS
          </Link>
          <Link 
            to="/registrar-dashboard/irregular-students" 
            className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/irregular-students' ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth <= 768) setShowSidebar(false); }}
          >
           <FontAwesomeIcon icon={faUserClock} className='me-2'/>
            IRREGULAR
          </Link>
        </div>
      )}
      <div className="submenu-item d-flex align-items-center mb-2" onClick={() => setShowGradesSubMenu(!showGradesSubMenu)}>
        <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
        GRADES
        <FontAwesomeIcon icon={showGradesSubMenu ? faChevronUp : faChevronDown} className="ms-auto" />
      </div>
      {showGradesSubMenu && (
        <div className="submenu">
          <Link 
            to="/registrar-dashboard/csog"
            className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/csog' ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth <= 768) setShowSidebar(false); }}
          >
            <FontAwesomeIcon icon={faTable} className="me-2" /> {/* CSOG icon */}
            CSOG
          </Link>
          <Link 
            to="/registrar-dashboard/mog"
            className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/mog' ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth <= 768) setShowSidebar(false); }}
          >
            <FontAwesomeIcon icon={faClipboardList} className="me-2" /> {/* MOG icon */}
            MOG
          </Link>
        </div>
      )}
      <Link 
        to="/registrar-dashboard/grades-submission" 
        className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/registrar-dashboard/grades-submission' ? 'active' : ''}`}
        onClick={() => {
          setShowGradesSubMenu(false);
          if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile
        }}
      >
        <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
        GRADES SUBMISSION
      </Link>
  
      {user?.personnelType === 'Admin' && ( 
        <>
          <Link 
            to="/registrar-dashboard/staff" 
            className={`submenu-item d-flex align-items-center mb-2 ${location.pathname.startsWith('/registrar-dashboard/staff') ? 'active' : ''}`}
            onClick={() => {
              setShowGradesSubMenu(false);
              if (window.innerWidth <= 768) setShowSidebar(false);
            }}
          >
            <FontAwesomeIcon icon={faUserTie} className="me-2" />
            STAFFS
          </Link>
          <Link 
            to="/registrar-dashboard/academicYear" 
            className={`submenu-item d-flex align-items-center mb-2 ${location.pathname.startsWith('/registrar-dashboard/academicYear') ? 'active' : ''}`}
            onClick={() => {
              setShowGradesSubMenu(false);
              if (window.innerWidth <= 768) setShowSidebar(false);
            }}
          >
            <FontAwesomeIcon icon={faClock} className="me-2" />
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
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/registrar-dashboard/profile');
                    if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile if needed
                    setShowDropdown(false); // Close dropdown after selection
                  }}
                >
                  Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/registrar-dashboard/change-password');
                    if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile if needed
                    setShowDropdown(false); // Close dropdown after selection
                  }}
                >
                  Change Password
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleLogout();
                    if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile if needed
                    setShowDropdown(false); // Close dropdown after selection
                  }}
                >
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
          <Route path="staff/" element={<RegistrarStaffAssign />} />
          <Route path="academicYear" element={<HeadRegistrarAcademicYear />} />
          <Route path="profile" element={<RegistrarProfile />} />
          <Route path="change-password" element={<NewPassword />} /> 
          <Route path="irregular-students" element={<RegistrarIrregularStudents />} />
        </Routes>
      </div>
    </div>
  );
}
