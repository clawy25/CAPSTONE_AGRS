import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faGraduationCap, faBars } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import '../App.css';
import StudentEnrollment from './StudentEnrollment';
import StudentSchedule from './StudentSchedule';
import StudentGrades from './StudentGrades';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import { UserContext } from '../Context/UserContext';
import StudentModel from '../ReactModels/StudentModel';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Get user context
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('enrollment'); // Default section
  const dropdownRef = useRef(null);
  const location = useLocation();

  const SECTIONS = {
    ENROLLMENT: 'enrollment',
    SCHEDULE: 'schedule',
    GRADES: 'grades'
  };


  const [studentInfo, setStudentInfo] = useState([]);

  const fetchStudentdata = async () => {
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
          const studentData = await StudentModel.fetchExistingStudents();
          console.log("Student data:", studentData);

          const findStudent = studentData.find(student => student.studentNumber === user.studentNumber);
          console.log("student matched",findStudent)
  
          if (findStudent) {
              setStudentInfo(findStudent);
          } else {
              console.error("Cannot fetch the student data");
          }


      } catch (error) {
          console.error("Error in fetchPersonnelData:", error);
      }
  };
  

  useEffect(() => {
    fetchStudentdata()
  }, [user.studentNumber]) 

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
                    onClick={() => {setSelectedSection(SECTIONS.ENROLLMENT); setShowSidebar(false);}}
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    ENROLLMENT
                </Link>
                <Link
                    to="/student-dashboard/schedule" 
                    className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/student-dashboard/schedule' ? 'active' : ''}`}
                    onClick={() => {setSelectedSection(SECTIONS.SCHEDULE); setShowSidebar(false);}}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    SCHEDULE
                </Link>
                <Link
                    to="/student-dashboard/grades"
                    className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/student-dashboard/grades' ? 'active' : ''}`}
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
                 <div className="card bg-white rounded">
                 <div className="card-header bg-white">
                     <p className="fs-5 fw-semibold my-2">{user.studentNameLast}, {user.studentNameFirst} {user.studentNameMiddle} ({user.studentNumber})</p>
                 </div>
                 <div className="card-body">
                     <div className="row d-flex justify-content-center align-items-center">
                         <div className="col">
                             <p className="fs-6">Student Number: </p>
                             <p className="fs-6">Student Name: </p>
                             <p className="fs-6">Gender: </p>
                             <p className="fs-6">Date of Birth: </p>                    
                         </div>
                         <div className="col">
                             <p className="fs-6 mb-2 fw-semibold">{user.studentNumber}</p>
                             <p className="fs-6 mb-3 fw-semibold">{user.studentNameFirst} {user.studentNameMiddle} {user.studentNameLast}</p>
                             <p className="fs-6 mb-2 fw-semibold">{studentInfo.studentSex}</p>
                             <p className="fs-6 mb-2 fw-semibold">{studentInfo.studentBirthDate}</p>
                         </div>
                         <div className="col">
                             <p className="fs-6">Student Type: </p>
                             <p className="fs-6">Mobile No.: </p>
                             <p className="fs-6">Email Address: </p>
                             <p className="fs-6">Home Address: </p>
                         </div>
                         <div className="col">
                             <p className="fs-6 mb-3 fw-semibold">{studentInfo.studentType}</p>
                             <input 
                                 type="text" 
                                 className="fs-6 mb-3 fw-semibold" 
                                 value={studentInfo.studentContact || ''} 
                                 readOnly
                             />
                             <input 
                                 type="text" 
                                 className="fs-6 mb-3 fw-semibold d-block" 
                                 value={studentInfo.studentEmail || ''} 
                                 readOnly
                             />
                             <input 
                                 type="text" 
                                 className="fs-6 mb-2 fw-semibold" 
                                 value={studentInfo.studentAddress || ''} 
                                 readOnly
                             />
                         </div>
                     </div>
                 </div>
                 <div className="card-footer p-2 bg-white">
                     <button className="btn btn-success">Save</button>
                 </div>
             </div>
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

        <Routes>
          <Route path="/student-dashboard/enrollment" element={<StudentEnrollment />} />
          <Route path="/student-dashboard/schedule" element={<StudentSchedule />} /> {/* Sections as submenu */}
          <Route path="/student-dashboard/grades" element={<StudentGrades />} />
        </Routes>   
      </div>
    </div>
  );
}
