import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Table, Modal } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import ProgramModel from '../ReactModels/ProgramModel'; // Ensure this path is correct

function ProgramFilter({ onView }) {
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
  };

  const handleView = () => {
    onView(programName, programCode, batchYear);
  };

const downloadExcel = () => {
  const table = document.querySelector('.table-success');
  const workbook = XLSX.utils.table_to_book(table, { raw: true });

  // Access the first sheet of the workbook
  const ws = workbook.Sheets[workbook.SheetNames[0]];

  // Get the range of the table
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Find the index of the "Transcript of Records" column (assuming it's the last column)
  const lastColumnIndex = range.e.c; // Get the last column index
  const columnToRemove = lastColumnIndex; // Column to remove (update this if "Transcript of Records" is in a different column)

  // Remove the "Transcript of Records" column by deleting the corresponding cells
  for (let row = range.s.r; row <= range.e.r; row++) {
    const cellAddress = { r: row, c: columnToRemove };
    const cellRef = XLSX.utils.encode_cell(cellAddress);
    delete ws[cellRef]; // Delete the cell in the "Transcript of Records" column
  }

  // Apply styles to all cells (center text and add borders)
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = { r: row, c: col };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      const cell = ws[cellRef];

      if (cell) {
        // Initialize style object if it doesn't exist
        if (!cell.s) cell.s = {};

        // Apply alignment (center horizontally and vertically)
        cell.s.alignment = {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true, // Optional: wrap text if it's too long
        };

        // Apply border to all cells
        cell.s.border = {
          top: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        };

        // Apply background color for header cells (if it's the header row)
        if (row === range.s.r) { // Header row
          cell.s.fill = {
            fgColor: { rgb: '28a745' } // Green color for header
          };
        }
      }
    }
  }

  // Write the workbook to an Excel file
  XLSX.writeFile(workbook, `${programName || "Masterlist"}_Grades.xlsx`);
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
              onChange={(e) => setBatchYear(e.target.value)} 
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
          <Form.Group controlId="viewButton">
            <Form.Label className="custom-color-green-font custom-font">Action</Form.Label>
            <div className="d-flex">
              <Button className="w-25 btn-success me-2" onClick={handleView}>View</Button>
              <Button className="w-75 btn-success" onClick={downloadExcel}>Download Excel</Button>
            </div>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}



// MasterlistOfGradesTable Component
function MasterlistOfGradesTable() {
  const [filters, setFilters] = useState({ programName: "", programCode: "", batchYear: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleView = (programName, programCode, batchYear) => {
    setFilters({ programName, programCode, batchYear });
  };

  const handleTORClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

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
    <div className='container-fluid'>
      {/* Program Filter Component */}
      <ProgramFilter onView={handleView} />

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
            <th rowSpan="3" className="align-middle text-center custom-color-green-font custom-font bg-white">Transcription of Records (TOR)</th>
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
              <td className='bg-white'>
                <Button 
                  variant="success" 
                  className='w-100' 
                  onClick={() => handleTORClick(student)}
                >
                  TOR
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for displaying student's TOR */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className='custom-color-green-font'>Transcription of Records (TOR) - {selectedStudent?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <>
              <p className='custom-color-green-font'><strong>Student Number:</strong> {selectedStudent.sNumber}</p>
              <p className='custom-color-green-font'><strong>Name:</strong> {selectedStudent.name}</p>
              <Table bordered responsive>
                <thead className='table-success'>
                  <tr>
                    <th className='custom-color-green-font'>Year</th>
                    <th className='custom-color-green-font'>Semester</th>
                    <th className='custom-color-green-font'>Subjects</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(semestersData).map((year) =>
                    Object.keys(semestersData[year]).map((semester, semIdx) => (
                      <tr key={`${year}-${semester}`}>
                        <td>{year}</td>
                        <td>{semester}</td>
                        <td>
                          <ul className="list-unstyled mb-0">
                            {semestersData[year][semester].map((subject, subIdx) => (
                              <li key={subIdx}>{subject}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="success" >Download TOR</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MasterlistOfGradesTable;
