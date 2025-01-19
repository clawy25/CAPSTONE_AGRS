import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBars, faAngleDown, faAngleUp, faTable, faGraduationCap, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import '../App.css';
import { UserContext } from '../Context/UserContext';
import ProgramHeadGrades from './ProgramHeadGrades';
import ProgramHeadClassDesig from './ProgramHeadClassDesig';
import CurriculumPage from './CurriculumPage'; 
import ProgramHeadMOG from './ProgramHeadMOG';
import ProgramHeadCSOG from './ProgramHeadCSOG';
import PersonnelModel from '../ReactModels/PersonnelModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import RegistrarProfile from '../RegistrarComponents/RegistrarProfile';
import NewPassword from '../RegistrarComponents/NewPassword';

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
  const [personnelInfo, setPersonnelInfo] = useState([]);
  const location = useLocation();

  //On loading the page
  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if user is not present
    }
  }, [user, navigate]);

    const fetchPersonnelData = async () => {
        try {
            // Fetch all academic years
            const academicYearData = await AcademicYearModel.fetchExistingAcademicYears();
            console.log("Academic years:", academicYearData);
    
            // Find the current academic year
            const currentAcademicYear = academicYearData.find(year => year.isCurrent);
            if (!currentAcademicYear) {
                console.error("No current academic year found");
                return;
            }
            console.log("Current academic year:", currentAcademicYear.academicYear);
    
            // Fetch personnel data using programNumber and current academic year
            const personnelData = await PersonnelModel.getProfessorsbyProgram(user.programNumber, currentAcademicYear.academicYear);
            console.log("Personnel data:", personnelData);

            const findPersonnel = personnelData.find(personnel => personnel.personnelNumber === user.personnelNumber);
            console.log("Personnel matched",findPersonnel)
    
            if (findPersonnel) {
                setPersonnelInfo(findPersonnel);
            } else {
                console.error("Cannot fetch the personnel data");
            }


        } catch (error) {
            console.error("Error in fetchPersonnelData:", error);
        }
    };
    

    useEffect(() => {
        fetchPersonnelData()
    }, [user.personnelNumber]) 
  const dropdownRef = useRef(null);


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
        <div className='d-block align-items-center justify-content-center'>
          <div className='d-flex align-items-center justify-content-center'>
          <img src="/pcc.png" alt="Logo" className="img-fluid mb-3 college-logo" />
          </div>
          <p className="welcome-message mb-3 text-center">Hello, {user ? user.personnelNameFirst : 'Student'}!</p>
        </div>

        {/* Navigation Menu */}
        <nav className="menu mb-3">
          {/* Close Sidebar Button */}
          <button
            className="close-sidebar-btn position-absolute top-0 end-0 m-2 me-3"
            onClick={() => setShowSidebar(false)}
            aria-label="Close Sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            &times;
          </button>

          {/* Grades Section */}
          <div className="menu-item-wrapper">
            <div
              className={`menu-item d-flex align-items-center mb-2`}
              onClick={() => {
                setShowGradesSubMenu(!showGradesSubMenu);
              }}
            >
              <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
              GRADES
              <FontAwesomeIcon icon={showGradesSubMenu ? faAngleUp : faAngleDown} className="ms-auto" />
            </div>
            {showGradesSubMenu && (
              <div className="submenu">
                <Link
                  to="/programHead-dashboard/csog"
                  className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/programHead-dashboard/csog' ? 'active' : ''}`}
                  onClick={() => {
                    if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile
                  }}
                >
                  <FontAwesomeIcon icon={faTable} className="me-2" />
                  Verification
                </Link>
              </div>
            )}
          </div>

          {/* Class Scheduling Section */}
          <div
            className="menu-item d-flex align-items-center mb-2"
            onClick={() => {
              setShowClassDesignationSubMenu(!showClassDesignationSubMenu);
              navigate('/programHead-dashboard/class-scheduling');
              if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile
            }}
          >
            <FontAwesomeIcon icon={faTable} className="me-2" />
            CLASS SCHEDULING
            <FontAwesomeIcon icon={showClassDesignationSubMenu ? faAngleUp : faAngleDown} className="ms-auto" />
          </div>

          {showClassDesignationSubMenu && (
            <div className="submenu">
              <Link
                to="/programHead-dashboard/curriculum"
                className={`submenu-item d-flex align-items-center mb-2 ${location.pathname === '/programHead-dashboard/curriculum' ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile
                }}
              >
                <FontAwesomeIcon icon={faTable} className="me-2" />
                CURRICULUM
              </Link>
            </div>
          )}
        </nav>

      </div>

      {/* Main Content Area */}
      <div className="main-content flex-grow-1">
        {/* Header Section */}
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom rounded">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">
            PROGRAM HEAD
          </h1>

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
                    navigate('/programHead-dashboard/profile');
                    if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile if needed
                    setShowDropdown(false); // Close dropdown after selection
                  }}
                >
                  Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/programHead-dashboard/change-password');
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

        {/* Main Content Section based on selected section */}
        <div className="content-section">

        {/*  {selectedSection === 'profile' && (
          <div className="card bg-white rounded">
          <div className="card-header bg-white">
              <p className="fs-5 fw-semibold my-2">{user.personnelNameLast}, {user.personnelNameFirst} {user.personnelNameMiddle} ({user.personnelNumber})</p>
          </div>
          <div className="card-body">
              <div className="row d-flex justify-content-center align-items-center">
                  <div className="col">
                      <p className="fs-6">Personnel Number: </p>
                      <p className="fs-6">Personnel Name: </p>
                      <p className="fs-6">Gender: </p>
                      <p className="fs-6">Date of Birth: </p>                    
                  </div>
                  <div className="col">
                      <p className="fs-6 mb-2 fw-semibold">{user.personnelNumber}</p>
                      <p className="fs-6 mb-3 fw-semibold">{user.personnelNameFirst} {user.personnelNameMiddle} {user.personnelNameLast}</p>
                      <p className="fs-6 mb-2 fw-semibold">{personnelInfo.personnelSex}</p>
                      <p className="fs-6 mb-2 fw-semibold">{personnelInfo.personnelBirthDate}</p>
                  </div>
                  <div className="col">
                      <p className="fs-6">Personnel Type: </p>
                      <p className="fs-6">Mobile No.: </p>
                      <p className="fs-6">Email Address: </p>
                      <p className="fs-6">Home Address: </p>
                  </div>
                  <div className="col">
                      <p className="fs-6 mb-3 fw-semibold">{personnelInfo.personnelType}</p>
                      <input 
                          type="text" 
                          className="fs-6 mb-3 fw-semibold" 
                          value={personnelInfo.personnelContact || ''} 
                          readOnly
                      />
                      <input 
                          type="text" 
                          className="fs-6 mb-3 fw-semibold d-block" 
                          value={personnelInfo.personnelEmail || ''} 
                          readOnly
                      />
                      <input 
                          type="text" 
                          className="fs-6 mb-2 fw-semibold" 
                          value={personnelInfo.personnelAddress || ''} 
                          readOnly
                      />
                  </div>
              </div>
          </div>
          <div className="card-footer p-2 bg-white">
              <button className="btn btn-success">Save</button>
          </div>
      </div>
        )}   */}

        </div>

        <Routes>
          <Route path="csog" element={<ProgramHeadCSOG />} />
          <Route path="mog" element={<ProgramHeadMOG />} />
          <Route path="class-scheduling" element={<ProgramHeadClassDesig  programHeadView={programHeadView}
              setProgramHeadView={setProgramHeadView}
              setSelectedProgram={setSelectedProgram}
              selectedProgram={selectedProgram}/>} />
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="profile" element={<RegistrarProfile />}/>
          <Route path="change-password" element={<NewPassword />}/>
        </Routes>
      </div>
    </div>
  );
}
