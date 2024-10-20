import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import '../App.css';
import PersonnelModel from '../ReactModels/PersonnelModel';
import { UserContext } from '../Context/UserContext';

export default function ProgramHeadEditProfs({ onBack }) {
  const [professors, setProfessors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProf, setNewProf] = useState({ number: '', firstname: '', middlename: '', lastname: '', email: '', phone: '', sex: '', address: '', birthDate: '' });
  const [editProf, setEditProf] = useState({ number: '', firstname: '', middlename: '', lastname: '', email: '', phone: '', sex: '', address: '', birthDate: '' });
  const [activeProfIndex, setActiveProfIndex] = useState(null);
  const { user } = useContext(UserContext);
  const [existingPersonnelNumbers, setExistingPersonnelNumbers] = useState([]);
  const [generatedPersonnelNumber, setGeneratedPersonnelNumber] = useState('');


  // Fetch professors from PersonnelModel when the component mounts
  useEffect(() => {
    async function fetchProfessors() {
      try {
        const data = await PersonnelModel.getProfessorsbyProgram(user.programNumber, sessionStorage.getItem('currentAcadYear')); // Ensure this fetches correctly
        // Filter for only faculty personnel
        const facultyProfessors = data.filter(prof => prof.personnelType === 'Faculty');
        setProfessors(facultyProfessors);
        // Extract personnel numbers for generating the next number
        const numbers = facultyProfessors.map(prof => prof.personnelNumber);
        setExistingPersonnelNumbers(numbers);
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
      number: professor.personnelNumber,
      firstname: professor.personnelNameFirst,
      middlename: professor.personnelNameMiddle,
      lastname: professor.personnelNameLast,
      email: professor.personnelEmail,
      phone: professor.personnelContact,
      sex: professor.personnelSex,
      address: professor.personnelAddress, 
      type: professor.personnelType,
      birthDate: professor.personnelBirthDate
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
const handleAddProf = async () => {
  // Validation: Check if all fields are filled
  const { name, email, phone, sex, address, birthDate } = newProf;
  if (!name || !email || !phone || !sex || !address || !birthDate) {
    alert("Please fill out all fields before adding a professor.");
    return; // Exit the function if validation fails
  }

  // Get the current year
  const currentYear = new Date().getFullYear();

  // Generate the next personnel number
  const nextPersonnelNumber = generateNextPersonnelNumber(existingPersonnelNumbers, currentYear);
  setGeneratedPersonnelNumber(nextPersonnelNumber); // Store the generated personnel number

  const newProfessorData = {
    personnelNumber: nextPersonnelNumber, // Identification number
    personnelPassword: 'AgrsPcc2024', // Make sure this is handled by your backend
    personnelType: 'Faculty',
    personnelNameFirst: newProf.firstname,
    personnelNameMiddle: newProf.middlename,
    personnelNameLast: newProf.lastname,
    personnelSex: newProf.sex,
    personnelEmail: newProf.email,
    personnelContact: newProf.phone, // Phone number
    personnelAddress: newProf.address,
    personnelBirthDate: newProf.birthDate, // Use the birth date from the form
    programNumber: user.programNumber,
    programName: user.programName,
    academicYear: sessionStorage.getItem('currentAcadYear')
  };
  
    try {
      const response = await PersonnelModel.insertPersonnel(newProfessorData);
      if (!response) {
        throw new Error('No response from server');
      }
      // Update the state and close the modal after adding the professor
      setProfessors((prevState) => [...prevState, newProfessorData]);
      // Close the modal only after the professor is successfully added
      handleCloseAdd(); 
      // Resetting the form fields
      setNewProf({ number: '', firstname: '', middlename:'', lastname:'', email: '', phone: '', sex: '', address: '', birthDate: '' });
      
    } catch (error) {
      console.error('Error adding professor:', error);
    }
  };
  
  const generateNextPersonnelNumber = (existingNumbers, year) => {
    let highestNumber = 0;
  
    // Loop through existing personnel numbers to find the highest for the given year
    existingNumbers.forEach(num => {
      const currentYear = num.split('-')[0];
      if (currentYear === year.toString()) {
        const numberPart = parseInt(num.split('-')[1]);
        if (numberPart > highestNumber) {
          highestNumber = numberPart;
        }
      }
    });
  
    const nextNumber = highestNumber + 1;
    return `${year}-${nextNumber.toString().padStart(3, '0')}-PCC-0`; // Format as '2024-000001-PCC-0'
  };
  
  // Edit professor in the database
  const handleEditProf = async () => {
    const updatedProfessorData = {
      personnelNumber: editProf.number,
      personnelNameFirst: editProf.firstname,
      personnelNameMiddle: editProf.middlename,
      personnelNameLast: editProf.lastname,
      personnelEmail: editProf.email,
      personnelContact: editProf.phone, // Phone number
      personnelSex: editProf.sex,
      personnelAddress: editProf.address, 
      personnelBirthDate: editProf.birthDate // Include birth date in update
    };

    try {
      const personnelNumber = professors[activeProfIndex].personnelNumber;
      await PersonnelModel.updatePersonnel(personnelNumber, updatedProfessorData); 
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
      await PersonnelModel.deletePersonnel(personnelNumber); 
      setProfessors((prevState) => prevState.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting professor:', error);
    }
  };

  const renderTable = () => (
    <Table hover className="table table-hover success-border">
      <thead className="table-success">
        <tr>
          <th className='custom-color-green-font custom-font'>Personnel Number</th>
          <th className='custom-color-green-font custom-font'>Name</th>
          <th className='custom-color-green-font custom-font'>Email</th>
          <th className='custom-color-green-font custom-font'>Phone Number</th>
          <th className='custom-color-green-font custom-font'>Sex</th>
          <th className='custom-color-green-font custom-font'>Address</th>
          <th className='custom-color-green-font custom-font'>Birth Date</th> {/* Personnel Birth Date */}
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {professors.length > 0 ? (
          professors.map((professor, index) => (
            <tr key={index}>
              <td>{professor.personnelNumber}</td>
              <td>{`${professor.personnelNameFirst} ${professor.personnelNameMiddle} ${professor.personnelNameLast}`}</td>
              <td>{professor.personnelEmail}</td>
              <td>{professor.personnelContact}</td>
              <td>{professor.personnelSex}</td>
              <td>{professor.personnelAddress}</td>
              <td>{professor.personnelBirthDate}</td>
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
            <td colSpan="9">No data available</td>
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
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control
                type="text"
                name="number"
                value={generatedPersonnelNumber} // Use the generated personnel number
                readOnly // Make it read-only
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                value={newProf.firstname}
                onChange={handleInputChange}
                placeholder="Enter Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                type="text"
                name="middlename"
                value={newProf.middlename}
                onChange={handleInputChange}
                placeholder="Enter Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={newProf.lastname}
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
            <Form.Group className="mb-3">
              <Form.Label>Birth Date</Form.Label>
              <Form.Control
                type="date"
                name="birthDate"
                value={newProf.birthDate}
                onChange={handleInputChange}
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
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control
                type="text"
                name="number"
                value={editProf.number}
                onChange={handleEditInputChange}
                placeholder="Enter Personnel Number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                value={editProf.firstname}
                onChange={handleEditInputChange}
                placeholder="Enter Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                type="text"
                name="middlename"
                value={editProf.middlename}
                onChange={handleEditInputChange}
                placeholder="Enter Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={editProf.lastname}
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
            <Form.Group className="mb-3">
              <Form.Label>Birth Date</Form.Label>
              <Form.Control
                type="date"
                name="birthDate"
                value={editProf.birthDate}
                onChange={handleEditInputChange}
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
