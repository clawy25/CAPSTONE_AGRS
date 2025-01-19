import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit} from '@fortawesome/free-solid-svg-icons';
import PersonnelModel from '../ReactModels/PersonnelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';


export default function RegistrarStaffAssign({ onBack }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
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

  //On loading the page
  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if user is not present
    }
  }, [user, navigate]);


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



  return (
    <Container fluid className="bg-white rounded pt-2 pb-2">
      <Container fluid className='mt-4 mx-auto mb-3 table-responsive shadow-sm'>
      <Table hover className="table table-hover success-border mt-4 shadow-sm">
        <thead className="table-success">
          <tr>
            <th className='custom-color-green-font custom-font text-center pt-3'>Personnel Number</th>
            <th className='custom-color-green-font custom-font text-center pt-3'>First Name</th>
            <th className='custom-color-green-font custom-font text-center pt-3'>Middle Name</th>
            <th className='custom-color-green-font custom-font text-center pt-3'>Last Name</th>
            <th className='custom-color-green-font custom-font text-center pt-3'>Program</th>
            <th className='custom-color-green-font custom-font text-center pt-3'>Personnel Type</th>
            <th className='custom-color-green-font custom-font text-center pt-3'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programHeads.length > 0 ? (
            programHeads.map((head, index) => (
              <tr key={index}>
                <td className='custom-color-green-font text-center pt-3'>{head.personnelNumber}</td>
                <td className='custom-color-green-font text-center pt-3'>{head.personnelNameFirst}</td>
                <td className='custom-color-green-font text-center pt-3'>{head.personnelNameMiddle}</td>
                <td className='custom-color-green-font text-center pt-3'>{head.personnelNameLast}</td>
                <td className='custom-color-green-font text-center pt-3'>{head.programNumber}</td>
                <td className='custom-color-green-font text-center pt-3'>{head.personnelType}</td>
                <td className='d-flex justify-content-center align-items center'>
                
                  <Button variant="warning" className='text-white' onClick={() => handleShowEdit(head, index)}>
                  <FontAwesomeIcon icon={faEdit}/> Edit
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className='text-center text-italic'>No Registrar Staff available</td>
            </tr>
          )}
        </tbody>
      </Table>
      </Container>

      <Container fluid className="d-flex justify-content-start mt-3 mx-auto mb-2">
        <Button variant="success" onClick={handleShowAdd}>
          Add Registrar Staff
        </Button>
      </Container>
      {/* Add Registrar Staff Modal */}
      <Modal show={showAddModal} onHide={handleCloseAdd} animation={false}>
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
      <Modal show={showEditModal} onHide={handleCloseEdit} animation={false}>
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

      
     
    </Container>
  );
}
