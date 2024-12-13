import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Modal, Table } from 'react-bootstrap';
import * as XLSX from 'sheetjs-style'; // Use sheetjs-style for formatting
import ProgramModel from '../ReactModels/ProgramModel'; // Ensure this path is correct

function ProgramFilter({ onView }) {
  const [programs, setPrograms] = useState([]);
  const [programName, setProgramName] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [batchYear, setBatchYear] = useState("");

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [tableContent, setTableContent] = useState("");

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
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(ws['!ref']);
  
    // Remove "Transcript of Records" column (assuming it's the last column)
    const lastColumnIndex = range.e.c;
    const columnToRemove = lastColumnIndex;
  
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = { r: row, c: columnToRemove };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      delete ws[cellRef];
    }
  
    // Apply styles to all cells
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = { r: row, c: col };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        const cell = ws[cellRef];
  
        if (cell) {
          if (!cell.s) cell.s = {};
  
          // Apply alignment
          cell.s.alignment = {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true,
          };
  
          // Apply border
          cell.s.border = {
            top: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          };
  
          // Apply header styles
          if (row === range.s.r) { // Header row
            cell.s.fill = {
              patternType: 'solid',
              fgColor: { rgb: '28a745' }, // Green color for header
            };
            cell.s.font = {
              bold: true,
              color: { rgb: 'FFFFFF' }, // White text for header
            };
          }
        }
      }
    }
  
    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, `${programName || "Masterlist"}_Grades.xlsx`);
  };

  const handlePrintModal = () => {
    const table = document.querySelector('.table-success'); // Select the table to copy
    if (table) {
      setTableContent(table.outerHTML); // Copy table's HTML content
      setShowPrintModal(true);
    }
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
              <Button className="w-50 btn-success me-2" onClick={downloadExcel}>Download Excel</Button>
              <Button className="w-25 btn-success me-2" onClick={handlePrintModal}>Print</Button>
            </div>
          </Form.Group>
        </Col>
      </Row>

      {/* Print Modal */}
      <Modal
        show={showPrintModal}
        onHide={() => setShowPrintModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Print Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowX: 'auto' }}>
            {/* Render the copied table */}
            <div dangerouslySetInnerHTML={{ __html: tableContent }} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => {
              window.print();
            }}
          >
            Print
          </Button>
        </Modal.Footer>
      </Modal>
    </Form>
  );
}






