import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../Context/UserContext';
import StudentModel from '../ReactModels/StudentModel';
import CourseModel from '../ReactModels/CourseModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import TimelineModel from '../ReactModels/TimelineModel'
import './Grades.css';
import '../App.css';


export default function Grades(){
  const { user } = useContext(UserContext); // Get the logged-in user from context
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [curriculum, setCurriculum] = useState([]);

  useEffect(() => {
    const fetchStudentData = async (studentNumber) => {
      try {
        // Fetch necessary data from models
        const [studentsData, enrolledStudents, courseData] = await Promise.all([
          StudentModel.fetchExistingStudents(),
          EnrollmentModel.fetchAllEnrollment(),
          CourseModel.fetchAllCourses(),
        ]);
    
        const semGradeDataPromises = enrolledStudents.map((enrollment) =>
          SemGradeModel.fetchSemGradeData(enrollment.scheduleNumber)
        );
        const semGradeDataArray = await Promise.all(semGradeDataPromises);
    
        // Flatten the array if fetchSemGradeData returns arrays
        const semGradeData = semGradeDataArray.flat();
    
        // Find the specific student by studentNumber
        const student = studentsData.find(
          (student) => student.studentNumber === studentNumber
        );
    

    
        // Fetch the student's enrollments
        const studentEnrollments = enrolledStudents.filter(
          (enrollment) => enrollment.studentNumber === studentNumber
        );
    
        // Map courses for the student
        const courses = studentEnrollments.map((enrollment) => {

          const course = courseData.find(
            (course) => course.courseCode === enrollment.courseCode
          );
          const gradeData = semGradeData.find(
            (semGrade) =>
              semGrade.scheduleNumber === enrollment.scheduleNumber &&
              semGrade.studentNumber === studentNumber
          );
    
          // Calculate total units of credit as the sum of laboratory and lecture units
          const totalUnits = (course?.courseLaboratory || 0) + (course?.courseLecture || 0);
    
          return {
            courseCode: enrollment.courseCode,
            courseDescriptiveTitle: course?.courseDescriptiveTitle || "",
            scheduleNumber: enrollment.scheduleNumber,
            yearLevel: course?.courseYearLevel || "",
            semester: course?.courseSemester || "",
            courseLaboratoryUnits: course?.courseLaboratory || 0,
            courseLectureUnits: course?.courseLecture || 0,
            unitOfCredits: totalUnits,
            finalGrade: gradeData?.grade || "-",
            completion: gradeData?.completionStatus || "-",
          };
        });
    
        // Return structured data for the student
        const currentStudentData = {
          studentNumber: student.studentNumber,
          studentName: `${student.studentNameFirst} ${
            student.studentNameMiddle || ""
          } ${student.studentNameLast}`,
          studentCurrentYearLevel: student.studentYrLevel,
          studentCurrentProgram: student.studentProgramNumber,
          studentadmissionYear: student.studentAdmissionYr,
          courses, // Array of course data
        };
    
        console.log("Fetched Student Data:", studentData);
    
        setStudentData(currentStudentData);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        return null;
      }
    };
    
    const fetchCurriculum = async (programNumber) => {
      try {
        // Fetch all courses
        const curricullumCourse = await CourseModel.fetchAllCourses();
        //console.log("Courses:", curricullumCourse);
    
        // Filter courses by selected programNumber
        const filteredCourses = curricullumCourse.filter(
          (course) => String(course.programNumber) === String(programNumber)
        );
    
        //console.log("Filtered Courses for Program:", filteredCourses);
    
        // Group courses by year level and semester
        const groupedCourses = filteredCourses.reduce((acc, course) => {
          const {
            courseYearLevel,
            courseSemester,
            courseCode,
            courseDescriptiveTitle,
            courseLecture,
            courseLaboratory,
            coursePreRequisite,
          } = course;
  
          // Calculate unit of credits
          const unitOfCredits = (courseLecture || 0) + (courseLaboratory || 0);
  
          // Ensure yearLevel and semester groups exist
          if (!acc[courseYearLevel]) {
            acc[courseYearLevel] = {};
          }
  
          if (!acc[courseYearLevel][courseSemester]) {
            acc[courseYearLevel][courseSemester] = [];
          }
  
          // Push the complete course details
          acc[courseYearLevel][courseSemester].push({
            courseCode,
            courseDescriptiveTitle,
            courseLecture,
            courseLaboratory,
            unitOfCredits,
            coursePreRequisite,
          });
  
          return acc;
        }, {});
        //console.log("Grouped Courses by Year and Semester:", groupedCourses);
        
        setCurriculum(groupedCourses);
      } catch (error) {
        console.error("Failed to fetch Curriculum data:", error);
        return {};
      }
    };

    fetchCurriculum(studentData.studentCurrentProgram)
    
    fetchStudentData(user.studentNumber);
  });

  const getSemesterText = (semester) => {
    const sem = parseInt(semester, 10);
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

  function getGradeDescription(grade) {
    // Handle special cases for 'INC', 'NC', 'OD', 'FA', 'UD'
    const specialGrades = {
      'INC': 'Incomplete',
      'NC': 'No Credit',
      'OD': 'Officially Dropped',
      'FA': 'Failure due to Excessive Absences',
      'UD': 'Unofficially Dropped'
    };
    
    // If the grade is a string (like 'INC', 'NC', etc.), return the special description
    if (typeof grade === 'string') {
      return specialGrades[grade] || 'Invalid Grade';
    }
  
    // Handle numeric grades with the provided grade values
    if (grade === 1.00) return 'Excellent';
    if (grade === 1.25) return 'Superior';
    if (grade === 1.50) return 'Very Good';
    if (grade === 1.75) return 'Good';
    if (grade === 2.00) return 'Meritorious';
    if (grade === 2.25) return 'Very Satisfactory';
    if (grade === 2.50) return 'Satisfactory';
    if (grade === 2.75) return 'Fairly Satisfactory';
    if (grade === 3.00) return 'Passing';
    if (grade === 5.00) return 'Failed';
  
    return 'Invalid Grade'; // If the grade doesn't match any of the specified values
  }

  const handleCloseModal = () => setShowModal(false);
  return (
    <>
        <div className='card bg-white'>
          <div className='card-header bg-white d-flex'>
            <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>{user.studentNameFirst} {user.studentNameMiddle || ''} {user.studentNameLast}</p>
            <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>  ({user.studentNumber})</p>
          </div>
          <div className='card-body card-success border-success rounded'>
            
          <div className="d-flex justify-content-end">
            <Button 
              className='text-success bg-white border-0 fs-6 fw-semibold' 
              onClick={() => setShowModal(true)}
            >
              <FontAwesomeIcon icon={faBook} /> Curriculum
            </Button>
          </div>

          <div className="card">
          <div className="card-header bg-custom-color-green d-flex">
            <p className="text-white mt-1 fs-6 gw-semibold custom-color">
              Academic Year ({studentData.studentCurrentYearLevel}) First Semester ({studentData.studentCurrentProgram}) 
            </p>
          </div>
          <div className="card-body">
            <Table bordered className="table">
              <thead className="table-success">
                <tr>
                  <th className="text-success custom-font">Code</th>
                  <th className="text-success custom-font">Subject</th>
                  <th className="text-success custom-font">Total Units</th>
                  <th className="text-success custom-font">Grade</th>
                  <th className="text-success custom-font">Remarks</th>

                </tr>
              </thead>
              <tbody>
                {studentData.courses && studentData.courses.length > 0 ? (
                  studentData.courses.map((course, index) => (
                    <tr key={index}>
                      <td className="custom-font">{course.courseCode}</td>
                      <td className="custom-font">{course.courseDescriptiveTitle}</td>
                      <td className="custom-font">{course.unitOfCredits}</td>
                      <td className="custom-font">{course.finalGrade}</td>
                      <td className="custom-font">{getGradeDescription(course.finalGrade)}</td>
                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center custom-font">
                      No courses available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>

        <Modal show={showModal} onHide={handleCloseModal} size='lg'centered>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         
            {Object.keys(curriculum).map((yearLevel) => (
              <div key={yearLevel}>
                <h4>Year Level {yearLevel}</h4>
                {Object.keys(curriculum[yearLevel]).map((semester) => (
                  <div key={semester} className='table-responsive'>
                    <h5>{getSemesterText(semester)} Semester</h5>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Title</th>
                          <th>Lecture Hours</th>
                          <th>Laboratory Hours</th>
                          <th>Unit Credits</th>
                          <th>Pre Requisite</th>
                        </tr>
                      </thead>
                      <tbody>
                        {curriculum[yearLevel][semester].map((course, index) => (
                          <tr key={index}>
                            <td>{course.courseCode}</td>
                            <td>{course.courseDescriptiveTitle}</td>
                            <td>{course.courseLecture}</td>
                            <td>{course.courseLaboratory}</td>
                            <td>{course.unitOfCredits}</td>
                            <td className="custom-font">{course.coursePreRequisite}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ))}
              </div>
            ))}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
 
        
          </div>
        </div>
   </>    
  );
};

