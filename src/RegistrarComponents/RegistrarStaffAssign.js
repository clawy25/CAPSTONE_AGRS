import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import PersonnelModel from '../ReactModels/PersonnelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import { UserContext } from '../Context/UserContext';

export default function RegistrarStaffAssign({ onBack }) {
  const [programHeads, setProgramHeads] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [programNumbers, setProgramNumbers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newProgramHead, setNewProgramHead] = useState({ number: '', firstname: '', middlename: '', lastname: '', programNumber: '', personnelType: 'Registrar' });
  const [editProgramHead, setEditProgramHead] = useState({ number: '', firstname: '', middlename: '', lastname: '', programNumber: '', personnelType: 'Registrar' });
  const [activeProgramHeadIndex, setActiveProgramHeadIndex] = useState(null);
  const { user } = useContext(UserContext);
  const personnelType = 'Registrar'; // Fixed personnel type for registrars

  const personnelTypes = ['Head', 'Registrar', 'Faculty', 'Admin'];
  const fetchRegistrarStaff = async () => {
    try {
      const programNumber = user.programNumber;
      const currentAcadYear = sessionStorage.getItem('currentAcadYear');
      const personnelData = await PersonnelModel.fetchAllPersonnel(programNumber, currentAcadYear);
      const registrarProgramHeads = personnelData.filter((personnel) => personnel.personnelType === personnelType);
      setProgramHeads(registrarProgramHeads);
    } catch (error) {
      console.error('Error fetching program heads:', error);
    }
  };

  useEffect(() => {
    fetchRegistrarStaff();
  }, [user.programNumber]);

  useEffect(() => {
    async function fetchPersonnelList() {
      try {
        const programNumber = user.programNumber;
        const currentAcadYear = sessionStorage.getItem('currentAcadYear');
        const personnelData = await PersonnelModel.fetchAllPersonnel(programNumber, currentAcadYear);
        const nonRegistrarPersonnel = personnelData.filter((personnel) => personnel.personnelType !== personnelType);
        setPersonnelList(nonRegistrarPersonnel);
      } catch (error) {
        console.error('Error fetching personnel list:', error);
      }
    }

    fetchPersonnelList();
  }, [user.programNumber]);

  useEffect(() => {
    async function fetchProgramNumbers() {
      try {
        const programs = await ProgramModel.fetchAllPrograms();
        setProgramNumbers(programs);
      } catch (error) {
        console.error('Error fetching program numbers:', error);
      }
    }

    fetchProgramNumbers();
  }, []);

  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => setShowAddModal(false);

  const handleShowEdit = (programHead, index) => {
    setEditProgramHead({
      number: programHead.personnelNumber,
      firstname: programHead.personnelNameFirst,
      middlename: programHead.personnelNameMiddle,
      lastname: programHead.personnelNameLast,
      programNumber: programHead.programNumber,
      personnelType: personnelType, // Ensure personnel type is set to 'Registrar'
    });
    setActiveProgramHeadIndex(index);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => setShowEditModal(false);




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProgramHead((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProgramHead((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddProgramHead = async () => {
    const { number: personnelNumber, programNumber } = newProgramHead;

    const updatedData = {
      programNumber,
      personnelType, // Always 'Registrar'
    };

    try {
      const response = await PersonnelModel.updatePersonnel(personnelNumber, updatedData);

      if (response) {
        // Refresh the program heads list after adding
        await fetchRegistrarStaff();
        handleCloseAdd();
        setNewProgramHead({ number: '', firstname: '', middlename: '', lastname: '', programNumber: '', personnelType }); // Reset fields
      }
    } catch (error) {
      console.error('Error adding program head:', error);
    }
  };

  const handleEditProgramHead = async () => {
    const updatedProgramHeadData = {
      personnelNameFirst: editProgramHead.firstname,
      personnelNameMiddle: editProgramHead.middlename,
      personnelNameLast: editProgramHead.lastname,
      programNumber: editProgramHead.programNumber,
      personnelType: editProgramHead.personnelType, // Updated type can be chosen in the modal
    };
  
    try {
      const personnelNumber = programHeads[activeProgramHeadIndex].personnelNumber;
      await PersonnelModel.updatePersonnel(personnelNumber, updatedProgramHeadData);
  
      // Refresh the program heads list after editing
      await fetchRegistrarStaff();
      handleCloseEdit(); // Close the modal after successful save
    } catch (error) {
      console.error('Error updating program head:', error);
    }
  };
  

  const handlePersonnelChange = (event) => {
    const selectedNumber = event.target.value;

    const selectedPersonnel = personnelList.find(personnel => personnel.personnelNumber === selectedNumber);

    if (selectedPersonnel) {
      setNewProgramHead({
        ...newProgramHead,
        firstname: selectedPersonnel.personnelNameFirst || '',
        middlename: selectedPersonnel.personnelNameMiddle || '',
        lastname: selectedPersonnel.personnelNameLast || '',
        number: selectedNumber,
        personnelType, // Set personnel type to 'Registrar'
      });
    } else {
      setNewProgramHead({
        number: selectedNumber,
        firstname: '',
        middlename: '',
        lastname: '',
        programNumber: '',
        personnelType, // Default to 'Registrar'
      });
    }
  };

  const renderTable = () => {
    return (
      <Table hover className="table table-hover success-border">
        <thead className="table-success">
          <tr>
            <th className='custom-font custom-color-green-font'>Personnel Number</th>
            <th className='custom-font custom-color-green-font'>First Name</th>
            <th className='custom-font custom-color-green-font'>Middle Name</th>
            <th className='custom-font custom-color-green-font'>Last Name</th>
            <th className='custom-font custom-color-green-font'>Program Number</th>
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
                <td>{head.programNumber}</td>
                <td>{head.personnelType}</td>
                <td>
                
                  <Button variant="warning" onClick={() => handleShowEdit(head, index)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No Program Heads available</td>
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
          <Modal.Title>Add Registrar Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control as="select" name="number" value={newProgramHead.number} onChange={handlePersonnelChange}>
                <option value="">Select Personnel Number</option>
                {personnelList.map((personnel) => (
                  <option key={personnel.personnelNumber} value={personnel.personnelNumber}>
                    {personnel.personnelNumber}
                  </option>
                ))}
              </Form.Control>
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
              <Form.Label>Program Number</Form.Label>
              <Form.Control as="select" name="programNumber" value={newProgramHead.programNumber} onChange={handleInputChange}>
                <option value="">Select Program Number</option>
                {programNumbers.map((program) => (
                  <option key={program.programNumber} value={program.programNumber}>
                    {program.programNumber}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Personnel Type</Form.Label>
              <Form.Control as="select" name="personnelType" value={newProgramHead.personnelType} onChange={handleInputChange}>
                <option value="Registrar">Registrar</option>
                {/* Add other personnel types if needed */}
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
          <Modal.Title>Edit Registrar Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control readOnly value={editProgramHead.number} />
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
              <Form.Label>Program Number</Form.Label>
              <Form.Control as="select" name="programNumber" value={editProgramHead.programNumber} onChange={handleEditInputChange}>
                <option value="">Select Program Number</option>
                {programNumbers.map((program) => (
                  <option key={program.programNumber} value={program.programNumber}>
                    {program.programNumber}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
            <Form.Label>Personnel Type</Form.Label>
            <Form.Control as="select" name="personnelType" value={editProgramHead.personnelType} onChange={handleEditInputChange}>
                {personnelTypes.map((type) => (
                <option key={type} value={type}>
                    {type}
                </option>
                ))}
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

      
      <div className="d-flex justify-content-end mt-3">
        <Button variant="success" onClick={handleShowAdd}>
          Add Registrar Staff
        </Button>
      </div>
    </div>
  );
}
