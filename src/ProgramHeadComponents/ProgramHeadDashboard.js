import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGraduationCap, faBars, faChalkboardTeacher, faAngleDown, faAngleUp, faTable } from '@fortawesome/free-solid-svg-icons';
import '../App.css';
import { UserContext } from '../Context/UserContext';
import ProgramHeadGrades from './ProgramHeadGrades';
import ProgramHeadClassDesig from './ProgramHeadClassDesig';
import CurriculumPage from './CurriculumPage'; // Import CurriculumPage

export default function ProgramHeadDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showClassDesignationSubMenu, setShowClassDesignationSubMenu] = useState(false);
  const [selectedSection, setSelectedSection] = useState('grades');
  const [programHeadView, setProgramHeadView] = useState('professor');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const dropdownRef = useRef(null);
  
  // Constants for section names
  const SECTIONS = {
    GRADES: 'grades',
    CLASSDESIGNATION: 'classDesignation',
    HRIS: 'hris',
    PROFILE: 'profile',
    CHANGEPASSWORD: 'change-password',
    CURRICULUM: 'curriculum', // Add curriculum section key
  };

  // Toggle Class Designation submenu
  const toggleClassDesignationSubMenu = () => {
    setShowClassDesignationSubMenu((prev) => !prev);
  };

  // Log user data when it changes
  useEffect(() => {
    console.log('Fetched User Data:', user);
  }, [user]);

  // Logout function
  const handleLogout = () => {
    navigate('/login');
    sessionStorage.clear();
  };

  // Toggle dropdown menu visibility
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  // Toggle sidebar visibility for mobile screens
  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  // Handle section change and close sidebar on selection (for mobile)
  const handleSectionChange = (section) => {
    setSelectedSection(section);
    setShowSidebar(false);
  };

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showDropdown]);

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar */}
      <div className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}>
        {/* Logo and Welcome Message */}
        <img src="pcc.png" alt="Logo" className="college-logo ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">
          Hello, {user ? user.personnelNameFirst : 'Guest'}!
        </div>

        {/* Navigation Menu */}
        <nav className="menu mb-3">
          {/* Grades Section Link */}
          <Link
            to="#"
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.GRADES ? 'active' : ''}`}
            onClick={() => handleSectionChange(SECTIONS.GRADES)}
          >
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            GRADES
          </Link>

          {/* Class Designation Section with Dropdown Submenu */}
          <div className="menu-item-wrapper">
            <div
              className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.CLASSDESIGNATION ? 'active' : ''}`}
              onClick={() => {
                setSelectedSection(SECTIONS.CLASSDESIGNATION);
                toggleClassDesignationSubMenu();
              }}
            >
              <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
              CLASS SCHEDULING
              <FontAwesomeIcon icon={showClassDesignationSubMenu ? faAngleUp : faAngleDown} className="ms-auto" />
            </div>

            {showClassDesignationSubMenu && (
              <div className="submenu">
                <Link 
                  to="#"
                  className="submenu-item d-flex align-items-center mb-2"
                  onClick={() => handleSectionChange(SECTIONS.CURRICULUM)} // Change section on click
                >
                  <FontAwesomeIcon icon={faTable} className="me-2" />
                  CURRICULUM
                </Link>
              </div>
            )}
          </div>

          {/* HRIS Section Link */}
          <Link
            to="#"
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.HRIS ? 'active' : ''}`}
            onClick={() => handleSectionChange(SECTIONS.HRIS)}
          >
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            HRIS
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="main-content flex-grow-1">
        {/* Header Section */}
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom rounded">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">
            PARAÑAQUE CITY COLLEGE
          </h1>

          <button className="btn btn-link custom-color-green-font d-md-none" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>

          <div className="user-info d-flex align-items-center position-relative" ref={dropdownRef}>
            <span className="me-2">
              {user ? `${user.personnelNameFirst} (${user.personnelNumber})` : 'Guest'}
            </span>
            <FontAwesomeIcon
              icon={faUser}
              className="user-icon"
              onClick={toggleDropdown}
              aria-label="User Menu"
              style={{ cursor: 'pointer' }}
            />
            {showDropdown && (
              <div className="dropdown-menu position-absolute end-0 mt-2 show">
                <button className="dropdown-item" onClick={() => handleSectionChange(SECTIONS.PROFILE)}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={() => handleSectionChange(SECTIONS.CHANGEPASSWORD)}>
                  Change Password
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Section based on selected section */}
        <div className="content-section m-3">
          {/* Grades Section */}
          {selectedSection === SECTIONS.GRADES && (
            <ProgramHeadGrades 
              programHeadView={programHeadView}
              setProgramHeadView={setProgramHeadView}
              setSelectedProgram={setSelectedProgram}
              selectedProgram={selectedProgram}
            />
          )}

          {/* Class Designation Section */}
          {selectedSection === SECTIONS.CLASSDESIGNATION && (
            <ProgramHeadClassDesig
              programHeadView={programHeadView} 
              setProgramHeadView={setProgramHeadView}
            />
          )}

          {/* HRIS Section */}
          {selectedSection === SECTIONS.HRIS && <h2>HRIS Section</h2>}

          {/* Profile Section */}
          {selectedSection === SECTIONS.PROFILE && (
            <section className="card border-success p-3">
              <h2 className="custom-color-green-font custom-font">Profile</h2>
              <input type="text" placeholder="First Name" className="form-control custom-color-green-font mb-2" required />
              <input type="text" placeholder="Last Name" className="form-control custom-color-green-font mb-2" required />
              <input type="email" placeholder="Email" className="form-control custom-color-green-font mb-2" required />
              <button className="btn custom-color-font bg-custom-color-green p-2">
                Save
              </button>
            </section>
          )}

          {/* Change Password Section */}
          {selectedSection === SECTIONS.CHANGEPASSWORD && (
            <section className="card border-success p-3">
              <h2 className="custom-color-green-font custom-font">Change Password</h2>
              <input type="password" placeholder="Current Password" className="form-control custom-color-green-font mb-2" required />
              <input type="password" placeholder="New Password" className="form-control custom-color-green-font mb-2" required />
              <button className="btn custom-color-font bg-custom-color-green p-2">
                Change Password
              </button>
            </section>
          )}

          {/* Curriculum Section */}
          {selectedSection === SECTIONS.CURRICULUM && <CurriculumPage />}
        </div>
      </div>
    </div>
  );
}
