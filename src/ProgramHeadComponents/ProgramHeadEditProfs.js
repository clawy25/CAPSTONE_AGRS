import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import '../App.css';
import PersonnelModel from '../ReactModels/PersonnelModel';
import { UserContext } from '../Context/UserContext';

export default function ProgramHeadEditProfs({ onBack }) {
  const [professors, setProfessors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProf, setNewProf] = useState({ name: '', email: '', phone: '', sex: '', address: '' });
  const [editProf, setEditProf] = useState({ name: '', email: '', phone: '', sex: '', address: '' });
  const [activeProfIndex, setActiveProfIndex] = useState(null);
  const { user, setUser } = useContext(UserContext);

  // Fetch professors from PersonnelModel when the component mounts
  useEffect(() => {
    async function fetchProfessors() {
      try {
        const data = await PersonnelModel.getProfessors(); // Make sure this is fetching from Supabase correctly
        setProfessors(data);
      } catch (error) {
        console.error('Error fetching professors:', error);
      }
    }

    fetchProfessors();
  }, []);

  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => setShowAddModal(false);

  const handleShowEdit = (professor, index) => {
    setEditProf({
      name: professor.personnelName,
      email: professor.personnelEmail,
      phone: professor.personnelNumber,
      sex: professor.personnelSex,
      address: professor.programName, // Address is being used as programName, ensure this is correct
    });
    setActiveProfIndex(index);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => setShowEditModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProf((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProf((prevState) => ({ ...prevState, [name]: value }));
  };

  // Add professor to the database
  // Add professor to the database
const handleAddProf = async () => {
  const newProfessorData = {
    personnelNumber: newProf.phone,
    personnelPassword: 'AgrsPcc2024',
    personnelName: newProf.name,
    personnelSex: newProf.sex,
    personnelEmail: newProf.email,
    personnelBirthDate: '2022-11-01', // Make sure this date format is valid
    programNumber: user.programNumber,
    programName: user.programName, // Assuming this is the address field
  };

  try {
    // Call insertPersonnel directly with the array
    const response = await PersonnelModel.insertPersonnel(newProfessorData);

    // Check the response for any potential error messages
    if (!response) {
      throw new Error('No response from server');
    }
    handleCloseAdd();
    setProfessors((prevState) => [...prevState, newProfessorData]);
    setNewProf({ name: '', email: '', phone: '', sex: '', address: '' });
    
  } catch (error) {
    console.error('Error adding professor:', error);
  }
};


  // Edit professor in the database
  const handleEditProf = async () => {
    const updatedProfessorData = {
      personnelName: editProf.name,
      personnelEmail: editProf.email,
      personnelNumber: editProf.phone,
      personnelSex: editProf.sex,
       // Ensure this is the right field for address
    };

    try {
      const personnelNumber = professors[activeProfIndex].personnelNumber;
      await PersonnelModel.updatePersonnel(personnelNumber, updatedProfessorData); // Ensure this interacts with your Supabase setup
      setProfessors((prevState) => {
        const updatedProfs = [...prevState];
        updatedProfs[activeProfIndex] = updatedProfessorData;
        return updatedProfs;
      });
      handleCloseEdit();
    } catch (error) {
      console.error('Error updating professor:', error);
    }
  };

  // Delete professor from the database
  const handleDeleteProf = async (index) => {
    const personnelNumber = professors[index].personnelNumber;

    try {
      await PersonnelModel.deletePersonnel(personnelNumber); // Ensure this is deleting from your Supabase
      setProfessors((prevState) => prevState.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting professor:', error);
    }
  };

  const renderTable = () => (
    <Table hover className="table table-hover success-border">
      <thead className="table-success">
        <tr>
          <th className='custom-color-green-font custom-font'>Name</th>
          <th className='custom-color-green-font custom-font'>Email</th>
          <th className='custom-color-green-font custom-font'>Phone Number</th>
          <th className='custom-color-green-font custom-font'>Sex</th>
          <th className='custom-color-green-font custom-font'>Address</th>
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {professors.length > 0 ? (
          professors.map((professor, index) => (
            <tr key={index}>
              <td>{professor.personnelName}</td>
              <td>{professor.personnelEmail}</td>
              <td>{professor.personnelNumber}</td>
              <td>{professor.personnelSex}</td>
              <td>{professor.programName}</td> {/* Replace with address field if necessary */}
              <td>
                <button 
                  className="btn btn-warning" 
                  onClick={() => handleShowEdit(professor, index)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteProf(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">No data available</td>
          </tr>
        )}
      </tbody>
    </Table>
  );

  return (
    <div className='container-fluid bg-white p-2 px-4 rounded'>
      {renderTable()}

      {/* Modal for adding a professor */}
      <Modal show={showAddModal} onHide={handleCloseAdd}>
        <Modal.Header closeButton>
          <Modal.Title>Add Professor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newProf.name}
                onChange={handleInputChange}
                placeholder="Enter Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newProf.email}
                onChange={handleInputChange}
                placeholder="Enter Email"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={newProf.phone}
                onChange={handleInputChange}
                placeholder="Enter Phone Number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sex</Form.Label>
              <Form.Control
                as="select"
                name="sex"
                value={newProf.sex}
                onChange={handleInputChange}
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={newProf.address}
                onChange={handleInputChange}
                placeholder="Enter Address"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdd}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddProf}>
            Add Professor
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for editing a professor */}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Professor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editProf.name}
                onChange={handleEditInputChange}
                placeholder="Enter Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editProf.email}
                onChange={handleEditInputChange}
                placeholder="Enter Email"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={editProf.phone}
                onChange={handleEditInputChange}
                placeholder="Enter Phone Number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sex</Form.Label>
              <Form.Control
                as="select"
                name="sex"
                value={editProf.sex}
                onChange={handleEditInputChange}
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={editProf.address}
                onChange={handleEditInputChange}
                placeholder="Enter Address"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditProf}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Professor Button positioned at the bottom right below the table */}
      <div className="d-flex justify-content-end mt-3">
        <Button variant="success" onClick={handleShowAdd}>
          Add Professor
        </Button>
      </div>
    </div>
  );
}
