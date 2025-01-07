import React, { useState, useEffect } from 'react';
import { Button, Table, Container, Modal, Form, Dropdown } from 'react-bootstrap';
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

export default function RegistrarIrregularStudents() {
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
        setSelectedStudent(student); // Set the selected student
        setShowAcademicRecordModal(true); // Show the academic record modal
        fetchCurriculum(student.studentProgramNumber, student.studentNumber); // Pass studentNumber to fetchCurriculum
    };

    // Handle click on "Enrollment" button
    const handleEnrollmentClick = (student) => {
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
        <Container fluid className="bg-white py-5 rounded">
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

            <Container fluid className="mt-4">

            <Table responsive hover>
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
                                <td>{student.studentNumber}</td>
                                <td>
                                    {student.studentNameLast}, {student.studentNameFirst} {student.studentNameMiddle || ''}
                                </td>
                                <td className='text-center'>{student.programName}</td>
                                <td className='text-center'>{student.studentYrLevel}</td>
                                <td className='text-center'>
                                    <Dropdown align="end">
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
                            <td colSpan="6" className="text-center fst-italic">
                                No students found
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            </Container>
            {/* Academic Record Modal */}
            <Modal show={showAcademicRecordModal} size='lg' onHide={handleCloseAcademicRecordModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Student Record</Modal.Title>
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
            
            <Modal show={showEnrollmentModal} size="xl" onHide={handleCloseEnrollmentModal}>
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
                                                                            professorNumber: selectedSchedule?.personnelNumber || '',
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

        </Container>
    );
}
