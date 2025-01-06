import React, { useState, useEffect } from 'react';
import { Button, Table, Container, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import StudentModel from '../ReactModels/StudentModel';
import CourseModel from '../ReactModels/CourseModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel'
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import PersonnelModel from '../ReactModels/PersonnelModel';

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
        console.log("Program Number:", programNumber);  // Debug: Log programNumber
        console.log("Student Number:", studentNumber);  // Debug: Log studentNumber
    
        try {
            // Fetch all courses
            const curriculumCourses = await CourseModel.fetchAllCourses();
            console.log("All Courses:", curriculumCourses);  // Log all courses
    
            // Filter courses by programNumber
            const filteredCourses = curriculumCourses.filter(
                (course) => String(course.programNumber) === String(programNumber)
            );
            console.log("Filtered Courses:", filteredCourses);  // Log filtered courses
    
            // Fetch all enrollment data to get scheduleNumber
            const enrollmentData = await EnrollmentModel.fetchAllEnrollment();
            console.log("Enrollment Data:", enrollmentData);  // Log enrollment data
    
            const groupedCurriculum = {};
    
            // Loop through each filtered course
            for (const course of filteredCourses) {
                const { courseYearLevel, courseSemester, courseCode } = course;
    
                console.log("Checking Enrollment for Course Code:", courseCode);
    
                // Find the scheduleNumber from EnrollmentModel using courseCode
                const enrollment = enrollmentData.find(
                    (enrollment) => enrollment.courseCode === courseCode
                );
    
                if (enrollment) {
                    const scheduleNumber = enrollment.scheduleNumber;
                    console.log("Found scheduleNumber:", scheduleNumber);  // Log the found scheduleNumber
    
                    // Fetch the semGrade data using both studentNumber and scheduleNumber
                    const semGradeData = await SemGradeModel.fetchSemGradeData(scheduleNumber);
                    console.log("semGradeData:", semGradeData);  // Log the fetched semGrade data

                    const filteredSemGradeData = semGradeData.find(
                        (data) => data.studentNumber === studentNumber
                    );
    
                    // Add the semGrade (numEq and remarks) to the course
                    const courseWithGrade = {
                        ...course,
                        numEq: filteredSemGradeData && filteredSemGradeData.numEq ? filteredSemGradeData.numEq : 'N/A',  // Default to 'N/A' if no grade
                        remarks: filteredSemGradeData && filteredSemGradeData.remarks ? filteredSemGradeData.remarks : 'N/A'  // Default to 'N/A' if no remarks
                    };
    
                    // Group the courses by Year Level and Semester
                    if (!groupedCurriculum[courseYearLevel]) {
                        groupedCurriculum[courseYearLevel] = {};
                    }
                    if (!groupedCurriculum[courseYearLevel][courseSemester]) {
                        groupedCurriculum[courseYearLevel][courseSemester] = [];
                    }
    
                    groupedCurriculum[courseYearLevel][courseSemester].push(courseWithGrade);
                } else {
                    console.log(`No enrollment found for courseCode: ${courseCode}`);
                }
            }
    
            console.log("Grouped Curriculum:", groupedCurriculum);  // Log final grouped data
    
            // Set the curriculum state
            setCurriculum(groupedCurriculum);
        } catch (error) {
            console.error("Failed to fetch Curriculum data:", error);
        }
    };

    const fetchCoursesAndSchedules = async (programNumber, studentNumber) => {
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
        try {
            // Assuming EnrollmentModel.createAndInsertEnrollment can handle bulk insertion
            await EnrollmentModel.createAndInsertEnrollment(enrollmentData);
            console.log("Enrollment data inserted successfully:", enrollmentData);
        } catch (error) {
            console.error("Error enrolling students:", error);
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
    
        try {
            await enrollStudents(enrollmentData);
            alert("Enrollment successful!");
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
            setIrregularStudent(listOfIrregularStudents);
            setFilteredStudent(listOfIrregularStudents);
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
                    <thead>
                        <tr>
                            <th>Student Number</th>
                            <th>Student Name</th>
                            <th>Program</th>
                            <th>Admission Year</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudent.length !== 0 ? (
                            filteredStudent.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.studentNumber}</td>
                                    <td>{student.studentNameLast}, {student.studentNameFirst} {student.studentNameMiddle || ''}</td>
                                    <td>{student.studentProgramNumber}</td>
                                    <td>{student.studentAdmissionYr}</td>
                                    <td>{student.studentType}</td>
                                    <td className='d-flex justify-content-evenly'>
                                        <Button
                                            variant="warning"
                                            className='w-50 me-2'
                                            onClick={() => handleEnrollmentClick(student)} // Handle Enrollment button click
                                        >
                                            Enrollment
                                        </Button>
                                        <Button
                                            variant="warning"
                                            className='w-50'
                                            onClick={() => handleAcademicRecordClick(student)} // Handle Academic Record button click
                                        >
                                            Academic Record
                                        </Button>
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

                    {/* Enrollment Details Content */}
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
                {/* Display Course Description */}
                <td>
                    <Form.Control
                        type="text"
                        value={row.courseDescription}
                        readOnly
                    />
                </td>
                {/* Display Lecture Units */}
                <td>
                    <Form.Control
                        type="text"
                        value={row.courseLecture}
                        readOnly
                    />
                </td>
                {/* Display Laboratory Units */}
                <td>
                    <Form.Control
                        type="text"
                        value={row.courseLaboratory}
                        readOnly
                    />
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

                {/* Professor */}
                <td>
                    <Form.Control
                        type="text"
                        value={row.professorName}
                        readOnly
                    />
                </td>
                {/* Section */}
                <td>
                    <Form.Control
                        type="text"
                        value={row.section}
                        readOnly
                    />
                </td>
                {/* Schedule Number */}
                <td>
                    <Form.Control
                        type="text"
                        value={row.scheduleNumber}
                        readOnly
                    />
                </td>
            </tr>
        ))}
    </tbody>
</Table>
<div className='d-flex justify-content-left'>
<Button variant="primary" className='' onClick={handleAddRow}>
        Add Row
    </Button>
    <div className='d-flex justify-content-left mt-3'>
    <Button variant="success" onClick={handleEnrollStudents}>
        Enroll
    </Button>
</div>

</div>

</div>

                </div>
            ) : (
                <p>No student selected</p>
            )}
        </Modal.Body>
    </Modal>
        </Container>
    );
}
