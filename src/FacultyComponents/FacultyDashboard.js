import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars, faChalkboardTeacher, faCalendar } from '@fortawesome/free-solid-svg-icons';
import FacultySchedulePage from './FacultySchedulePage';
import '../StudentComponents/Dashboard.css';
import ClassDetails from './ClassDetails';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
import StudentModel from '../ReactModels/StudentModel';
import './PrintStyles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../Context/UserContext';
import { Row, Col, Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';


export default function FacultyDashboard () {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Get user context
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('classes'); // Default section
  const [selectedClass, setSelectedClass] = useState(null); // To track selected class
  const dropdownRef = useRef(null);
  const [program, setProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [programs, setPrograms] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);



  const SECTIONS = {
    CLASSES: 'classes',
    SCHEDULE: 'schedule',
    HRIS: 'hris',
    PROFILE: 'profile',
    CHANGE_PASSWORD: 'change-password',
  };
  
  
  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if user is not found
    }
  }, [user, navigate]);

      // Fetch existing students from StudentModel
      const fetchExistingStudents = async () => {
        try {
            const existingStudents = await StudentModel.fetchExistingStudents();
            
            // Modify student.id to start from 0, 1, 2, etc.
            const studentsWithModifiedIds = existingStudents.map((student, index) => ({
                ...student, // Keep the existing student data
                id: index   // Overwrite the id with the new index
            }));
    
            setStudents(studentsWithModifiedIds);
        } catch (error) {
            console.error('Error fetching existing students:', error);
        }
      };
  
        // Fetch existing students onload
    useEffect(() => {fetchExistingStudents();}, []);


  const handleLogout = () => {
    navigate('/login');
    sessionStorage.clear();
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleProfileClick = () => {
    setSelectedSection(SECTIONS.PROFILE);
    setShowDropdown(false);
  };

  const handleChangePasswordClick = () => {
    setSelectedSection(SECTIONS.CHANGE_PASSWORD);
    setShowDropdown(false);
  };

  const handleClassClick = (className) => {
    setSelectedClass(className); // Set the selected class
    setSelectedSection(SECTIONS.CLASSES); // Ensure the section is still 'classes'
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


  
  
// Fetch programs from ProgramModel
useEffect(() => {
  const fetchPrograms = async () => {
    try {
      const fetchedPrograms = await ProgramModel.fetchAllPrograms(); 
      setPrograms(fetchedPrograms);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  fetchPrograms();
}, []);

  // Fetch year levels from YearLevelModel
  useEffect(() => {
    const fetchYearLevels = async () => {
      try {
        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        setYearLevels(fetchedYearLevels);
      } catch (error) {
        console.error('Error fetching year levels:', error);
      }
    };

    fetchYearLevels();
  }, []);


 // SECTION RELATED CONSTANTS
  const sections = ['A', 'B', 'C'];


  //COURSE RELATED CONSTANTS
  

    // Fetch courses from CourseModel
    useEffect(() => {
      const fetchCourses = async () => {
        try {
          const fetchedCourses = await CourseModel.fetchAllCourses();
          setCourses(fetchedCourses);
        } catch (error) {
          console.error('Error fetching courses:', error);
        }
      };
    
      fetchCourses();
    }, []);

    //CLASS LIST RELATED CONSTANTS

    const [showTable, setShowTable] = useState(false);

    const handleClassListClick = () => {
      setShowTable(!showTable); // Toggle the table visibility
    };

  const printTableContent = (elementId) => {
    const printContent = document.getElementById(elementId);
    const newWindow = window.open('', '', 'width=800,height=600');
    newWindow.document.write('<html><head><title>Print Class List</title>');
    newWindow.document.write('<link rel="stylesheet" href="/PrintStyles.css" />');
    newWindow.document.write('</head><body >');
    newWindow.document.write(printContent.innerHTML);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
  };
  
  return (
    <div className="dashboard-container d-flex">
      <div className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}>
        <img src="pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">Hello, {user ? user.personnelNameFirst : 'Guest'}!</div>
        <nav className="menu mb-3">
          <Link
            to=""
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.CLASSES ? 'active' : ''}`}
            onClick={() => { setSelectedSection(SECTIONS.CLASSES); setSelectedClass(null); setShowSidebar(false); }}
          >
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            CLASSES
          </Link>
          <Link
            to=""
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.SCHEDULE ? 'active' : ''}`}
            onClick={() => { setSelectedSection(SECTIONS.SCHEDULE); setShowSidebar(false); }}
          >
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            SCHEDULE
          </Link>
          <Link
            to=""
            className={`menu-item d-flex align-items-center mb-2 ${selectedSection === SECTIONS.HRIS ? 'active' : ''}`}
            onClick={() => { setSelectedSection(SECTIONS.HRIS); setShowSidebar(false); }}
          >
            <FontAwesomeIcon icon={faUser} className="me-2" />
            HRIS
          </Link>
        </nav>
      </div>

      <div className="main-content flex-grow-1">
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom rounded">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">
            PARAÑAQUE CITY COLLEGE
          </h1>
          <button className="btn btn-link text-dark d-md-none" onClick={toggleSidebar} aria-label="Toggle Sidebar">
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

{/* FIRST ROW: DROPDOWNS BAR */}
        {selectedSection === SECTIONS.CLASSES && (
  <section className="mt-3 ms-0">
    <h2 className="custom-font custom-color-green-font">Class Records for {selectedClass}</h2>
    {selectedClass ? ( <div className="ms-0"> <ClassDetails />
      </div>
    ) : (

      <div>
      <Row className="p-3 bg-white border border-success rounded mb-4 m-1">

        <Col>
        <Form.Group controlId="course">
          <Form.Label className="custom-color-green-font custom-font">Course</Form.Label>
          <Form.Control
            as="select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.courseDescriptiveTitle}>
                {course.courseDescriptiveTitle}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Col>



      <Col>
        <Form.Group controlId="program">
          <Form.Label className="custom-color-green-font custom-font">Program</Form.Label>
          <Form.Control
            as="select"
            value={program}
            onChange={(e) => setProgram(e.target.value)} // This will set the selected program
          >
            <option value="">Select a program</option> {/* Placeholder */}
            {programs.map((prog) => (
              <option key={prog.id} value={prog.programName}>
                {prog.programName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Col>

          
      <Col>
        <Form.Group controlId="yearLevel">
          <Form.Label className="custom-color-green-font custom-font">Year Level</Form.Label>
          <Form.Control
            as="select"
            value={yearLevel}
            onChange={(e) => setYearLevel(e.target.value)}
          >
            <option value="">Select a year level</option>
            {yearLevels.map((level) => (
              <option key={level.id} value={level.yearName}>
                {level.yearName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Col>

      <Col>
        <Form.Group controlId="section">
          <Form.Label className="custom-color-green-font custom-font">Section</Form.Label>
          <Form.Control
            as="select"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Select a section</option>
            {sections.map((section, index) => (
              <option key={index} value={section}>
                Section {section}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Col>


          <Col>
            <Form.Group controlId="semester">
              <Form.Label className="custom-color-green-font custom-font">Semester</Form.Label>
              <Form.Control as="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="First">First</option>
                <option value="Second">Second</option>
              </Form.Control>
            </Form.Group>
          </Col>


      {/* Button to show/hide the table */}
      <Col className="d-flex align-items-end">
        <Button 
          variant="success" 
          className="w-100" 
          onClick={handleClassListClick}
        >
          Class List
        </Button>
      </Col>


        <Col className="d-flex align-items-end">
          <Button variant="success" className="w-100" onClick={() => handleClassClick('BSIT1-1')}>
            Grade Sheet
          </Button>
        </Col>

      </Row>

        
        

      {/* SECOND ROW: TABLE */}
      {showTable && (
      <div className="table-container mt-4">
          {/* Print Button */}
          <div 
              className="d-flex justify-content-between align-items-center" 
              style={{
                  position: 'sticky', 
                  top: 0, 
                  backgroundColor: 'white', 
                  zIndex: 10, 
                  padding: '10px'
              }}>
              <h4 className="custom-font custom-color-green-font">
                  Course: {course ? `${course}` : ""}
              </h4>
              <button 
                  className="btn btn-success"
                  onClick={() => printTableContent("printableContent")}
              >
                  Print Class List
              </button>
          </div>

          {/* Printable Content */}
          <div id="printableContent">

              {/* Class Information Row */}
              <div 
                  className="class-info-row mb-3 p-2 border border-success rounded"
                  style={{
                      fontSize: '14px', 
                      backgroundColor: '#e9f5ea',
                      display: 'flex', 
                      justifyContent: 'space-around',
                      alignItems: 'center'
                  }}
              >
                  <span><strong>Course/Subject:</strong> {course}</span>
                  <span><strong>Course Code:</strong> {course}</span>
                  <span><strong>Program:</strong> {program}</span>
                  <span><strong>Year Level:</strong> {yearLevel}</span>
                  <span><strong>Section:</strong> {section}</span>
                  <span><strong>Semester:</strong> {semester}</span>
              </div>

              {/* Table Content */}
              <div 
                  id="printableTable" 
                  className="table-wrapper">
                  <table className="table table-bordered border-success">
                      <thead 
                          className="table-success"
                          style={{
                              position: 'sticky',
                              top: 0,
                              backgroundColor: '#28a745',
                              zIndex: 5
                          }}>
                          <tr>
                              <th className="custom-color-green-font">Student Number</th>
                              <th className="custom-color-green-font">Last Name</th>
                              <th className="custom-color-green-font">First Name</th>
                              <th className="custom-color-green-font">Middle Name</th>
                              <th className="custom-color-green-font">Contact Number</th>
                              <th className="custom-color-green-font">PCC Email</th>
                              <th className="custom-color-green-font">Address</th>
                          </tr>
                      </thead>
                      <tbody className="table-light">
                          {students.map((student, index) => (
                              <tr key={index}>
                                  <td>{student.studentNumber}</td>
                                  <td>{student.studentNameLast}</td>
                                  <td>{student.studentNameFirst}</td>
                                  <td>{student.studentNameMiddle}</td>
                                  <td>{student.studentContact}</td>
                                  <td>{student.studentPccEmail}</td>
                                  <td>{student.studentAddress}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      )}
  </div>
    )}
  </section>
)}


        {selectedSection === SECTIONS.SCHEDULE && (
          <section className="m-3 ms-0">
            <h2 className='custom-color-green-font custom-font ms-3'>Schedule</h2>
            <FacultySchedulePage />
          </section>
        )}

        {selectedSection === SECTIONS.HRIS && (
          <section className="m-3 ms-0">
            <h2 className='custom-color-green-font custom-font ms-3'>HRIS</h2>
          </section>
        )}

        {selectedSection === SECTIONS.PROFILE && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Profile</h2>
            <div className="custom-font custom-color-green-font fs-6 mb-2">Faculty ID: 2020-00202-PQ-O</div>
            <input type="text" placeholder="First Name" className="form-control custom-color-green-font mb-2" required />
            <input type="text" placeholder="Last Name" className="form-control custom-color-green-font mb-2" required />
            <input type="email" placeholder="Email" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Profile information saved!')}>
              Save
            </button>
          </section>
        )}

        {selectedSection === SECTIONS.CHANGE_PASSWORD && (
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