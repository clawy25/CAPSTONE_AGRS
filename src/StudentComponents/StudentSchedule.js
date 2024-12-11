import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import CourseModel from '../ReactModels/CourseModel';
import PersonnelModel from '../ReactModels/PersonnelModel'; 
import StudentModel from '../ReactModels/StudentModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';

import './Schedule.css';
import '../App.css';

export default function Schedule() {
  const { user } = useContext(UserContext); // Get the logged-in user from context
  const [studentSchedules, setStudentSchedules] = useState([]); // To store student's schedule data
  const [courses, setCourses] = useState([]); // To store all course data
  const [personnel, setPersonnel] = useState([]); // To store personnel data
  const [studentName, setStudentName] = useState(""); // To store the student's full name
  const [error, setError] = useState(null); // For error handling
  const [currentAcadYear, setCurrentAcadYear] = useState(""); // State for current academic year

  useEffect(() => {
    const fetchAcademicYear = async () => {
      try {
        const academicYears = await AcademicYearModel.fetchExistingAcademicYears();
        const currentYear = academicYears.find(year => year.isCurrent); // Find the current academic year
        if (currentYear) {
          setCurrentAcadYear(currentYear.academicYear); // Set the current academic year
        } else {
          throw new Error("Current academic year not found.");
        }
      } catch (error) {
        setError("Error fetching academic year.");
        console.error(error);
      }
    };

    const fetchStudentData = async () => {
      try {
        if (!user || !user.studentNumber) {
          throw new Error("No student information available.");
        }

        // Fetch the student details based on studentNumber
        const students = await StudentModel.fetchExistingStudents();
        const currentStudent = students.find(student => student.studentNumber === user.studentNumber);

        if (currentStudent) {
          // Set the student's full name
          const fullName = `${currentStudent.studentNameLast}, ${currentStudent.studentNameFirst} ${currentStudent.studentNameMiddle || ''} ${currentStudent.studentNameLast}`;
          setStudentName(fullName.trim());
        } else {
          throw new Error("Student not found.");
        }

        // Fetch personnel for the current academic year
        const personnelData = await PersonnelModel.getProfessorsbyProgram(user.programNumber, currentAcadYear);

        // Fetch enrollments, schedules, and courses
        const enrollments = await EnrollmentModel.fetchAllEnrollment();
        const schedules = await ScheduleModel.fetchSchedules();
        const fetchedCourses = await CourseModel.fetchAllCourses();

        // Find the enrollments for the current student
        const studentEnrollments = enrollments.filter(
          (enrollment) => enrollment.studentNumber === user.studentNumber
        );

        // Loop through studentEnrollments and match schedules
        const studentSchedules = await Promise.all(
          studentEnrollments.map(async (enrollment) => {
            // Find matching schedule for the student enrollment
            const matchedSchedule = schedules.find(
              (schedule) => schedule.scheduleNumber === enrollment.scheduleNumber
            );

            if (matchedSchedule) {
              // Find the professor (personnel) for the schedule using fetched personnel
              const fetchedPersonnel = personnelData.find(
                (person) => person.personnelNumber === matchedSchedule.personnelNumber
              );

           
              // Find the matching course
              const matchedCourse = fetchedCourses.find(
                (course) => course.courseCode === matchedSchedule.courseCode
              );

              // If course and professor data are available, return schedule data
              if (matchedCourse && fetchedPersonnel) {
                const totalUnits = matchedCourse.courseLecture + matchedCourse.courseLaboratory;

                // Fix the personnel name display to handle undefined or missing fields
                const professorName = `${fetchedPersonnel.personnelNameFirst} ${fetchedPersonnel.personnelNameLast}`.trim();
                
                return {
                  courseCode: matchedCourse.courseCode,
                  courseDesc: matchedCourse.courseDescriptiveTitle,
                  lectureUnits: matchedCourse.courseLecture,
                  labUnits: matchedCourse.courseLaboratory,
                  totalUnits,
                  scheduleTime: `${matchedSchedule.scheduleDay} ${formatTimeTo12Hour(
                    matchedSchedule.startTime
                  )} - ${formatTimeTo12Hour(matchedSchedule.endTime)}`,
                  professorName,  // Full name
                };
              } else {
                console.warn(
                  `No match found for courseCode: ${matchedSchedule.courseCode} or personnel data is incomplete`
                );
              }
            }
            return null; // Return null if no match is found
          })
        );

        // Filter out null values from studentSchedules
        const validSchedules = studentSchedules.filter((schedule) => schedule !== null);
        setStudentSchedules(validSchedules);

      } catch (error) {
        setError(error.message);
        console.error("Error fetching student data:", error);
      }
    };

    fetchAcademicYear(); // Fetch academic year
    fetchStudentData(); // Fetch student data when component mounts

  }, [user, currentAcadYear]); // Re-run effect when user or currentAcadYear changes

  // Render loading state or error if applicable
  if (error) {
    return <div>Error: {error}</div>;
  }

  const formatTimeTo12Hour = (timeStr) => {
    if (!timeStr) return ''; // Handle empty or invalid time input
    const timeParts = timeStr.split(':');
    let hours = parseInt(timeParts[0], 10);
    let minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
  
    if (isNaN(hours) || isNaN(minutes)) {
      return '';
    }
  
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
  
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="card card-success rounded">
      <div className='card-header bg-white d-flex'>
        <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>{studentName}</p>
        <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>  ({user.studentNumber})</p>
      </div>
      <div className='card-body'>
        <table className="table table-bordered table-responsive">
          <thead className="table-success text-center">
            <tr>
              <th className="text-success custom-font">Course Code</th>
              <th className="text-success custom-font">Course Desc</th>
              <th className="text-success custom-font">Lecture Units</th>
              <th className="text-success custom-font">Lab Units</th>
              <th className="text-success custom-font">Total Units</th> {/* New column for total units */}
              <th className="text-success custom-font">Schedule</th>
              <th className="text-success custom-font">Professor</th>
            </tr>
          </thead>
          <tbody className='bg-white'>
            {studentSchedules.length > 0 ? (
              studentSchedules.map((schedule, index) => (
                <tr key={index}>
                  <td className="custom-font">{schedule.courseCode}</td>
                  <td className="custom-font">{schedule.courseDesc}</td>
                  <td className="custom-font">{schedule.lectureUnits}</td>
                  <td className="custom-font">{schedule.labUnits}</td>
                  <td className="custom-font">{schedule.totalUnits}</td>
                  <td className="custom-font">{schedule.scheduleTime}</td>
                  <td className="custom-font">{schedule.professorName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center custom-font">No schedule found for this student.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>  
    </div>
  );
}
