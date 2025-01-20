import React, { useState, useEffect, useContext } from 'react';
import { Button, Table, Container, Modal, Form, Dropdown, Spinner, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import StudentModel from '../ReactModels/StudentModel';
import CourseModel from '../ReactModels/CourseModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel'
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function RegistrarIrregularStudents() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); 
    const [irregularStudent, setIrregularStudent] = useState([]); // Full list of irregular students
    const [searchQuery, setSearchQuery] = useState(''); // Search query
    const [filteredStudent, setFilteredStudent] = useState([]); // Filtered students for display
    const [curriculum, setCurriculum] = useState({}); // Object to group courses by Year Level and Semester
    const [showAcademicRecordModal, setShowAcademicRecordModal] = useState(false); // State for Academic Record modal
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false); // State for Enrollment modal
    const [selectedStudent, setSelectedStudent] = useState(null); // State to store selected student
    const [courses, setCourses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [rows, setRows] = useState([
        {
            courseCode: "",
            courseDescription: "",
            courseLecture: "",
            courseLaboratory: "",
            scheduleNumber: "",
            schedule: "",
            professor: "",
            section: "",
        },
    ]);
    const [groupedCourseDetails, setGroupedCourseDetails] = useState({});

    const [showModal, setShowModal] = useState(false);
    const [programName, setProgramName] = useState("");
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const [batchYear, setBatchYear] = useState("");

    //On loading the page
    useEffect(() => {
      if (!user) {
        navigate('/'); // Redirect to login if user is not present
      }
    }, [user, navigate]);

    const handlePrint = () => {
        const contentElement = document.getElementById('modalContent');
    
        if (!contentElement) {
            console.error("Modal content not found. Ensure the modal is open before printing.");
            return;
        }
    
        const content = contentElement.innerHTML;
        const logoURL = '/pcc.png'; // Ensure the image path is correct and accessible.
    
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print TOR</title>
    <style>
    @media print {
      @page {
        size: legal;
        margin: 10mm; /* Keep margins small */
        scale: 97;
      }
    
      body {
        margin: 0;
        font-family: Arial, sans-serif;
      }
    
      .content {
        page-break-inside: avoid; /* Prevent unnecessary page breaks */
        overflow: visible;
      }
    
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        page-break-inside: auto; /* Allow tables to split naturally across pages */
        page-break-after: auto;
      }
    
      th, td {
        border: 1px solid black;
        padding: 5px;
        text-align: left;
      }
    
      tr {
        page-break-inside: avoid; /* Prevent breaking rows */
      }
    
      thead {
        display: table-header-group; /* Repeat headers on each page */
      }
    
      tfoot {
        display: table-footer-group; /* Repeat footers on each page */
      }
    
      .watermark {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background-image: url('${logoURL}');
        background-repeat: no-repeat;
        background-position: center;
        background-size: 500px 500px;
        opacity: 0.1;
      }
    }
    </style>
    
    
    
    
    
            </head>
            <body>
              <!-- Watermark -->
              <div class="watermark"></div>
    
              <!-- Content -->
              <div class="content">
                ${content}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
    
        printWindow.document.close();
    };
    
    const handleTORClick = (students) => {
        setSelectedStudent(students);
        setShowModal(true);
      };
    
      const handleCloseModal = () => setShowModal(false);

    const handleAddRow = () => {
        setRows([
            ...rows,
            {
            courseCode: "",
            courseDescription: "",
            courseLecture: "",
            courseLaboratory: "",
            scheduleNumber: "",
            schedule: "",
            professor: "",
            section: "",
            }
        ]);
    };
    //curriculum that student must take
    const fetchCurriculum = async (programNumber, studentNumber) => {
        console.log("Fetching curriculum for Program:", programNumber, "Student:", studentNumber);
    
        // Validate inputs
        if (!programNumber || !studentNumber) {
            console.error("Program number and student number are required.");
            return;
        }
    
        try {
            // Step 1: Fetch all data in parallel
            const [allCourses, allEnrollments] = await Promise.all([
                CourseModel.fetchAllCourses(),
                EnrollmentModel.fetchAllEnrollment(),
            ]);
    
            console.log("Fetched courses and enrollments");
    
            // Step 2: Filter courses by programNumber
            const programCourses = allCourses.filter(
                (course) => String(course.programNumber) === String(programNumber)
            );
    
            console.log(`Filtered ${programCourses.length} courses for program ${programNumber}`);
    
            // Step 3: Index enrollments by courseCode for quick lookup
            const enrollmentIndex = allEnrollments.reduce((acc, enrollment) => {
                acc[enrollment.courseCode] = enrollment.scheduleNumber;
                return acc;
            }, {});
    
            console.log("Created enrollment index");
    
            // Step 4: Fetch grades in parallel and group curriculum
            const curriculumPromises = programCourses.map(async (course) => {
                const { courseYearLevel, courseSemester, courseCode } = course;
    
                // Find scheduleNumber for the course
                const scheduleNumber = enrollmentIndex[courseCode];
                if (!scheduleNumber) {
                    console.log(`No scheduleNumber found for courseCode: ${courseCode}`);
                    return null;
                }
    
                // Fetch semGradeData for this scheduleNumber
                const semGradeData = await SemGradeModel.fetchSemGradeData(scheduleNumber);
                const studentGrade = semGradeData.find(
                    (grade) => grade.studentNumber === studentNumber
                );
    
                return {
                    ...course,
                    numEq: studentGrade?.numEq || "N/A",
                    remarks: studentGrade?.remarks || "N/A",
                    courseYearLevel,
                    courseSemester,
                };
            });
    
            // Resolve all promises
            const resolvedCurriculum = (await Promise.all(curriculumPromises)).filter(Boolean);
    
            console.log("Resolved curriculum courses with grades");
    
            // Step 5: Group courses by year level and semester
            const groupedCurriculum = resolvedCurriculum.reduce((acc, course) => {
                const { courseYearLevel, courseSemester } = course;
    
                acc[courseYearLevel] = acc[courseYearLevel] || {};
                acc[courseYearLevel][courseSemester] =
                    acc[courseYearLevel][courseSemester] || [];
                acc[courseYearLevel][courseSemester].push(course);
    
                return acc;
            }, {});
    
            console.log("Grouped Curriculum:", groupedCurriculum);
    
            // Step 6: Update state
            setCurriculum(groupedCurriculum);
        } catch (error) {
            console.error("Failed to fetch curriculum:", error);
        }
    };

    //this is for TOR 
  

    useEffect(() => {
      const fetchAndDisplayCourseDetails = async () => {
        const courseDetails = await fetchCourseDetails(selectedStudent.studentNumber);
  
        if (courseDetails) {
          setGroupedCourseDetails(courseDetails);
        }
      };
  
      if (selectedStudent?.studentNumber) {
        fetchAndDisplayCourseDetails();
      }
    }, [selectedStudent]);
  
    const fetchCourseDetails = async (studentNumber) => {
        console.log("Fetching course details for Student:", studentNumber);
      
        // Validate input
        if (!studentNumber) {
          console.error("Student number is required.");
          return;
        }
      
        try {
          // Step 1: Fetch all courses, enrollments, and grades in parallel
          const [allCourses, allEnrollments] = await Promise.all([
            CourseModel.fetchAllCourses(),
            EnrollmentModel.fetchAllEnrollment(),
          ]);
      
          console.log("Fetched courses and enrollments");
      
          // Step 2: Filter enrollments for the given student
          const studentEnrollments = allEnrollments.filter(
            (enrollment) => String(enrollment.studentNumber) === String(studentNumber)
          );
      
          if (studentEnrollments.length === 0) {
            console.log(`No enrollments found for student ${studentNumber}`);
            return;
          }
      
          console.log(`Filtered ${studentEnrollments.length} enrollments for student ${studentNumber}`);
      
          // Step 3: Create an index of enrollments by courseCode for quick lookup
          const enrollmentIndex = studentEnrollments.reduce((acc, enrollment) => {
            acc[enrollment.courseCode] = enrollment.scheduleNumber;
            return acc;
          }, {});
      
          console.log("Created enrollment index");
      
          // Step 4: Map through courses and fetch grades and curriculum info
          const courseDetailsPromises = allCourses.map(async (course) => {
            const { courseCode, courseDescriptiveTitle, academicYear, courseSemester, courseLecture, courseLaboratory } = course;
            const scheduleNumber = enrollmentIndex[courseCode];
      
            if (!scheduleNumber) {
              console.log(`No scheduleNumber found for courseCode: ${courseCode}`);
              return null;
            }
      
            // Fetch semGrade data for this course's schedule
            const semGradeData = await fetchSemGrade(scheduleNumber, studentNumber);
            const numEq = semGradeData?.numEq || "N/A";
            const remarks = semGradeData?.remarks || "N/A";
      
            // Add course details to return object, including numEq and credits (if available)
            return {
              courseCode,
              courseDescriptiveTitle,
              academicYear,
              courseSemester,
              numEq,
              remarks,
              credits: courseLecture + courseLaboratory || "N/A",  // Assuming the course has a 'credits' property
            };
          });
      
          // Step 5: Resolve all promises and filter out nulls
          const resolvedCourseDetails = (await Promise.all(courseDetailsPromises)).filter(Boolean);
      
          console.log("Resolved course details:", resolvedCourseDetails);
      
          // Step 6: Group courses by academicYear and courseSemester
          const groupedCourseDetails = resolvedCourseDetails.reduce((acc, course) => {
            const { academicYear, courseSemester } = course;
      
            acc[academicYear] = acc[academicYear] || {};
            acc[academicYear][courseSemester] =
              acc[academicYear][courseSemester] || [];
            acc[academicYear][courseSemester].push(course);
      
            return acc;
          }, {});
      
          console.log("Grouped Course Details:", groupedCourseDetails);
      
          return groupedCourseDetails;
        } catch (error) {
          console.error("Failed to fetch course details:", error);
        }
      };
      
      // Function to fetch grade details based on scheduleNumber and studentNumber
      const fetchSemGrade = async (scheduleNumber, studentNumber) => {
        try {
          const semGrades = await SemGradeModel.fetchSemGradeData(scheduleNumber);
          const findgrades = semGrades.find((grade) => grade.studentNumber === studentNumber) || {};
      
          return findgrades;
        } catch (error) {
          console.error("Error fetching SemGrade:", error);
          return {};
        }
      };
      

      
  
    // Function to determine the academic year based on the student's admission year
    const getAcademicYear = (studentAdmissionYr, yearIdx) => {
      return `${studentAdmissionYr + yearIdx}-${studentAdmissionYr + yearIdx + 1}`;
    };
    
    
    
    const fetchCoursesAndSchedules = async (programNumber) => {
        console.log('programNumber', programNumber);
        try {
            // Fetch courses and filter by programNumber
            const courseData = await CourseModel.fetchAllCourses();
            console.log('courseData', courseData);
    
            const filteredCourses = courseData.filter(
                (course) => course.programNumber === programNumber
            );
            console.log('filteredCourses', filteredCourses);
    
            setCourses(filteredCourses);
    
            // Fetch academic years and find the current academic year
            const academicYears = await AcademicYearModel.fetchExistingAcademicYears();
            const currentAcademicYear = academicYears.find((year) => year.isCurrent === true);
    
            if (!currentAcademicYear) {
                console.error('No current academic year found');
                return;
            }
    
            // Fetch schedules for the current academic year
            const fetchedScheduleData = await ScheduleModel.fetchAllSchedules(currentAcademicYear.academicYear);
            console.log('fetchedScheduleData', fetchedScheduleData);
    
            // Fetch personnel data for each schedule's personnelNumber
            const processedSchedules = await Promise.all(
                fetchedScheduleData.map(async (schedule) => {
                    const personnelData = await PersonnelModel.getProfessorByPersonnelNumber(schedule.personnelNumber);
                    console.log('personnelData', personnelData);  // Debugging line

                    return {
                        schedule: `${schedule.scheduleDay} ${schedule.startTime} - ${schedule.endTime}`,
                        personnelNumber: schedule.personnelNumber,
                        personnelName: `${personnelData.firstName} ${personnelData.lastName}`,
                        sectionNumber: schedule.sectionNumber,
                        scheduleNumber: schedule.scheduleNumber,
                        courseCode: schedule.courseCode,
                    };
                })
            );
    
            console.log('processedSchedules', processedSchedules);
    
            setSchedules(processedSchedules);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    };

    const enrollStudents = async (enrollmentData) => {
        // Validation: Check if any required field is missing
        for (let i = 0; i < enrollmentData.length; i++) {
            const data = enrollmentData[i];
            
            // Check for missing fields: Adjust according to your required fields
            if (!data.studentNumber || !data.scheduleNumber || !data.courseCode || !data.status) {
                console.error(`Missing required field in enrollment data at index ${i}:`, data);
                alert("Please complete all required fields before enrolling.");
                return; // Prevent further processing
            }
        }
    
        try {
            // Fetch all enrollments from the database
            const existingEnrollments = await EnrollmentModel.fetchAllEnrollment();
    
            // Check if any of the enrollmentData records already exist
            for (let i = 0; i < enrollmentData.length; i++) {
                const data = enrollmentData[i];
    
                // Check for existing enrollment based on studentNumber, courseCode, and scheduleNumber
                const isExisting = existingEnrollments.some((enrollment) => 
                    enrollment.studentNumber === data.studentNumber &&
                    enrollment.courseCode === data.courseCode &&
                    enrollment.scheduleNumber === data.scheduleNumber
                );
                
                if (isExisting) {
                    console.error(`Enrollment already exists for student ${data.studentNumber} in course ${data.courseCode} with schedule ${data.scheduleNumber}`);
                    alert(`Student ${data.studentNumber} is already enrolled in ${data.courseCode} for this schedule.`);
                    return; // Prevent further processing if a record exists
                }
                else if(!isExisting){
                    console.log("Inserting enrollment data:", enrollmentData); 
                    // Proceed to insert the data if no existing record is found
                    await EnrollmentModel.createAndInsertEnrollment(enrollmentData);
                    console.log("Enrollment data inserted successfully:", enrollmentData);
                    alert("Enrollment successful!");
                }
            }
    
           
        } catch (error) {
            console.error("Error enrolling students:", error);
            alert("Failed to enroll students. Please try again.");
            throw error;
        }
    };
    
    
    const handleEnrollStudents = async () => {
        if (rows.length === 0) {
            alert("No courses selected for enrollment.");
            return;
        }
    
        const enrollmentData = rows.map((row) => ({
            studentNumber: selectedStudent.studentNumber,
            scheduleNumber: row.scheduleNumber,
            courseCode: row.courseCode,
            status: 'Ongoing', // Add status 'Ongoing'
        }));
    
        console.log("Enrollment data:", enrollmentData); // Log the data to verify
    
        try {
            await enrollStudents(enrollmentData);
            handleCloseEnrollmentModal();
        } catch (error) {
            console.error("Error during enrollment:", error);
            alert("Failed to enroll students. Please try again.");
        }
    };
    
    
    const fetchStudents = async () => {
        setLoading(true); 
        try {
            const studentData = await StudentModel.fetchExistingStudents();
            const listOfIrregularStudents = studentData.filter((student) => student.studentType === "Irregular");
    
            // Fetch all programs to map programNumber to programName
            const programData = await ProgramModel.fetchAllPrograms();
            const programMap = programData.reduce((map, program) => {
                map[program.programNumber] = program.programName;
                return map;
            }, {});
    
            // Add programName to each student based on their programNumber
            const updatedStudentData = listOfIrregularStudents.map((student) => ({
                ...student,
                programName: programMap[student.studentProgramNumber] || "Unknown Program"
            }));
    
            setIrregularStudent(updatedStudentData);
            setFilteredStudent(updatedStudentData);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };
    

    const handleSearch = (studentSearch) => {
        setSearchQuery(studentSearch);
        const searchResult = irregularStudent.filter((student) =>
            student.studentNumber.toUpperCase().includes(studentSearch.toUpperCase())
        );
        setFilteredStudent(searchResult);
    };

    // Handle click on "Academic Record" button
    const handleAcademicRecordClick = (student) => {
        console.log("Opening Academic Record Modal for:", student); // Added log
        setSelectedStudent(student); // Set the selected student
        setShowAcademicRecordModal(true); // Show the academic record modal
        fetchCurriculum(student.studentProgramNumber, student.studentNumber); // Pass studentNumber to fetchCurriculum
        fetchCourseDetails(student.studentNumber);
    };

    // Handle click on "Enrollment" button
    const handleEnrollmentClick = (student) => {
        console.log("Opening Enrollment Modal for:", student); // Added log
        setSelectedStudent(student); // Set the selected student
        setShowEnrollmentModal(true); // Show the enrollment modal
        fetchCoursesAndSchedules(student.studentProgramNumber, student.studentNumber)
    };

    const handleCloseAcademicRecordModal = () => {
        setShowAcademicRecordModal(false); // Close the academic record modal
        setSelectedStudent(null); // Clear the selected student
        fetchCurriculum(null, null); // Reset curriculum

    };

    const handleCloseEnrollmentModal = () => {
        setShowEnrollmentModal(false); // Close the enrollment modal
        setSelectedStudent(null); // Clear the selected student
        setRows([ // Reset rows to initial state
            {
                courseCode: "",
                courseDescription: "",
                courseLecture: "",
                courseLaboratory: "",
                scheduleNumber: "",
                schedule: "",
                professor: "",
                section: "",
            },
        ]);
        fetchCoursesAndSchedules(null); // Reset any fetched courses and schedules
    };
    

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
    <Container fluid>
    <h2 className="custom-font custom-color-green-font mb-3 mt-2">Irregular Students</h2>
        <Container fluid className="bg-white py-5 rounded hide-scrollbar table-responsive">
            
            <Container fluid className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <span className="input-group-text">
                    <FontAwesomeIcon icon={faSearch} />
                </span>
            </Container>

       

            {loading ? (
            <div className="text-center py-5 bg-white">
                <Spinner animation="border" variant="success" />
                <p className="mt-3">Loading data, please wait...</p>
            </div>
            ) : (

              <Table hover className="table table-hover success-border mt-4 mx-auto shadow-sm hide-scrollbar">
                  <thead className='table-success rounded'>
                  <tr>
                      <th className='custom-color-green-font custom-font text-center pt-3'>Student Number</th>
                      <th className='custom-color-green-font custom-font text-center pt-3'>Student Name</th>
                      <th className='custom-color-green-font custom-font text-center pt-3'>Program Name</th>
                      <th className='custom-color-green-font custom-font text-center pt-3'>Admission Year</th>
                      <th className='custom-color-green-font custom-font text-center pt-3'>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredStudent.length !== 0 ? (
                      filteredStudent.map((student) => (
                      <tr key={student.id}>
                          <td className='text-center'>{student.studentNumber}</td>
                          <td className='text-center'>
                          {student.studentNameLast}, {student.studentNameFirst} {student.studentNameMiddle || ''}
                          </td>
                          <td className='text-center'>{student.programName}</td>
                          <td className='text-center'>{student.studentYrLevel}</td>
                          <td className='text-center'>
                          <Dropdown align="end" className='h-100 w-100'>
                              <Dropdown.Toggle
                              variant="link"
                              className="p-0 border-0"
                              style={{ color: '#000' }}
                              >
                              <i className="fas fa-ellipsis-v"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleEnrollmentClick(student)}>
                                  Enrollment
                              </Dropdown.Item>
                              
                              <Dropdown.Item onClick={() => handleTORClick(student)}>View TOR</Dropdown.Item>
                              <Dropdown.Item onClick={() => handleAcademicRecordClick(student)}>
                                  Academic Record
                              </Dropdown.Item>

                              
                              </Dropdown.Menu>
                          </Dropdown>
                          </td>
                      </tr>
                      ))
                  ) : (
                      <tr>
                      <td colSpan="5" className="text-center fst-italic">
                          No students found
                      </td>
                      </tr>
                  )}
                  </tbody>
              </Table>

            )}



     
            {/* Academic Record Modal */}
            <Modal show={showAcademicRecordModal} size="xl" onHide={handleCloseAcademicRecordModal} animation={false}>
                <Modal.Header closeButton>
                    <Card.Title>Student Record</Card.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStudent ? (
                        <div>
                            <h5>{selectedStudent.studentNameFirst} {selectedStudent.studentNameLast}</h5>
                            <p><strong>Student Number:</strong> {selectedStudent.studentNumber}</p>
                            <p><strong>Program:</strong> {selectedStudent.studentProgramNumber}</p>
                            <p><strong>Admission Year:</strong> {selectedStudent.studentAdmissionYr}</p>
                            <h6>Curriculum:</h6>
                            {Object.keys(curriculum).length > 0 ? (
                                <div>
                                    {Object.keys(curriculum).map((yearLevel) => (
                                        <div key={yearLevel}>
                                            <h6>Year Level: {yearLevel}</h6>
                                            {Object.keys(curriculum[yearLevel]).map((semester) => (
                                                <div key={semester}>
                                                    <h6>Semester: {semester}</h6>
                                                    <Table responsive striped bordered hover>
                                                        <thead>
                                                            <tr>
                                                                <th>Course Code</th>
                                                                <th>Course Title</th>
                                                                <th>Lecture Hours</th>
                                                                <th>Lab Hours</th>
                                                                <th>Units</th>
                                                                <th>Grade</th>
                                                                <th>Remarks</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {curriculum[yearLevel][semester].map((course, index) => (
                                                                <tr key={index}>
                                                                    <td>{course.courseCode}</td>
                                                                    <td>{course.courseDescriptiveTitle}</td>
                                                                    <td>{course.courseLecture}</td>
                                                                    <td>{course.courseLaboratory}</td>
                                                                    <td>{(course.courseLecture + course.courseLaboratory) || 0}</td>
                                                                    <td>{course.numEq}</td>
                                                                    <td>{course.remarks}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No curriculum available</p>
                            )}
                        </div>
                    ) : (
                        <p>No student selected</p>
                    )}
                </Modal.Body>
            </Modal>

            {/* Enrollment Modal */}
            
            <Modal show={showEnrollmentModal} size="xl" onHide={handleCloseEnrollmentModal} animation={false} >
                <Modal.Header closeButton>
                    <Modal.Title>Enrollment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStudent ? (
                        <div>
                            {/* Student Information */}
                            <h5>
                                {selectedStudent.studentNameFirst} {selectedStudent.studentNameLast}
                            </h5>
                            <p>
                                <strong>Student Number:</strong> {selectedStudent.studentNumber}
                            </p>
                            <p>
                                <strong>Program:</strong> {selectedStudent.studentProgramNumber}
                            </p>
                            <p>
                                <strong>Admission Year:</strong> {selectedStudent.studentAdmissionYr}
                            </p>

                            {/* Enrollment Details Table */}
                            <div className="table-responsive">
                                <Table hover className="mt-2">
                                    <thead>
                                        <tr className="text-center">
                                            <th className="text-success custom-font">#</th>
                                            <th className="text-success custom-font">Course Code</th>
                                            <th className="text-success custom-font">Course Description</th>
                                            <th className="text-success custom-font">Lecture Units</th>
                                            <th className="text-success custom-font">Lab Units</th>
                                            <th className="text-success custom-font">Schedule</th>
                                            <th className="text-success custom-font">Professor</th>
                                            <th className="text-success custom-font">Section</th>
                                            <th className="text-success custom-font">Schedule Number</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, index) => (
                                            <tr key={index}>
                                                {/* Row Index */}
                                                <td>{index + 1}</td>
                                                {/* Course Selector */}
                                                <td>
                                                    <Form.Select
                                                        value={row.courseCode}
                                                        onChange={(e) => {
                                                            const selectedCourse = courses.find(
                                                                (course) => course.courseCode === e.target.value
                                                            );
                                                            setRows(
                                                                rows.map((r, i) =>
                                                                    i === index
                                                                        ? {
                                                                            ...r,
                                                                            courseCode: e.target.value,
                                                                            courseDescription: selectedCourse?.courseDescriptiveTitle || '',
                                                                            courseLecture: selectedCourse?.courseLecture || 0,
                                                                            courseLaboratory: selectedCourse?.courseLaboratory || 0,
                                                                        }
                                                                        : r
                                                                )
                                                            );
                                                        }}
                                                    >
                                                        <option value="">Select Course</option>
                                                        {courses.map((course, idx) => (
                                                            <option key={idx} value={course.courseCode}>
                                                                {course.courseCode}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </td>
                                                {/* Display Course Details */}
                                                <td>
                                                    <Form.Control type="text" value={row.courseDescription} readOnly />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" value={row.courseLecture} readOnly />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" value={row.courseLaboratory} readOnly />
                                                </td>
                                                {/* Schedule Selector */}
                                                <td>
                                                    <Form.Select
                                                        value={row.scheduleNumber}
                                                        onChange={(e) => {
                                                            const selectedSchedule = schedules.find(
                                                                (schedule) => schedule.scheduleNumber === e.target.value
                                                            );
                                                            setRows(
                                                                rows.map((r, i) =>
                                                                    i === index
                                                                        ? {
                                                                            ...r,
                                                                            scheduleNumber: selectedSchedule?.scheduleNumber || '',
                                                                            schedule: selectedSchedule?.schedule || '',
                                                                            professorName: selectedSchedule?.personnelName || '',
                                                                            section: selectedSchedule?.sectionNumber || '',
                                                                        }
                                                                        : r
                                                                )
                                                            );
                                                        }}
                                                    >
                                                        <option value="">Select Schedule</option>
                                                        {schedules
                                                            .filter((schedule) => schedule.courseCode === row.courseCode)
                                                            .map((schedule, idx) => (
                                                                <option key={idx} value={schedule.scheduleNumber}>
                                                                    {schedule.schedule}
                                                                </option>
                                                            ))}
                                                    </Form.Select>
                                                </td>
                                                {/* Professor, Section, and Schedule Number */}
                                                <td>
                                                    <Form.Control type="text" value={row.professorName} readOnly />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" value={row.section} readOnly />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" value={row.scheduleNumber} readOnly />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Add Row Button */}
                            <div className="d-flex justify-content-left mt-3">
                                <Button variant="primary" onClick={handleAddRow}>
                                    Add Row
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p>No student selected</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleEnrollStudents}>
                        Enroll
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModal} onHide={handleCloseModal} size="xl"  className="custom-modal-width" animation={false}>
        <Modal.Header closeButton>
          <Modal.Title className="custom-color-green-font">Transcription of Records (TOR) - {selectedStudent?.studentName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Your modal content goes here */}
          <div id="modalContent">
          {selectedStudent && (
            <div>
<table className="table table-white" style={{ borderCollapse: 'collapse', border: '2px solid black' }}>
  <thead className="no-border">
    <tr>
      <th
        className="text-center"
        style={{ width: '25%', border: 'none' }}
      >
        <img
          src="/pcc.png"
          alt="Logo"
          className="img-fluid"
          style={{ width: '110px' }}
        />
      </th>
      <th
        className="text-center"
        style={{ width: '50%', border: 'none' }}
      >
        <p className="fs-6 mb-0 fw-semibold">
          PARAÑAQUE CITY COLLEGE
        </p>
        <p className="fs-5 mb-0">Office of the College Registrar</p>
        <p
          style={{ fontSize: '0.9rem' }}
          className="mb-0"
        >
          Parañaque City, Philippines
        </p>
        <p className="fs-4 mb-0">
          OFFICIAL TRANSCRIPT OF RECORDS
        </p>
      </th>
      <th
        className="text-center"
        style={{ width: '25%', border: 'none' }}
      >
        <p className="fs-6">UF-REG-018</p>
        <p className="fs-6">Rev.0</p>
        <p className="fs-6">03/01/2022</p>
      </th>
    </tr>
  </thead>
</table>


                        
              <table
                style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}
                className="mb-2"
              >
                <thead className="no-border">
                  <tr>
                    <td
                      className="no-border"
                      colSpan="2"
                      style={{ border: "none" }}
                    >
                      <p
                        className="fw-bold m-0 px-2 py-1"
                        style={{
                          display: "inline-block",
                          border: "5px solid #F7FE28",
                          backgroundColor: "#004d00",
                          color: "white",
                        }}
                      >
                        PERSONAL DATA
                      </p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>STUDENT NUMBER: </p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentNumber}
                      </p>
                    </td>
                  </tr>
                </thead>
                <tbody className="no-border">
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>NAME</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentName}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>SEX:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentGender}</p>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "none",
                      }}
                      rowSpan={2}
                    >
                      <p style={{ fontSize: "0.7rem" }}>PERMANENT ADDRESS:</p>
                    </td>
                    <td style={{ border: "none" }} rowSpan={2}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentAddress}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>GR NO.:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentGrNumber}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>SPECIAL ORDER NO.:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentspecielaNumber}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>DATE OF BIRTH</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentBirthDate}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>ACADEMIC PROGRAM:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{programName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>PLACE OF BIRTH</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentBirthPlace}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>ATTENDED:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentNumberOdSemesterAttended}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>NATIONALITY</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentnationality}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>DATE GRADUATED:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentDateGraduated}</p>
                    </td>
                  </tr>
                </tbody>
              </table>



              <table
                style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}
                className="p-2 mb-0"
              >
                <thead className="no-border">
                  <tr>
                    <td colSpan="1" style={{ border: "none" }}>
                      <p
                        className="fw-bold m-0 px-2 py-1"
                        style={{
                          display: "inline-block",
                          border: "5px solid #F7FE28",
                          backgroundColor: "#004d00",
                          color: "white",
                        }}
                      >
                        ENTRANCE DATA
                      </p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>ADMISSION CREDENTIALS</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentAdmissionCredentials}
                      </p>
                    </td>
                    <td style={{ border: "none" }}></td>
                  </tr>
                </thead>
                <tbody className="no-border">
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>DATE GRADUATED/LAST ATTENDED:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentAdmissionYr}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>SCHOOL LAST ATTENDED:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentSchoolLastAttended}
                      </p>
                    </td>
                    <td style={{ border: "none" }}></td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>CATEGORY:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentCategoryStarnd}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>DATE/SEMESTER ADMITTED: </p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentDateSemesterAdmitted}
                      </p>
                    </td>
                    <td style={{ border: "none" }}></td>
                  </tr>
                </tbody>
              </table>

              <div
