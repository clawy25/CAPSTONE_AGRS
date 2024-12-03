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
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel'
import StudentModel from '../ReactModels/StudentModel';
import TimelineModel from '../ReactModels/TimelineModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel'
import './PrintStyles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../Context/UserContext';
import { Row, Col, Form, Table } from 'react-bootstrap';
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
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [academicYear, setAcademicYear] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programName, setProgramName] = useState('');
  const [sections, setSections] = useState([]); 
  const [studentInfo, setStudentInfo] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [currentAcademicYear, setCurrentAcadYear] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [userSelectedCount, setUserSelectedCount] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const [finalData, setFinalData] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [classListData, setClassListData] = useState([]); // Store class list data




  const SECTIONS = {
    CLASSES: 'classes',
    SCHEDULE: 'schedule',
    HRIS: 'hris',
    PROFILE: 'profile',
    CHANGE_PASSWORD: 'change-password',
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
    if (!user) {
      navigate('/login'); // Redirect to login if user is not logged in
    } else {
      // Set the user's programNumber as the default selected option
      setSelectedProgram(user.programNumber);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    navigate('/login');
    sessionStorage.clear();
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value); // Allow program change if needed
  };


  // Fetch Academic Years
    useEffect(() => {
      if (!user) {
       console.error('User context is not available.');
       setErrorMessage('User context is not available.');
       return;
        }
        
          const fetchAcademicYears = async () => {
            try {
              const data = await AcademicYearModel.fetchExistingAcademicYears();
              if (data.length === 0) {
                setErrorMessage('No academic years found.');
              } else {
                setAcademicYear(data); // Set fetched data
              }
            } catch (error) {
              console.error('Error fetching academic years:', error);
              setErrorMessage('Failed to load academic years.');
            }
          };
        
          fetchAcademicYears();
        }, [user]);

          // Fetch programs from ProgramModel
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const fetchedPrograms = await ProgramModel.fetchAllPrograms();
        setPrograms(fetchedPrograms);
        
        // Find the programName that corresponds to user.programNumber
        const program = fetchedPrograms.find(program => program.programNumber === user?.programNumber);
        if (program) {
          setProgramName(program.programName);
        } else {
          setProgramName('Program Not Found');
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    
    fetchPrograms();
  }, [user?.programNumber]);

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


