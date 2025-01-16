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
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../Context/UserContext';
import { Row, Col, Form, Table, Spinner, Container, Toast, ToastContainer } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import '../App.css'

export default function ClassList() {
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
  
    const SECTIONS = {
      CLASSES: 'classes',
      SCHEDULE: 'schedule',
      HRIS: 'hris',
      PROFILE: 'profile',
      CHANGE_PASSWORD: 'change-password',
    };
  
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
        navigate('/login'); // Redirect to login if user is not present
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
    setSelectedSection(SECTIONS.CLASSES); // Ensure the section is still 'classes'
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
   
   
   
    return(
        <Container fluid>
       
          {selectedClass ? ( <div> 
            <h2 className="custom-font custom-color-green-font mb-3 mt-2">Class Records for {selectedClass || ''}</h2>
            <ClassDetails classList={classListData} classDetails={selectedSchedule} /></div>
          ) : (
    <div>

<ToastContainer
    position="top-end"
    className={`p-3 ${showToast ? 'slide-in' : ''}`}
  >
    <Toast
      show={showToast}
      onClose={() => setShowToast(false)}
      bg="warning"
      delay={3000} // Auto close after 3 seconds
      autohide
    >
      <Toast.Header>
        <strong className="me-auto">Warning</strong>
      </Toast.Header>
      <Toast.Body>Please select all required filters before proceeding to the grade sheet.</Toast.Body>
    </Toast>
  </ToastContainer>

<Form className="p-3 mb-4 bg-white border border-success rounded">
<Row className="align-items-center justify-content-between gx-3 gy-2">
{/* Academic Year */}
<Col sm={12} md={6} lg={2} className="mb-3">
  <Form.Group controlId="academicYear" className='w-100'>
    <Form.Label className="custom-color-green-font custom-font text-nowrap">Academic Year</Form.Label>
    <Form.Select
      value={selectedAcademicYear}
      onChange={handleAcademicYearChange}
      className="border-success w-100">
      <option value="">Select Academic Year</option>
      {mappedData.sort((a, b) => {
        let yearA = parseInt(a.academicYear.split('-')[0]);
        let yearB = parseInt(b.academicYear.split('-')[0]);
        return yearB - yearA; // Sorting in descending order
      })
        .map((program) => (
          <option key={program.academicYear} value={program.academicYear}>
            {program.academicYear}
          </option>
        ))}
    </Form.Select>
  </Form.Group>
</Col>

{/* Program */}
<Col sm={12} md={6} lg={2} className="mb-3" >
  <Form.Group controlId="program" className='w-100'>
    <Form.Label className="custom-color-green-font custom-font text-nowrap">Program</Form.Label>
    <Form.Control
      as='select'
      className="border-success w-100"
      disabled>
      <option value={UserProgram.programNumber}>
        {UserProgram.programName || 'No Program'}
      </option>
    </Form.Control>
  </Form.Group>
</Col>

{/* Year Level */}
<Col sm={12} md={6} lg={2} className="mb-3">
  <Form.Group controlId="yearLevel" className='w-100'>
    <Form.Label className="custom-color-green-font custom-font text-nowrap">Year Level</Form.Label>
    <Form.Select
      value={selectedYearLevel}
      onChange={handleYearLevelChange}
      className="border-success w-100"
      disabled={!selectedAcademicYear}>
      <option value="">Select a year level</option>
      {mappedData
        ?.filter(p => p.academicYear === selectedAcademicYear) // Filter by selected academic year
        ?.flatMap(p => p.yearLevels) // Get year levels for selected academic year
        ?.map(level => (
          <option key={level.yearLevel} value={level.yearLevel}>
            Year {level.yearLevel}
          </option>
        ))}
    </Form.Select>
  </Form.Group>
</Col>

{/* Semester */}
<Col sm={12} md={6} lg={2} className="mb-3">
  <Form.Group controlId="semester" className='w-100'>
    <Form.Label className="custom-color-green-font custom-font text-nowrap">Semester</Form.Label>
    <Form.Select
      value={selectedSemester}
      onChange={handleSemesterChange}
      className="border-success w-100"
      disabled={!selectedAcademicYear || !selectedYearLevel}>
      <option value="">Select a semester</option>
      {selectedYearData?.semesters?.map((sem, index) => (
        <option key={index} value={sem}>
          {getSemesterText(sem)}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>

{/* Section */}
<Col sm={12} md={6} lg={2} className="mb-3">
  <Form.Group controlId="section" className='w-100'>
    <Form.Label className="custom-color-green-font custom-font text-nowrap">Select Section</Form.Label>
    <Form.Select
      value={selectedSect}
      onChange={handleSectionChange}
      className="border-success w-100"
      disabled={!selectedAcademicYear || !selectedYearLevel || !selectedSemester}>
      <option value="">Select a section</option>
      {sections.map((section) => (
        <option key={section.id} value={section.sectionNumber}>
          {section.sectionNumber}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>

{/* Course */}
<Col sx={12} sm={12} md={6} lg={2} className="mb-3">
  <Form.Group controlId="course" className='w-100'>
    <Form.Label className="custom-color-green-font custom-font text-nowrap">Course</Form.Label>
    <Form.Select
      value={selectedCourse}
      onChange={handleCourseChange}
      className="border-success w-100"
      disabled={!selectedAcademicYear || !selectedYearLevel || !selectedSemester || !selectedSect}>
      <option value="">Select a course</option>
      {schedules.map((course) => (
        <option key={course.id} value={course.courseCode}>
          {course.courseCode}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>

</Row>
</Form>


{/* Table and printable content */}

{isTableVisible && (
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
        Course: {selectedCourse ? `${selectedCourse}` : "None"}
      </h4>

      {/* Flex Container for Buttons */}
      <div className="d-flex  align-items-center justify-content-center mt-3 mt-md-0">
        {/* Grade Sheet Button */}
        <Button
          variant="success"
          className="w-100 w-md-auto mb-2 mb-md-0 me-md-2 text-nowrap px-2 py-2"
          onClick={(e) => {handleClassClick(selectedCourse);}}
        >
          Grade Sheet
        </Button>

        {/* Print Button */}
        <Button
          className="btn bg-white border-white w-100 w-md-auto d-flex justify-content-center align-items-center"
          onClick={() => printTableContent("printableContent")}
        >
          <FontAwesomeIcon icon={faPrint} className="fa-2x text-success" />
        </Button>
      </div>
    </div>


    {/* Table Content */}
    <div id="printableContent">
      <div className="container-fluid bg-white rounded hide-scroll">
        <div
          className="class-info-row mb-3 mx-2 p-2 fs-6 rounded rowBgColor text-white shadow-sm"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: "20px",
            rowGap: "10px",
            padding: "10px",
            fontSize: "14px",
            
          }}
        >
          <div className='custom-color-green-font'>
            <strong>Academic Year:</strong> {selectedAcademicYear || "N/A"}
          </div>
          <div className='custom-color-green-font'>
            <strong>Program:</strong> {UserProgram.programName || "Program Not Assigned"}
          </div>
          <div className='custom-color-green-font'>
            <strong>Year Level:</strong> {selectedYearLevel || "N/A"}
          </div>
          <div className='custom-color-green-font'>
            <strong>Semester:</strong> {selectedSemester || "N/A"}
          </div>
          <div className='custom-color-green-font'>
            <strong>Section:</strong> {selectedSect || "N/A"}
          </div>
          <div className='custom-color-green-font'>
            <strong>Course/Subject:</strong> {selectedCourse || "N/A"}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
         <div className="text-center py-5 bg-white">
         <Spinner animation="border" variant="success" />
         <p className="mt-3">Loading data, please wait...</p>
       </div>
        ) : classListData.length === 0 ? (
          <div className="text-center py-5 bg-white rounded pt-5 px-4 pb-5 shadow-sm">
            <h5 className="custom-color-green-font mt-5 fs-5">No Student Data Available</h5>
            <p className="fs-6 mb-4">
              No data found for the selected filters. Please adjust your filters and try again.
            </p>
          </div>
        ) : (
          // Table when data is available
          <Container fluid className="table-responsive">
            <Table className="table table-responsive table-bordered border-success ">
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
                {classListData.map((student, index) => (
                  <tr key={index}>
                    <td>{student.studentNumber}</td>
                    <td>{student.studentLastName}</td>
                    <td>{student.studentFirstName}</td>
                    <td>{student.studentMiddleName}</td>
                    <td>{student.contactNumber}</td>
                    <td>{student.pccEmail}</td>
                    <td>{student.studentAddress}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Container>
        )}
      </div>
    </div>
<Routes>
   
</Routes>

  </div>
)}
</div>
)}
      </Container>
    );
}