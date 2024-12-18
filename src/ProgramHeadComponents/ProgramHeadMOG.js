import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Modal, Table } from 'react-bootstrap';
import ProgramModel from '../ReactModels/ProgramModel'; // Ensure this path is correct

function MasterlistOfGradesTable() {
  const [filters, setFilters] = useState({ programName: "", programCode: "", batchYear: "" });
  const [showModal, setShowModal] = useState(false);
  const [validatedStates, setValidatedStates] = useState({}); // Track validation per program/batch

  // Handle program or batch year selection changes
  const handleView = (programName, programCode, batchYear) => {
    setFilters({ programName, programCode, batchYear });
  };

  const isValidated = () => {
    const key = `${filters.programName}-${filters.batchYear}`;
    return validatedStates[key] || false;
  };

  const handleValidate = () => {
    if (!filters.programName || !filters.batchYear) {
      alert("Please select both Program Name and Batch Year.");
      return;
    }
    setShowModal(true);
  };

  const handleConfirmValidation = () => {
    const key = `${filters.programName}-${filters.batchYear}`;
    setValidatedStates((prev) => ({ ...prev, [key]: true })); // Mark this selection as validated
    setShowModal(false);
  };

  const handleProgramFilterChange = (programName, programCode, batchYear) => {
    setFilters({ programName, programCode, batchYear });
  };

    // Define your semesters data structure
    const semestersData = {
      "First Year": {
        "1st Semester A.Y. 2023-2024": ["ENG101", "FIL101", "MATH101", "SS101", "NSTP101", "PE11", "PIZAL"],
        "2nd Semester A.Y. 2023-2024": ["PAN101", "HUM101", "STS101", "VE101", "NSTP102", "PE12"],
      },
      "Second Year": {
        "1st Semester A.Y. 2024-2025": ["FIL102", "SS102", "CB101", "CBMEC1", "ENTREP1", "3NTREP2", "ENTREP3", "ENTREP TRACK1", "PE21"],
        "2nd Semester A.Y. 2024-2025": ["VE102", "CBMEC2", "ENTREP5", "ENTREP6", "ENTREP7", "ENTREP8", "PE22", "PCC12", "ENTREP9", "ENTREP10"],
      },
      "Third Year": {
        "1st Semester A.Y. 2025-2026": ["ENTREP11", "ENTREP ELEC1", "ENTREP ELEC2", "ACC101", "ENTREP TRACK2", "ENTREP12"],
        "2nd Semester A.Y. 2025-2026": ["ENTREP13", "ENTREP ELEC3", "ENTREP ELEC4", "ACC102", "ENTREP14"],
      },
      "Fourth Year": {
        "1st Semester A.Y. 2026-2027": ["ENTREP15", "ENTREP ELECK4"],
        "2nd Semester A.Y. 2026-2027": ["ENTREP16"],
      }
    };
  
    // Example students data
    const students = [
      { sNumber: '2023001', name: 'Alice Johnson' },
      { sNumber: '2023002', name: 'Bob Smith' },
      { sNumber: '2023003', name: 'Charlie Brown' },
      { sNumber: '2023004', name: 'David Wilson' },
      { sNumber: '2023005', name: 'Eve Davis' },
      { sNumber: '2023006', name: 'Frank Miller' },
      { sNumber: '2023007', name: 'Grace Lee' },
      { sNumber: '2023008', name: 'Hannah Clark' },
      { sNumber: '2023009', name: 'Ivy Harris' },
      { sNumber: '2023010', name: 'Jack Turner' },
      { sNumber: '2023011', name: 'Katherine Taylor' },
      { sNumber: '2023012', name: 'Liam Martinez' },
      { sNumber: '2023013', name: 'Mia Anderson' },
      { sNumber: '2023014', name: 'Noah Thomas' },
      { sNumber: '2023015', name: 'Olivia Jackson' },
      { sNumber: '2023016', name: 'Paul Robinson' },
      { sNumber: '2023017', name: 'Quinn White' },
      { sNumber: '2023018', name: 'Rachel Lewis' },
      { sNumber: '2023019', name: 'Samuel Walker' },
      { sNumber: '2023020', name: 'Tina Hall' },
      { sNumber: '2023021', name: 'Ursula Young' },
      { sNumber: '2023022', name: 'Victor Scott' },
      { sNumber: '2023023', name: 'Wendy Green' },
      { sNumber: '2023024', name: 'Xander King' },
      { sNumber: '2023025', name: 'Yvonne Wright' },
      { sNumber: '2023026', name: 'Zachary Adams' },
    ];
  return (
    <div className="container-fluid">
      {/* Program Filter Component */}
      <ProgramFilter
        onView={handleProgramFilterChange}
        onValidate={handleValidate}
        isValidated={isValidated()} // Dynamically check if the current selection is validated
      />

      {/* Modal for Validation Confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Validation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to validate this for {filters.batchYear} and {filters.programName}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleConfirmValidation}>
            Validate
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Display Selected Filters */}
      <Row className="bg-success text-white py-2 mt-2 rounded">
        <Col md={4}>
          <strong>PROGRAM:</strong> {filters.programName || "Select Program"}
        </Col>
        <Col md={4}>
          <strong>PROGRAM CODE:</strong> {filters.programCode || "Select Code"}
        </Col>
        <Col md={4}>
          <strong>BATCH/YEAR:</strong> {filters.batchYear || "Select Batch Year"}
        </Col>
      </Row>

            {/* Grades Table */}
            <Table bordered responsive className="table-success my-4">
              <thead className='table-success'>
                {/* Year Level Header */}
                <tr>
                  <th rowSpan="3" className="align-middle text-center custom-color-green-font custom-font bg-white">Item</th>
                  <th rowSpan="3" className="align-middle text-center custom-color-green-font custom-font bg-white">SNumber</th>
                  <th rowSpan="3" className="align-middle text-center custom-color-green-font custom-font bg-white">Student Name</th>
                  {Object.keys(semestersData).map((year, idx) => (
                    <th
                      key={idx}
                      colSpan={Object.values(semestersData[year]).flat().length}
                      className="text-center custom-color-green-font custom-font"
                    >
                      {year}
                    </th>
                  ))}
                </tr>
                {/* Semester Header */}
                <tr>
                  {Object.keys(semestersData).map((year) =>
                    Object.keys(semestersData[year]).map((semester, semIdx) => (
                      <th
                        colSpan={semestersData[year][semester].length}
                        key={`${year}-${semIdx}`}
                        className="text-center custom-color-green-font custom-font bg-white"
                      >
                        {semester}
                      </th>
                    ))
                  )}
                </tr>
                {/* Subjects Header */}
                <tr>
                  {Object.keys(semestersData).map((year) =>
                    Object.keys(semestersData[year]).map((semester) =>
                      semestersData[year][semester].map((subject, subIdx) => (
                        <th key={`${year}-${semester}-${subIdx}`} className="text-center custom-color-green-font custom-font bg-white">
                          {subject}
                        </th>
                      ))
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {students.map((student, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="text-center bg-white">{rowIdx + 1}</td>
                    <td className="text-center bg-white">{student.sNumber}</td>
                    <td className="bg-white">{student.name}</td>
                    {Object.keys(semestersData).map((year) =>
                      Object.keys(semestersData[year]).map((semester) =>
                        semestersData[year][semester].map((_, gradeIdx) => (
                          <td key={`${year}-${semester}-${gradeIdx}`} className="text-center bg-white"></td>
                        ))
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
    </div>
  );
}

function ProgramFilter({ onView, onValidate, isValidated }) {
  const [programs, setPrograms] = useState([]);
  const [programName, setProgramName] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [batchYear, setBatchYear] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const allPrograms = await ProgramModel.fetchAllPrograms();
        setPrograms(allPrograms);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };
    fetchPrograms();
  }, []);

  const handleProgramNameChange = (e) => {
    const selectedProgramName = e.target.value;
    setProgramName(selectedProgramName);

    const selectedProgram = programs.find((program) => program.programName === selectedProgramName);
    setProgramCode(selectedProgram ? selectedProgram.programNumber : "");
    onView(selectedProgramName, selectedProgram ? selectedProgram.programNumber : "", batchYear);
  };

  const handleBatchYearChange = (e) => {
    const selectedBatchYear = e.target.value;
    setBatchYear(selectedBatchYear);
    onView(programName, programCode, selectedBatchYear);
  };

  return (
    <Form className="p-3 bg-white border border-success rounded">
      <Row className="align-items-center">
        <Col md={3}>
          <Form.Group controlId="programName">
            <Form.Label className="custom-color-green-font custom-font">Program Name</Form.Label>
            <Form.Select
              value={programName}
              onChange={handleProgramNameChange}
              className="border-success"
            >
              <option value="">Select Program Name</option>
              {programs.map((program) => (
                <option key={program.id} value={program.programName}>
                  {program.programName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="programCode">
            <Form.Label className="custom-color-green-font custom-font">Program Code</Form.Label>
            <Form.Control
              type="text"
              value={programCode}
              readOnly
              className="border-success bg-white"
              placeholder="Select Program Name first"
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="batchYear">
            <Form.Label className="custom-color-green-font custom-font">Batch Year</Form.Label>
            <Form.Select
              value={batchYear}
              onChange={handleBatchYearChange}
              className="border-success"
            >
              <option value="">Select Batch Year</option>
              <option>2021</option>
              <option>2022</option>
              <option>2023</option>
              <option>2024</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="actionButtons">
            <Form.Label className="custom-color-green-font custom-font">Action</Form.Label>
            <div className="d-flex">
              <Button className="w-25 btn-success me-2" onClick={() => onView(programName, programCode, batchYear)}>
                View
              </Button>
              <Button
                className={`w-75 me-2 ${isValidated ? "btn-secondary" : "btn-danger"}`}
                disabled={isValidated}
                onClick={onValidate}
              >
                {isValidated ? "VALIDATED!" : "Validate"}
              </Button>
            </div>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}



export default MasterlistOfGradesTable;
