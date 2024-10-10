import React, { useState } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import '../App.css';

export default function ProgramHeadEditProfs({ onBack }) {
  const [professors, setProfessors] = useState([
    { name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890', sex: 'Male', address: '123 Main St' },
    { name: 'Jane Smith', email: 'jane.smith@example.com', phone: '987-654-3210', sex: 'Female', address: '456 Elm St' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProf, setNewProf] = useState({ name: '', email: '', phone: '', sex: '', address: '' });
  const [editProf, setEditProf] = useState({ name: '', email: '', phone: '', sex: '', address: '' });
  const [activeProfIndex, setActiveProfIndex] = useState(null);

  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => setShowAddModal(false);

  const handleShowEdit = (professor, index) => {
    setEditProf(professor);
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

  const handleAddProf = () => {
    setProfessors((prevState) => [...prevState, newProf]);
    setNewProf({ name: '', email: '', phone: '', sex: '', address: '' });
    handleCloseAdd();
  };

  const handleEditProf = () => {
    setProfessors((prevState) => {
      const updatedProfs = [...prevState];
      updatedProfs[activeProfIndex] = editProf; // Update the edited professor
      return updatedProfs;
    });
    handleCloseEdit();
  };

  const handleDeleteProf = (index) => {
    setProfessors((prevState) => prevState.filter((_, i) => i !== index));
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
      <tbody className='bg-white'>
        {professors.map((prof, index) => (
          <tr key={index}>
            <td>{prof.name}</td>
            <td>{prof.email}</td>
            <td>{prof.phone}</td>
            <td>{prof.sex}</td>
            <td>{prof.address}</td>
            <td>
              <Button variant="warning" onClick={() => handleShowEdit(prof, index)} className="me-2">Edit</Button>
              <Button variant="danger" onClick={() => handleDeleteProf(index)}>Delete</Button>
            </td>
          </tr>
        ))}
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
              <Form.Label>Phone Number</Form.Label>
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
              <Form.Label>Phone Number</Form.Label>
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
