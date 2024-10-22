import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel'; // Update with the actual path
import '../App.css';

export default function HeadRegistrarAcademicYear() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);


  const [newAcademicYear, setNewAcademicYear] = useState({
    academicYear: '',
    isCurrent: false,
  });

  const [editAcademicYear, setEditAcademicYear] = useState({
    academicYear: '',
    isCurrent: false,
  });


  // Fetch academic years when the component loads
  const fetchAcademicYears = async () => {
    try {
      const years = await AcademicYearModel.fetchExistingAcademicYears();
      setAcademicYears(years);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => {
    setShowAddModal(false);
    setNewAcademicYear({ academicYear: '', isCurrent: false }); // Reset state
  };

  const handleShowEdit = (year) => {
    setEditAcademicYear(year); // Set the selected year to the edit state
    setShowEditModal(true); // Show the modal
  };
  
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditAcademicYear({ academicYear: '', isCurrent: false }); // Reset state
  };



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;
    if (showAddModal) {
      setNewAcademicYear((prevState) => ({ ...prevState, [name]: updatedValue }));
    } else {
      setEditAcademicYear((prevState) => ({ ...prevState, [name]: updatedValue }));
    }
  };

 
  const handleAddAcademicYear = async () => {
    try {
        // Create and insert the new academic year
        const createdYear = await AcademicYearModel.createAndInsertAcademicYear(newAcademicYear);
        console.log('Created Year:', createdYear);

        // Append the newly created year to the existing academic years
        setAcademicYears((prevYears) => [...prevYears, createdYear]);

        // Automatically close the add modal
        handleCloseAdd();
    } catch (error) {
        console.error('Error adding academic year:', error);
    }
};


  

  // Handle editing an academic year
  const handleEditAcademicYear = async () => {
    try {
      const updatedYear = await AcademicYearModel.updateAcademicYear(editAcademicYear.id, editAcademicYear);
      console.log('Updated Year:', updatedYear);

      // Refetch the data to include the updated record
      await fetchAcademicYears();
    } catch (error) {
      console.error('Error updating academic year:', error);
    }
    handleCloseEdit(); // Close modal after editing
  };

  // Handle deleting an academic year


  // Render the table
  const renderTable = () => (
    <Table bordered rounded hover className="table success-border">
      <thead className='table-success'>
        <tr>
          <th className='custom-color-green-font custom-font'>Academic Year</th>
          <th className='custom-color-green-font custom-font'>Is Current</th>
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {academicYears
          .filter((year) => year && year.academicYear) // Filter out null or invalid entries
          .map((year, index) => (
            <tr key={index}>
              <td>{year.academicYear}</td>
              <td>{year.isCurrent ? 'Yes' : 'No'}</td>
              <td>
                <Button variant="success" onClick={() => handleShowEdit(year)} className="me-2">Edit</Button>
              
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );

  if (loading) return <Spinner animation="border" role="status" />;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <div className="container-fluid bg-white p-4 rounded">
      <h2>Academic Years</h2>
      
      {renderTable()}

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={handleCloseAdd}>
        <Modal.Header closeButton>
          <Modal.Title>Add Academic Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Academic Year</Form.Label>
              <Form.Control
                type="text"
                name="academicYear"
                value={newAcademicYear.academicYear}
                onChange={handleInputChange}
                placeholder="Enter Academic Year"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Current"
                name="isCurrent"
                checked={newAcademicYear.isCurrent}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdd}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddAcademicYear}>
            Add Academic Year
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Academic Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Academic Year</Form.Label>
              <Form.Control
                type="text"
                name="academicYear"
                value={editAcademicYear.academicYear}
                onChange={handleInputChange}
                placeholder="Enter Academic Year"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Current"
                name="isCurrent"
                checked={editAcademicYear.isCurrent}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditAcademicYear}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

   
      
      {/* Add Academic Year Button */}
      <div className="d-flex justify-content-end mt-3">
        <Button variant="success" onClick={handleShowAdd}>
          Add Academic Year
        </Button>
      </div>
    </div>
  );
}
