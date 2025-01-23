import { useEffect, useState, useContext } from 'react';
import { Table, Form, Button, Modal, Card, Row, Col, Container } from 'react-bootstrap';
import StudentModel from '../ReactModels/StudentModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
import TimelineModel from '../ReactModels/TimelineModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';


const ScheduleTable = () => {
  
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState([]);
  const [yearLevel, setYearLevel] = useState("");  // Placeholder value for year level
  const [semester, setSemester] = useState("");  // Placeholder value for semester  
  const [program, setProgram] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [sections, setSections] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [studentType, setstudentType] = useState('');
  
  const [selectedSection, setSelectedSection] = useState('');

  const [currentAcademicYear, setCurrentAcadYear] = useState([]);

  
  const [showModal, setShowModal] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [userSelectedCount, setUserSelectedCount] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  //On loading the page
  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if user is not present
    }
  }, [user, navigate]);

  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
      const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);
      setCurrentAcadYear(current);
  
      if (current.length > 0) {
        const currentYear = current[0].academicYear;
        const allPrograms = await ProgramModel.fetchProgramData(user.programNumber);
        const currentProgram = allPrograms.filter((program) => program.academicYear === currentYear);

        setProgram(currentProgram);
      } else {
        console.error('No current academic year found');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchStudentInfo = async (studentNumber) => {
    try {
      const studentData = await StudentModel.fetchExistingStudents();
  
      const student = studentData.find(student => student.studentNumber === studentNumber);
      //console.log(student.studentType)
      setstudentType(student.studentType);
      if (student.length > 0) {
        setStudentInfo(student);
        
        //fetchEnrollment(studentNumber);
      }
  
      if (student) {
        // Set the student's full name
        const fullName = `${student.studentNameLast}, ${student.studentNameFirst}`;
        setStudentName(fullName.trim());
      } else {
        throw new Error("Student not found.");
      }
  
      // Fetch the current academic year (adjust as necessary)
    
    } catch (error) {
      console.error('Error fetching student data:', error.message);
    }
  };

  const fetchYearLevelandSemester = async () => {
    try {
      const academicYear = currentAcademicYear[0]?.academicYear;
      const studentNumber = user.studentNumber;
  
      // Ensure that academicYear and studentNumber are available
      if (!academicYear || !studentNumber) {
        setYearLevel('Missing data');
        setSemester('Missing data');
        console.error('Missing academicYear or studentNumber');
        return;
      }
      const timelineData = await TimelineModel.fetchTimelineData(academicYear, studentNumber);

      if (timelineData && timelineData.length > 0) {
        // Sort by yearLevel (1-4) and then by semester (1-3) in descending order
        timelineData.sort((a, b) => {
          // Compare yearLevel first (higher yearLevel comes first)
          if (b.yearLevel !== a.yearLevel) {
            return b.yearLevel - a.yearLevel; // Descending order
          }
      
          // If yearLevel is the same, compare semester
          return b.semester - a.semester; // Descending order
        });
      
        const latestTimeline = timelineData[0];
        setYearLevel(latestTimeline.yearLevel || 'Unknown');
        setSemester(latestTimeline.semester || 'Unknown');
      } else {
        setYearLevel('No data available');
        setSemester('No data available');
      }

    } catch (error) {
      console.error('Error fetching semester:', error);
      setSemester('Error fetching semester');
    }
  };

  const fetchSections = async () => {
    try {
      const fetchedSections = await SectionModel.fetchExistingSections(currentAcademicYear[0]?.academicYear, yearLevel, semester, program[0]?.programNumber);

      setSections(fetchedSections); // Update the sections state with the fetched data
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchPersonnelList = async () =>{
    try {
      const personnelData = await PersonnelModel.getProfessorsbyProgram(user.programNumber, currentAcademicYear[0].academicYear);
      //console.log(personnelData);
      setProfessors(personnelData);
    } catch (error) {
      console.error('Error fetching personnel list:', error);
    }
  };

  // Function to fetch courses and their schedules, displaying them with time and personnel
  const fetchCoursesAndSchedules = async (academicYear, yearLevel, semester, programNumber, selectedSection) => {
  try {
    const allSchedules = await ScheduleModel.fetchExistingschedule(selectedSection);
    setSchedules(allSchedules);
    
    // Fetch courses for the specific criteria
    const fetchedCourses = await CourseModel.getCoursesbyProgram(
      academicYear,
      yearLevel,
      semester,
      programNumber
    );
    
    if (fetchedCourses){
      setCourses(fetchedCourses);
    }
  } catch (error) {
    console.error('Error fetching courses and schedules:', error.message);
  }
  };

  const fetchEnrollment = async(studentNumber) => {
    
    const userEnrollment = await EnrollmentModel.fetchEnrollmentData(studentNumber);
    const userSections = new Set();
    userEnrollment.forEach(row => {

      const parts = row.scheduleNumber.split('-'); 
      const sectionNumber = parts.slice(-2).join('-');

      userSections.add(sectionNumber);
    });

    const sectionList = Array.from(userSections);

    const Enrolled = sections.some(item => sectionList.includes(item.sectionNumber));
    if(Enrolled){
      setIsEnrolled(true);
    }
  };

  useEffect(() => {
    fetchAcademicYearsAndPrograms();
    fetchStudentInfo(user.studentNumber);
    //console.log(user.studentNumber)
  }, []);
  
  useEffect(() => {
    if (currentAcademicYear.length > 0 && user.studentNumber) {
      fetchYearLevelandSemester();
    }
  }, [currentAcademicYear, user.studentNumber]);

  useEffect(() => {
    if (yearLevel && semester && currentAcademicYear.length > 0 && program.length > 0) {
      fetchSections();
    }
  }, [yearLevel, semester, currentAcademicYear, program]);

  useEffect(()=> {
    if (sections){
      fetchEnrollment(user.studentNumber);
    }
  }, [sections]);




// useEffect hook to trigger fetchCoursesAndSchedules call
useEffect(() => {
  if (yearLevel && semester && program.length > 0 && currentAcademicYear.length > 0 && selectedSection) {
   // console.log (currentAcademicYear[0]?.academicYear, yearLevel, semester, program[0]?.programNumber, selectedSection);
    setCourses([]);
    setSchedules([]);
    setProfessors([]);
    fetchCoursesAndSchedules(
      currentAcademicYear[0]?.academicYear,
      yearLevel,
      semester,
      program[0]?.programNumber,
      selectedSection // Pass selectedSection to the function
    );
    fetchPersonnelList();
  }
}, [yearLevel, semester, program, currentAcademicYear, selectedSection]);


  

  const handleSectionChange = (e) => {
    const selectedSection = e.target.value;
    setSchedules([]);
    setSelectedSection(selectedSection);
  };

  const handleCheckboxChange = (subjectId) => {
    setCourses((prevSubjects) =>
      prevSubjects.map((subject) =>
        subject.id === subjectId ? { ...subject, checked: !subject.checked } : subject
      )
    );
  };

  const handleSaveAndAssess = async () => {
    const invalidSchedules = schedules.filter(schedule => 
      !schedule.courseCode || 
      !schedule.scheduleDay || 
      !schedule.startTime || 
      !schedule.endTime || 
      !schedule.personnelNumber
    );
    
    if (invalidSchedules.length > 0) {
      alert(`Cannot proceed due to incomplete schedules:\n\n${invalidSchedules.map((schedule) => `${schedule.courseCode}`).join('\n')}`);
      return;
    }

    //const checking = await EnrollmentModel.fetchEnrollmentData(user.studentNumber);

    //console.log(checking);
    setShowModal(true);
  };

  const handleNumberClick = (number) => {
    setUserSelectedCount(number);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEnroll = async () =>{
    try{
      const enrollment = [];

      if (schedules && schedules.length > 0){
        schedules.forEach(row => {
          enrollment.push({
            studentNumber: user.studentNumber,
            scheduleNumber: row.scheduleNumber,
            courseCode: row.courseCode,
            status: 'Ongoing'
          });
        })
      }

      await EnrollmentModel.createAndInsertEnrollment(enrollment);
      setIsEnrolled(true);
    }
    catch (error) {
      console.error('Error fetching sections:', error);
    }
    setShowModal(false);
  };

  function formatTime(day, startTime, endTime) {
    if (!day && !startTime && !endTime) {
      return "No schedule"; // If all fields are null or empty, return "No schedule"
    }
  
    if (!startTime && !endTime) {
      return `${day}, No timeframe`; // If only startTime and endTime are empty
    }
    // Split the HH:MM:SS format into its components
    const [startHrs, minutes] = startTime.split(':');
    const [endHrs, endMin] = endTime.split(':');
  
    const startHr = (startHrs % 12) || 12; // 0 or 24 becomes 12 (midnight)
    const startampm = startHrs >= 12 ? 'pm' : 'am'; // Determine am/pm based on hours
  
    const endHr = (endHrs % 12) || 12; // 0 or 24 becomes 12 (midnight)
    const endampm = endHrs >= 12 ? 'pm' : 'am'; // Determine am/pm based on hours
  
    // Return formatted time with day
    return `${day || 'No day'}, ${startHr}:${minutes} ${startampm} - ${endHr}:${endMin} ${endampm}`;
  }
  
  return (
    <section className='card bg-white'>
      <div className='card-header bg-white d-flex'>
        <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold text-nowrap'>{studentName} ({user.studentNumber})</p>
        </div>

        {studentType !== 'Regular' ? (<div class="mt-4  mx- auto alert alert-warning text-center px-auto" role="alert">
          <span className='fw-bold fs-6'>Note: </span> Attention! Non-regular students are required to coordinate with their respective faculties to complete the enrollment process.
</div>
):       !isEnrolled && (
        <div className='card-body '>
          <div 
            className="class-info-row mb-4 p-3 border border-success rounded"
            style={{
              fontSize: '14px', 
              backgroundColor: '#e9f5ea',
              width: '100%',
            }}
          >
            <h3 className="mb-3">Enrollment is now open.</h3> 
  
            <Container fluid className="d-flex flex-wrap justify-content-between align-items-center rounded p-3 w-100">
  <Col xs={12} md={6} className="mb-3 mb-md-0">
    <p className="fw-bold text-muted fs-6">
      Select a section to review a schedule that is favorable to you.
    </p>
  </Col>
  <Col xs={12} md={6}>
    <Form.Select
      aria-label="Select Section"
      value={selectedSection}
      onChange={handleSectionChange}
    >
      <option value="">Select a section</option>
      {sections.map((section) => (
        <option key={section.id} value={section.sectionNumber}>
          {section.sectionNumber}
        </option>
      ))}
    </Form.Select>
  </Col>
</Container>
      




          </div>

{/* New Display Bar for Student Name, Program, Year Level, and Semester */}
<div 
  className="d-flex justify-content-around align-items-center mb-4 p-3 border border-success rounded"
  style={{
    fontSize: '14px', 
    backgroundColor: '#e9f5ea',
    width: '100%',
  }}
>
  
  <span><strong>Program:</strong> {program.length > 0 ? program[0]?.programName : ''}</span>
  <span><strong>Year Level:</strong> {yearLevel || 'Loading...'}</span> {/* Display 'Loading...' if yearLevel is empty */}
  <span><strong>Semester:</strong> {semester || 'Loading...'}</span> {/* Display 'Loading...' if semester is empty */}
</div>

    {/* Courses Table */}
      <div className="card card-success border-success rounded mb-4">
      <span className="card-header bg-custom-color-green text-white custom-font fs-5 ms-0">
        Check all the courses and schedule to enroll:
      </span>
      
      <div className="table-responsive">
      <Table hover className="mt-2">
        <thead>
          <tr className='text-center'>
            <th className="text-success custom-font">#</th>
            <th className="text-success custom-font">Subject Code</th>
            <th className="text-success custom-font">Subject Description</th>
            <th className="text-success custom-font">Lecture Units</th>
            <th className="text-success custom-font">Lab Units</th>
            <th className="text-success custom-font">Schedule</th>
            <th className="text-success custom-font">Professor</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((schedule, index) => {
              const courseDetails = courses?.find(course => course.courseCode === schedule.courseCode);
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{courseDetails?.courseCode}</td>
                  <td>{courseDetails?.courseDescriptiveTitle || 'N/A'}</td>
                  <td>{courseDetails?.courseLecture || 'N/A'}</td>
                  <td>{courseDetails?.courseLaboratory || 'N/A'}</td>
                  <td>
                    <ul className=' list-unstyled'>
                      <li>
                        {formatTime(schedule.scheduleDay, schedule.startTime, schedule.endTime)}
                      </li>
                    </ul>
                  </td>
                  <td>
                    <Form.Control
                      as="input"
                      type="text"
                      value={schedule.personnelNumber
                              ? `${professors.find((prof) => prof.personnelNumber === schedule.personnelNumber)?.personnelNameFirst || ''} ${professors.find((prof) => prof.personnelNumber === schedule.personnelNumber)?.personnelNameLast || ''}` : ''}
                      readOnly
                      className="mr-2"/>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className='text-center'>No courses available</td>
            </tr>
          )}
        </tbody>
      </Table>
      </div>
    </div>
    <Button 
        className='btn bg-custom-color-green' 
        onClick={handleSaveAndAssess} 
        style={{ marginTop: '20px' }}
        disabled = {schedules.length === 0}
      >
        Save & Assess
      </Button>
  </div>
)}


     

      {/* Modal for confirming the selected number of courses */}
      <Modal size="lg"show={showModal} onHide={handleCloseModal} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation of Enrollment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <i><p>Please confirm the following information below.</p></i>
          <div className="d-flex flex-wrap gap-2">
            <p>You have selected section <strong>{selectedSection}</strong> with the following courses and their schedules:</p>

            <Table hover className="mt-2">
              <thead>
                <tr className='text-center'>
                  <th className="text-success custom-font">#</th>
                  <th className="text-success custom-font">Course Description</th>
                  <th className="text-success custom-font">Schedule</th>
                  <th className="text-success custom-font">Professor</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length > 0 ? (
                  schedules.map((schedule, index) => {
                    const courseDetails = courses?.find(course => course.courseCode === schedule.courseCode);
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{courseDetails?.courseDescriptiveTitle || 'N/A'}</td>
                        <td>
                          <ul className=' list-unstyled'>
                            <li>
                              {formatTime(schedule.scheduleDay, schedule.startTime, schedule.endTime)}
                            </li>
                          </ul>
                        </td>
                        <td>{schedule.personnelNumber
                              ? `${professors.find((prof) => prof.personnelNumber === schedule.personnelNumber)?.personnelNameFirst || ''} ${professors.find((prof) => prof.personnelNumber === schedule.personnelNumber)?.personnelNameLast || ''}` : ''}
                        </td>
                      </tr>
                    );
                  })
                  ) : (
                  <tr>
                    <td colSpan="8">No courses available</td>
                  </tr>
                )}
              </tbody>
            </Table>

            <strong><p>WARNING! Once you have confirmed, this will be your schedule for the semester and you CANNOT change it anymore!</p></strong>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="success" onClick={handleEnroll}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Enrollment confirmation */}
      {isEnrolled && (
        <Card className="mt-4 mx-3 mb-3">
          <Card.Header className="bg-custom-color-green text-white">
            <strong>You are qualified for Free Higher Education Act.</strong>
          </Card.Header>
          <Card.Body className="text-center">
          <div class="mt-4  mx- auto alert alert-warning text-center px-auto" role="alert">
          Please be informed that you need to visit the Registrar's Office to obtain a copy of your Certificate of Registration.
</div>
            <div className='mt-3 text-center'>
            <h3 className="text-success fs-3 custom-font mt-2">
              You are officially enrolled.
            </h3>
            <p>(S.Y. 2425 - First Semester)</p>
            </div>
            
          </Card.Body>
        </Card>
      )}
    </section>
  );
};

export default ScheduleTable;