style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  width: '100%',
  gap: '0px',  // Set gap to 0 for shared borders
  textAlign: 'center',
  border: '1px solid black', // Outer border
}}
>
  {/* Header Row */}
  <div style={{ gridColumn: 'span 6', borderBottom: '1px solid black' , fontSize: '0.8rem',}}>
    <p className="fs-6 text-start mb-1"><strong>ACADEMIC RECORD</strong></p>
  </div>
  {/* Column Headers */}
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', gridRow: 'span 2', fontSize: '0.8rem', }}>
    TERM & SCHOOL YEAR
  </div>
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', gridRow: 'span 2', fontSize: '0.8rem',  }}>
    SUBJECT CODE
  </div>
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', gridRow: 'span 2', fontSize: '0.8rem',  }}>
    DESCRIPTIVE TITLE
  </div>
  
  {/* Final Header that spans two columns */}
  <div
    style={{
      gridColumn: 'span 2',  // Spans across "FINAL GRADES" and "COMPLETION"
      border: '1px solid black',
      padding: '8px',
      fontWeight: 'bold',
      fontSize: '0.8rem',
    }}
  >
    FINAL
  </div>

  {/* FINAL GRADES and COMPLETION Column Headers */}
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', gridRow: 'span 2', fontSize: '0.8rem', }}>
  UNITS OF CREDIT
  </div>
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', fontSize: '0.8rem', }}>
    GRADES
  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', fontSize: '0.8rem', }}>
    COMPLETION
  </div>


 

                  {/* Rows of Data */}
                  {Object.keys(groupedCourseDetails).map((academicYear, idx) =>
  Object.keys(groupedCourseDetails[academicYear]).map((semesterKey) => {
    const semester = parseInt(semesterKey, 10); // Convert the semester key to a number
    const courses = groupedCourseDetails[academicYear][semester] || [];
    const academicYearLabel = getAcademicYear(selectedStudent.studentAdmissionYr, idx);

    return (
      <>
        {courses.length > 0 ? (
          <>
            {/* Render Courses for the Current Semester */}
            {courses.map((course, subIdx) => (
              <React.Fragment key={subIdx}>
                {/* TERM & SCHOOL YEAR */}
                {subIdx === 0 && (
                  <div
                    style={{
                      gridColumn: '1',
                      gridRow: `span ${courses.length}`,
                      border: '1px solid black',
                      padding: '8px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <strong>
                      {semester === 1
                        ? '1st'
                        : semester === 2
                        ? '2nd'
                        : '3rd'}{' '}
                      Semester
                    </strong>
                    <br />
                    {academicYearLabel}
                  </div>
                )}
                {/* SUBJECT CODE */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.courseCode}
                </div>

                {/* DESCRIPTIVE TITLE */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.courseDescriptiveTitle}
                </div>

                {/* GRADES */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.credits || '-'}
                </div>

                {/* COMPLETION */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.remarks || '-'}
                </div>

                {/* UNITS OF CREDIT */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.numEq.toFixed(2) || '-'}
                </div>
              </React.Fragment>
            ))}
          </>
        ) : (
          <div
            style={{
              gridColumn: 'span 6',
              border: '1px solid black',
              padding: '8px',
              textAlign: 'center',
              fontSize: '0.8rem',
            }}
          >
            No courses available
          </div>
        )}
      </>
    );
  })
)}

</div>

<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    width: '100%',
    gap: '0px', // Set gap to 0 for shared borders
    textAlign: 'center',
    border: '1px solid black', // Outer border
  }}
