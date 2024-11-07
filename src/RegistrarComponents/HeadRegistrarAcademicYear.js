import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import ProgramModel from '../ReactModels/ProgramModel';
import '../App.css';
import { UserContext } from '../Context/UserContext';

export default function HeadRegistrarAcademicYear() {
  const { user } = useContext(UserContext);
  const [academicYears, setAcademicYears] = useState([]);
  const [program, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgramAddModal, setShowProgramAddModal] = useState(false);
  const [showProgramEditModal, setShowProgramEditModal] = useState(false);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState({
    academicYear: '',
    isCurrent: false,
  });
  const [editAcademicYear, setEditAcademicYear] = useState({
    academicYear: '',
    isCurrent: false,
  });

  // State for new and edit program
  const [newProgram, setNewProgram] = useState({ name: '', years: '', levels: [] });
  const [editProgram, setEditProgram] = useState({ name: '', years: '', levels: [], programNumber: '' });

  // Fetch Academic Years
  const fetchAcademicYears = async () => {
    setLoading(true);
    try {
      const years = await AcademicYearModel.fetchExistingAcademicYears();
      setAcademicYears(years);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch All Programs
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const programs = await ProgramModel.fetchAllPrograms();
      setPrograms(programs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
    fetchPrograms();
  }, []);

  const getYearPrefix = (academicYear) => {
    const [startYear] = academicYear.split('-');
    return startYear.slice(-2) + (parseInt(startYear.slice(-2)) + 1).toString().padStart(2, '0');
  };

  const generateProgramNumber = (academicYear) => {
    const yearPrefix = getYearPrefix(academicYear); // e.g., "2425" for "2024-2025"

    const matchingProgramNumbers = program
        .map(p => p.programNumber.toString()) // Ensure programNumber is a string
        .filter(number => number.startsWith(yearPrefix)); // Filter based on the year prefix

    // Determine the next sequential number based on existing ones
    let nextNumber = 1;
    if (matchingProgramNumbers.length > 0) {
        // Extract the last two digits of the program number to get the sequential part
        const maxNumber = Math.max(...matchingProgramNumbers.map(number => parseInt(number.slice(-2))));
        nextNumber = maxNumber + 1;
    }

    // Construct the new program number, ensuring two digits for the sequential part
    return `${yearPrefix}${nextNumber.toString().padStart(2, '0')}`;
  };



  // Handlers for modals
  const handleShowAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => {
    setShowAddModal(false);
    setNewAcademicYear({ academicYear: '', isCurrent: false });
  };

  const handleShowEdit = (year) => {
    setEditAcademicYear(year);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditAcademicYear({ academicYear: '', isCurrent: false });
  };

  const handleShowProgramAdd = () => setShowProgramAddModal(true);

  const handleCloseProgramAdd = () => {
    fetchPrograms();
    setShowProgramAddModal(false);
    setNewProgram({ name: '', years: '', levels: [] });
  };

  const handleShowProgramEdit = (programName, programNumOfYear, summerlevels, programNumber) => {
    setEditProgram({
      name: programName,
      years: programNumOfYear,
      levels: summerlevels,
      programNumber: programNumber
    });
    setShowProgramEditModal(true);
  };

  const handleCloseProgramEdit = () => {
    fetchPrograms();
    setShowProgramEditModal(false);
    setEditProgram({ name: '', years: '', levels: [] , programNumber: ''});
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;

    if (showAddModal) {
      setNewAcademicYear((prevState) => ({ ...prevState, [name]: updatedValue }));
    } else if (showEditModal) {
      setEditAcademicYear((prevState) => ({ ...prevState, [name]: updatedValue }));
    } else if (showProgramAddModal) {
      setNewProgram((prevState) => ({ ...prevState, [name]: updatedValue }));
    } else if (showProgramEditModal) {
      setEditProgram((prevState) => ({ ...prevState, [name]: updatedValue }));
    }
  };

  // Handle year level checkboxes for program modals
  const handleYearLevelsChange = (e, programType) => {
    const { value, checked } = e.target;
    const programState = programType === 'new' ? newProgram : editProgram;
    
    // Parse the value to an integer since the checkboxes are using number values
    const level = parseInt(value, 10);
  
    // Update the levels array by either adding or removing the level
    const updatedLevels = checked
      ? [...programState.levels, level]
      : programState.levels.filter((levelItem) => levelItem !== level);
  
    // Update the state based on programType
    if (programType === 'new') {
      setNewProgram((prevState) => ({ ...prevState, levels: updatedLevels }));
    } else {
      setEditProgram((prevState) => ({ ...prevState, levels: updatedLevels }));
    }
  };
  

  // Add a new academic year
  const handleAddAcademicYear = async () => {
    try {
      const createdYear = await AcademicYearModel.createAndInsertAcademicYear(newAcademicYear);
      setAcademicYears((prevYears) => [...prevYears, createdYear]);
      handleCloseAdd();
    } catch (error) {
      console.error('Error adding academic year:', error);
    }
  };

  // Edit an existing academic year
  const handleEditAcademicYear = async () => {
    try {
      await AcademicYearModel.updateAcademicYear(editAcademicYear.id, editAcademicYear);
      await fetchAcademicYears();
    } catch (error) {
      console.error('Error updating academic year:', error);
    }
    handleCloseEdit();
  };

  // Adding program closes the modal
  const handleAddProgram = async (name, years, summerlevels) => {
    const programNumber = generateProgramNumber(selectedAcademicYear);
    
    const lastProgram = program.reduce((max, p) => (p.id > max ? p.id : max), 0);
    let newId = lastProgram + 1;  // Increment the highest id found

    const newProgramsData = (summerlevels.length > 0 ? summerlevels : [null]).map((level) => ({
      id: newId++,
      programName: name,
      programNumber: programNumber,
      noOfYears: years,
      yearLevelwithSummer: level,
      academicYear: selectedAcademicYear
    }));
  
    try {

      const response = await ProgramModel.createAndInsertProgram(newProgramsData);
  
      if (!response) {
        throw new Error('No response from server');
      }
  
    } catch (error) {
      console.error(error);
    }
    handleCloseProgramAdd();
  };
  

  // Editing program closes the modal
  const handleEditProgram = async (name, years, summerlevels, programNumber) => {
    // Clean up summerlevels to ensure it only has either non-null values or a single null
    if (summerlevels.some(level => level !== null)) {
      summerlevels = summerlevels.filter(level => level !== null);
    } else if (summerlevels.length === 0) {
      summerlevels = [null];
    }
    
    if(programNumber){
      try {
        const response = await ProgramModel.deletePrograms(programNumber);
    
        if (!response) {
          throw new Error('No response from server');
        }
    
      } catch (error) {
        console.error(error);
      }

      const lastProgram = program.reduce((max, p) => (p.id > max ? p.id : max), 0);
      let newId = lastProgram + 1;  // Increment the highest id found
      const newProgramsData = (summerlevels.length > 0 ? summerlevels : [null]).map((level) => ({
        id: newId++,
        programName: name,
        programNumber: programNumber,
        noOfYears: years,
        yearLevelwithSummer: level,
        academicYear: selectedAcademicYear
      }));

      console.log(newProgramsData);
      try {
        const response = await ProgramModel.createAndInsertProgram(newProgramsData);
    
        if (!response) {
          throw new Error('No response from server');
        }
      } catch (error) {
        console.error(error);
      }
    };
    handleCloseProgramEdit();
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === 'addNew') {
      handleShowAdd();
    } else if (value === 'editSelected') {
      const selectedYear = academicYears.find(year => year.academicYear === selectedAcademicYear);
      if (selectedYear) handleShowEdit(selectedYear);
    } else {
      setSelectedAcademicYear(value);
    }
  };

  // Render loading and error messages
  if (loading) return <Spinner animation="border" role="status" />;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  const renderYearLevelCheckboxes = (programType) => {
    const program = programType === 'new' ? newProgram : editProgram;
    const years = parseInt(program.years, 10) || 0;
  
    return (
      <Form.Group className="mb-3">
        <Form.Label>Select Year Levels with Summer</Form.Label>
        {Array.from({ length: years }, (_, i) => (
          <Form.Check
            key={i}
            type="checkbox"
            label={`Year ${i + 1}`}
            value={i + 1}
            checked={program.levels.includes(i + 1)} // Check if the current year level is in program.levels
            onChange={(e) => handleYearLevelsChange(e, programType)} // Call the function on change
          />
        ))}
      </Form.Group>
    );
  };
  
  const renderProgramsTable = () => (
    <Table bordered hover className="mt-2">
      <thead className='table-success'>
        <tr>
          <th className='custom-color-green-font custom-font'>Current Programs</th>
          <th className='custom-color-green-font custom-font'>Number of Years</th>
          <th className='custom-color-green-font custom-font'>Year Levels with Summer</th>
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {program
          .filter((program) => program.academicYear === selectedAcademicYear) // Filter by selected academic year
          .reduce((acc, currProgram) => {
          // Find an existing entry for the same programName, programNumber, and academicYear
          const existingProgram = acc.find(
            (entry) =>
              entry.programName === currProgram.programName &&
              entry.programNumber === currProgram.programNumber &&
              entry.programNumOfYear === currProgram.programNumOfYear
          );

        if (existingProgram) { 
          // If found, add the summerlevel (if it's not already in the list)
          if (!existingProgram.summerlevels.includes(currProgram.programYrLvlSummer)) {
            existingProgram.summerlevels.push(currProgram.programYrLvlSummer);
          }
        } else {
          // If not found, create a new entry
          acc.push({
            programName: currProgram.programName,
            programNumber: currProgram.programNumber,
            programNumOfYear: currProgram.programNumOfYear,
            summerlevels: [currProgram.programYrLvlSummer],
          });
      }

      return acc;
    }, []) // Initialize the accumulator as an empty array
    .map((program) => (
      <tr key={program.programNumber}>
        <td>{program.programName}</td>
        <td>{program.programNumOfYear}</td>
        <td>
            {program.summerlevels.length > 0
              ? program.summerlevels
            .sort((a, b) => a - b) // Sort the summer levels numerically (if they're numbers)
            .join(', ') // Join the sorted summer levels with commas
            : 'No summer levels available'}
        </td>
        <td>
          <Button variant="success" onClick={() => handleShowProgramEdit(program.programName, program.programNumOfYear, program.summerlevels, program.programNumber)}>Edit</Button>
        </td>
      </tr>
    ))}
      </tbody>

    </Table>
  );

  return (

    
      <div className='container-fluid bg-white p-4 rounded mt-3'>
       
    <Row>
      <Col>
      <h3 className="mt-2 custom-color-green-font custom-font" >Programs</h3>
      
      
      </Col>

      <Col>
      <Form.Group className="mb-3">
        {/*<Form.Label className='custom-color-green-font custom-font'>Select Academic Year</Form.Label>*/}
        <Form.Select className='p-2 mt-2' value={selectedAcademicYear} onChange={handleSelectChange}>
          <option value="">Select Academic Year</option>
          {academicYears
          .sort((a, b) => {
            let yearA = parseInt(a.academicYear.split('-')[0]);
            let yearB = parseInt(b.academicYear.split('-')[0]);
            return yearB - yearA; //SWITCH THESE TWO FOR ASC TO DESC ORDER
          })
          .map((year) => (
            <option key={year.id} value={year.academicYear}>
              {year.academicYear}
            </option>
          ))}
          <option value="addNew">Add Academic Year</option>
          {selectedAcademicYear && (
            <option value="editSelected">Edit Selected Academic Year</option>
          )}
        </Form.Select>
      </Form.Group>
      </Col>
    </Row>
    {renderProgramsTable()}
    {selectedAcademicYear === academicYears.find(year => year.isCurrent)?.academicYear && (
      <>
      <Button variant="success" className="mt-3" onClick={handleShowProgramAdd}>
        Add Program
      </Button>
      </>
    )}

      {/* Modals for Academic Year */}
      <Modal show={showAddModal} onHide={handleCloseAdd}>
        <Modal.Header closeButton>
          <Modal.Title>Add Academic Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Academic Year</Form.Label>
              <Form.Control
                type="text"
                name="academicYear"
                value={newAcademicYear.academicYear}
                onChange={handleInputChange}
                placeholder="Enter Academic Year"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isCurrent"
                label="Is Current Year"
                checked={newAcademicYear.isCurrent}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdd}>Close</Button>
          <Button variant="primary" onClick={handleAddAcademicYear}>Add Academic Year</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Academic Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Academic Year</Form.Label>
              <Form.Control
                type="text"
                name="academicYear"
                value={editAcademicYear.academicYear}
                onChange={handleInputChange}
                placeholder="Enter Academic Year"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isCurrent"
                label="Is Current Year"
                checked={editAcademicYear.isCurrent}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>Close</Button>
          <Button variant="primary" onClick={handleEditAcademicYear}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Modals for Program */}
      <Modal show={showProgramAddModal} onHide={handleCloseProgramAdd}>
        <Modal.Header closeButton>
          <Modal.Title>Add Program</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Program Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newProgram.name}
                onChange={handleInputChange}
                placeholder="Enter Program Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Number of Years</Form.Label>
              <Form.Control
                type="text"
                name="years"
                value={newProgram.years}
                onChange={handleInputChange}
                placeholder="(0-9)"
                maxLength={1}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                    e.preventDefault(); // Prevent any non-numeric character
                  }
                }}
              />
            </Form.Group>
            {renderYearLevelCheckboxes('new', null)}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='border-success bg-white custom-color-green-font' onClick={handleCloseProgramAdd}>Close</Button>
          <Button variant="success" onClick={() => handleAddProgram(newProgram.name, newProgram.years, newProgram.levels)}>Add Program</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProgramEditModal} onHide={handleCloseProgramEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Program</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Program Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editProgram.name}
                onChange={handleInputChange}
                placeholder="Enter Program Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Number of Years</Form.Label>
              <Form.Control
                type="text"
                name="years"
                value={editProgram.years}
                onChange={handleInputChange}
                placeholder="(0-9)"
                maxLength={1}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                    e.preventDefault(); // Prevent any non-numeric character
                  }
                }}
              />
            </Form.Group>
            {renderYearLevelCheckboxes('edit', editProgram.levels)}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='border-success bg-white custom-color-green-font' onClick={handleCloseProgramEdit}>Close</Button>
          <Button variant="success" onClick={() => handleEditProgram (editProgram.name, editProgram.years, editProgram.levels, editProgram.programNumber)}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
}
