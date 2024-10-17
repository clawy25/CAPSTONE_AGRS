import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import CourseModel from '../ReactModels/CourseModel'; 
import '../App.css';
import { UserContext } from '../Context/UserContext';

export default function ProgramHeadEditCourses({ onBack }) {
  const [yearData, setYearData] = useState({ 'First Year': [] });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [newCourse, setNewCourse] = useState({ 
    courseCode: '', 
    courseDescriptiveTitle: '', 
    courseLecture: '', 
    courseLaboratory: '', 
    coursePreRequisite: '', 
    courseUnits: '' 
  });

  const [editCourse, setEditCourse] = useState({ 
    id: '',
    courseCode: '', 
    courseDescriptiveTitle: '', 
    courseLecture: '', 
    courseLaboratory: '', 
    coursePreRequisite: '', 
    courseUnits: '' 
  });

  const [courseToDelete, setCourseToDelete] = useState(null); 

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await CourseModel.fetchExistingCourses();
        setYearData({ 'First Year': fetchedCourses });
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => setShowAddModal(false);

  const handleShowEdit = (course) => {
    setEditCourse(course);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => setShowEditModal(false);

  const handleShowDelete = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };
  const handleCloseDelete = () => setShowDeleteModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCourse((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddCourse = async () => {
    // Check if required fields are filled
    if (!newCourse.courseCode || !newCourse.courseDescriptiveTitle || !newCourse.courseUnits) {
      console.error('Course Code, Descriptive Title, and Units are required');
      return;
    }

    try {
      const createdCourse = await CourseModel.createAndInsertCourse(
        newCourse.courseCode,
        newCourse.courseDescriptiveTitle,
        newCourse.courseLecture,
        newCourse.courseLaboratory,
        newCourse.coursePreRequisite,
        newCourse.courseUnits
      );

      const newCourseData = createdCourse.data && Array.isArray(createdCourse.data) ? createdCourse.data[0] : createdCourse;

      setYearData((prevState) => {
        const updatedYear = [...prevState['First Year'], newCourseData];
        return { ...prevState, 'First Year': updatedYear };
      });

      // Reset the new course inputs
      setNewCourse({
        courseCode: '',
        courseDescriptiveTitle: '',
        courseLecture: '',
        courseLaboratory: '',
        coursePreRequisite: '',
        courseUnits: '',
      });

      handleCloseAdd();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleEditCourse = async () => {
    try {
      await CourseModel.updateCourse(editCourse.id, editCourse);

      setYearData((prevState) => {
        const updatedYear = prevState['First Year'].map((course) =>
          course.id === editCourse.id ? editCourse : course
        );
        return { ...prevState, 'First Year': updatedYear };
      });

      handleCloseEdit();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async () => {
    if (courseToDelete) {
      try {
        await CourseModel.deleteCourse(courseToDelete.id);

        setYearData((prevState) => {
          const updatedYear = prevState['First Year'].filter((course) => course.id !== courseToDelete.id);
          return { ...prevState, 'First Year': updatedYear };
        });

        handleCloseDelete();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const renderTable = (year) => (
    <Table hover className="table table-hover success-border">
      <thead className="table-success">
        <tr>
          <th className='custom-color-green-font custom-font'>Course Code</th>
          <th className='custom-color-green-font custom-font'>Descriptive Title</th>
          <th className='custom-color-green-font custom-font'>Lecture Hours</th>
          <th className='custom-color-green-font custom-font'>Laboratory Hours</th>
          <th className='custom-color-green-font custom-font'>Pre-requisite</th>
          <th className='custom-color-green-font custom-font'>Units</th>
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody className='bg-white'>
        {yearData[year].map((entry, index) => (
          <tr key={index}>
            <td>{entry.courseCode}</td>
            <td>{entry.courseDescriptiveTitle}</td>
            <td>{entry.courseLecture}</td>
            <td>{entry.courseLaboratory}</td>
            <td>{entry.coursePreRequisite}</td>
            <td>{entry.courseUnits}</td>
            <td>
              <Button variant="warning" onClick={() => handleShowEdit(entry)} className="me-2">Edit</Button>
              <Button variant="danger" onClick={() => handleShowDelete(entry)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className='container-fluid bg-white p-2 px-4 rounded'>
      {renderTable('First Year')}
      
      {/* Add Modal */}
      <Modal show={showAddModal} onHide={handleCloseAdd}>
        <Modal.Header closeButton>
          <Modal.Title>Add Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Course Code</Form.Label>
              <Form.Control
                type="text"
                name="courseCode"
                value={newCourse.courseCode}
                onChange={handleInputChange}
                placeholder="Enter Course Code"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descriptive Title</Form.Label>
              <Form.Control
                type="text"
                name="courseDescriptiveTitle"
                value={newCourse.courseDescriptiveTitle}
                onChange={handleInputChange}
                placeholder="Enter Descriptive Title"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Lecture Hours</Form.Label>
              <Form.Control
                type="text"
                name="courseLecture"
                value={newCourse.courseLecture}
                onChange={handleInputChange}
                placeholder="Enter Lecture Hours"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Laboratory Hours</Form.Label>
              <Form.Control
                type="text"
                name="courseLaboratory"
                value={newCourse.courseLaboratory}
                onChange={handleInputChange}
                placeholder="Enter Laboratory Hours"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pre-requisite</Form.Label>
              <Form.Control
                type="text"
                name="coursePreRequisite"
                value={newCourse.coursePreRequisite}
                onChange={handleInputChange}
                placeholder="Enter Pre-requisite"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Units</Form.Label>
              <Form.Control
                type="text"
                name="courseUnits"
                value={newCourse.courseUnits}
                onChange={handleInputChange}
                placeholder="Enter Units"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdd}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddCourse}>
            Add Course
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Course Code</Form.Label>
              <Form.Control
                type="text"
                name="courseCode"
                value={editCourse.courseCode}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descriptive Title</Form.Label>
              <Form.Control
                type="text"
                name="courseDescriptiveTitle"
                value={editCourse.courseDescriptiveTitle}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Lecture Hours</Form.Label>
              <Form.Control
                type="text"
                name="courseLecture"
                value={editCourse.courseLecture}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Laboratory Hours</Form.Label>
              <Form.Control
                type="text"
                name="courseLaboratory"
                value={editCourse.courseLaboratory}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pre-requisite</Form.Label>
              <Form.Control
                type="text"
                name="coursePreRequisite"
                value={editCourse.coursePreRequisite}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Units</Form.Label>
              <Form.Control
                type="text"
                name="courseUnits"
                value={editCourse.courseUnits}
                onChange={handleEditInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditCourse}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this course?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDelete}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDeleteCourse}>
            Delete Course
          </Button>
        </Modal.Footer>
      </Modal>
       {/* Add Subject Button */}
       <div className="d-flex justify-content-end mt-3"> 
        <Button variant="success" onClick={handleShowAdd}>
          Add Course
        </Button>
      </div>
    </div>
    
  );
}
