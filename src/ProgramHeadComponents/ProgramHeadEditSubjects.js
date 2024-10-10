import React, { useState } from 'react';
import { Tab, Tabs, Table, Modal, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; 
import '../App.css';

export default function ProgramHeadEditSubjects({ onBack }) { 
  const [yearData, setYearData] = useState({
    'First Year': [
      { subjectCode: 'MATH101', subjectName: 'Mathematics' },
      { subjectCode: 'ENG101', subjectName: 'English' },
      { subjectCode: 'CS101', subjectName: 'Computer Science' },
    ],
    'Second Year': [
      { subjectCode: 'PHYS201', subjectName: 'Physics' },
      { subjectCode: 'CHEM201', subjectName: 'Chemistry' },
      { subjectCode: 'BIO201', subjectName: 'Biology' },
    ],
    'Third Year': [
      { subjectCode: 'STAT301', subjectName: 'Statistics' },
      { subjectCode: 'HIST301', subjectName: 'History' },
      { subjectCode: 'PHIL301', subjectName: 'Philosophy' },
    ],
    'Fourth Year': [
      { subjectCode: 'ECO401', subjectName: 'Economics' },
      { subjectCode: 'SOC401', subjectName: 'Sociology' },
      { subjectCode: 'ART401', subjectName: 'Art History' },
    ],
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ subjectCode: '', subjectName: '' });
  const [editSubject, setEditSubject] = useState({ subjectCode: '', subjectName: '' });
  const [activeYear, setActiveYear] = useState('First Year');

  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => setShowAddModal(false);

  const handleShowEdit = (subject) => {
    setEditSubject(subject);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => setShowEditModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditSubject((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddSubject = () => {
    setYearData((prevState) => {
      const updatedYear = [...prevState[activeYear], newSubject];
      return { ...prevState, [activeYear]: updatedYear };
    });
    setNewSubject({ subjectCode: '', subjectName: '' });
    handleCloseAdd(); 
  };

  const handleEditSubject = () => {
    setYearData((prevState) => {
      const updatedYear = prevState[activeYear].map((subject) => 
        subject.subjectCode === editSubject.subjectCode ? editSubject : subject
      );
      return { ...prevState, [activeYear]: updatedYear };
    });
    handleCloseEdit();
  };

  const handleDeleteSubject = (subjectCode) => {
    setYearData((prevState) => {
      const updatedYear = prevState[activeYear].filter((subject) => subject.subjectCode !== subjectCode);
      return { ...prevState, [activeYear]: updatedYear };
    });
  };

  const renderTable = (year) => (
    <Table hover className="table table-hover success-border">
      <thead className="table-success">
        <tr>
          <th className='custom-color-green-font custom-font'>Subject Code</th>
          <th className='custom-color-green-font custom-font'>Subject Name</th>
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody className='bg-white'>
        {yearData[year].map((entry, index) => (
          <tr key={index}>
            <td>{entry.subjectCode}</td>
            <td>{entry.subjectName}</td>
            <td>
              <Button variant="warning" onClick={() => handleShowEdit(entry)} className="me-2">Edit</Button>
              <Button variant="danger" onClick={() => handleDeleteSubject(entry.subjectCode)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div className='container-fluid bg-white p-2 px-4 rounded'>
      <Tabs defaultActiveKey="firstYear" id="year-tabs" className="mb-3 text-success">
        <Tab eventKey="firstYear" title={<span className="custom-color-green-font custom-font">First Year</span>} onClick={() => setActiveYear('First Year')}>
          {renderTable('First Year')}
        </Tab>
        <Tab eventKey="secondYear" title={<span className="custom-color-green-font custom-font">Second Year</span>} onClick={() => setActiveYear('Second Year')}>
          {renderTable('Second Year')}
        </Tab>
        <Tab eventKey="thirdYear" title={<span className="custom-color-green-font custom-font">Third Year</span>} onClick={() => setActiveYear('Third Year')}>
          {renderTable('Third Year')}
        </Tab>
        <Tab eventKey="fourthYear" title={<span className="custom-color-green-font custom-font">Fourth Year</span>} onClick={() => setActiveYear('Fourth Year')}>
          {renderTable('Fourth Year')}
        </Tab>
      </Tabs>

      {/* Modal for adding a subject */}
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

      {/* Modal for editing a subject */}
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
                disabled // Prevent editing of the subject code
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

      {/* Add Subject Button positioned at the bottom right below the table */}
      <div className="d-flex justify-content-end mt-3">
        <Button variant="success" onClick={handleShowAdd}>
          Add Subject
        </Button>
      </div>
    </div>
  );
}
