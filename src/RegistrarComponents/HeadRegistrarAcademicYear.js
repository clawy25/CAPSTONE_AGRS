import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel'; // Update with the actual path
import '../App.css';

export default function HeadRegistrarAcademicYear() {
  const [academicYears, setAcademicYears] = useState([]);
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
  const [editProgram, setEditProgram] = useState({ name: '', years: '', levels: [] });

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

  useEffect(() => {
    fetchAcademicYears();
  }, []);

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
    setShowProgramAddModal(false);
    setNewProgram({ name: '', years: '', levels: [] });
  };

  const handleShowProgramEdit = (program) => {
    setEditProgram(program);
    setShowProgramEditModal(true);
  };

  const handleCloseProgramEdit = () => {
    setShowProgramEditModal(false);
    setEditProgram({ name: '', years: '', levels: [] });
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
    const updatedLevels = checked
      ? [...programState.levels, value]
      : programState.levels.filter((level) => level !== value);

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

  // Add a new program
  const handleAddProgram = () => {
    console.log('New Program:', newProgram);
    handleCloseProgramAdd();
  };

  // Edit an existing program
  const handleEditProgram = () => {
    console.log('Edit Program:', editProgram);
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
            checked={program.levels.includes((i + 1).toString())}
            onChange={(e) => handleYearLevelsChange(e, programType)}
          />
        ))}
      </Form.Group>
    );
  };

  // Program Data (Static for Example)
  const programs = [
    { name: "BSREM", years: 4, levels: [1, 2, 3, 4] },
    { name: "BSHM", years: 4, levels: [1, 2, 3, 4] },
    { name: "BSTM", years: 4, levels: [1, 2, 3, 4] },
    { name: "BSEntrep", years: 5, levels: [1, 2, 3, 4, 5] },
    { name: "New Program", years: "X", levels: ["X"] },
  ];

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
        {programs.map((program, index) => (
          <tr key={index}>
            <td>{program.name}</td>
            <td>{program.years}</td>
            <td>{program.levels.join(" ")}</td>
            <td>
              <Button variant="success" onClick={() => handleShowProgramEdit(program)}>Edit</Button>
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
          <option value="">Select an academic year</option>
          {academicYears.map((year) => (
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
      <Button variant="success" className="mt-3" onClick={handleShowProgramAdd}>
        Add Program
      </Button>

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
              <Form.Select
                name="years"
                value={newProgram.years}
                onChange={handleInputChange}
              >
                <option value="">Select number of years</option>
                {[1, 2, 3, 4, 5].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Form.Group>
            {renderYearLevelCheckboxes('new')}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='border-success bg-white custom-color-green-font' onClick={handleCloseProgramAdd}>Close</Button>
          <Button variant="success" onClick={handleAddProgram}>Add Program</Button>
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
              <Form.Select
                name="years"
                value={editProgram.years}
                onChange={handleInputChange}
              >
                <option value="">Select number of years</option>
                {[1, 2, 3, 4, 5].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Form.Group>
            {renderYearLevelCheckboxes('edit')}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='border-success bg-white custom-color-green-font' onClick={handleCloseProgramEdit}>Close</Button>
          <Button variant="success" onClick={handleEditProgram}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
}
