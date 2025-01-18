import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Button, Modal, Table,Spinner } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../Context/UserContext';
import StudentModel from '../ReactModels/StudentModel';
import CourseModel from '../ReactModels/CourseModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import './Grades.css';
import '../App.css';

const studentCache = new Map();
const curriculumCache = new Map();

export default function Grades() {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext); // Get the logged-in user from context
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [curriculum, setCurriculum] = useState([]);

  const fetchStudentData = useCallback(async (studentNumber) => {
    if (studentCache.has(studentNumber)) {
      setStudentData(studentCache.get(studentNumber)); // Use cached data if available
      return;
    }
    setLoading(true);
    try {
      const [studentsData, enrolledStudents, courseData] = await Promise.all([
        StudentModel.fetchExistingStudents(),
        EnrollmentModel.fetchAllEnrollment(),
        CourseModel.fetchAllCourses(),
      ]);

      const semGradeDataPromises = enrolledStudents.map((enrollment) =>
        SemGradeModel.fetchSemGradeData(enrollment.scheduleNumber)
      );
      const semGradeDataArray = await Promise.all(semGradeDataPromises);
      const semGradeData = semGradeDataArray.flat();

      const student = studentsData.find(
        (student) => student.studentNumber === studentNumber
      );

      const studentEnrollments = enrolledStudents.filter(
        (enrollment) => enrollment.studentNumber === studentNumber
      );

      const courses = studentEnrollments.map((enrollment) => {
        const course = courseData.find(
          (course) => course.courseCode === enrollment.courseCode
        );
        const gradeData = semGradeData.find(
          (semGrade) =>
            semGrade.scheduleNumber === enrollment.scheduleNumber &&
            semGrade.studentNumber === studentNumber
        );
      
        const totalUnits =
          (course?.courseLaboratory || 0) + (course?.courseLecture || 0);
      
        return {
          courseCode: enrollment.courseCode,
          courseDescriptiveTitle: course?.courseDescriptiveTitle || "",
          scheduleNumber: enrollment.scheduleNumber,
          academicYear: extractAcademicYear(enrollment.scheduleNumber), // Extract academic year
          yearLevel: course?.courseYearLevel || "",
          semester: course?.courseSemester || "",
          courseLaboratoryUnits: course?.courseLaboratory || 0,
          courseLectureUnits: course?.courseLecture || 0,
          unitOfCredits: totalUnits,
          finalGrade: gradeData?.numEq || "-",
          completion: gradeData?.completionStatus || "-",
        };
      });
      

      const currentStudentData = {
        studentNumber: student.studentNumber,
        studentName: `${student.studentNameFirst} ${
          student.studentNameMiddle || ""
        } ${student.studentNameLast}`,
        studentCurrentYearLevel: student.studentYrLevel,
        studentCurrentProgram: student.studentProgramNumber,
        studentadmissionYear: student.studentAdmissionYr,
        courses,
      };

      console.log("Fetched Student Data:", currentStudentData);

      studentCache.set(studentNumber, currentStudentData); // Cache the fetched data
      console.log('student cache', studentCache)
      setStudentData(currentStudentData);
    } catch (error) {
      console.error("Failed to fetch student data:", error);
      setError(error);
    }
    finally{
      setLoading(false);
    }
  }, []);

  const fetchCurriculum = useCallback(async (programNumber) => {
    if (curriculumCache.has(programNumber)) {
      setCurriculum(curriculumCache.get(programNumber)); // Use cached data if available
      return;
    }
    setLoading(true)
    try {
      const curricullumCourse = await CourseModel.fetchAllCourses();
      const filteredCourses = curricullumCourse.filter(
        (course) => String(course.programNumber) === String(programNumber)
      );

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

        const unitOfCredits = (courseLecture || 0) + (courseLaboratory || 0);

        if (!acc[courseYearLevel]) {
          acc[courseYearLevel] = {};
        }

        if (!acc[courseYearLevel][courseSemester]) {
          acc[courseYearLevel][courseSemester] = [];
        }

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

      curriculumCache.set(programNumber, groupedCourses); // Cache the fetched curriculum
      setCurriculum(groupedCourses);
    } catch (error) {
      console.error("Failed to fetch Curriculum data:", error);
      setError(error);
    }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.studentNumber) {
      fetchStudentData(user.studentNumber);
    }
  }, [user?.studentNumber, fetchStudentData]);

  useEffect(() => {
    if (studentData?.studentCurrentProgram) {
      fetchCurriculum(studentData.studentCurrentProgram);
    }
  }, [studentData?.studentCurrentProgram, fetchCurriculum]);

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
    const specialGrades = {
      'INC': 'Incomplete',
      'NC': 'No Credit',
      'OD': 'Officially Dropped',
      'FA': 'Failure due to Excessive Absences',
      'UD': 'Unofficially Dropped'
    };
    if (typeof grade === 'string') {
      return specialGrades[grade] || 'Invalid Grade';
    }
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

    return 'Invalid Grade';
  }

  const handleCloseModal = () => setShowModal(false);

  const groupByAcademicYearAndSemester = (courses) => {
    return courses.reduce((acc, course) => {
      const { academicYear, semester } = course;
      if (!acc[academicYear]) {
        acc[academicYear] = {};
      }
      if (!acc[academicYear][semester]) {
        acc[academicYear][semester] = [];
      }
      acc[academicYear][semester].push(course);
      return acc;
    }, {});
  };
  
  
  const extractAcademicYear = (scheduleNumber) => {
    const match = scheduleNumber.match(/-(\d{2})(\d{2})-/);
    if (match) {
      const startYear = `20${match[1]}`;
      const endYear = `20${match[2]}`;
      return `${startYear}-${endYear}`;
    }
    return "Unknown Academic Year";
  };
  

  return (
    // Your existing JSX structure remains the same
    <>
    <div className='card bg-white'>
      <div className='card-header bg-white d-flex'>
        <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>{user.studentNameFirst} {user.studentNameMiddle || ''} {user.studentNameLast}</p>
        <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>  ({user.studentNumber})</p>
      </div>
      <div className='card-body card-success border-success rounded'>
        
      

    {loading ? (
      <div className="text-center py-5 bg-white mt-4">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Loading data, please wait...</p>
      </div>
        ):(
          <>
          <div className="d-flex justify-content-end">
            <Button 
              className='text-success bg-white border-0 fs-6 fw-semibold' 
              onClick={() => setShowModal(true)}
            >
              <FontAwesomeIcon icon={faBook} /> Curriculum
            </Button>
          </div>
          <div>
          {studentData.courses && studentData.courses.length > 0 ? (
            Object.entries(groupByAcademicYearAndSemester(studentData.courses)).map(([academicYear, semesters], index) => (
              <div key={index} className="card mb-3">
                {Object.entries(semesters).map(([semester, courses], semesterIndex) => (
                  <div key={semesterIndex} className="card">
                    <div className="card-header bg-custom-color-green d-flex">
                      <p className="text-white mt-1 fs-6 gw-semibold custom-color">
                        Academic Year {academicYear} {getSemesterText(semester)} Semester
                      </p>
                    </div>
                    <div className="card-body">
                      <Table bordered className="table">
                        <thead className="table-success">
                          <tr>
                            <th className="text-success custom-font text-center">Code</th>
                            <th className="text-success custom-font text-center">Subject</th>
                            <th className="text-success custom-font text-center">Total Units</th>
                            <th className="text-success custom-font text-center">Grade</th>
                            <th className="text-success custom-font text-center">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.length > 0 ? (
                            courses.map((course, index) => (
                              <tr key={index}>
                                <td className="custom-font text-center">{course.courseCode}</td>
                                <td className="custom-font text-center">{course.courseDescriptiveTitle}</td>
                                <td className="custom-font text-center">{course.unitOfCredits}</td>
                                <td className="custom-font text-center">{course.finalGrade}</td>
                                <td className="custom-font text-center">{getGradeDescription(course.finalGrade)}</td>
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
                ))}
              </div>
            ))
          ) : (
            <div className="text-center custom-font">No courses available.</div>
          )}

</div>



          </>
    )}

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
                      <th className='text-center text-success custom-font'>Course Code</th>
                      <th className='text-center text-success custom-font'>Course Title</th>
                      <th className='text-center text-success custom-font'>Lecture Hours</th>
                      <th className='text-center text-success custom-font'>Laboratory Hours</th>
                      <th className='text-center text-success custom-font'>Unit Credits</th>
                      <th className='text-center text-success custom-font'>Pre Requisite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculum[yearLevel][semester].map((course, index) => (
                      <tr key={index}>
                        <td className="custom-font text-center">{course.courseCode}</td>
                        <td className="custom-font text-center">{course.courseDescriptiveTitle}</td>
                        <td className="custom-font text-center">{course.courseLecture}</td>
                        <td className="custom-font text-center">{course.courseLaboratory}</td>
                        <td className="custom-font text-center">{course.unitOfCredits}</td>
                        <td className="custom-font text-center">{course.coursePreRequisite}</td>
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
}
