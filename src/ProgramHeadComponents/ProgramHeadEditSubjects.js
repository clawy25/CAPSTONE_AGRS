import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import SubjectModel from '../ReactModels/SubjectModel'; 
import '../App.css';
import { UserContext } from '../Context/UserContext';

export default function ProgramHeadEditSubjects({ onBack }) {
  const [yearData, setYearData] = useState({ 'First Year': [] });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ subjectCode: '', subjectName: '', subjectUnits: '' });
  const [editSubject, setEditSubject] = useState({ id: '', subjectCode: '', subjectName: '', subjectUnits: '' });
  const [subjectToDelete, setSubjectToDelete] = useState(null); // State to hold the subject being deleted

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const fetchedSubjects = await SubjectModel.fetchExistingSubjects();
        setYearData({ 'First Year': fetchedSubjects });
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => setShowAddModal(false);

  const handleShowEdit = (subject) => {
    setEditSubject(subject);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => setShowEditModal(false);

  const handleShowDelete = (subject) => {
    setSubjectToDelete(subject);
    setShowDeleteModal(true);
  };
  const handleCloseDelete = () => setShowDeleteModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditSubject((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddSubject = async () => {
    // Validate input data
    if (!newSubject.subjectCode || !newSubject.subjectName || !newSubject.subjectUnits) {
      console.error('Subject Code, Name, and Units are required');
      return;
    }

    try {
      // Create and insert the subject
      const createdSubject = await SubjectModel.createAndInsertSubject(
        newSubject.subjectCode,
        newSubject.subjectName,
        user.programNumber,
        newSubject.subjectUnits
      );
  
      const newSubjectData = createdSubject.data ? createdSubject.data : createdSubject;
  
      // Update the yearData with the newly added subject
      setYearData((prevState) => {
        const updatedYear = [...prevState['First Year'], newSubjectData]; 
        return { ...prevState, 'First Year': updatedYear };
      });
  
      // Reset the newSubject state and close modal
      setNewSubject({ subjectCode: '', subjectName: '',programNumber: '', subjectUnits: '' });
      handleCloseAdd();
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleEditSubject = async () => {
    try {
      await SubjectModel.updateSubject(editSubject.id, editSubject);

      setYearData((prevState) => {
        const updatedYear = prevState['First Year'].map((subject) =>
          subject.id === editSubject.id ? editSubject : subject
        );
        return { ...prevState, 'First Year': updatedYear };
      });

      handleCloseEdit();
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const handleDeleteSubject = async () => {
    if (subjectToDelete) {
      try {
        await SubjectModel.deleteSubject(subjectToDelete.id);

        setYearData((prevState) => {
          const updatedYear = prevState['First Year'].filter((subject) => subject.id !== subjectToDelete.id);
          return { ...prevState, 'First Year': updatedYear };
        });

        handleCloseDelete();
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const renderTable = (year) => (
    <Table hover className="table table-hover success-border">
      <thead className="table-success">
        <tr>
          <th className='custom-color-green-font custom-font'>Subject Code</th>
          <th className='custom-color-green-font custom-font'>Subject Name</th>
          <th className='custom-color-green-font custom-font'>Units</th>
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody className='bg-white'>
        {yearData[year].map((entry, index) => (
          <tr key={index}>
            <td>{entry.subjectCode}</td>
            <td>{entry.subjectName}</td>
            <td>{entry.subjectUnits}</td>
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
          <Modal.Title>Add Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject Code</Form.Label>
              <Form.Control
                type="text"
                name="subjectCode"
                value={newSubject.subjectCode}
                onChange={handleInputChange}
                placeholder="Enter Subject Code"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control
                type="text"
                name="subjectName"
                value={newSubject.subjectName}
                onChange={handleInputChange}
                placeholder="Enter Subject Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject Units</Form.Label>
              <Form.Control
                type="text"
                name="subjectUnits"
                value={newSubject.subjectUnits}
                onChange={handleInputChange}
                placeholder="Enter Subject Units"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdd}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddSubject}>
            Add Subject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject Code</Form.Label>
              <Form.Control
                type="text"
                name="subjectCode"
                value={editSubject.subjectCode}
                onChange={handleEditInputChange}
                placeholder="Enter Subject Code"
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control
                type="text"
                name="subjectName"
                value={editSubject.subjectName}
                onChange={handleEditInputChange}
                placeholder="Enter Subject Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject Units</Form.Label>
              <Form.Control
                type="text"
                name="subjectUnits"
                value={editSubject.subjectUnits}
                onChange={handleEditInputChange}
                placeholder="Enter Subject Units"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSubject}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this subject?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSubject}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

       {/* Add Subject Button positioned at the bottom right below the table */} 
       <div className="d-flex justify-content-end mt-3"> 
        <Button variant="success" onClick={handleShowAdd}> Add Subject </Button>
      </div>
    </div>
  );
}
