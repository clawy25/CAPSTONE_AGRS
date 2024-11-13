import { useEffect, useState } from 'react';
import { Table, Form, Button, Modal, Card } from 'react-bootstrap';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';

const ScheduleTable = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]); // Store sections
  const [selectedSection, setSelectedSection] = useState(''); // Store selected section

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // You can replace this with the appropriate method if you need to filter by program
        const data = await CourseModel.fetchAllCourses(); 

        // If you need to use getCoursesbyProgram, uncomment the next line and provide the necessary parameters
        // const data = await CourseModel.getCoursesbyProgram(academicYear, yearLevel, semester, programNumber);

        // Format the data to match your table's structure
        const formattedCourses = data.map(course => ({
          id: course.courseCode, // Assuming courseCode is the unique identifier
          description: course.courseDescriptiveTitle,
          lectureHours: course.courseLecture,
          labHours: course.courseLaboratory,
          creditedUnits: course.creditedUnits, // Ensure this field exists or is calculated
          schedule: '', // If you have a schedule field, use it here
          checked: false, // Default value for checkbox
        }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error.message);
      }
    };

    const fetchSections = async () => {
      try {
        const data = await SectionModel.fetchAllSections(); // Assuming you have a method to fetch sections
        setSections(data);
      } catch (error) {
        console.error('Error fetching sections:', error.message);
      }
    };

    fetchCourses();
    fetchSections();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [userSelectedCount, setUserSelectedCount] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleCheckboxChange = (subjectId) => {
    setCourses((prevSubjects) =>
      prevSubjects.map((subject) =>
        subject.id === subjectId ? { ...subject, checked: !subject.checked } : subject
      )
    );
  };

  const handleSaveAndAssess = () => {
    const checkedBoxesCount = courses.filter(subject => subject.checked).length;
    setCheckedCount(checkedBoxesCount);
    setShowModal(true);
  };

  const handleNumberClick = (number) => {
    setUserSelectedCount(number);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (userSelectedCount === checkedCount) {
      setIsEnrolled(true);
    }
  };

  return (
    <section className='container-fluid ms-0'>
      {!isEnrolled && (
        <div>
          <div 
            className="class-info-row mb-3 p-2 border border-success rounded"
            style={{
              fontSize: '14px', 
              backgroundColor: '#e9f5ea',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <span className="text-muted" style={{ flex: 1 }}>
              <strong>Select a section to review a schedule that is favorable to you.</strong>
            </span>
            <Form.Select
              aria-label="Select Section"
              value={selectedSection}
              onChange={handleSectionChange}
              className="form-select-sm"
              style={{ width: '200px' }}
            >
              <option value="">Select a section</option>
              {sections.map((section, index) => (
                <option key={index} value={section.id}>
                  {section.name}
                </option>
              ))}
            </Form.Select>
          </div>

      
        {/* Courses Table */}
        <div className="card card-success border-success rounded mb-4">
          <span className="card-header bg-custom-color-green text-white custom-font fs-5 ms-0">
            Check all the courses and schedule to enroll:
          </span>
      
          <div className="table-responsive">
            <Table hover className="mt-2">
              <thead>
                <tr>
                  <th className="text-success custom-font">#</th>
                  <th className="text-success custom-font">Subject Code</th>
                  <th className="text-success custom-font">Select</th>
                  <th className="text-success custom-font">Subject Description</th>
                  <th className="text-success custom-font">Lecture Units</th>
                  <th className="text-success custom-font">Lab Units</th>
                  <th className="text-success custom-font">Schedule</th>
                  <th className="text-success custom-font">Professor</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={course.id}>
                    <td className="custom-font">{index + 1}</td>
                    <td className="custom-font">{course.id}</td> {/* Subject Code */}
                    <td className="custom-font">
                      <Form.Check
                        type="checkbox"
                        checked={course.checked}
                        onChange={() => handleCheckboxChange(course.id)}
                        className="m-0"
                      />
                    </td>
                    <td className="custom-font">{course.description}</td>
                    <td className="custom-font">{course.lectureHours}</td> {/* Lecture Units */}
                    <td className="custom-font">{course.labHours}</td> {/* Lab Units */}
                    <td className="custom-font">{course.schedule || 'N/A'}</td> {/* Schedule */}
                    <td className="custom-font">{course.professor || 'N/A'}</td> {/* Professor */}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          </div>
        </div>
      )}

      <Button 
        className='btn bg-custom-color-green' 
        onClick={handleSaveAndAssess} 
        style={{ marginTop: '20px' }}
      >
        Save & Assess
      </Button>

      {/* Modal for confirming the selected number of courses */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Number of Checked Boxes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have checked {checkedCount} courses. Please confirm the count by selecting a number:</p>
          <div className="d-flex flex-wrap gap-2">
            {[...Array(10).keys()].map(i => (
              <Button
                key={i + 1}
                variant={userSelectedCount === i + 1 ? 'success' : 'outline-success'}
                onClick={() => handleNumberClick(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="success" onClick={handleCloseModal} disabled={userSelectedCount !== checkedCount}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Enrollment confirmation */}
      {isEnrolled && (
        <Card className="mt-4">
          <Card.Header className="bg-custom-color-green text-white">
            <strong>You are qualified for Free Higher Education Act.</strong>
          </Card.Header>
          <Card.Body className="text-center">
            <h5 className="text-success fs-3 custom-font">
              You are officially enrolled.
            </h5>
            <p>(S.Y. 2425 - First Semester)</p>
            <Button className='bg-custom-color-green'>
              Certificate of Registration
            </Button>
          </Card.Body>
        </Card>
      )}
    </section>
  );
};

export default ScheduleTable;