const handleClassListClick = async () => {
  // Check for missing required fields
  if (!selectedAcademicYear || !selectedProgram || !yearLevel || !semester || !section || !selectedCourse) {
    alert("Please fill in all required fields.");
    return;
  }

  // Toggle table visibility
  setIsTableVisible(!isTableVisible);

  if (!isTableVisible) {
    try {
      // Fetch class list data from your models or API in parallel
      const [enrollments, schedules, students, courses] = await Promise.all([
        EnrollmentModel.fetchAllEnrollment(),
        ScheduleModel.fetchSchedules(),
        StudentModel.fetchExistingStudents(),
        CourseModel.fetchAllCourses()
      ]);

      // Create Maps for fast lookups
      const studentMap = new Map(students.map(student => [student.studentNumber, student]));
      const scheduleMap = new Map(schedules.map(schedule => [schedule.scheduleNumber, schedule]));
      const courseMap = new Map(courses.map(course => [course.courseCode, course]));

      // Map over enrollments and match data from other models using Maps for faster lookups
      const classList = enrollments.map((enrollment) => {
        const matchedStudent = studentMap.get(enrollment.studentNumber) || {};
        const matchedSchedule = scheduleMap.get(enrollment.scheduleNumber) || {};
        const matchedCourse = courseMap.get(enrollment.courseCode) || {};

        return {
          studentNumber: matchedStudent.studentNumber || "N/A",
          studentFirstName: matchedStudent.studentNameFirst || "N/A",
          studentLastName: matchedStudent.studentNameLast || "N/A",
          courseCode: matchedCourse.courseCode || "N/A",
          yearLevel: matchedSchedule.yearLevel || "N/A",
          sectionNumber: matchedSchedule.sectionNumber || "N/A",
        };
      });

      // Update state with fetched class list data
      setClassListData(classList);
    } catch (error) {
      console.error("Error fetching class list data:", error);
      alert("An error occurred while fetching class list data. Please try again.");
    }
  }
};

    
  
    const fetchExistingStudents = async () => {
      
      // Fetch data from all models
      const enrollments = await EnrollmentModel.fetchAllEnrollment();
      const schedules = await ScheduleModel.fetchSchedules();
      const students = await StudentModel.fetchExistingStudents();
      const courses = await CourseModel.fetchAllCourses();
    
      // Map over enrollments and match data from other models
      const finalResults = enrollments.map(enrollment => {
      
        const matchedStudent = students.find(student => student.studentNumber === enrollment.studentNumber);
        const matchedSchedule = schedules.find(schedule => schedule.scheduleNumber === enrollment.scheduleNumber);
        const matchedCourse = courses.find(course => course.courseCode === enrollment.courseCode);
      
        return {
          studentNumber: matchedStudent?.studentNumber || "N/A",
          studentLastName: matchedStudent?.studentNameLast || "N/A",
          studentFirstName: matchedStudent?.studentNameFirst || "N/A",
          studentMiddleName: matchedStudent?.studentNameMiddle || "N/A",
          contactNumber: matchedStudent?.studentContact || "N/A",
          pccEmail: matchedStudent?.studentPccEmail || "N/A",
          studentPccAddress: matchedStudent?.studentAddress || "N/A",
          scheduleNumber: matchedSchedule?.scheduleNumber || "N/A",
          academicYear: matchedSchedule?.academicYear || "N/A",
          yearLevel: matchedSchedule?.yearLevel || "N/A",
          semester: matchedSchedule?.semester || "N/A",
          sectionNumber: matchedSchedule?.sectionNumber || "N/A", // Ensure sectionNumber is set correctly
          courseCode: matchedCourse?.courseCode || "N/A", // Ensure courseCode is set correctly
          programNumber: matchedCourse?.programNumber || "N/A",
        };
      });
    
      // Apply filtering logic here
      const filteredResults = finalResults.filter(student => {
    
    
        // Ensure all values are converted to strings and trimmed for comparison
        const matchesAcademicYear = selectedAcademicYear ? String(student.academicYear).trim() === String(selectedAcademicYear).trim() : true;
        const matchesYearLevel = yearLevel ? String(student.yearLevel).trim() === String(yearLevel).trim() : true;
        const matchesProgram = selectedProgram ? student.programNumber === selectedProgram : true;
        const matchesSemester = semester ? String(student.semester).trim() === String(semester).trim() : true;
        const matchesSection = section ? String(student.sectionNumber).trim() === String(section).trim() : true;
        const matchesCourse = selectedCourse ? String(student.courseCode).trim() === String(selectedCourse).trim() : true;
    
        // Only return the student if all conditions match
        return matchesAcademicYear && matchesYearLevel && matchesProgram && matchesSemester && matchesSection && matchesCourse;
      });
    
      console.table(filteredResults);
    
      // Update state with filtered data
      setFinalData(filteredResults);
    };
  
    // Fetch existing students onload when the table is visible
    useEffect(() => {
      if (isTableVisible) {
        fetchExistingStudents(); // Fetch data only when the table is visible
      }
    }, [isTableVisible]); // This will trigger when isTableVisible changes

     
      useEffect(() => {
        // Fetch the schedule when the component mounts
        const fetchScheduleForUser = async () => {
          if (!user) {
            setErrorMessage('User not logged in');
            return;
          }
    
          try {
            // Fetch the schedules based on personnelNumber (user's personnelNumber)
            const schedules = await ScheduleModel.fetchSchedulesByPersonnelNumber(user.personnelNumber);
            
            // Find the section associated with this user
            const userSchedule = schedules.find(schedule => schedule.personnelNumber === user.personnelNumber);
    
            if (userSchedule) {
              setSection(userSchedule.sectionNumber); // Set the section based on the fetched data
            } else {
              setErrorMessage('No section found for this user');
            }
          } catch (error) {
            console.error('Error fetching schedule:', error);
            setErrorMessage('Failed to fetch schedule.');
          }
        };
    
        fetchScheduleForUser();
      }, [user]); 

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

    useEffect(() => {
      // Fetch all academic years when the component is mounted
      fetchAcademicYearsAndPrograms();
      fetchStudentInfo(user.studentNumber);
    }, [user.studentNumber]);
  
    useEffect(() => {
      fetchYearLevelandSemester();
    }, [selectedAcademicYear, user.studentNumber]);
  
    useEffect(() => {
      if (selectedAcademicYear && yearLevel && semester && program.length > 0) {
        fetchSections();
      }
    }, [selectedAcademicYear, yearLevel, semester, program]);
  
    const fetchAcademicYearsAndPrograms = async () => {
      try {
        // Fetch all academic years (current and past)
        const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
        setCurrentAcadYear(fetchedAcademicYears); // Store all academic years
  
        // Default to the current academic year if available
        const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);
        if (current.length > 0) {
          setSelectedAcademicYear(current[0].academicYear); // Default to the current academic year
          fetchProgramsForYear(current[0].academicYear); // Fetch programs for the current year
        } else {
          console.error('No current academic year found');
        }
      } catch (error) {
        console.error("Error fetching academic years:", error);
      }
    };
  
    const fetchProgramsForYear = async (academicYear) => {
      try {
        // Fetch programs based on the selected academic year
        const allPrograms = await ProgramModel.fetchProgramData(user.programNumber);
        const programsForYear = allPrograms.filter((program) => program.academicYear === academicYear);
        setProgram(programsForYear); // Set the programs for the selected academic year
      } catch (error) {
        console.error("Error fetching programs for the selected academic year:", error);
      }
    };
  
    const fetchStudentInfo = async (studentNumber, academicYear, yearLevel, program, semester, section, course, personnelNumber) => {
      try {
        // Fetch student data
        const studentData = await StudentModel.fetchExistingStudents();
        const student = studentData.filter((student) => student.studentNumber === studentNumber);
    
        if (student.length === 0) {
          console.error('No matching student found');
          return;
        }
    
        // Fetch enrollment data based on the student number
        const enrollmentData = await EnrollmentModel.fetchEnrollmentData(studentNumber);
    
        if (!enrollmentData || enrollmentData.length === 0) {
          console.error('No enrollment data found for this student');
          return;
        }
    
        // Filter enrollment data based on the provided filters
        const filteredEnrollment = enrollmentData.filter((enrollment) => {
          return (
            enrollment.academicYear === academicYear &&
            enrollment.yearLevel === yearLevel &&
            enrollment.programNumber === program &&
            enrollment.semester === semester &&
            enrollment.section === section
          );
        });
    
        if (filteredEnrollment.length === 0) {
          console.error('No matching enrollment data found');
          return;
        }
    
        // Combine student and filtered enrollment data
        const studentInfo = {
          studentNumber: student[0].studentNumber,
          lastName: student[0].lastName,
          firstName: student[0].firstName,
          middleName: student[0].middleName,
          contactNumber: student[0].contactNumber,
          pccEmail: student[0].pccEmail,
          address: student[0].address,
          enrollmentInfo: filteredEnrollment, // Filtered enrollment information
        };
    
        // Set the combined data
        setStudentInfo(studentInfo);
    
      } catch (error) {
        console.error('Error fetching student or enrollment data:', error.message);
      }
    };
    

  
    const fetchYearLevelandSemester = async () => {
      try {
        const academicYear = selectedAcademicYear;
        const studentNumber = user.studentNumber;
      
        if (!academicYear || !studentNumber) {
          console.error('Missing academicYear or studentNumber');
          setYearLevel('Missing data');
          setSemester('Missing data');
          return; // Stop if required data is missing
        }
         
        const timelineData = await TimelineModel.fetchTimelineData(academicYear, studentNumber);
      
        if (timelineData && timelineData.length > 0) {
          const latestTimeline = timelineData[0];
          setYearLevel(latestTimeline.yearLevel || 'Unknown');
          setSemester(latestTimeline.semester || 'Unknown');
        } else {
          console.log("No timeline data found for the provided academic year and student number.");
          setYearLevel('No data available');
          setSemester('No data available');
        }
      } catch (error) {
        console.error('Error fetching semester:', error);
        setYearLevel('Error fetching year level');
        setSemester('Error fetching semester');
      }
    };
  
    const fetchSections = async () => {
      try {
        if (!selectedAcademicYear || !yearLevel || !semester || !program[0]?.programNumber) {
          console.error("Missing required data: academic year, year level, semester, or program.");
          return;
        }
        const fetchedSections = await SectionModel.fetchExistingSections(
          selectedAcademicYear,
          yearLevel,
          semester,
          program[0]?.programNumber
        );
        setSections(fetchedSections);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };

      // Fetch courses from CourseModel
      useEffect(() => {
        const fetchCourses = async () => {
          try {
            const fetchedCourses = await CourseModel.fetchAllCourses();
            const fetchedPersonnelNumber = await ScheduleModel.fetchAllSchedules()
            
            // Filter courses based on the selected program (user.programNumber)
            const filteredCourses = fetchedCourses.filter(course => 
              course.programNumber === user?.programNumber 
            );
            const filteredCoursesSchedule = fetchedPersonnelNumber.filter(schedule => 
              schedule.personnelNumber === user?.personnelNumber 
            );
            
            setCourses(filteredCourses, filteredCoursesSchedule);  // Set the filtered courses to the state
          } catch (error) {
            console.error('Error fetching courses:', error);
          }
        };
      
        fetchCourses();
      }, [user?.programNumber, user?.personnelNumber ]);  // Re-fetch courses when the user's programNumber changes

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

  const getProgramNameByNumber = (programNumber) => {
    const program = programs.find(p => p.programNumber === programNumber);
    return program ? program.programName : null; // Return null if no match is found
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
            FACULTY
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



<Row className="p-3 bg-white border border-success rounded mb-4 m-1  justify-content-center align-items-center">
  {/* Filter Controls */}
  <Col>
    <Form.Group controlId="academicYear">
      <Form.Label className="custom-color-green-font custom-font">Academic Year</Form.Label>
      <Form.Control
        as="select"
        value={selectedAcademicYear}
        onChange={(e) => setSelectedAcademicYear(e.target.value)}
      >
        <option value="">Select an Academic Year</option>
        {academicYear
          .sort((a, b) => {
            const yearA = parseInt(a.academicYear.split('-')[0]);
            const yearB = parseInt(b.academicYear.split('-')[0]);
            return yearB - yearA; // Sort in descending order
          })
          .map((year) => (
            <option key={year.academicYear} value={year.academicYear}>
              {year.academicYear}
            </option>
          ))}
      </Form.Control>
    </Form.Group>
  </Col>

  <Col>
    <Form.Group controlId="program">
      <Form.Label className='custom-color-green-font custom-font'>Program</Form.Label>
      <Form.Control
        as="select"
        value={selectedProgram || ''}
        onChange={handleProgramChange}
        disabled // Disable dropdown since programNumber comes from user context
      >
        <option value={user?.programNumber || ''}>
          {programName || 'Program Not Assigned'}
        </option>
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
          <option key={level.id} value={level.id}>
            {level.id}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  </Col>

  {/* Semester */}
  <Col>
    <Form.Group controlId="semester">
      <Form.Label className="custom-color-green-font custom-font">Semester</Form.Label>
      <Form.Control as="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
        <option value="">Select a semester</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </Form.Control>
    </Form.Group>
  </Col>

  {/* Section */}
  <Col>
    <Form.Group controlId="section">
      <Form.Label className="custom-color-green-font custom-font">Select Section</Form.Label>
      <Form.Control
        as="select"
        value={section}
        onChange={(e) => setSection(e.target.value)}
      >
        <option value="">Select a section</option>
        {sections.map((section) => (
          <option key={section.id} value={section.sectionNumber}>
            {section.sectionNumber}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  </Col>

  {/* Course */}
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
          <option key={course.id} value={course.courseCode}>
            {course.courseCode}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  </Col>

  {/* Button to trigger fetch and filter */}
  <Col>
    <Button variant="success" className="w-100 mt-4" onClick={handleClassListClick}>
      Class List
    </Button>
  </Col>

  <Col>
    <Button variant="success" className="w-100 mt-4" onClick={() => handleClassClick('BSIT1-1')}>
      Grade Sheet
    </Button>
  </Col>
</Row>


  {/* Table and printable content */}

  <div className="table-container mt-4 bg-white rounded">
  {/* Print Button */}
  <div
    className="d-flex flex-column flex-md-row justify-content-between align-items-center"
    style={{
      position: 'sticky',
      top: 0,
      backgroundColor: 'white',
      zIndex: 10,
      padding: '10px',
    }}
  >
    <h4 className="custom-font custom-color-green-font text-center text-md-left">
      Course: {selectedCourse ? `${selectedCourse}` : "All"}
    </h4>
    <button 
      className="btn btn-success mt-2 mt-md-0"
      onClick={() => printTableContent("printableContent")}
    >
      Print Class List
    </button>
  </div>

  {/* Table Content */}
  <div id="printableContent">
  <div className="class-info-row mb-3 mx-2 p-2 border border-success fs-6 rounded bg-success text-white">
  <div className="row">
    <div className="col-12 col-md-2">
      <strong>Academic Year:</strong> {selectedAcademicYear || "N/A"}
    </div>
    <div className="col-12 col-md-2">
      <strong>Program:</strong> {getProgramNameByNumber(user?.programNumber) || "Program Not Assigned"}
    </div>
    <div className="col-12 col-md-2">
      <strong>Year Level:</strong> {yearLevel || "N/A"}
    </div>
    <div className="col-12 col-md-2">
      <strong>Semester:</strong> {semester || "N/A"}
    </div>
    <div className="col-12 col-md-2">
      <strong>Section:</strong> {section || "N/A"}
    </div>
    <div className="col-12 col-md-2">
      <strong>Course/Subject:</strong> {selectedCourse || "N/A"}
    </div>
  </div>
</div>



    {/* Data Table */}
    <div className="container-fluid">
    <Table className="table table-responsive table-bordered border-success">
      <thead className="table-success" style={{ position: 'sticky', top: 0, backgroundColor: '#28a745', zIndex: 5 }}>
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
        {finalData.length > 0 ? (
          finalData.map((student, index) => (
            <tr key={index}>
              <td>{student.studentNumber}</td>
              <td>{student.studentLastName}</td>
              <td>{student.studentFirstName}</td>
              <td>{student.studentMiddleName}</td>
              <td>{student.contactNumber}</td>
              <td>{student.pccEmail}</td>
              <td>{student.studentPccAddress}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className='text-center'>No Data Available</td>
          </tr>
        )}
      </tbody>
    </Table>
</div>

  </div>
</div>


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