>
  {/* Header Row */}
  <div style={{ gridColumn: 'span 1', border: '1px solid black', padding: '8px' }}>
    <p style={{ fontSize: '0.7rem', marginBottom: '2px', textAlign: 'start' }}>REMARKS:</p>
  </div>
  <div style={{ gridColumn: 'span 7', border: '1px solid black', padding: '8px' }}>
    <p style={{ fontSize: '0.7rem', marginBottom: '2px', textAlign: 'start' }}>
      <strong>CLEARED OF ALL PROPERTY AND MONEY ACCOUNTABILITIES</strong>
    </p>
  </div>

  {/* Grading System Header */}
  <div style={{ gridColumn: 'span 3', border: '1px solid black', padding: '4px' }}>
    <p style={{ fontSize: '0.6rem', margin: '0' }}><strong>GRADING SYSTEM</strong></p>
  </div>
  <div
    style={{
      gridColumn: 'span 5',
      gridRow: 'span 2',
      border: '1px solid black',
      padding: '4px',
      fontSize: '0.5rem',
      fontStyle: 'italic',
      textAlign: 'start',
    }}
  >
    <p style={{ margin: '0' }}>
      This Transcript is valid only when it bears the school seal and the original signature of the
      Registrar. Any erasure or alteration made on this document renders it void unless initialed
      by the foregoing official.
    </p>
  </div>

  {/* Sub-Headers */}
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem' }}>
    <p style={{ margin: '0' }}>GRADE</p>
  </div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem' }}>
    <p style={{ margin: '0' }}>EQUIVALENCE</p>
  </div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem' }}>
    <p style={{ margin: '0' }}>DESCRIPTION</p>
  </div>

  {/* Body Rows */}
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>1.00</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>99-100%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>EXCELLENT</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'left',
      fontSize: '0.5rem',
      lineHeight: '1.2',
    }}
  >
    Prepared by:
  </div>

  <div
    style={{
      gridColumn: 'span 2',
      gridRow: 'span 14',
      border: '1px solid black',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      textAlign: 'center',
      height: '100%',
      fontSize: '0.5rem',
    }}
  >
    <p>
      Transcript is <strong>NOT</strong> valid without PCC seal
    </p>
  </div>

  {/* Remaining Rows */}
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>1.25</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>96-98%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>SUPERIOR</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem',
      lineHeight: '1.2',
    }}
  >
    <strong> <big>
      {`${user.personnelNameFirst} ${user.personnelNameMiddle} ${user.personnelNameLast}`}
      </big></strong>
  </div>

    {/* Repeat for remaining rows */}
    <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>1.50</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>93-95%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>VERY GOOD</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    Program Records-In-Charge
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>1.75</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>90-92%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>GOOD</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'left',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    Checked & Verified by:
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>2.00</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>87-89%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>MERITORIOUS</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'left',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >

  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>2.25</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>84-86%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>VERY SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    Registrar 1
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>2.50</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>81-83%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'left',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    Date Issued
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>2.75</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>76-80%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>FAIRLY SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    <big>{formattedDate}</big>
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>3.00</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>75-77%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>PASSING</div>
  <div
    style={{
      gridColumn: 'span 3',
      gridRow: 'span 4',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>5.00</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>Below 50</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>FAILED</div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>INC</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}></div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>INCOMPLETE</div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>OD</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}></div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>OFFICIALY DROPPED</div>


  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>UD</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}></div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>UNOFICIALLY DROPPED</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
      <strong>
      <big>{`${user.personnelNameFirst} ${user.personnelNameMiddle} ${user.personnelNameLast}`}</big>
    </strong>
  </div>

  <div style={{ border: '1px solid black', padding: '4px' , fontSize: '0.5rem', lineHeight: '1.2'}}>FA</div>
  <div style={{ border: '1px solid black', padding: '4px' , fontSize: '0.5rem', lineHeight: '1.2'}}></div>
  <div style={{ border: '1px solid black', padding: '4px' , fontSize: '0.5rem', lineHeight: '1.2'}}>FAILURE DUE TO EXCESSIVE ABSENCES</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
  College Registrar
  </div>
  {/* Add other rows in similar fashion */}
</div>

           </div>
          )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCloseModal}>
            Close
          </Button>
          <Button onClick={handlePrint} variant="success" >Print</Button>

        </Modal.Footer>
      </Modal>
     </Container>
    </Container>
    );
}
