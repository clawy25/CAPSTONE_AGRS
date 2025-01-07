import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../Context/UserContext';
import ScheduleModel from '../ReactModels/ScheduleModel';
import CourseModel from '../ReactModels/CourseModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import StudentModel from '../ReactModels/StudentModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';

import './Schedule.css';
import '../App.css';

// Caching maps
const courseCache = new Map();
const personnelCache = new Map();
const scheduleCache = new Map();

export default function Schedule() {
  const { user } = useContext(UserContext);
  const [studentSchedules, setStudentSchedules] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState(null);
  const [currentAcadYear, setCurrentAcadYear] = useState("");

  const fetchData = useCallback(async () => {
    try {
      // Fetch current academic year and student information
      const [academicYears, students] = await Promise.all([
        AcademicYearModel.fetchExistingAcademicYears(),
        StudentModel.fetchExistingStudents(),
      ]);

      const currentYear = academicYears.find((year) => year.isCurrent);
      if (!currentYear) throw new Error("Current academic year not found.");
      setCurrentAcadYear(currentYear.academicYear);

      const currentStudent = students.find(
        (student) => student.studentNumber === user.studentNumber
      );
      if (currentStudent) {
        const fullName = `${currentStudent.studentNameLast}, ${currentStudent.studentNameFirst} ${currentStudent.studentNameMiddle || ''}`.trim();
        setStudentName(fullName);
      } else {
        throw new Error("Student not found.");
      }

      // Fetch data if not cached
      if (courseCache.size === 0) {
        const fetchedCourses = await CourseModel.fetchAllCourses();
        fetchedCourses.forEach((course) => {
          courseCache.set(course.courseCode, course);
        });
      }

      if (personnelCache.size === 0) {
        const personnelData = await PersonnelModel.getProfessorsbyProgram(
          user.programNumber,
          currentYear.academicYear
        );
        personnelData.forEach((person) => {
          personnelCache.set(person.personnelNumber, person);
        });
      }

      if (scheduleCache.size === 0) {
        const schedules = await ScheduleModel.fetchSchedules();
        schedules.forEach((schedule) => {
          scheduleCache.set(schedule.scheduleNumber, schedule);
        });
      }

      const enrollments = await EnrollmentModel.fetchAllEnrollment();
      const studentEnrollments = enrollments.filter(
        (enrollment) => enrollment.studentNumber === user.studentNumber
      );

      // Build student schedule data
      const schedulesData = studentEnrollments.map((enrollment) => {
        const matchedSchedule = scheduleCache.get(enrollment.scheduleNumber);
        if (matchedSchedule) {
          const matchedCourse = courseCache.get(matchedSchedule.courseCode);
          const fetchedPersonnel = personnelCache.get(matchedSchedule.personnelNumber);

          if (matchedCourse && fetchedPersonnel) {
            const totalUnits =
              matchedCourse.courseLecture + matchedCourse.courseLaboratory;
            const professorName = `${fetchedPersonnel.personnelNameFirst} ${fetchedPersonnel.personnelNameLast}`.trim();

            return {
              courseCode: matchedCourse.courseCode,
              courseDesc: matchedCourse.courseDescriptiveTitle,
              lectureUnits: matchedCourse.courseLecture,
              labUnits: matchedCourse.courseLaboratory,
              totalUnits,
              scheduleTime: `${matchedSchedule.scheduleDay} ${formatTimeTo12Hour(matchedSchedule.startTime)} - ${formatTimeTo12Hour(matchedSchedule.endTime)}`,
              professorName,
            };
          }
        }
        return null;
      });

      setStudentSchedules(schedulesData.filter((schedule) => schedule !== null));
    } catch (error) {
      setError(error.message);
      console.error("Error fetching student data:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTimeTo12Hour = useCallback((timeStr) => {
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
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="card card-success rounded">
      <div className='card-header bg-white d-flex'>
        <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>{studentName}</p>
        <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>  ({user.studentNumber})</p>
      </div>
      <div className="card-body table-container">
  <div className="table-responsive">
    <table className="table table-bordered">
      <thead className="table-success text-center">
        <tr>
          <th className="text-success custom-font">Course Code</th>
          <th className="text-success custom-font">Course Desc</th>
          <th className="text-success custom-font">Lecture Units</th>
          <th className="text-success custom-font">Lab Units</th>
          <th className="text-success custom-font">Total Units</th>
          <th className="text-success custom-font">Schedule</th>
          <th className="text-success custom-font">Professor</th>
        </tr>
      </thead>
      <tbody className="bg-white">
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
            <td colSpan="7" className="text-center custom-font">
              No schedule found for this student.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
  
    </div>
  );
}
