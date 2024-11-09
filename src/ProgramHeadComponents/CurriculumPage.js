import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import CourseModel from '../ReactModels/CourseModel';
import ProgramModel from '../ReactModels/ProgramModel';
import { UserContext } from '../Context/UserContext'; // Assuming CourseModel handles fetching courses based on academic year, year level, and semester.

const CurriculumPage = () => {
  const { user } = useContext(UserContext);
  const [program, setPrograms] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showTable, setShowTable] = useState(false);

  const [academicYears, setAcademicYears] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [courses, setCourses] = useState([]); // State to hold course data for the selected academic year, year level, and semester
  const [showModal, setShowModal] = useState(false); // State to toggle Add/Edit modal
  const [currentCourse, setCurrentCourse] = useState(null); // Track the course being edited
  const [coursesCache, setCoursesCache] = useState({}); // Cache for storing courses based on academic year, year level, and semester
  
  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
      setAcademicYears(fetchedAcademicYears);
  
      const programs = await ProgramModel.fetchAllPrograms();
      const userProgram = programs.filter(program => program.programNumber === user.programNumber);
  
      if (userProgram.length > 0) {

        const data = [];

        userProgram.forEach(row => {
          // Find if there is an existing entry for the academic year
          let existingAcadYear = data.find(item => item.academicYear === row.academicYear);
        
          if (!existingAcadYear) {
            // If not found, create a new entry

            const listYrlevels = [];
            const numYrs = row.programNumOfYear;
            
            for (let i = 1; i <= numYrs; i++){
              listYrlevels.push(i)
            } //Output should be [1,2,3,4] based on row.programNumOfYear



            const summerlevels = [];
            userProgram.forEach(row => {
              summerlevels.push(row.programYrLvlSummer);
            });

            const semesters = [];

            for (let i = 1; i <= numYrs; i++){
              if (summerlevels.includes(i)){
                for (let j = 1; j <= 3; j++){
                  semesters.push({
                    yearLevel: i,
                    semester: j
                  })
                }
              } else {
                for (let j = 1; j <= 2; j++){
                  semesters.push({
                    yearLevel: i,
                    semester: j
                  })
                }
              }
            }


            const entry = {
              academicYear: row.academicYear,
              yearLevels: listYrlevels,
              semesters: semesters // Initialize the set with the academic year
            };
            data.push(entry);  // Push the new entry into the data array
          }
        });
        
        console.log(data);
        setPrograms(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  
  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, []);


  // Fetch the courses based on selected academic year, year level, and semester
  const fetchCourses = async () => {
    const cacheKey = `${selectedAcademicYear}-${selectedYearLevel}-${selectedSemester}`;
    
    // Check if the courses for the current combination are already in the cache
    if (coursesCache[cacheKey]) {
      setCourses(coursesCache[cacheKey]); // If courses are cached, use them
    } else {
      try {
        const fetchedCourses = await CourseModel.fetchCoursesByYearLevel(
          selectedAcademicYear,
          selectedYearLevel,
          selectedSemester
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

  // Trigger fetchCourses whenever academicYear, selectedYearLevel, or semester changes
  useEffect(() => {
    if (selectedAcademicYear && selectedYearLevel && selectedSemester) {
      setCourses([]); // Clear current courses data
      fetchCourses(); // Fetch new courses or get from cache
    }
  }, [selectedAcademicYear, selectedYearLevel, selectedSemester]);

  const handleView = () => {
    if (selectedAcademicYear && selectedYearLevel && selectedSemester) {
      setShowTable(true);
    }
  };

  const handleAcademicYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedAcademicYear(selectedYear);
    setSelectedYearLevel('');  // Reset Year Level when Academic Year changes
    setSelectedSemester('');
  };

  const handleYearLevelChange = (e) => {
    setSelectedYearLevel(e.target.value);
    setSelectedSemester(''); // Reset Semester when Year Level changes
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
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
  
    const cacheKey = `${selectedAcademicYear}-${selectedYearLevel}-${selectedSemester}`;
    
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
    const cacheKey = `${selectedAcademicYear}-${selectedYearLevel}-${selectedSemester}`;
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
            <Form.Control name ="acad" as="select" value={selectedAcademicYear} onChange={handleAcademicYearChange}>
            <option value="">Select Acad Year</option>
            {program
    .sort((a, b) => {
      let yearA = parseInt(a.academicYear.split('-')[0]);
      let yearB = parseInt(b.academicYear.split('-')[0]);
      return yearB - yearA; // Sorting in descending order
    })
    .map((program) => (
      <option key={program.academicYear} value={program.academicYear}>
        {program.academicYear}
      </option>
    ))
  }
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="selectedYearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Control 
            name="year" 
            as="select" 
            value={selectedYearLevel} 
            onChange={handleYearLevelChange}
            disabled={!selectedAcademicYear} // Disable if no Academic Year is selected
            >
              <option value="">Select Year Level</option>
            {program
              .filter(p => p.academicYear === selectedAcademicYear) // Filter by selected academic year
              .flatMap(p => p.yearLevels) // Get year levels for selected academic year
              .map(level => (
                <option key={level} value={level}>
                  Year {level}
                </option>
              ))}
          </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="semester">
            <Form.Label>Semester</Form.Label>
            <Form.Control 
            name="sem" 
            as="select" 
            value={selectedSemester} 
            onChange={handleSemesterChange}
            disabled={!selectedYearLevel || !selectedAcademicYear} // Disable if no Year Level is selected
            >
              <option value="">Select Semester</option>
              {program
  .filter(p => p.academicYear === selectedAcademicYear) // Filter by selected academic year
  .flatMap(p => // Flatten semesters after filtering by year level
    p.semesters
      .filter(semester => semester.yearLevel === parseInt(selectedYearLevel)) // Filter semesters by selected year level
      .map(semester => (
        <option key={semester.semester} value={semester.semester}>
          Year {semester.yearLevel} - Semester {semester.semester}
        </option>
      ))
  )
}

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
