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
import StudentModel from '../ReactModels/StudentModel';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../Context/UserContext';
import { Row, Col, Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap'; // Import Button component from react-bootstrap or your UI library
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
  const [subject, setSubject] = useState('');
  const [students, setStudents] = useState([]);


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






  function printTableContent() {
    const printContent = document.getElementById('printableContent').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
}



{/* SIDE BAR NAV */}
  return (
    
    <div className="dashboard-container d-flex">
      <div className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}>
        <img src="pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">
  Hello, {user?.personnelNameFirst || 'Guest'}!
</div>
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







{/* HEADER BAR */}
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
    {selectedClass ? (
      <div className="ms-0">
        <ClassDetails />
      </div>
    ) : (
      <div>
        <Row className="mb-4 bg-white rounded p-3 m-1">
        <Col>
          <Form.Group controlId="subject">
            <Form.Label>Subject</Form.Label>
            <Form.Control as="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.subjectName}>
                  {subj.subjectName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>


          <Col>
            <Form.Group controlId="program">
              <Form.Label>Program</Form.Label>
              <Form.Control as="select" value={program} onChange={(e) => setProgram(e.target.value)}>
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
              <Form.Label>Year Level</Form.Label>
              <Form.Control as="select" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
                {yearLevels.map((level) => (
                  <option key={level.id} value={level.yearName}>
                    {level.yearName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="semester">
              <Form.Label>Semester</Form.Label>
              <Form.Control as="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="First">First</option>
                <option value="Second">Second</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="section">
              <Form.Label>Section</Form.Label>
              <Form.Control as="select" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                {sections.map((section, index) => (
                  <option key={index} value={section}>
                    Section {section}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          <Col>
              <Button variant="primary" onClick={() => handleClassClick('BSIT1-1')}>
                View Grade Sheet
              </Button>
          </Col>

        </Row>

        

        <div className="table-container mt-4">
        <h4 className="subject-table-title">
          Subject {subject ? `[${subject}]` : ""}
        </h4>
        <button 
          className="btn btn-success"
          onClick={() => printTableContent("printableContent")}
        >
          Print Class List
        </button>
      </div>

 
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Student Number</th>
              <th>Student Name</th>
              <th>Contact Number</th>
              <th>PCC Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>

            {students.map((student, index) => (
              <tr key={index}>
                <td>{student.studentNumber}</td>
                <td>{student.studentName}</td>
                <td>{student.contactNumber}</td>
                <td>{student.pccEmail}</td>
                <td>{student.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> 


        {/*
        <div className="class-box-container">
          <div className="class-box" onClick={() => handleClassClick('BSIT1-1')}>BSIT 1-1</div>
          <div className="class-box" onClick={() => handleClassClick('BSIT1-2')}>BSIT 1-2</div>
          <div className="class-box" onClick={() => handleClassClick('BSIT2-1')}>BSIT 2-1</div>
          <div className="class-box" onClick={() => handleClassClick('BSIT2-2')}>BSIT 2-2</div>
          <div className="class-box" onClick={() => handleClassClick('BSIT3-1')}>BSIT 3-1</div>
          <div className="class-box" onClick={() => handleClassClick('BSIT3-2')}>BSIT 3-2</div>
          <div className="class-box" onClick={() => handleClassClick('BSIT4-1')}>BSIT 4-1</div>
          <div className="class-box" onClick={() => handleClassClick('BSIT4-2')}>BSIT 4-2</div>
        </div> */}

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
