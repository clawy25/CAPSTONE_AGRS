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
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print COG</title>
          <style>
            /* General print styles */
            @media print {
              @page { size: A3 portrait; margin: 0; }
              body { 
                margin: 0; 
                font-family: Arial, sans-serif; 
                width: 100%; 
              }
              .modalContent { 
                width: 100%; 
                padding: 10px; 
                box-sizing: border-box;
              }
              /* Adjustments for fitting content on one page */
              .modalContent h1 { font-size: 18px; margin: 0; padding: 5px; }
              .modalContent p, .modalContent td, .modalContent th {
                font-size: 10px;
                padding: 4px;
              }
              /* Table styling for compact view */
              .modalContent table {
                width: 100%;
                border-collapse: collapse;
              }
              .modalContent th, .modalContent td {
                border: 1px solid black;
              }

              .modalContent div {
              border: 1px solid black;
              }
            }
          </style>
        </head>
        <body>
          <div class="modalContent">${content}</div>
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
            <thead>
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
          
          <table style={{ border: "2px solid black" }} className='mb-2'>
            <thead>
              <tr>
                <td colSpan="2">
                  <p className="text-white bg-custom-color-green fw-bold m-0 px-2 py-1" style={{ display: 'inline-block', border: '5px solid #F7FE28' }}>
                    PERSONAL DATA
                  </p>
                </td>
                <td><p className='fs-6'>STUDENT NUMBER: </p></td>
                <td><p className='fs-6'>(STUDENT NUMBER)</p></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><p className='fs-6'>NAME</p></td>
                <td><p className='fs-6'>(NAME)</p></td>
                
                <td><p className='fs-6'>SEX:</p></td>
                <td><p className='fs-6'>(FEMALE?)</p></td>
              </tr>
              <tr>
              <td rowSpan={2}><p className='fs-6'>PERMANENT ADDRESS:</p></td>
              <td  rowSpan={2}><p className='fs-6'>(PERMANENT ADDRESS)</p></td>
              <td><p className='fs-6'>GR NO.:</p></td>
              <td><p className='fs-6'>(COPC-032 s. 2023 CRO)</p></td>    
              </tr>
              <tr>
                <td><p className='fs-6'>SPECIAL ORDER NO.:</p></td>
                <td><p className='fs-6'>((B) 50-343924 - 0028 S. 2024, Dated April 27,2024)</p></td>
              </tr>
              <tr>
              <td><p className='fs-6'>DATE OF BIRTH</p></td>
              <td><p className='fs-6'>(BIRTHDAY)</p></td>
              <td><p className='fs-6'>ACADEMIC PROGRAM:</p></td>
                <td><p className='fs-6'>(BACHELOR OF SCIENCE IN ENTREPRENEURSHIP?)</p></td>
              </tr>
              <tr>
                <td><p className='fs-6'>PLACE OF BIRTH</p></td>
                <td><p className='fs-6'>(BIRTH PLACE)</p></td>
                <td><p className='fs-6'>ATTENDED:</p></td>
                <td><p className='fs-6'>(8 semester(s)?)</p></td>
              </tr>
              <tr>
                <td><p className='fs-6'>NATIONALITY</p></td>
                <td><p className='fs-6'>(FILIPINO?)</p></td>
                
                <td><p className='fs-6'>DATE GRADUATED:</p></td>
                <td><p className='fs-6'>(GRADUATE KA?)</p></td>
              </tr>
            </tbody>
          </table>
            
          <table style={{ border: " 2px solid black" }} className='p-2 mb-0'>
            <thead>
              <tr>
                <td colSpan="2">
                  <p className="text-white bg-custom-color-green fw-bold m-0 px-2 py-1" style={{ display: 'inline-block', border: '5px solid #F7FE28' }}>
                    ENTRANCE DATA
                  </p>
                </td>
                <td><p className='fs-6'>ADMISSION CREDENTIALS</p></td>
                <td><p>(F-137)</p></td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              <tr>     
                <td><p className='fs-6'>DATE GRADUATED/LAST ATTENDED:</p></td>
                <td><p className='fs-6'>(2019)</p></td>
                <td><p className='fs-6'>SCHOOL LAST ATTENDED:</p></td>
                <td><p className='fs-6'>(COLLEGE NAME)</p></td>
                <td></td>
              </tr>
              <tr>     
                <td><p className='fs-6'>CATEGORY:</p></td>
                <td><p className='fs-6'>SHS - TVL Strand</p></td>
                <td><p className='fs-6'>DATE/SEMESTER ADMITTED: </p></td>
                <td><p className='fs-6'>(1st Semester A.Y. 2019-2020)</p></td>
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
          <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Left Column: Grading System Table */}
                <div style={{ flex: 1, padding: '10px', maxWidth: '50%' }}>
                  <Table className="tables border-white">
                    <thead>
                      <tr className="border-black">
                        <th style={{ fontSize: '0.7rem' }}>GRADE</th>
                        <th style={{ fontSize: '0.7rem' }}>EQUIVALENCE</th>
                        <th style={{ fontSize: '0.7rem' }}>DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Grading System Data */}
                      {[
                        { grade: '1.00', equivalence: '99-100%', description: 'EXCELLENT' },
                        { grade: '1.25', equivalence: '96-98%', description: 'SUPERIOR' },
                        { grade: '1.5', equivalence: '93-95%', description: 'VERY GOOD' },
                        { grade: '1.75', equivalence: '90-92%', description: 'GOOD' },
                        { grade: '2.00', equivalence: '87-89%', description: 'MERITORIOUS' },
                        { grade: '2.25', equivalence: '84-86%', description: 'VERY SATISFACTORY' },
                        { grade: '2.50', equivalence: '81-83%', description: 'SATISFACTORY' },
                        { grade: '2.75', equivalence: '76-80%', description: 'FAIR SATISFACTORY' },
                        { grade: '3.00', equivalence: '75-77%', description: 'PASSING' },
                        { grade: '5.00', equivalence: 'Below 50%', description: 'FAILED' },
                        { grade: 'INC', equivalence: '', description: 'INCOMPLETE' },
                        { grade: 'OD', equivalence: '', description: 'OFFICIALLY DROPPED' },
                        { grade: 'UD', equivalence: '', description: 'UNOFFICIALLY DROPPED' },
                        { grade: 'FA', equivalence: '', description: 'FAILURE DUE TO EXCESSIVE ABSENCES' }
                      ].map(({ grade, equivalence, description }, index) => (
                        <tr className="border-black" key={index}>
                          <td style={{ fontSize: '0.7rem' }}>{grade}</td>
                          <td style={{ fontSize: '0.7rem' }}>{equivalence}</td>
                          <td style={{ fontSize: '0.7rem' }}>{description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Right Column: Remarks and Information Section */}
                <div style={{ flex: 1, padding: '10px', maxWidth: '50%' }}>
                  <Table className="tables border-white">
                    <tbody>
                      {/* Remarks and Information Section */}
                      <tr>
                        <td colSpan={6} style={{ fontSize: '0.7rem', border: '2px solid black' }} className="p-3">
                          This Transcript is valid only when it bears the school seal and the original signature of the Registrar. Any erasure or alteration made on this document renders it void unless initialed by the foregoing official.
                        </td>
                      </tr>

                      {/* Prepared By, Checked & Verified By, Date Issued Section */}
                      <tr>
                        <td colSpan={3} className="align-top">
                          {['Prepared by', 'Checked & Verified by', 'Date Issued'].map((label, index) => (
                            <div className="mb-3" key={index}>
                              <p className="fs-6">{label}:</p>
                              <div className="border border-black pt-3 px-4">
                                <p className="fs-6">(Name of Person)</p>
                                <p className="fs-6">{label === 'Prepared by' ? 'Program Records-In-Charge' : 'Registrar I'}</p>
                              </div>
                            </div>
                          ))}
                          <div className="border border-black pt-3 px-4">
                            <p className="fs-6">(Name of Person)</p>
                            <p className="fs-6">College Registrar</p>
                          </div>
                        </td>
                        {/* Right Column with "Transcript is NOT valid" message */}
                        <td colSpan={3} rowSpan={3} className="text-center align-top">
                          <div className="mt-3">
                            <div className="border border-black p-5 ms-5">
                              <p className="fs-6">Transcript is <span>NOT</span> valid without PCC seal</p>
                            </div>
                            <p className="fs-6">Page 1 of 2</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
              </div>
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


