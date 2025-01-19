import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars, faChalkboardTeacher, faCalendar, faPrint } from '@fortawesome/free-solid-svg-icons';
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
import NewPassword from '../RegistrarComponents/NewPassword';
import RegistrarProfile from '../RegistrarComponents/RegistrarProfile';
import './PrintStyles.css';

import { UserContext } from '../Context/UserContext';
import { Row, Col, Form, Table, Spinner, Container, Toast, ToastContainer } from 'react-bootstrap';

import { Button } from 'react-bootstrap';
import ClassList from './ClassList';
import '../App.css'


export default function FacultyDashboard () {
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Get user context
  const [currentAcademicYear, setCurrentAcadYear] = useState([]);

  const [mappedData, setMappedData] = useState([]);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [UserProgram, setUserProgram] = useState([]);
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSect, setSelectedSect] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [selectedSchedule, setSelectedSchedule] = useState([]);

  const [sections, setSections] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [classListData, setClassListData] = useState([]);

  const [selectedSection, setSelectedSection] = useState('classes');
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null); // To track selected class
  const dropdownRef = useRef(null);
  const [program, setProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [programName, setProgramName] = useState('');
   
  const [studentInfo, setStudentInfo] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [userSelectedCount, setUserSelectedCount] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const location = useLocation();



  const fetchAcademicYearsAndPrograms = async () => {
    try {
  
      const programs = await ProgramModel.fetchAllPrograms();
      const userProgram = programs.filter(program => program.programNumber === user.programNumber);
      let programDetails = null; // Default value in case no match is found

      if (userProgram.length > 0) {
        programDetails = {
          programNumber: userProgram[0].programNumber,
          programName: userProgram[0].programName
        };
        const data = [];

        userProgram.forEach(row => {
          // Find if there is an existing entry for the academic year
          let existingAcadYear = data.find(item => item.academicYear === row.academicYear);
        
          if (!existingAcadYear) {
            // If not found, create a new entry

            const yearLevels = [];
            const numYrs = row.programNumOfYear;
            const summerlevels = [];


              userProgram.forEach(row => {
                summerlevels.push(row.programYrLvlSummer);  
              });
            
            for (let i = 1; i <= numYrs; i++){

              const semesters = [];
              let isSummer = false;
              
              //For loop [0, 1, 2] to iterate per value summerLevelValue
              for (let j = 0; j < summerlevels.length; j++) {
                if (summerlevels[j] === i) {
                  isSummer = true;
                  
                  break;
                }
              }

              if(isSummer){
                for (let x = 1; x <= 3; x++) {
                  semesters.push(x);
                }
              } else{
                for (let x = 1; x <= 2; x++) {
                  semesters.push(x);
                }
              }

              yearLevels.push({
                yearLevel: i,
                semesters: semesters,
              });
            }
            
            const entry = {
              academicYear: row.academicYear,
              yearLevels: yearLevels,
            };
            data.push(entry);  // Push the new entry into the data array
          }
        });
        
        console.log(data);
        setUserProgram(programDetails);
        setMappedData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchSections = async () => {
    try {
      if (!selectedAcademicYear || !selectedYearLevel || !selectedSemester || !UserProgram.programNumber) {
        console.error("Missing required data: academic year, year level, semester, or program.");
        return;
      }
      const fetchedSections = await SectionModel.fetchExistingSections(
        selectedAcademicYear,
        selectedYearLevel,
        selectedSemester,
        UserProgram.programNumber
      );
      setSections(fetchedSections);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchScheduleForUser = async () => {
    try {
      // Fetch the schedules based on personnelNumber (user's personnelNumber)
      const schedules = await ScheduleModel.fetchExistingschedule(selectedSect);

      //console.log(schedules);
      
      // Find the section associated with this user
      const userSchedule = schedules.filter(schedule => schedule.personnelNumber === user.personnelNumber);

      //console.log(userSchedule);
      if (userSchedule) {
        setSchedules(userSchedule);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setErrorMessage('Failed to fetch schedule.');
    }
  };

  //On loading the dashboard
  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if user is not present
    } else {
      fetchAcademicYearsAndPrograms();
      setUserProgram(user.programNumber);
    }
  }, [user, navigate]);

  useEffect(() => { //Fetching sections after selecting semester
    if (selectedAcademicYear && UserProgram && selectedYearLevel && selectedSemester) {
      setSections([]);
      fetchSections();
    }
  }, [selectedAcademicYear, UserProgram, selectedYearLevel, selectedSemester]);
  
  useEffect(() => { //Fetching professor schedules after selecting section
    if (selectedAcademicYear && UserProgram && selectedYearLevel && selectedSemester && selectedSect) {
      setSchedules([]);
      fetchScheduleForUser();
    }
  }, [selectedAcademicYear, UserProgram, selectedYearLevel, selectedSemester, selectedSect]);

  const handleLogout = () => { //Log out
    navigate('/login');
    sessionStorage.clear();
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleProfileClick = () => {
  
    setShowDropdown(false);
  };

  const handleChangePasswordClick = () => {
  
    setShowDropdown(false);
  };

  const handleClassClick = async (className) => {
    if (!className) {
      setShowToast(true); 
      return; // Exit the function if className is empty
    }
    setShowToast(false);
    if (!classListData || classListData.length === 0){
      try {
        // Fetch data from all models in parallel
        const [enrollments, schedules, students, courses] = await Promise.all([
          EnrollmentModel.fetchAllEnrollment(),
          ScheduleModel.fetchSchedules(),
          StudentModel.fetchExistingStudents(),
          CourseModel.fetchAllCourses(),
        ]);
  
        // Create Maps for faster lookups
        const studentMap = new Map(students.map(student => [student.studentNumber, student]));
        const scheduleMap = new Map(schedules.map(schedule => [schedule.scheduleNumber, schedule]));
        const courseMap = new Map(courses.map(course => [course.courseCode, course]));
  
        // Map over enrollments to create class list
        const mappedData = enrollments.map((enrollment) => {
          const matchedStudent = studentMap.get(enrollment.studentNumber) || {};
          const matchedSchedule = scheduleMap.get(enrollment.scheduleNumber) || {};
          const matchedCourse = courseMap.get(enrollment.courseCode) || {};
  
          return {
            studentNumber: matchedStudent.studentNumber || "N/A",
            studentLastName: matchedStudent.studentNameLast || "N/A",
            studentFirstName: matchedStudent.studentNameFirst || "N/A",
            studentMiddleName: matchedStudent.studentNameMiddle || "N/A",
            contactNumber: matchedStudent.studentContact || "N/A",
            pccEmail: matchedStudent.studentPccEmail ? `${matchedStudent.studentPccEmail.split('@')[0]}@` : "N/A",
            studentAddress: matchedStudent.studentAddress || "N/A",
            scheduleNumber: matchedSchedule.scheduleNumber || "N/A",
            academicYear: matchedSchedule.academicYear || "N/A",
            yearLevel: matchedSchedule.yearLevel || "N/A",
            semester: matchedSchedule.semester || "N/A",
            sectionNumber: matchedSchedule.sectionNumber || "N/A",
            courseCode: matchedCourse.courseCode || "N/A",
            programNumber: matchedCourse.programNumber || "N/A",
          };
        });
  
        //console.log(mappedData);
  
        // Apply filtering
        const filteredResults = mappedData.filter((student) => {
          const program = UserProgram?.programNumber;
  
          return (
            //(!selectedAcademicYear || String(student.academicYear).trim() === String(selectedAcademicYear).trim()) &&
            //(!selectedYearLevel || String(student.yearLevel).trim() === String(selectedYearLevel).trim()) &&
            //(!program || student.programNumber === program) &&
            //(!selectedSemester || String(student.semester).trim() === String(selectedSemester).trim()) &&
            (!selectedSect || String(student.sectionNumber).trim() === String(selectedSect).trim()) &&
            (!selectedCourse || String(student.courseCode).trim() === String(selectedCourse).trim())
          );
        });
        
        setClassListData(filteredResults);
  
        const selectedSchedule = schedules.filter(schedule => schedule.sectionNumber === selectedSect)
                                          .filter(schedule => schedule.courseCode === selectedCourse);
        
        setSelectedSchedule(selectedSchedule);
  
        console.log(selectedSchedule);
        console.log("Mapped Data:", mappedData);
        console.log("Filtered Results:", filteredResults);
      } catch (error) {
        console.error("Error fetching class list data:", error);
        alert("An error occurred while fetching class list data. Please try again.");
      }
    }
    setSelectedClass(className); // Set the selected class
  
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleAcademicYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedAcademicYear(selectedYear);
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedSect('');
    setSelectedCourse('');
    //setIsTableVisible(false);
    setClassListData([]);
  };

  const handleYearLevelChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYearLevel(selectedYear);
    setSelectedSemester('');
    setSelectedSect('');
    setSelectedCourse('');
    //setIsTableVisible(false);
    setClassListData([]);
  };

  const handleSemesterChange = (e) => {
    const level = (e.target.value);
    setSelectedSemester(level);
    setSelectedSect('');
    setSelectedCourse('');
    //setIsTableVisible(false);
    setClassListData([]);
  };

  const handleSectionChange = (e) => {
    const section = e.target.value;
    setSelectedSect(section);
    setSelectedCourse('');
    //setIsTableVisible(false);
    setClassListData([]);
  };

  const handleCourseChange = (e) => {
    const course = e.target.value;
    setSelectedCourse(course);
    //setIsTableVisible(false);
    setClassListData([]);
  };


  useEffect(() => {
    const handleClassListClick = async () => {
      // Check for missing required fields
      if (!selectedAcademicYear || !UserProgram || !selectedYearLevel || !selectedSemester || !selectedSect || !selectedCourse) {
        return; // Do not proceed if not all fields are selected
      }

      // Set loading state and toggle table visibility
      setIsTableVisible(true);
      setLoading(true); // Set loading to true when starting data fetch

      try {
        // Fetch data from all models in parallel
        const [enrollments, schedules, students, courses] = await Promise.all([
          EnrollmentModel.fetchAllEnrollment(),
          ScheduleModel.fetchSchedules(),
          StudentModel.fetchExistingStudents(),
          CourseModel.fetchAllCourses(),
        ]);

        // Create Maps for faster lookups
        const studentMap = new Map(students.map(student => [student.studentNumber, student]));
        const scheduleMap = new Map(schedules.map(schedule => [schedule.scheduleNumber, schedule]));
        const courseMap = new Map(courses.map(course => [course.courseCode, course]));

        // Map over enrollments to create class list
        const mappedData = enrollments.map((enrollment) => {
          const matchedStudent = studentMap.get(enrollment.studentNumber) || {};
          const matchedSchedule = scheduleMap.get(enrollment.scheduleNumber) || {};
          const matchedCourse = courseMap.get(enrollment.courseCode) || {};

          return {
            studentNumber: matchedStudent.studentNumber || "N/A",
            studentLastName: matchedStudent.studentNameLast || "N/A",
            studentFirstName: matchedStudent.studentNameFirst || "N/A",
            studentMiddleName: matchedStudent.studentNameMiddle || "N/A",
            contactNumber: matchedStudent.studentContact || "N/A",
            pccEmail: matchedStudent.studentPccEmail ? `${matchedStudent.studentPccEmail.split('@')[0]}@` : "N/A",
            studentAddress: matchedStudent.studentAddress || "N/A",
            scheduleNumber: matchedSchedule.scheduleNumber || "N/A",
            academicYear: matchedSchedule.academicYear || "N/A",
            yearLevel: matchedSchedule.yearLevel || "N/A",
            semester: matchedSchedule.semester || "N/A",
            sectionNumber: matchedSchedule.sectionNumber || "N/A",
            courseCode: matchedCourse.courseCode || "N/A",
            programNumber: matchedCourse.programNumber || "N/A",
          };
        });

        // Apply filtering
        const filteredResults = mappedData.filter((student) => {
          const program = UserProgram?.programNumber;

          return (
            (!selectedAcademicYear || String(student.academicYear).trim() === String(selectedAcademicYear).trim()) &&
            (!selectedYearLevel || String(student.yearLevel).trim() === String(selectedYearLevel).trim()) &&
            (!program || student.programNumber === program) &&
            (!selectedSemester || String(student.semester).trim() === String(selectedSemester).trim()) &&
            (!selectedSect || String(student.sectionNumber).trim() === String(selectedSect).trim()) &&
            (!selectedCourse || String(student.courseCode).trim() === String(selectedCourse).trim())
          );
        });

        setClassListData(filteredResults);

        // Filter schedules for the selected section and course
        const selectedSchedule = schedules.filter(schedule => schedule.sectionNumber === selectedSect)
                                          .filter(schedule => schedule.courseCode === selectedCourse);

        setSelectedSchedule(selectedSchedule);

      } catch (error) {
        console.error("Error fetching class list data:", error);
        alert("An error occurred while fetching class list data. Please try again.");
      } finally {
        setLoading(false); // Set loading to false when data fetch is done (success or failure)
      }
    };

    // Call handleClassListClick when all fields are selected
    if (selectedAcademicYear && UserProgram && selectedYearLevel && selectedSemester && selectedSect && selectedCourse) {
      handleClassListClick();
    }
  }, [selectedAcademicYear, UserProgram, selectedYearLevel, selectedSemester, selectedSect, selectedCourse]); // dependencies

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

  const getSemesterText = (sem) => {
    switch (sem) {
      case 1:
        return "First";
      case 2:
        return "Second";
      case 3:
        return "Summer";
      default:
        return `${sem}`;
    }
  };

  const selectedYearData = mappedData?.filter(p => p.academicYear === selectedAcademicYear)
                                 ?.flatMap(p => p.yearLevels)
                                 ?.find(p => p.yearLevel === Number(selectedYearLevel));
 
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
      <div className='d-block align-items-center justify-content-center'>
          <div className='d-flex align-items-center justify-content-center'>
          <img src="/pcc.png" alt="Logo" className="img-fluid mb-3 college-logo" />
          </div>
          <p className="welcome-message mb-3 text-center">Hello, {user ? user.personnelNameFirst : 'Student'}!</p>
        </div>
        <nav className="menu mb-3">
        <Link
            to="/faculty-dashboard/classes"
            className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/faculty-dashboard/classes' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();  // Prevent default Link behavior
              setSelectedClass(null);
              setShowSidebar(false);
              navigate('/faculty-dashboard/classes');  // Manually trigger navigation
            }}
          >
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            CLASSES
          </Link>
          <Link
            to="/faculty-dashboard/schedules"
            className={`menu-item d-flex align-items-center mb-2 ${location.pathname === '/faculty-dashboard/schedules' ? 'active' : ''}`}
            onClick={(e) => {navigate('/faculty-dashboard/schedules'); setShowSidebar(false); }}
          >
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            SCHEDULE
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
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/faculty-dashboard/profile');
                    if (window.innerWidth <= 768) setShowSidebar(false); // Close sidebar on mobile if needed
                    setShowDropdown(false); // Close dropdown after selection
                  }}
                >
                  Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/faculty-dashboard/change-password');
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
  <Route path="classes/*" element={<ClassList />} />
  <Route path="schedules" element={<FacultySchedulePage />} />
  <Route path="profile" element={<RegistrarProfile />} />
  <Route path="change-password" element={<NewPassword />} />
  <Route
    path="classes/class-details"
    element={<ClassDetails />}  // Ensure ClassDetails is rendered here
  />
</Routes>

      </div>
    </div>
  );
};