import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Table, Modal, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import SubjectModel from './SubjectModel'; // Adjust the import path as necessary
import '../App.css';

export default function ProgramHeadEditSubjects({ onBack }) {
  const [yearData, setYearData] = useState({
    'First Year': [],
    'Second Year': [],
    'Third Year': [],
    'Fourth Year': [],
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ subjectCode: '', subjectName: '', programName: '' });
  const [editSubject, setEditSubject] = useState({ subjectCode: '', subjectName: '', programName: '' });
  const [activeYear, setActiveYear] = useState('First Year');

  useEffect(() => {
    // Fetch all subjects when the component mounts
    const fetchSubjects = async () => {
      try {
        const subjects = await SubjectModel.fetchAllSubjects();
        // Categorize subjects by year (Assuming you have some logic to determine year)
        const categorizedSubjects = categorizeSubjects(subjects);
        setYearData(categorizedSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  const categorizeSubjects = (subjects) => {
    // Implement your logic to categorize subjects by year
    // This is a placeholder implementation; adjust based on your data structure
    return {
      'First Year': subjects.filter(sub => sub.programName === 'First Year'),
      'Second Year': subjects.filter(sub => sub.programName === 'Second Year'),
      'Third Year': subjects.filter(sub => sub.programName === 'Third Year'),
      'Fourth Year': subjects.filter(sub => sub.programName === 'Fourth Year'),
    };
  };

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

  const handleAddSubject = async () => {
    try {
      const newSubjectData = await SubjectModel.createAndInsertSubject(newSubject.subjectCode, newSubject.subjectName, newSubject.programName);
      setYearData((prevState) => {
        const updatedYear = [...prevState[activeYear], newSubjectData];
        return { ...prevState, [activeYear]: updatedYear };
      });
      setNewSubject({ subjectCode: '', subjectName: '', programName: '' });
      handleCloseAdd();
    } catch (error) {
      console.error('Error adding subject:', error);
    }
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

  const handleDeleteSubject = async (subjectCode) => {
    // Implement the delete functionality as needed
    setYearData((prevState) => {
      const updatedYear = prevState[activeYear].filter((subject) => subject.subjectCode !== subjectCode);
      return { ...prevState, [activeYear]: updatedYear };
    });
    // Call the appropriate API to delete the subject from the database
  };

  const renderTable = (year) => (
    <Table hover className="table table-hover success-border">
      <thead className="table-success">
        <tr>
          <th className='custom-color-green-font custom-font'>Subject Code</th>
          <th className='custom-color-green-font custom-font'>Subject Name</th>
          <th className='custom-color-green-font custom-font'>Program Name</th>
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody className='bg-white'>
        {yearData[year].map((entry, index) => (
          <tr key={index}>
            <td>{entry.subjectCode}</td>
            <td>{entry.subjectName}</td>
            <td>{entry.programName}</td>
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
      <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
        Add Subject
      </Button>

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
            <Form.Group className="mb-3">
              <Form.Label>Program Name</Form.Label>
              <Form.Control
                type="text"
                name="programName"
                value={newSubject.programName}
                onChange={handleInputChange}
                placeholder="Enter Program Name"
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
            <Form.Group className="mb-3">
              <Form.Label>Program Name</Form.Label>
              <Form.Control
                type="text"
                name="programName"
                value={editSubject.programName}
                onChange={handleEditInputChange}
                placeholder="Enter Program Name"
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

      <Button variant="secondary" className="mt-3" onClick={onBack}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </Button>
    </div>
  );
}
