import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBars, faAngleDown, faAngleUp, faTable, faGraduationCap, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import '../App.css';
import { UserContext } from '../Context/UserContext';
import ProgramHeadGrades from './ProgramHeadGrades';
import ProgramHeadClassDesig from './ProgramHeadClassDesig';
import CurriculumPage from './CurriculumPage'; 
import ProgramHeadMOG from './ProgramHeadMOG';
import ProgramHeadCSOG from './ProgramHeadCSOG';

export default function ProgramHeadDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('csog'); // Default to CSOG
  const [programHeadView, setProgramHeadView] = useState('professor');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showGradesSubMenu, setShowGradesSubMenu] = useState(false);
  const [showClassDesignationSubMenu, setShowClassDesignationSubMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Constants for section names
  const SECTIONS = {
    GRADES: 'grades',
    CLASSDESIGNATION: 'classDesignation',
    HRIS: 'hris',
    PROFILE: 'profile',
    CHANGEPASSWORD: 'change-password',
    CURRICULUM: 'curriculum',
    MOG: 'mog',
    CSOG: 'csog',
  };

  // Toggle Grades submenu visibility
  const toggleGradeSubMenu = () => {
    setShowGradesSubMenu((prev) => !prev);
  };

  // Toggle Class Designation submenu
  const toggleClassDesignationSubMenu = () => {
    setShowClassDesignationSubMenu((prev) => !prev);
  };


  // When Class Designation section is clicked, open the submenu
  const handleClassDesignationClick = () => {
    setSelectedSection(SECTIONS.CLASSDESIGNATION); // Ensure Class Designation is selected
    setShowClassDesignationSubMenu(true); // Open submenu by default
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

  // Handle section change and close sidebar on selection (for mobile)
  const handleSectionChange = (section) => {
    setSelectedSection(section);
    setShowSidebar(false);
    setShowGradesSubMenu(false); // Close submenu when section is selected
    setShowClassDesignationSubMenu(false); // Close Class Designation submenu
    setShowDropdown(false); // Close dropdown when any section is selected
  };

  // Highlight CSOG by default when Grades is clicked
  const handleGradesClick = () => {
    setSelectedSection(SECTIONS.CSOG); // Set CSOG as default section within Grades
    setShowGradesSubMenu(true); // Open submenu by default
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

  // Toggle sidebar visibility (for mobile view)
  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

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
          <div className="menu-item-wrapper">
    {/* Grades Section Link */}
    <div
      className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.GRADES || selectedSection === SECTIONS.CSOG || selectedSection === SECTIONS.MOG ? 'active' : ''}`}
      onClick={handleGradesClick} // Ensure submenu toggles when Grades is clicked
    >
      <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
      GRADES
      <FontAwesomeIcon icon={showGradesSubMenu ? faAngleUp : faAngleDown} className="ms-auto" />
    </div>
    {showGradesSubMenu && (
      <div className="submenu">
        <Link
          to="#"
          className={`submenu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.CSOG ? 'active' : ''}`}
          onClick={() => handleSectionChange(SECTIONS.CSOG)} // Navigate to CSOG
        >
          <FontAwesomeIcon icon={faTable} className="me-2" />
          CSOG
        </Link>
        <Link
          to="#"
          className={`submenu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.MOG ? 'active' : ''}`}
          onClick={() => handleSectionChange(SECTIONS.MOG)} // Navigate to MOG
        >
          <FontAwesomeIcon icon={faClipboardList} className="me-2" />
          MOG
        </Link>
      </div>
    )}

    {/* Class Designation Section Link */}
    <div
      className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.CLASSDESIGNATION ? 'active' : ''}`}
      onClick={handleClassDesignationClick} // Ensure submenu toggles when Class Designation is clicked
    >
      <FontAwesomeIcon icon={faTable} className="me-2" />
      CLASS SCHEDULING
      <FontAwesomeIcon icon={showClassDesignationSubMenu ? faAngleUp : faAngleDown} className="ms-auto" />
    </div>
    {showClassDesignationSubMenu && (
      <div className="submenu">
        <Link
          to="#"
          className="submenu-item d-flex align-items-center mb-2"
          onClick={() => handleSectionChange(SECTIONS.CURRICULUM)} // Navigate to Curriculum
        >
          <FontAwesomeIcon icon={faTable} className="me-2" />
          CURRICULUM
        </Link>
      </div>
    )}
  </div>

  <div
      className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.HRIS ? 'active' : ''}`} 
    >
      <FontAwesomeIcon icon={faUser} className="me-2" />
      HRIS  
    </div>
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
                <button className="dropdown-item" onClick={() => { handleSectionChange(SECTIONS.PROFILE); setShowDropdown(false); }}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={() => { handleSectionChange(SECTIONS.CHANGEPASSWORD); setShowDropdown(false); }}>
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
          {/* MOG Section */}
          {selectedSection === SECTIONS.MOG && <ProgramHeadMOG />}

          {/* CSOG Section */}
          {selectedSection === SECTIONS.CSOG && <ProgramHeadCSOG />}

          {/* Class Designation Section */}
          {selectedSection === SECTIONS.CLASSDESIGNATION && (
            <ProgramHeadClassDesig
              programHeadView={programHeadView}
              setProgramHeadView={setProgramHeadView}
              setSelectedProgram={setSelectedProgram}
              selectedProgram={selectedProgram}
            />
          )}

          {/* Curriculum Section */}
          {selectedSection === SECTIONS.CURRICULUM && <CurriculumPage />}

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
    </div>
  );
}
