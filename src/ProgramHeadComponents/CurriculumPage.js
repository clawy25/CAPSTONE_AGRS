import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
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

  //const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]); // State to hold course data for the selected academic year, year level, and semester
  const [showModal, setShowModal] = useState(false); // State to toggle Add/Edit modal
  const [currentCourse, setCurrentCourse] = useState(null); // Track the course being edited

  
  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      //const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
      //setAcademicYears(fetchedAcademicYears);
  
      const programs = await ProgramModel.fetchAllPrograms();
      const userProgram = programs.filter(program => program.programNumber === user.programNumber);
  
      if (userProgram.length > 0) {

        const data = [];

        userProgram.forEach(row => {
          // Find if there is an existing entry for the academic year
          let existingAcadYear = data.find(item => item.academicYear === row.academicYear);
        
          if (!existingAcadYear) {
            // If not found, create a new entry

            const yearLevels = [];
            const numYrs = row.programNumOfYear;
            const summerlevels = [];


              userProgram.forEach(row => {
                summerlevels.push(row.programYrLvlSummer);  
              });
            
            for (let i = 1; i <= numYrs; i++){

              const semesters = [];
              let isSummer = false;
              
              //For loop [0, 1, 2] to iterate per value summerLevelValue
              for (let j = 0; j < summerlevels.length; j++) {
                if (summerlevels[j] === i) {
                  isSummer = true;
                  
                  break;
                }
              }

              if(isSummer){
                for (let x = 1; x <= 3; x++) {
                  semesters.push(x);
                }
              } else{
                for (let x = 1; x <= 2; x++) {
                  semesters.push(x);
                }
              }

              yearLevels.push({
                yearLevel: i,
                semesters: semesters,
              });
            }
            /*
            cnost summerlevels = [];
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
            }*/
            const entry = {
              academicYear: row.academicYear,
              yearLevels: yearLevels,
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


  // Fetch the courses based on selected academic year, year level, and semester
  const fetchCourses = async () => {
    try {
      //Insert Fetch function for getting courses based on 3 input variables
      const courseData = await CourseModel.getCoursesbyProgram(
        selectedAcademicYear,
        selectedYearLevel,
        selectedSemester,
        user.programNumber);

      if(courseData){
          setCourses(courseData); // Update the courses state with fetched data
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  
  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, []);

  // Trigger fetchCourses whenever academicYear, selectedYearLevel, or semester changes
  useEffect(() => {
    if (selectedAcademicYear && selectedYearLevel && selectedSemester) {
      setCourses([]);
      fetchCourses();
    }
  }, [selectedAcademicYear, selectedYearLevel, selectedSemester]);

  const handleView = async() => {
    if (selectedAcademicYear && selectedYearLevel && selectedSemester) {
      setShowTable(true);
    }
  };

  const handleAcademicYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedAcademicYear(selectedYear);
    setSelectedYearLevel('');  // Reset Year Level when Academic Year changes
    setSelectedSemester('');
    setShowTable(false);
  };

  const handleYearLevelChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYearLevel(selectedYear);
    setSelectedSemester(''); // Reset Semester when Year Level changes
    setShowTable(false);
  };

  const handleSemesterChange = (e) => {
    const level = (e.target.value);
    setSelectedSemester(level);
    setShowTable(false);
  };

  const getNextCourseId = async () => {
    try {
        // Fetch all existing courses
        const allExistingCourses = await CourseModel.fetchAllCourses();

        // Find the highest id
        const highestId = allExistingCourses.length > 0 
            ? Math.max(...allExistingCourses.map(course => course.id)) 
            : 0;

        // Increment by 1 to get the next available id
        return highestId + 1;
    } catch (error) {
        console.error("Error fetching courses:", error);
        return 1; // Default id if fetching fails
    }
  };


  // Handle course form submission
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    
    console.log(courses);
  
    const form = e.target;
    const updatedCourse = {
      id: currentCourse?.id || await getNextCourseId(),
      courseCode: form.courseCode.value,
      courseDescriptiveTitle: form.title.value,
      courseLecture: parseInt(form.lectureUnits.value) || 0,
      courseLaboratory: parseInt(form.labUnits.value)|| 0,
      coursePreRequisite: form.prerequisite.value || 'None',
      programNumber: user.programNumber, 
      courseYearLevel: parseInt(selectedYearLevel), 
      courseSemester: parseInt(selectedSemester), 
      isBridgingCourse: Boolean(form.bridging.checked) || false, //Update Needed
      academicYear: selectedAcademicYear
    };
    
    if (currentCourse) {

      try {
        await CourseModel.updateCourse(updatedCourse);
        
    } catch (error) {
        console.error("Error updating course:", error);
    }
    } else {
      try{
        await CourseModel.createAndInsertCourse(updatedCourse);
      }
      catch (error){
        console.error("Error creating course:", error);
      }
    }
    fetchCourses(); //Update the Courses
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

  const handleDeleteCourse = (course) => {
    
    CourseModel.deleteCourse(course);
    fetchCourses();
  };

  const getSemesterText = (sem) => {
    switch (sem) {
      case 1:
        return "First";
      case 2:
        return "Second";
      case 3:
        return "Summer";
      default:
        return `${sem} Semester`;
    }
  };

  
  const selectedYearData = program?.filter(p => p.academicYear === selectedAcademicYear)
                                 ?.flatMap(p => p.yearLevels)
                                 ?.find(p => p.yearLevel === Number(selectedYearLevel));
  return (
    <div>
      <h2 className="custom-font custom-color-green-font">Curriculum</h2>
      <Row className="mb-4 bg-white rounded p-3 m-1">
        <Col>
          <Form.Group controlId="academicYear">
            <Form.Label>Academic Year</Form.Label>
            <Form.Control name ="acad" as="select" value={selectedAcademicYear} onChange={handleAcademicYearChange}>
            <option value="">Select Academic Year</option>
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
            disabled={!selectedAcademicYear}>
              <option value="">Select Year Level</option>
              {program
                ?.filter(p => p.academicYear === selectedAcademicYear) // Filter by selected academic year
                ?.flatMap(p => p.yearLevels) // Get year levels for selected academic year
                ?.map(level => (
                  <option key={level.yearLevel} value={level.yearLevel}>
                    Year {level.yearLevel}
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
          disabled={!selectedYearLevel || !selectedAcademicYear}>
            <option value="">Select Semester</option>
              {selectedYearData?.semesters?.map((sem, index) => (
                <option key={index} value={sem}>
                  {getSemesterText(sem)}
                </option>
              ))}
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
                <th>Bridging Course?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseDescriptiveTitle}</td>
                  <td>{course.courseLecture}</td>
                  <td>{course.courseLaboratory}</td>
                  <td>{course.coursePreRequisite}</td>
                  <td>{course.isBridgingCourse? 'Yes' : 'No'}</td>
                  <td>
                    <Button variant="success" className="me-2" onClick={() => handleEditCourse(course)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteCourse(course)}>
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
                defaultValue={currentCourse ? currentCourse.courseDescriptiveTitle : ''}
                required
              />
            </Form.Group>
            <Form.Group controlId="lectureUnits">
              <Form.Label>Lecture Units</Form.Label>
              <Form.Control
                type="number"
                defaultValue={currentCourse ? currentCourse.courseLecture : ''}
                required
              />
            </Form.Group>
            <Form.Group controlId="labUnits">
              <Form.Label>Laboratory Units</Form.Label>
              <Form.Control
                type="number"
                defaultValue={currentCourse ? currentCourse.courseLaboratory : ''}
                required
              />
            </Form.Group>
            <Form.Group controlId="prerequisite">
              <Form.Label>Pre-requisite</Form.Label>
              <Form.Control
                type="text"
                defaultValue={currentCourse ? currentCourse.coursePreRequisite : ''}
                placeholder="If none, leave this blank"
              />
            </Form.Group>
            
            <Form.Group controlId="bridging">
              <Form.Label>Bridging Course</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Bridging Course"
                  defaultChecked={currentCourse ? currentCourse.isBridgingCourse : false}
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
