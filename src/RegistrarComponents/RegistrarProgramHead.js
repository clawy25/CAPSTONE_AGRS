import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import PersonnelModel from '../ReactModels/PersonnelModel';
import { UserContext } from '../Context/UserContext';

export default function RegistrarProgramHead({ onBack }) {
  const [programHeads, setProgramHeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newProgramHead, setNewProgramHead] = useState({ number: '', firstname: '', middlename: '', lastname: '', personnelType: 'Head' });
  const [editProgramHead, setEditProgramHead] = useState({ number: '', firstname: '', middlename: '', lastname: '', personnelType: 'Head' });
  const [activeProgramHeadIndex, setActiveProgramHeadIndex] = useState(null);
  const { user } = useContext(UserContext);

  // Fetch program heads when the component mounts
  useEffect(() => {
    async function fetchProgramHeads() {
      try {
        // Get the program number from user context
        const programNumber = user.programNumber; 
  
        // Get the current academic year from sessionStorage
        const currentAcadYear = sessionStorage.getItem('currentAcadYear'); 
  
        // Fetch all personnel data using programNumber and currentAcadYear
        const personnelData = await PersonnelModel.LoginPersonnelData(programNumber, currentAcadYear); 
  
        // Assuming personnelData is a single PersonnelModel instance,
        // you may need to modify this if the API returns a list of personnel.
        const headProgramHeads = [personnelData].filter((personnel) => personnel.personnelType === 'Head'); 
  
        // Set the filtered program heads to state
        setProgramHeads(headProgramHeads); 
      } catch (error) {
        console.error('Error fetching program heads:', error);
      }
    }
  
    fetchProgramHeads();
  }, [user.programNumber]);
  

  // Handlers for modal visibility
  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => setShowAddModal(false);

  const handleShowEdit = (programHead, index) => {
    setEditProgramHead({
      number: programHead.personnelNumber,
      firstname: programHead.personnelNameFirst,
      middlename: programHead.personnelNameMiddle,
      lastname: programHead.personnelNameLast,
      personnelType: programHead.personnelType,
    });
    setActiveProgramHeadIndex(index);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => setShowEditModal(false);
  const handleShowView = (programHead) => {
    setEditProgramHead(programHead);
    setShowViewModal(true);
  };

  const handleCloseView = () => setShowViewModal(false);

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProgramHead((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProgramHead((prevState) => ({ ...prevState, [name]: value }));
  };

  // Add program head to the database
  const handleAddProgramHead = async () => {
    const newProgramHeadData = {
      personnelNumber: newProgramHead.number,
      personnelNameFirst: newProgramHead.firstname,
      personnelNameMiddle: newProgramHead.middlename,
      personnelNameLast: newProgramHead.lastname,
      personnelType: newProgramHead.personnelType,
    };

    try {
      const response = await PersonnelModel.insertPersonnel(newProgramHeadData);
      if (response) {
        setProgramHeads((prevState) => [...prevState, newProgramHeadData]); // Add new head to state
        handleCloseAdd();
        setNewProgramHead({ number: '', firstname: '', middlename: '', lastname: '', personnelType: 'Head' });
      }
    } catch (error) {
      console.error('Error adding program head:', error);
    }
  };

  // Edit program head in the database
  const handleEditProgramHead = async () => {
    const updatedProgramHeadData = {
      personnelNumber: editProgramHead.number,
      personnelNameFirst: editProgramHead.firstname,
      personnelNameMiddle: editProgramHead.middlename,
      personnelNameLast: editProgramHead.lastname,
      personnelType: editProgramHead.personnelType,
    };

    try {
      const personnelNumber = programHeads[activeProgramHeadIndex].personnelNumber;
      await PersonnelModel.updatePersonnel(personnelNumber, updatedProgramHeadData);
      setProgramHeads((prevState) => {
        const updatedProgramHeads = [...prevState];
        updatedProgramHeads[activeProgramHeadIndex] = updatedProgramHeadData; // Update the specific program head in state
        return updatedProgramHeads;
      });
      handleCloseEdit();
    } catch (error) {
      console.error('Error updating program head:', error);
    }
  };

  // Render table
  const renderTable = () => {
    return (
      <Table hover className="table table-hover success-border">
        <thead className="table-success">
          <tr>
            <th className='custom-font custom-color-green-font'>Personnel Number</th>
            <th className='custom-font custom-color-green-font'>First Name</th>
            <th className='custom-font custom-color-green-font'>Middle Name</th>
            <th className='custom-font custom-color-green-font'>Last Name</th>
            <th className='custom-font custom-color-green-font'>Personnel Type</th>
            <th className='custom-font custom-color-green-font'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programHeads.length > 0 ? (
            programHeads.map((head, index) => (
              <tr key={index}>
                <td>{head.personnelNumber}</td>
                <td>{head.personnelNameFirst}</td>
                <td>{head.personnelNameMiddle}</td>
                <td>{head.personnelNameLast}</td>
                <td>{head.personnelType}</td>
                <td>
                  <Button variant="info" onClick={() => handleShowView(head)}>
                    View
                  </Button>{' '}
                  <Button variant="warning" onClick={() => handleShowEdit(head, index)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No Program Heads available</td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="container-fluid bg-white p-2 px-4 rounded">
      {renderTable()}

      {/* Add Program Head Modal */}
      <Modal show={showAddModal} onHide={handleCloseAdd}>
        <Modal.Header closeButton>
          <Modal.Title>Add Program Head</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control type="text" name="number" value={newProgramHead.number} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="firstname" value={newProgramHead.firstname} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Middle Name</Form.Label>
              <Form.Control type="text" name="middlename" value={newProgramHead.middlename} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="lastname" value={newProgramHead.lastname} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Personnel Type</Form.Label>
              <Form.Control as="select" name="personnelType" value={newProgramHead.personnelType} onChange={handleInputChange}>
                <option value="Head">Head</option>
                <option value="Faculty">Faculty</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdd}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddProgramHead}>
            Add Program Head
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Program Head Modal */}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Program Head</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control type="text" name="number" value={editProgramHead.number} onChange={handleEditInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="firstname" value={editProgramHead.firstname} onChange={handleEditInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Middle Name</Form.Label>
              <Form.Control type="text" name="middlename" value={editProgramHead.middlename} onChange={handleEditInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="lastname" value={editProgramHead.lastname} onChange={handleEditInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Personnel Type</Form.Label>
              <Form.Control as="select" name="personnelType" value={editProgramHead.personnelType} onChange={handleEditInputChange}>
                <option value="Head">Head</option>
                <option value="Faculty">Faculty</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditProgramHead}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Program Head Modal */}
      <Modal show={showViewModal} onHide={handleCloseView}>
        <Modal.Header closeButton>
          <Modal.Title>View Program Head</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Personnel Number:</strong> {editProgramHead.number}</p>
          <p><strong>First Name:</strong> {editProgramHead.firstname}</p>
          <p><strong>Middle Name:</strong> {editProgramHead.middlename}</p>
          <p><strong>Last Name:</strong> {editProgramHead.lastname}</p>
          <p><strong>Personnel Type:</strong> {editProgramHead.personnelType}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
