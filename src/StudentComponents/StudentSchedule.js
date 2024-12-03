import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import CourseModel from '../ReactModels/CourseModel';
import PersonnelModel from '../ReactModels/PersonnelModel'; // Import PersonnelModel

import './Schedule.css';
import '../App.css';

export default function Schedule() {
  const { user } = useContext(UserContext); // Get the logged-in user from context
  const [studentSchedules, setStudentSchedules] = useState([]); // To store student's schedule data
  const [courses, setCourses] = useState([]); // To store all course data
  const [personnel, setPersonnel] = useState([]); // To store personnel data
  const [error, setError] = useState(null); // For error handling
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!user || !user.studentNumber) {
          throw new Error("No student information available.");
        }
  
        // Log the student number to the console
        console.log("Logged-in student number:", user.studentNumber);
  
        // Fetch enrollments for the logged-in student
        const enrollments = await EnrollmentModel.fetchAllEnrollment();
  
        // Filter enrollments based on the logged-in student number
        const studentEnrollments = enrollments.filter(
          (enrollment) => enrollment.studentNumber === user.studentNumber
        );
  
        // Fetch all schedules from ScheduleModel
        const schedules = await ScheduleModel.fetchSchedules();
  
        // Fetch all courses from CourseModel
        const fetchedCourses = await CourseModel.fetchAllCourses();
        setCourses(fetchedCourses); // Set the course data
  
        // Now match the scheduleNumber in enrollments with the schedules and course data
        const studentSchedules = await Promise.all(
          studentEnrollments.map(async (enrollment) => {
            const matchedSchedule = schedules.find(
              (schedule) => schedule.scheduleNumber === enrollment.scheduleNumber
            );
  
            if (matchedSchedule) {
              // Log the personnel number from the schedule to check
              console.log("Personnel Number from Schedule:", matchedSchedule.personnelNumber);
  
              // Check if personnelNumber is available
              if (!matchedSchedule.personnelNumber) {
                console.log("No personnel number in the schedule:", matchedSchedule);
                return null; // Skip this entry if personnelNumber is missing
              }
  
              // Match the courseCode to get course details
              const matchedCourse = fetchedCourses.find(
                (course) => course.courseCode === matchedSchedule.courseCode
              );
  
              if (matchedCourse) {
                // Calculate total units (lecture + lab units)
                const totalUnits = matchedCourse.courseLecture + matchedCourse.courseLaboratory;
  
                // Fetch the professor (personnel) by personnelNumber
                console.log(`Fetching professor data for personnelNumber: ${matchedSchedule.personnelNumber}`);
                const professorData = await PersonnelModel.getProfessorByPersonnelNumber(matchedSchedule.personnelNumber);
  
                // Log the fetched professor data
                console.log("Fetched Professor Data:", professorData);
  
                // If personnel data is found, extract the professor's name
                const professorName = professorData
                  ? `${professorData.firstName} ${professorData.lastName}`
                  : "Unknown"; // Handle case where professor is not found
  
                return {
                  courseCode: matchedCourse.courseCode,
                  courseDesc: matchedCourse.courseDescriptiveTitle,
                  lectureUnits: matchedCourse.courseLecture,
                  labUnits: matchedCourse.courseLaboratory,
                  totalUnits, // New field for total units
                  scheduleTime: `${matchedSchedule.scheduleDay} ${formatTimeTo12Hour(matchedSchedule.startTime)} - ${formatTimeTo12Hour(matchedSchedule.endTime)}`, // Apply formatTimeTo12Hour
                  professor: professorName, // Use the professor's name here
                };
              } else {
                console.log("No matched course found for courseCode:", matchedSchedule.courseCode);
              }
            } else {
              console.log("No matching schedule for enrollment:", enrollment);
            }
            return null; // If no matching schedule or course, return null (will filter out later)
          })
        );
  
        // Filter out null schedules
        setStudentSchedules(studentSchedules.filter(schedule => schedule !== null));
  
      } catch (error) {
        setError(error.message); // Handle any errors
        console.error("Error fetching student data:", error);
      }
    };
  
    fetchStudentData(); // Fetch data when component mounts
  }, [user]); // Re-run effect when user changes
  
  
  

  // Render loading state or error if applicable
  if (error) {
    return <div>Error: {error}</div>;
  }

  const formatTimeTo12Hour = (timeStr) => {
    if (!timeStr) return ''; // Handle empty or invalid time input
  
    // Ensure the time is properly formatted by adding missing zeroes or handling edge cases
    const timeParts = timeStr.split(':'); // Split time into hours and minutes
    let hours = parseInt(timeParts[0], 10); // Get the hours
    let minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0; // Get minutes or default to 0
  
    if (isNaN(hours) || isNaN(minutes)) {
      return ''; // Return empty string if time is invalid
    }
  
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    // Convert to 12-hour format
    hours = hours % 12; // Convert hours to 12-hour format
    hours = hours ? hours : 12; // If hours is 0 (midnight), set it to 12
    minutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero to minutes if necessary
  
    return `${hours}:${minutes} ${ampm}`; // Return formatted time
  };

  return (
  
      <div className="card card-success rounded">
        <div className="card-header bg-white p-3">
          {user.studentNumber} 
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
                  <td className="custom-font">{schedule.totalUnits}</td> {/* Display total units */}
                  <td className="custom-font">
                    {schedule.scheduleTime} {/* Use the formatted scheduleTime */}
                  </td>
                  <td className="custom-font">{schedule.professor}</td> {/* Display professor's name */}
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
