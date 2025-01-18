import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { UserContext } from '../Context/UserContext';
import ScheduleModel from '../ReactModels/ScheduleModel';
import CourseModel from '../ReactModels/CourseModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';

import '../App.css'


export default function FacultySchedulePage() {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext); // Access user context
  const [semester, setSemester] = useState('');  // Store semester as a string initially
  const [academicYear, setAcademicYear] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const program = user?.programNumber || null; // Safely access programNumber from user

  useEffect(() => {
    console.log('User Data:', user);
  }, [user]);

  // Fetch Academic Years
  useEffect(() => {
    if (!user) {
      console.error('User context is not available.');
      setErrorMessage('User context is not available.');
      return;
    }

    if (!program) {
      setErrorMessage('You do not have an assigned program. Please contact the administrator.');
      return;
    }

    const fetchAcademicYears = async () => {
      try {
        const data = await AcademicYearModel.fetchExistingAcademicYears();
        if (data.length === 0) {
          setErrorMessage('No academic years found.');
        } else {
          setAcademicYear(data);
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
        setErrorMessage('Failed to load academic years.');
      }
    };

    fetchAcademicYears();
  }, [user, program]);

  // Fetch all Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await CourseModel.fetchAllCourses(); // Fetch all courses
        if (data && data.length > 0) {
          setCourses(data);
          setErrorMessage(''); // Clear any previous errors
        } else {
          setErrorMessage('No courses available.');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setErrorMessage('Error fetching courses. Please try again later.');
      }
    };

    fetchCourses();
  }, []);

  // Handle Class Schedule fetch

  const handleClassSchedule = async () => {
    if (program && selectedAcademicYear && semester) {
      setLoading(true); // Start loading
      try {
        console.log('Fetching schedules with:', {
          academicYear: selectedAcademicYear,
          program: program,
          semester: semester,
          personnelNumber: user?.personnelNumber,
        });
  
        const fetchedSchedules = await ScheduleModel.fetchAllSchedules(selectedAcademicYear); // Fetch all schedules by academic year
        console.log('Fetched Schedules:', fetchedSchedules); // Log the fetched schedules
  
        if (fetchedSchedules && fetchedSchedules.length > 0) {
          setSchedule(fetchedSchedules); // Set fetched schedules
          setErrorMessage(''); // Clear error messages
        } else {
          setErrorMessage('No schedules available for the selected academic year.'); // Set no data message
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setErrorMessage('Failed to fetch schedules.'); // Set fetch error message
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      setErrorMessage('Please select both academic year and semester to fetch schedules.'); // Prompt selection
    }
  };
  
  // useEffect to trigger fetching when academic year or semester changes
  useEffect(() => {
    if (selectedAcademicYear && semester) {
      handleClassSchedule(); // Fetch data when fields are selected
    }
  }, [selectedAcademicYear, semester]); // Dependencies for academic year and semester
  

  // Filter schedules based on selected academic year, semester, and personnelNumber
  useEffect(() => {
    console.log('Filtering schedules with:', {
      selectedAcademicYear,
      semester,
      personnelNumber: user?.personnelNumber,
    });

    const filtered = schedule.filter((sched) => {
      const matches =
        (selectedAcademicYear ? sched.academicYear === selectedAcademicYear : true) &&
        (semester ? sched.semester === parseInt(semester) : true) &&  // Convert semester to integer for comparison
        (sched.personnelNumber === user?.personnelNumber);

      console.log('Checking Schedule:', sched, 'Matches:', matches); // Debugging filtered schedules
      return matches;
    });

    console.log('Filtered Schedules:', filtered);
    setFilteredSchedules(filtered);
  }, [schedule, selectedAcademicYear, semester, user]);

  // Function to get course details by courseCode
  const getCourseDetails = (courseCode) => {
    const course = courses.find((course) => course.courseCode === courseCode);
    return course || {}; // Return course details if found, otherwise return an empty object
  };

  // Helper function to format time to 12-hour format with AM/PM
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
    <section>
      <h2 className="custom-font custom-color-green-font mb-3 mt-2"> Schedule</h2>
      <Form className="p-3 mb-4 bg-white border border-success rounded">
      <Row className="align-items-center justify-content-between gx-3 gy-2">
        <Col sm={12} md={6} className="mb-3">
          <Form.Group controlId="academicYear" className='w-100'>
            <Form.Label className="custom-color-green-font custom-font text-nowrap">Academic Year</Form.Label>
            <Form.Select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="border-success w-100"
            >
              <option value="">Select an Academic Year</option>
              {academicYear
                .sort((a, b) => {
                  const yearA = parseInt(a.academicYear.split('-')[0]);
                  const yearB = parseInt(b.academicYear.split('-')[0]);
                  return yearB - yearA;
                })
                .map((year) => (
                  <option key={year.academicYear} value={year.academicYear}>
                    {year.academicYear}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col sm={12} md={6} className="mb-3">
          <Form.Group controlId="semester" className='w-100'> 
            <Form.Label className="custom-color-green-font custom-font text-nowrap">Semester</Form.Label>
            <Form.Select value={semester} onChange={(e) => setSemester(e.target.value)} className="border-success w-100" disabled={!selectedAcademicYear}>
              <option value="">Select a Semester</option>
              <option value="1">First</option>
              <option value="2">Second</option>
              <option value="3">Summer</option>
            </Form.Select>
          </Form.Group>
        </Col>

      </Row>
      </Form>
      <div className="card rounded bg-white px-3 pb-3 pt-4">
  {/* Loading State */}
  {loading ? (
    <div className="text-center py-5 bg-white">
      <Spinner animation="border" variant="success" />
      <p className="mt-3">Loading data, please wait...</p>
    </div>
  ) : filteredSchedules.length > 0 ? (
    // Schedule Table
    <Table bordered responsive className="table">
      <thead className="table-success">
        <tr>
          <th className="custom-color-green-font text-center">Course Code</th>
          <th className="custom-color-green-font text-center">Course Description</th>
          <th className="custom-color-green-font text-center">Lec</th>
          <th className="custom-color-green-font text-center">Lab</th>
          <th className="custom-color-green-font text-center">Unit</th>
          <th className="custom-color-green-font text-center">Class</th>
          <th className="custom-color-green-font text-center">Schedule</th>
        </tr>
      </thead>
      <tbody>
        {filteredSchedules.map((sched) => {
          const courseDetails = getCourseDetails(sched.courseCode);
          const totalUnits =
            (parseFloat(courseDetails.courseLecture) || 0) +
            (parseFloat(courseDetails.courseLaboratory) || 0);
          return (
            <tr key={sched.id}>
              <td className="text-center">{sched.courseCode}</td>
              <td className="text-center">{courseDetails.courseDescriptiveTitle || "N/A"}</td>
              <td className="text-center">{courseDetails.courseLecture || "N/A"}</td>
              <td className="text-center">{courseDetails.courseLaboratory || "N/A"}</td>
              <td className="text-center">{totalUnits || "N/A"}</td>
              <td className="text-center">{sched.sectionNumber || "N/A"}</td>
              <td className="text-center">
                {sched.scheduleDay}, {formatTimeTo12Hour(sched.startTime)} -{" "}
                {formatTimeTo12Hour(sched.endTime)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  ) : (
    // No Data Available
    <div className="text-center py-5 bg-white rounded pt-5 px-4 pb-5">
    <h5 className="custom-color-green-font mt-5 fs-5">No Schedule Available</h5>
    <p className="fs-6 mb-4">
        No data found for the selected filters. Please adjust your filters and try again.
    </p>
  </div>
  )}
</div>

    </section>
  );
}
