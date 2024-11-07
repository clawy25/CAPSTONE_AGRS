import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import CourseModel from '../ReactModels/CourseModel'; // Assuming CourseModel handles fetching courses based on academic year, year level, and semester.

const CurriculumPage = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('First');
  const [showTable, setShowTable] = useState(false);

  const [academicYears, setAcademicYears] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [courses, setCourses] = useState([]); // State to hold course data for the selected academic year, year level, and semester
  const [showModal, setShowModal] = useState(false); // State to toggle Add/Edit modal
  const [currentCourse, setCurrentCourse] = useState(null); // Track the course being edited
  const [coursesCache, setCoursesCache] = useState({}); // Cache for storing courses based on academic year, year level, and semester

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
        setAcademicYears(fetchedAcademicYears);
        if (fetchedAcademicYears.length > 0) {
          setAcademicYear(fetchedAcademicYears[0].academicYear);
        }

        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        setYearLevels(fetchedYearLevels);
        if (fetchedYearLevels.length > 0) {
          setYearLevel(fetchedYearLevels[0].yearName);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch the courses based on selected academic year, year level, and semester
  const fetchCourses = async () => {
    const cacheKey = `${academicYear}-${yearLevel}-${semester}`;
    
    // Check if the courses for the current combination are already in the cache
    if (coursesCache[cacheKey]) {
      setCourses(coursesCache[cacheKey]); // If courses are cached, use them
    } else {
      try {
        const fetchedCourses = await CourseModel.fetchCoursesByYearLevel(
          academicYear,
          yearLevel,
          semester
        );
        setCourses(fetchedCourses); // Update the courses state with fetched data
        setCoursesCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: fetchedCourses, // Cache the fetched courses
        }));
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }
  };

  // Trigger fetchCourses whenever academicYear, yearLevel, or semester changes
  useEffect(() => {
    if (academicYear && yearLevel && semester) {
      setCourses([]); // Clear current courses data
      fetchCourses(); // Fetch new courses or get from cache
    }
  }, [academicYear, yearLevel, semester]);

  const handleView = () => {
    if (academicYear && yearLevel && semester) {
      setShowTable(true);
    }
  };

  // Handle course form submission
  const handleCourseSubmit = (e) => {
    e.preventDefault();
  
    const form = e.target;
    const updatedCourse = {
      courseCode: form.courseCode.value,
      title: form.title.value,
      lectureUnits: form.lectureUnits.value,
      labUnits: form.labUnits.value,
      prerequisite: form.prerequisite.value,
    };
  
    const cacheKey = `${academicYear}-${yearLevel}-${semester}`;
    
    if (currentCourse) {
      // Editing an existing course
      const updatedCourses = courses.map(course =>
        course.courseCode === currentCourse.courseCode ? updatedCourse : course
      );
      
      setCourses(updatedCourses); // Update the courses in state
      setCoursesCache((prevCache) => ({
        ...prevCache,
        [cacheKey]: updatedCourses, // Update the cache with edited course
      }));
    } else {
      // Adding a new course
      const newCourses = [...courses, updatedCourse];
      
      setCourses(newCourses); // Update the courses in state
      setCoursesCache((prevCache) => ({
        ...prevCache,
        [cacheKey]: newCourses, // Update the cache with new course added
      }));
    }
  
    setShowModal(false); // Close the modal
    setCurrentCourse(null); // Reset currentCourse to null after edit/add
  };
  
  const handleEditCourse = (course) => {
    setCurrentCourse(course); // Set course for editing
    setShowModal(true); // Show modal
  };

  const handleAddCourse = () => {
    setCurrentCourse(null); // No course to edit, so reset
    setShowModal(true); // Show modal for adding a new course
  };

  const handleDeleteCourse = (courseCode) => {
    // Delete the course with the given courseCode
    const updatedCourses = courses.filter(course => course.courseCode !== courseCode);
    setCourses(updatedCourses);

    // Update the cache with the modified courses list
    const cacheKey = `${academicYear}-${yearLevel}-${semester}`;
    setCoursesCache((prevCache) => ({
      ...prevCache,
      [cacheKey]: updatedCourses,
    }));
  };

  return (
    <div>
      <h2 className="custom-font custom-color-green-font">Curriculum</h2>
      <Row className="mb-4 bg-white rounded p-3 m-1">
        <Col>
          <Form.Group controlId="academicYear">
            <Form.Label>Academic Year</Form.Label>
            <Form.Control as="select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
              {academicYears.map((year) => (
                <option key={year.id} value={year.academicYear}>
                  {year.academicYear}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="yearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Control as="select" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
              {yearLevels.map((level) => (
                <option key={level.id} value={level.yearName}>
                  {level.yearName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="semester">
            <Form.Label>Semester</Form.Label>
            <Form.Control as="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="First">First</option>
              <option value="Second">Second</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col className="d-flex align-items-end">
          <Button className="w-100 btn-success" onClick={handleView}>View</Button>
        </Col>
      </Row>

      {showTable && (
        <>
          <Table bordered className="text-center mt-4">
            <thead className="table-success">
              <tr>
                <th>Course Code</th>
                <th>Descriptive Title</th>
                <th>Lecture Units</th>
                <th>Laboratory Units</th>
                <th>Pre-requisite</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseCode}</td>
                  <td>{course.title}</td>
                  <td>{course.lectureUnits}</td>
                  <td>{course.labUnits}</td>
                  <td>{course.prerequisite}</td>
                  <td>
                    <Button variant="success" className="me-2" onClick={() => handleEditCourse(course)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteCourse(course.courseCode)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Row className="mt-3">
            <Col>
              <Button className="btn-success w-auto" onClick={handleAddCourse}>
                Add Course
              </Button>
            </Col>
          </Row>
        </>
      )}

      {/* Modal for Add/Edit Course */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentCourse ? 'Edit Course' : 'Add New Course'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCourseSubmit}>
            <Form.Group controlId="courseCode">
              <Form.Label>Course Code</Form.Label>
              <Form.Control
                type="text"
                defaultValue={currentCourse ? currentCourse.courseCode : ''}
                required
              />
            </Form.Group>
            <Form.Group controlId="title">
              <Form.Label>Descriptive Title</Form.Label>
              <Form.Control
                type="text"
                defaultValue={currentCourse ? currentCourse.title : ''}
                required
              />
            </Form.Group>
            <Form.Group controlId="lectureUnits">
              <Form.Label>Lecture Units</Form.Label>
              <Form.Control
                type="number"
                defaultValue={currentCourse ? currentCourse.lectureUnits : ''}
                required
              />
            </Form.Group>
            <Form.Group controlId="labUnits">
              <Form.Label>Laboratory Units</Form.Label>
              <Form.Control
                type="number"
                defaultValue={currentCourse ? currentCourse.labUnits : ''}
                required
              />
            </Form.Group>
            <Form.Group controlId="prerequisite">
              <Form.Label>Pre-requisite</Form.Label>
              <Form.Control
                type="text"
                defaultValue={currentCourse ? currentCourse.prerequisite : ''}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3 w-100">
              {currentCourse ? 'Save Changes' : 'Add Course'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CurriculumPage;
