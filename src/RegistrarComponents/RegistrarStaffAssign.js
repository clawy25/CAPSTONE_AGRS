import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form, Container, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch} from '@fortawesome/free-solid-svg-icons'; 
import { faEdit, } from '@fortawesome/free-solid-svg-icons';
import PersonnelModel from '../ReactModels/PersonnelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';


export default function RegistrarStaffAssign({ onBack }) {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [filterOption, setFilterOption] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [programHeads, setProgramHeads] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [programNumbers, setProgramNumbers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editRegistrar, seteditRegistrar] = useState({ number: '', firstname: '', middlename: '', lastname: '', programNumber: '', personnelType: '' });
  const [activeProgramHeadIndex, setActiveProgramHeadIndex] = useState(null);
  
  const currentAcadYear = sessionStorage.getItem('currentAcadYear');
  
  const personnelTypes = ['Head', 'Registrar', 'Faculty', 'Admin', 'Staff'];

  //On loading the page
  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if user is not present
    }
  }, [user, navigate]);


  const fetchRegistrarStaff = async () => {
    try {
      const personnelData = await PersonnelModel.fetchAllPersonnel(currentAcadYear);
      //const registrarStaff = personnelData.filter((personnel) => personnel.personnelType === personnelType);
      setProgramHeads(personnelData);
    } catch (error) {
      console.error('Error fetching program heads:', error);
    }
  };
  const fetchPersonnelList = async () =>{
    try {
      setLoading(true);
      const personnelData = await PersonnelModel.fetchAllPersonnel(currentAcadYear);
      const nonRegistrarPersonnel = personnelData.filter((personnel) => personnel.personnelType === 'Staff');
      setPersonnelList(nonRegistrarPersonnel);
    } catch (error) {
      console.error('Error fetching personnel list:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRegistrarStaff();
    fetchPersonnelList();
  }, [user.programNumber]);

  useEffect(() => {
    async function fetchProgramNumbers() {
      try {
        const currentAcademicYear = await AcademicYearModel.fetchExistingAcademicYears();
        const filteredAcadYear = currentAcademicYear.find(acadYear => acadYear.isCurrent === true)
        console.log(filteredAcadYear)
        const programs = await ProgramModel.fetchAllPrograms();
        setPrograms(programs);
        const filteredProgrmByAcadYear = programs.filter(currentProgram => currentProgram.academicYear === filteredAcadYear.academicYear);

        // Removing duplicates based on 'programName'
        const uniquePrograms = filteredProgrmByAcadYear.filter((program, index, self) =>
          index === self.findIndex((p) => (
              p.programName === program.programName
          ))
        );
        setProgramNumbers(uniquePrograms);
      } catch (error) {
        console.error('Error fetching program numbers:', error);
      }
    }

    fetchProgramNumbers();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
};

  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => {
    setFormData({
      personnelNumber: '',
      personnelNameFirst: '',
      personnelNameMiddle: '',
      personnelNameLast: '',
      programNumber: '',
      personnelType: '',
    });
    setShowAddModal(false)
  };

  const handleShowEdit = (programHead, index) => {
    seteditRegistrar({
      number: programHead.personnelNumber,
      firstname: programHead.personnelNameFirst,
      middlename: programHead.personnelNameMiddle,
      lastname: programHead.personnelNameLast,
      programNumber: programHead.programNumber,
      personnelType: programHead.personnelType, // Ensure personnel type is set to 'Registrar'
    });
    setActiveProgramHeadIndex(index);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => setShowEditModal(false);


  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    seteditRegistrar((prevState) => ({ ...prevState, [name]: value }));
  };



  const [formData, setFormData] = useState({
    personnelNumber: '',
    personnelNameFirst: '',
    personnelNameMiddle: '',
    personnelNameLast: '',
    programNumber: '',
    personnelType: '',
  });

  const generateNextPersonnelNumber = (personnelType) => {
    if (personnelType) {
      const personnelNumbers = filteredPersonnel.map(personnel => personnel.personnelNumber);
      console.log(personnelNumbers);
  
      const year = currentAcadYear.split('-')[0];
      let typeNum;
  
      // Determine the personnel type number
      switch (personnelType) {
        case 'Admin':
          typeNum = 0;
          break;
        case 'Registrar':
          typeNum = 1;
          break;
        case 'Head':
          typeNum = 2;
          break;
        case 'Faculty':
          typeNum = 3;
          break;
        default:
          typeNum = 4;
      }
  
      // Filter personnel numbers matching the current year and type
      const matchingNumbers = personnelNumbers
        .filter(num => {
          const [numYear, numId, , numType] = num.split('-');
          return numYear === year && parseInt(numType, 10) === typeNum;
        })
        .map(num => parseInt(num.split('-')[1], 10)); // Extract the nextNumber part
  
      // Determine the next available number
      let nextNumber = 1;
      if (matchingNumbers.length > 0) {
        matchingNumbers.sort((a, b) => a - b); // Sort numbers in ascending order
        for (let i = 1; i <= matchingNumbers.length; i++) {
          if (matchingNumbers[i - 1] !== i) {
            nextNumber = i; // Find the first missing number
            break;
          }
        }
        if (nextNumber === 1) {
          nextNumber = matchingNumbers.length + 1; // If no gaps, take the next number
        }
      }
  
      return `${year}-${String(nextNumber).padStart(3, '0')}-PCC-${typeNum}`;
    }
  };
  



  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'personnelType'){
      const newPersonnelNumber = generateNextPersonnelNumber(value);

      setFormData((prevData) => ({
        ...prevData,
        ['personnelNumber']: newPersonnelNumber,
        [name]: value
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); // Start loading
      
      const personnelProgram = programNumbers.filter(program => program.programNumber === Number(formData.programNumber));
      console.log(personnelProgram);
      
      const updatedFormData = {
        ...formData,
        programNumber: Number(formData.programNumber),
        personnelPassword: `${formData.programNumber}${formData.personnelNameLast.toLowerCase()}${personnelProgram[0].academicYear.split('-')[0]}`,
        personnelSex: '',
        personnelEmail: null,
        personnelContact: null,
        personnelBirthDate: null,
        personnelAddress: '',
        academicYear: personnelProgram[0].academicYear,
      };

      const formattedData = [updatedFormData];
      console.log('Submitting data:', formattedData);


      await PersonnelModel.insertPersonnel(formattedData);
      fetchRegistrarStaff();
      console.log('Personnel added successfully');
      handleCloseAdd();
    } catch (error) {
      console.error('Error adding personnel:', error);
      alert(`Failed to add personnel. ${error.message}`);
    } finally {
      setLoading(false); // Stop loading
    }
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
      setLoading(true);
      const personnelNumber = programHeads[activeProgramHeadIndex].personnelNumber;
      await PersonnelModel.updatePersonnel(personnelNumber, updatedProgramHeadData);
  
      // Refresh the program heads list after editing
      await fetchRegistrarStaff();
      handleCloseEdit(); // Close the modal after successful save
    } catch (error) {
      console.error('Error updating program head:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const filteredPersonnel = programHeads
  .map(person => {
      // Ensure programName is mapped correctly
      const program = programs.find(prog => prog.programNumber === person.programNumber);
      const programName = program ? program.programName : 'Unknown';

      // Return the updated person object with programName
      return { ...person, programName };
  })
  .filter(person => {
      const searchQueryLower = searchQuery.toLowerCase();
      return (
          (person.personnelNameFirst && person.personnelNameFirst.toLowerCase().includes(searchQueryLower)) ||
          (person.personnelNameLast && person.personnelNameLast.toLowerCase().includes(searchQueryLower)) ||
          (person.personnelNumber && person.personnelNumber.toLowerCase().includes(searchQueryLower)) ||
          (person.personnelEmail && person.personnelEmail.toLowerCase().includes(searchQueryLower)) ||
          (person.personnelType && person.personnelType.toLowerCase().includes(searchQueryLower)) ||
          (person.programName && person.programName.toLowerCase().includes(searchQueryLower)) && // Include programName in the search
          (filterOption === 'All' || person.personnelType === filterOption)
      );
  });



  return (
   <Container fluid>
     <h2 className="custom-font custom-color-green-font mb-3 mt-2">Staff Management</h2>
     <Container fluid className="bg-white rounded pt-2 pb-2">
     
        <Container fluid className="d-flex justify-content-start mt-4 mx-auto">
      
                    <Container fluid className="input-group w-50">
                        <input
                            type="text"
                            className="form-control p-2"
                            placeholder="Search personnel..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <span className="input-group-text">
                            <FontAwesomeIcon icon={faSearch} /> {/* Font Awesome search icon */}
                        </span>
            
                </Container>
        <Button variant="success" className='w-50 p-2' onClick={handleShowAdd}>
          Add Registrar Staff
        </Button>
      </Container>

    <Container fluid className="mt-3 mx-auto mb-2 table-responsive shadow-sm">
      {loading ? (
         <div className="text-center py-5">
         <Spinner animation="border" variant="success" />
         <p className="mt-3">Loading data, please wait...</p>
       </div>
      ) : (
        <Table hover className="table table-hover success-border mt-4 shadow-sm">
          <thead className="table-success">
            <tr>
              <th className="custom-color-green-font custom-font text-center pt-3">Personnel Number</th>
              <th className="custom-color-green-font custom-font text-center pt-3">First Name</th>
              <th className="custom-color-green-font custom-font text-center pt-3">Middle Name</th>
              <th className="custom-color-green-font custom-font text-center pt-3">Last Name</th>
              <th className="custom-color-green-font custom-font text-center pt-3">Program</th>
              <th className="custom-color-green-font custom-font text-center pt-3">Personnel Type</th>
              <th className="custom-color-green-font custom-font text-center pt-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonnel.length > 0 ? (
              filteredPersonnel.map((head, index) => {
                // Find the corresponding program based on programNumber
                const program = programs.find((prog) => prog.programNumber === head.programNumber);
                const programName = program ? program.programName : 'Unknown'; // Default to 'Unknown' if not found

                return (
                  <tr key={index}>
                    <td className="custom-color-green-font text-center pt-3">{head.personnelNumber}</td>
                    <td className="custom-color-green-font text-center pt-3">{head.personnelNameFirst}</td>
                    <td className="custom-color-green-font text-center pt-3">{head.personnelNameMiddle}</td>
                    <td className="custom-color-green-font text-center pt-3">{head.personnelNameLast}</td>
                    <td className="custom-color-green-font text-center pt-3">{programName}</td>
                    <td className="custom-color-green-font text-center pt-3">{head.personnelType}</td>
                    <td className="d-flex justify-content-center align-items-center">
                      <Button variant="warning" className="text-white" onClick={() => handleShowEdit(head, index)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-italic">
                  No Personnels available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>





      {/* Add Registrar Staff Modal */}
      <Modal show={showAddModal} onHide={handleCloseAdd} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>Add Personnel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Personnel Number</Form.Label>
            <Form.Control
              type="text"
              name="personnelNumber"
              value={formData.personnelNumber}
              onChange={handleChange}
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="personnelNameFirst"
              value={formData.personnelNameFirst}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Middle Name</Form.Label>
            <Form.Control
              type="text"
              name="personnelNameMiddle"
              value={formData.personnelNameMiddle}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="personnelNameLast"
              value={formData.personnelNameLast}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Program</Form.Label>
            <Form.Control
          as="select"
          name="programNumber"
          value={formData.programNumber}
          onChange={handleChange}
        >
          <option value="">Select Program</option>
          {programNumbers.map((program) => (
            <option key={program.programNumber} value={program.programNumber}>
              {program.programName}
            </option>
          ))}
        </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Personnel Type</Form.Label>
            <Form.Control
              as="select"
              name="personnelType"
              value={formData.personnelType}
              onChange={handleChange}
            >
            <option value="">Select Role</option>
            {personnelTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseAdd}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={Object.values(formData).some(value => value === '')}>
        {loading ? 'Saving...' : 'Add Personnel'}
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
              {program.programNumber} - {program.programName} {/* Display both programNumber and programName */}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>Personnel Type</Form.Label>
        <Form.Control as="select" name="personnelType" value={editRegistrar.personnelType} onChange={handleEditInputChange}>
          <option value="">Select Role</option>
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
    {loading ? 'Saving...' : 'Update Personnel'}
    </Button>
  </Modal.Footer>
</Modal>


      
     
    </Container>
   </Container>
  );
}
