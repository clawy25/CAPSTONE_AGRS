import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import PersonnelModel from '../ReactModels/PersonnelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import { UserContext } from '../Context/UserContext';

export default function RegistrarStaffAssign({ onBack }) {
  const { user } = useContext(UserContext);
  const [programHeads, setProgramHeads] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [programNumbers, setProgramNumbers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newRegistrar, setnewRegistrar] = useState({ number: '', firstname: '', middlename: '', lastname: '', programNumber: '', personnelType: 'Registrar' });
  const [editRegistrar, seteditRegistrar] = useState({ number: '', firstname: '', middlename: '', lastname: '', programNumber: '', personnelType: 'Registrar' });
  const [activeProgramHeadIndex, setActiveProgramHeadIndex] = useState(null);
  
  const currentAcadYear = sessionStorage.getItem('currentAcadYear');
  const personnelType = 'Registrar';
  const personnelTypes = ['Head', 'Registrar', 'Faculty', 'Admin'];
  const fetchRegistrarStaff = async () => {
    try {
      const personnelData = await PersonnelModel.fetchAllPersonnel(currentAcadYear);
      const registrarStaff = personnelData.filter((personnel) => personnel.personnelType === personnelType);
      setProgramHeads(registrarStaff);
    } catch (error) {
      console.error('Error fetching program heads:', error);
    }
  };
  const fetchPersonnelList = async () =>{
    try {
      const personnelData = await PersonnelModel.fetchAllPersonnel(currentAcadYear);
      const nonRegistrarPersonnel = personnelData.filter((personnel) => personnel.personnelType === 'Faculty');
      setPersonnelList(nonRegistrarPersonnel);
    } catch (error) {
      console.error('Error fetching personnel list:', error);
    }
  };


  useEffect(() => {
    fetchRegistrarStaff();
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
    seteditRegistrar({
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
    setnewRegistrar((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    seteditRegistrar((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddRegistrar = async () => {
    const { number: personnelNumber, programNumber } = newRegistrar;

    const updatedData = {
      programNumber,
      personnelType, // Always 'Registrar'
    };

    try {

      await PersonnelModel.updatePersonnel(personnelNumber, updatedData);

    } catch (error) {
      console.error('Error adding program head:', error);
    }

    fetchRegistrarStaff();
      handleCloseAdd();
      setnewRegistrar({ number: '', firstname: '', middlename: '', lastname: '', programNumber: '', personnelType });
  };

  const handleeditRegistrar = async () => {
    const updatedProgramHeadData = {
      personnelNameFirst: editRegistrar.firstname,
      personnelNameMiddle: editRegistrar.middlename,
      personnelNameLast: editRegistrar.lastname,
      programNumber: editRegistrar.programNumber,
      personnelType: editRegistrar.personnelType, // Updated type can be chosen in the modal
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
      setnewRegistrar({
        ...newRegistrar,
        firstname: selectedPersonnel.personnelNameFirst || '',
        middlename: selectedPersonnel.personnelNameMiddle || '',
        lastname: selectedPersonnel.personnelNameLast || '',
        number: selectedNumber,
        personnelType, // Set personnel type to 'Registrar'
      });
    } else {
      setnewRegistrar({
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
            <th className='custom-font custom-color-green-font'>Program</th>
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
                
                  <Button variant="success" onClick={() => handleShowEdit(head, index)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No Registrar Staff available</td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="container-fluid bg-white p-2 px-4 rounded">
      {renderTable()}

      {/* Add Registrar Staff Modal */}
      <Modal show={showAddModal} onHide={handleCloseAdd}>
        <Modal.Header closeButton>
          <Modal.Title>Add Registrar Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control as="select" name="number" value={newRegistrar.number} onChange={handlePersonnelChange}>
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
              <Form.Control type="text" name="firstname" value={newRegistrar.firstname} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Middle Name</Form.Label>
              <Form.Control type="text" name="middlename" value={newRegistrar.middlename} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="lastname" value={newRegistrar.lastname} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Program Number</Form.Label>
              <Form.Control as="select" name="programNumber" value={newRegistrar.programNumber} onChange={handleInputChange}>
                <option value="">Select Program Number</option>
                {programNumbers.map((program) => (
                  <option key={program.programNumber} value={program.programNumber}>
                    {program.programName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Personnel Type</Form.Label>
              <Form.Control as="select" name="personnelType" value={newRegistrar.personnelType} onChange={handleInputChange}>
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
          <Button variant="primary" onClick={handleAddRegistrar}>
            Add Program Head
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Registrar Staff Modal */}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Registrar Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control readOnly value={editRegistrar.number} />
            </Form.Group>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="firstname" value={editRegistrar.firstname} onChange={handleEditInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Middle Name</Form.Label>
              <Form.Control type="text" name="middlename" value={editRegistrar.middlename} onChange={handleEditInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="lastname" value={editRegistrar.lastname} onChange={handleEditInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Program Number</Form.Label>
              <Form.Control as="select" name="programNumber" value={editRegistrar.programNumber} onChange={handleEditInputChange}>
                <option value="">Select Program Number</option>
                {programNumbers.map((program) => (
                  <option key={program.programNumber} value={program.programNumber}>
                    {program.programName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
            <Form.Label>Personnel Type</Form.Label>
            <Form.Control as="select" name="personnelType" value={editRegistrar.personnelType} onChange={handleEditInputChange}>
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
          <Button variant="primary" onClick={handleeditRegistrar}>
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