// MasterlistOfGradesTable Component
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
  

  
  const handlePrint = () => {
    const contentElement = document.getElementById('modalContent');
  
    if (!contentElement) {
      console.error("Modal content not found. Ensure the modal is open before printing.");
      return;
    }
  
    const content = contentElement.innerHTML;
    const logoURL = '/pcc.png'; 
  
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print TOR</title>
          <style>
            @media print {
              @page {
                size: legal;
                margin: 0;
              }
  
              body {
                margin: 0;
                font-family: Arial, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: scale(1.00); /* Adjust scale for fitting content */
                transform-origin: center center;
                width: 100%;
                height: 100%;
                overflow: hidden; /* Prevent overflow */
              }
  
              .tableContainer {
                display: block;
                width: 100%;
                padding: 10px;
              }
  
              .modalContent {
                width: 100%;
                padding: 10px;
                background: #fff;
                position: relative;
                box-sizing: border-box;
              }
  
              /* Watermark logo - centered */
              .modalContent::before {
                content: '';
                position: absolute;
                top: 30%;
                left: 50%;
                transform: translate(-50%, -50%); /* Center the logo */
                width: 100%;
                height: 100%;
                background-image: url('${logoURL}');
                background-position: center;
                background-repeat: no-repeat;
                background-size: 500px 500px; /* Adjust size of logo */
                opacity: 0.1; /* Low opacity for watermark effect */
                z-index: 0;
              }
  
              /* Ensure content is above the watermark */
              .modalContent * {
                position: relative;
                z-index: 1;
              }
  
              /* Default table styling (with borders) */
              .modalContent table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed; /* Fix table layout to prevent overflow */
              }
  
              /* Add borders to table cells */
              .modalContent th {
                border: 1px solid black; /* Add border to table cells */
                padding: 5px; /* Optional: Adds padding inside cells */
                text-align: center; /* Align text to the left */
              }

              /* Add borders to table cells */
              .modalContent td {
                border: 1px solid black; /* Add border to table cells */
                padding: 5px; /* Optional: Adds padding inside cells */
                text-align: left; /* Align text to the left */
              }
  
              /* Specific tables with no borders */
              .no-border th, .no-border td {
                border: none; /* Remove borders from these tables */
              }
  
              .modalContent .grading-system th,
              .modalContent .grading-system td { 
                font-size: 0.5em; 
                font-style: italic;
              }
  
              .modalContent .table-upper td { 
                font-size: 0.7rem; 
              }
  
              .modalContent .table-upper th {
                font-size: 0.9rem; 
              }
  
              .modalContent .bottom-part-print .certify-statement, 
              .modalContent .bottom-part-print .college-registrar-center {
                text-align: center;
                font-size: 0.7rem;
              }
  
              .modalContent .bottom-part-print .prepared-by{
                font-size: 0.7rem;
              }
  
              .modalContent .grades-table th, .modalContent .grades-table td {
                border: 1px solid black;
                font-size: 0.7rem; 
              }
            }
          </style>
        </head>
        <body>
          <div class="modalContent">
            ${content}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
  
    printWindow.document.close();
  };
  
  
  
  
  
  
  
  

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
      <Modal show={showModal} onHide={handleCloseModal} size="xl"  className="custom-modal-width">
        <Modal.Header closeButton>
          <Modal.Title className="custom-color-green-font">Transcription of Records (TOR) - {selectedStudent?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Your modal content goes here */}
          <div id="modalContent">
          {selectedStudent && (
            <div>
           <table className="table table-white">
            <thead class="no-border">
              <tr>
                <th className="text-center" style={{ width: '25%' }}>
                  <img src="/pcc.png" alt="Logo" className="img-fluid" style={{ width: '110px' }} />
                </th>
                <th className="text-center" style={{ width: '50%' }}>
                  <p className="fs-6 mb-0 fw-semibold">PARAÑAQUE CITY COLLGE</p>
                  <p className="fs-5 mb-0">Office of the College Registrar</p>
                  <p style={{ fontSize: '0.9rem' }} className="mb-0">Parañaque City, Philippines</p>
                  <p className="fs-4 mb-0">OFFICIAL TRANSCRIPT OF RECORDS</p>
                </th>
                <th className="text-center" style={{ width: '25%' }}>
                  <p className='fs-6'>UF-REG-018</p>
                  <p className='fs-6'>Rev.0</p>
                  <p className='fs-6'>03/01/2022</p>
                </th>
              </tr>
            </thead>
          </table>
          
          <table style={{ border: "2px solid black", width: '100%'  }} className="mb-2">
        <thead className="no-border">
          <tr>
          <td className="no-border" colSpan="2">
            <p
              className="fw-bold m-0 px-2 py-1"
              style={{
                display: 'inline-block',
                border: '5px solid #F7FE28',
                backgroundColor: '#004d00',
                color: 'white',
              }}
            >
              PERSONAL DATA
            </p>
          </td>
            <td><p style={{ fontSize: '0.7rem' }}>STUDENT NUMBER: </p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(STUDENT NUMBER)</p></td>
          </tr>
        </thead>
        <tbody className="no-border">
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>NAME</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(NAME)</p></td>

            <td><p style={{ fontSize: '0.7rem' }}>SEX:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(FEMALE?)</p></td>
          </tr>
          <tr>
            <td rowSpan={2}><p style={{ fontSize: '0.7rem' }}>PERMANENT ADDRESS:</p></td>
            <td rowSpan={2}><p style={{ fontSize: '0.7rem' }}>(PERMANENT ADDRESS)</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>GR NO.:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(COPC-032 s. 2023 CRO)</p></td>
          </tr>
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>SPECIAL ORDER NO.:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>((B) 50-343924 - 0028 S. 2024, Dated April 27,2024)</p></td>
          </tr>
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>DATE OF BIRTH</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(BIRTHDAY)</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>ACADEMIC PROGRAM:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(BACHELOR OF SCIENCE IN ENTREPRENEURSHIP?)</p></td>
          </tr>
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>PLACE OF BIRTH</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(BIRTH PLACE)</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>ATTENDED:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(8 semester(s)?)</p></td>
          </tr>
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>NATIONALITY</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(FILIPINO?)</p></td>

            <td><p style={{ fontSize: '0.7rem' }}>DATE GRADUATED:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(GRADUATE KA?)</p></td>
          </tr>
        </tbody>
      </table>



      <table style={{ border: "2px solid black", width: '100%'  }} className="p-2 mb-0">
        <thead className="no-border">
          <tr >
          <td colSpan="1">
            <p
              className="fw-bold m-0 px-2 py-1"
              style={{
                display: 'inline-block',
                border: '5px solid #F7FE28',
                backgroundColor: '#004d00',
                color: 'white',
              }}
            >
              ENTRANCE DATA
            </p>
          </td>
            <td><p style={{ fontSize: '0.7rem' }}>ADMISSION CREDENTIALS</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(F-137)</p></td>
            <td></td>
          </tr>
        </thead>
        <tbody className="no-border">
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>DATE GRADUATED/LAST ATTENDED:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(2019)</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>SCHOOL LAST ATTENDED:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(COLLEGE NAME)</p></td>
            <td></td>
          </tr>
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>CATEGORY:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>SHS - TVL Strand</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>DATE/SEMESTER ADMITTED: </p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(1st Semester A.Y. 2019-2020)</p></td>
            <td></td>
          </tr>
        </tbody>
      </table>


         
          <Table bordered responsive className="text-center">
            <thead>
              <tr style={{ border: "2px solid black" }}>
                <th colSpan={6}><p className='fs-6 text-start mb-1'>ACADEMIC RECORD</p></th>
              </tr>
              <tr>
                <th className="custom-color-green-font align-middle" rowSpan="2">
                  TERM & SCHOOL YEAR
                </th>
                <th className="custom-color-green-font align-middle" rowSpan="2">
                  SUBJECT CODE
                </th>
                <th className="custom-color-green-font align-middle" rowSpan="2">
                  DESCRIPTIVE TITLE
                </th>
                <th className="custom-color-green-font align-middle" colSpan="2">
                  FINAL
                </th>
                <th className="custom-color-green-font align-middle" rowSpan="2">
                  UNITS OF CREDIT
                </th>
              </tr>
              <tr>
                <th className="custom-color-green-font">GRADES</th>
                <th className="custom-color-green-font">COMPLETION</th>
              </tr>
            </thead>
            <tbody>
         
            {/* Generate 8 rows with 6 columns (td) each */}
            {Array(8).fill().map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array(6).fill().map((_, colIndex) => (
                  <td key={colIndex} className='fs-5'>-</td>
                ))}
              </tr>
            ))}

            {/* Uncomment this section to map over your `semestersData` */}
            {/* {Object.keys(semestersData).map((year) =>
              Object.keys(semestersData[year]).map((semester, semIdx) =>
                semestersData[year][semester].map((subject, subIdx) => (
                  <tr key={`${year}-${semester}-${subIdx}`}>
                    <td>{year} - {semester}</td>
                    <td>{subject.code}</td>
                    <td>{subject.title}</td>
                    <td>{subject.finalGrade}</td>
                    <td>{subject.completion}</td>
                    <td>{subject.units}</td>
                  </tr>
                ))
              )
            )} */}
          </tbody>
          </Table>
          <Table bordered responsive className="text-center">
            <thead>
            <tr style={{ border: "2px solid black" }}>
                <th colSpan={1}><p className='fs-6 text-start mb-1'>REMARKS:</p></th>
                <th colSpan={7}><p className='fs-6 text-start mb-1'>CLEARED OF ALL PROPERTY AND MONEY ACCOUNTABILITIES</p></th>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <th colSpan={3}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>GRADING SYSTEM</p></th>
                <th colSpan={5} rowSpan={2}><p style={{ fontSize: '0.7rem' }}>This Transcript is valid only when it bears the school seal and the original signature of the Registrar. Any erasure or alteration made on this document renders it void unless initialed by the foregoing official.</p></th>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <th colSpan={1}  rowSpan={1}> <p style={{ fontSize: '0.7rem' }}>GRADE</p></th>
                <th colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>EQUIVALENCE</p></th>
                <th colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>DESCRIPTION</p></th>
              </tr>
            </thead>
            <tbody>
            <tr style={{ border: "2px solid black", borderBottom: 'none' }}>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>1.00</td>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>99-100%</td>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>EXCELLENT</td>
              <td colSpan={3} rowSpan={1} style={{ fontSize: '0.7rem', textAlign: "left",  borderBottom: 'none'}}>Prepared by:</td>
              <td colSpan={2}  rowSpan={14}><p style={{ fontSize: '0.7rem', paddingTop: '210px', textAlign: "center"}}>Transcript is <strong>NOT</strong> valid without PCC seal</p></td>
            </tr>
            <tr style={{ border: "2px solid black" }}>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>1.25</td>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>96-98%</td>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>SUPERIOR</td>
              <td colSpan={3} rowSpan={1} style={{ fontSize: '0.7rem', textAlign: "center" }}><strong><big>MELISSA TAN</big></strong></td>
            </tr>
            <tr style={{ border: "2px solid black" }}>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>1.50</td>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>93-95%</td>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>VERY GOOD</td>
              <td colSpan={3} rowSpan={1} style={{ fontSize: '0.7rem', textAlign: "center" }}>Program Records-In-Charge</td>
            </tr>
            <tr style={{ border: "2px solid black" }}>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>1.75</td>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>90-92%</td>
              <td colSpan={1} rowSpan={1} style={{ fontSize: '0.7rem' }}>GOOD</td>
              <td colSpan={3} rowSpan={1} style={{ fontSize: '0.7rem', textAlign: "left" }}>Checked & Verified by:</td>
            </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>2.00</p></td>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>87-89%</p></td>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>MERITORIOUS</p></td>
                <td colSpan={3}  rowSpan={1}><p  style={{ fontSize: '0.7rem', textAlign: "center"}} ><strong><big>LORNA L. DELLORO</big></strong></p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>2.25</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>84-86%</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>VERY SATISFACTORY</p></td>
                <td colSpan={3}  rowSpan={1}><p style={{ fontSize: '0.7rem', textAlign: "center"}}>Registrar I</p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>2.50</p></td>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>81-83%</p></td>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>SATISFACTORY</p></td>
                <td colSpan={3}  rowSpan={1}><p  style={{ fontSize: '0.7rem', textAlign: "left" }} >Date Issued:</p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>2.75</p></td>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>76-80%</p></td>
                <td colSpan={1}  rowSpan={1}><p  style={{ fontSize: '0.7rem' }}>FAIRLY SATISFACTORY</p></td>
                <td colSpan={3}  rowSpan={1}><p  style={{ fontSize: '0.7rem', textAlign: "center"}}><big>MAY 23, 2024</big></p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>3.00</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>75-77%</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>PASSING</p></td>
                <td colSpan={3}  rowSpan={4}><p style={{ fontSize: '0.7rem' }}></p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>5.00</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>Below 50</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>FAILED</p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>INC</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}></p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>INCOMPLETE</p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>OD</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}></p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>OFFICIALY DROPPED</p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>UD</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}></p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>UNOFFICIALY DROPPED</p></td>
                <td colSpan={3}  rowSpan={1}><p style={{ textAlign: "center", fontSize: '0.7rem'}} ><strong><big>JORGE ERWIN A. RAD, RL, MLIS, MBA</big></strong></p></td>
              </tr>
              <tr style={{ border: "2px solid black" }}>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>FA</p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}></p></td>
                <td colSpan={1}  rowSpan={1}><p style={{ fontSize: '0.7rem' }}>FAILURE DUE TO EXCESSIVE ABSENCES</p></td>
                <td colSpan={3}  rowSpan={1}><p style={{ textAlign: "center", fontSize: '0.7rem'}} >College Registrar</p></td>
              </tr>
              

          </tbody>
          </Table>
           </div>
          )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCloseModal}>
            Close
          </Button>
          <Button onClick={handlePrint} variant="success" >Print</Button>

        </Modal.Footer>
      </Modal>
    </div>
  );
}


export default MasterlistOfGradesTable;


