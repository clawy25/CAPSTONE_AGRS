import React, { useState, useEffect } from 'react'; 
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt,  faEnvelope, faPhoneAlt} from '@fortawesome/free-solid-svg-icons';

import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import SectionModel from '../ReactModels/SectionModel';

const MasterlistOfGradesTable = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('First');
  const [program, setProgram] = useState('');
  const [sections, setSections] = useState(Array(8).fill(null).map((_, index) => `Section ${index + 1}`));

  const [academicYears, setAcademicYears] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
        setAcademicYears(fetchedAcademicYears);
        if (fetchedAcademicYears.length > 0) {
          setAcademicYear(fetchedAcademicYears[0].academicYear); 
        }

        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        setYearLevels(fetchedYearLevels);
        if (fetchedYearLevels.length > 0) {
          setYearLevel(fetchedYearLevels[0].yearName); 
        }

        const fetchedPrograms = await ProgramModel.fetchAllPrograms();
        setPrograms(fetchedPrograms);
        if (fetchedPrograms.length > 0) {
          setProgram(fetchedPrograms[0].programName); 
        }

        setSections(Array(8).fill(null).map((_, index) => `Section ${index + 1}`));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const columns = ["ITEM", "SNUMBER", "STUDENT NAME", "PAN101", "HUM101", "STS101", "VE101", "NSTP102", "PE12", "LIT101"];
  const weightedColumns = ["PAN101", "HUM101", "STS101", "VE101", "NSTP102", "PE12", "LIT101", "WGA"];
  const professors = ["Oreta", "Gatdula", "Escaran", "Sagun", "Bautista", "Dela Cruz", "Ramos"];

  const handleView = () => {
    const selectedProgram = programs.find((prog) => prog.programName === program);
    if (selectedProgram && academicYear && yearLevel && semester) {
      setSelectedProgramId(selectedProgram.id);
    } else {
      setSelectedProgramId(null);
    }
  };
  
  const printTable = () => {
    const table = document.getElementById('printableTable');
    if (!table) {
      console.error('Table not found');
      return;
    }
  
    // Clone the table
    const clonedTable = table.cloneNode(true);
  
    // Select all rows (including header and body)
    const rows = clonedTable.querySelectorAll('tr');
  
    // Get all rows for header and body
    const headerRows = clonedTable.querySelectorAll('thead tr');
    const bodyRows = clonedTable.querySelectorAll('tbody tr');
  
    // Highlight the last column (WGA) in both header and body (only for print)
    // In header (last cell in both header rows)
    const headerCells = clonedTable.querySelectorAll('thead th');
    const lastHeaderCell = headerCells[headerCells.length - 1];
    lastHeaderCell.style.backgroundColor = '#bf9000'; // Brown for WGA column in header
    lastHeaderCell.style.color = 'black'; // Text color black for WGA header
  
    // In body (last column in each row)
    bodyRows.forEach(row => {
      const lastCell = row.cells[row.cells.length - 1]; // Target the last cell in each body row
      lastCell.style.backgroundColor = '#bf9000'; // Brown for WGA column in body
    });
  
    // Apply colors to the first and second header rows (only for print)
    if (headerRows.length > 0) {
      headerRows.forEach((headerRow, index) => {
        // Apply blue color to the first header row and text color black (only for print)
        if (index === 0) {
          headerRow.querySelectorAll('th').forEach(cell => {
            cell.style.backgroundColor = '#00b0f0'; // Blue
            cell.style.color = 'black'; // Text color black
          });
        }
        // Apply yellow color to the second header row and text color black (only for print)
        if (index === 1) {
          headerRow.querySelectorAll('th').forEach(cell => {
            cell.style.backgroundColor = '#ffff00'; // Yellow
            cell.style.color = 'black'; // Text color black
          });
        }
      });
    }
  
    // Remove the last column from body rows (not the header)
    bodyRows.forEach(row => {
      row.deleteCell(row.cells.length - 1);
    });
  
    const printWindow = window.open('', '', 'height=500,width=1000');
    printWindow.document.write('<html><head><title>Print Table</title>');
    printWindow.document.write(`
      <style>
        @media print {
          @page {
            size: legal landscape; /* Set Legal size and Landscape orientation */
            margin: 0;
            /* Ensure background graphics are included */
            background: #fff;
          }
  
          body {
            font-family: Arial, sans-serif;
          }
  
          table {
            width: 100%;
            table-layout: auto;
            border-collapse: collapse;
            page-break-before: auto;
          }
  
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
          }
  
          td {
            background-color: white;
          }
  
          th {
            background-color: #4CAF50;
            color: black; /* Text color black in all header cells */
          }
  
          /* Prevent repeated header on every page */
          thead {
            display: table-row-group;
          }
  
          /* Keep rows from splitting between pages */
          tr {
            page-break-inside: avoid;
          }
  
          /* Highlight last column in print */
          th:last-child, td:last-child {
            background-color: #bf9000; /* Highlight color for last column */
            color: black; /* Text color black for WGA column */
          }
  
          /* Apply print-specific header row colors */
          thead tr:nth-child(1) th {
            background-color: #00b0f0; /* Blue for the first header row */
            color: black; /* Text color black for first header row */
          }
  
          thead tr:nth-child(2) th {
            background-color: #ffff00; /* Yellow for the second header row */
            color: black; /* Text color black for second header row */
          }
  
          .header-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            margin-top: 40px;
          }
  
          .logo {
            height: 80px;
            margin-right: 20px;
          }
  
          .text {
            text-align: left;
            margin-right: 20px;
          }
  
          .city, .college {
            color: green;
          }
  
          .college {
            font-size: 29px;
            font-weight: bold;
          }
  
          .vertical-line {
            border-left: 2px solid green;
            height: 80px;
            margin-left: 20px;
            margin-right: 20px;
          }
  
          .additional-text {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }
  
          .additional-line {
            font-size: 16px;
            font-weight: normal;
            display: flex;
            align-items: flex-start;
            margin-bottom: 5px;
            color: green;
          }
  
          .icon {
            margin-right: 8px;
            font-size: 18px;
            min-width: 24px;
            color: green;
          }
  
          .address-container {
            display: flex;
            align-items: flex-start;
          }
  
          .address-container .address-text {
            display: flex;
            flex-direction: column;
          }
  
          .second-logo {
            height: 80px;
            margin-left: 40px;
          }
  
          .separator {
            border: 0;
            border-top: 2px solid green;
            width: 80%;
            margin: 20px auto;
          }
  
          .centered-text {
            text-align: center;
          }
        }
  
      </style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    `);
    printWindow.document.write('</head><body>');
  
    let fullProgramName;
    if (program === "BSHM") {
      fullProgramName = "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT";
    } else if (program === "BSEntrep") {
      fullProgramName = "BACHELOR OF SCIENCE IN ENTREPRENEURSHIP";
    } else {
      fullProgramName = program;
    }
  
    printWindow.document.write(`
      <div class="header-container">
        <img src="/pcc.png" alt="PCC Logo" class="logo" id="logo">
        <div class="text">
          <div class="city">PARANAQUE CITY</div>
          <div class="college">COLLEGE</div>
        </div>
        <div class="vertical-line"></div>
        <div class="additional-text">
          <div class="additional-line address-container">
            <span class="icon"><i class="fas fa-map-marker-alt"></i></span>
            <div class="address-text">
              <div>Coastal Rd., cor. Victor Medina Street,</div>
              <div>San Dionisio, Paranaque City, Philippines</div>
            </div>
          </div>
          <div class="additional-line">
            <span class="icon"><i class="fas fa-envelope"></i></span>info@paranaquecitycollege.edu.ph
          </div>
          <div class="additional-line">
            <span class="icon"><i class="fas fa-phone-alt"></i></span>(02)85343321
          </div>
        </div>
        <img src="/pcc.png" alt="PCC Logo" class="second-logo">
      </div>
      <hr class="separator">
      <div class="centered-text">
        <h1>OFFICE OF THE COLLEGE REGISTRAR</h1>
        <h2>Summary of Grades</h2>
        <h2>${fullProgramName}</h2>
        <h2>${yearLevel}</h2>
        <h2>${semester} Semester S.Y. ${academicYear}</h2>
      </div>
    `);
  
    printWindow.document.write(clonedTable.outerHTML);
    printWindow.document.write('</body></html>');
  
    const logo = printWindow.document.getElementById('logo');
    logo.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  
    logo.onerror = () => {
      console.error('Logo failed to load.');
      printWindow.print();
      printWindow.close();
    };
  };
  
  

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };


  const handlePrint = () => {
    const contentElement = document.getElementById('modalContent');
  
    if (!contentElement) {
      console.error("Modal content not found. Ensure the modal is open before printing.");
      return;
    }
  
    const content = contentElement.innerHTML;
  
    // Open a new window with specific dimensions for printing
    const printWindow = window.open('', '', 'width=800,height=600'); // Set the size of the window
    printWindow.document.write(`
      <html>
        <head>
          <title>Print COG</title>
          <style>
            /* General print styles */
            @media print {
              @page {
                size: portrait; /* Set portrait orientation */
                margin: 0;
              }
  
              body {
                margin: 0;
                font-family: Arial, sans-serif;
                width: 100%;
                height: 100%;
                position: relative;
              }
  
              /* Background logo behind the content */
              body::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('pcc.png'); /* Add logo image */
                background-position: center;
                background-repeat: no-repeat;
                background-size: 25%; /* Adjust size of logo */
                opacity: 0.1; /* Set opacity for transparency */
                z-index: -1; /* Ensure it stays behind the content */
              }
  
              /* Container for both tables */
              .tableContainer {
                display: block;
                width: 100%;
                padding: 10px;
              }
  
              /* Each table should have its own box */
              .modalContent {
                width: 100%;
                padding: 10px;
                box-sizing: border-box;
                margin-bottom: 20px; /* Add some space between the two tables */
                border: 1px solid #ccc; /* Optional border around each table */
                background: #fff; /* Optional background */
              }
  
              /* Adjustments for fitting content on one page */
              .modalContent h1 {
                font-size: 18px;
                margin: 0;
                padding: 5px;
              }
  
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
                border: none;
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
          <!-- Container for both tables -->
          <div class="tableContainer">
            <!-- First table -->
            <div class="modalContent">${content}</div>
  
            <!-- Second table (same content repeated) -->
            <div class="modalContent">${content}</div>
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
  
    // Close the document after writing content to it
    printWindow.document.close();
  };
  
  
  
  

  


  return (
    <div>
      <Row className="mb-4 bg-white rounded p-3 m-1">
        <Col>
          <Form.Group controlId="academicYear">
            <Form.Label>Academic Year</Form.Label>
            <Form.Control as="select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
              {academicYears.map((year) => (
                <option key={year.id} value={year.academicYear}>
                  {year.academicYear}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="yearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Control as="select" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
              {yearLevels.map((level) => (
                <option key={level.id} value={level.yearName}>
                  {level.yearName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="semester">
            <Form.Label>Semester</Form.Label>
            <Form.Control as="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="First">First</option>
              <option value="Second">Second</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="program">
            <Form.Label>Program</Form.Label>
            <Form.Control as="select" value={program} onChange={(e) => setProgram(e.target.value)}>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.programName}>
                  {prog.programName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col className="d-flex align-items-end">
          <Button className="w-25 btn-success me-2" onClick={handleView}>View</Button>
          <Button className="w-75 btn-success" onClick={printTable}>Print</Button>
        </Col>
      </Row>

      {selectedProgramId && (
        <div id="printableTable" style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <h5 className="text-center">{program}</h5>
          {sections.map((section, sectionIndex) => (
            <Table bordered key={sectionIndex} className="text-center">
              <thead className='table-success'>
                <tr>
                  <th colSpan="3" className='custom-color-green-font'>{`${program} - ${section}`}</th>
                  {columns.slice(3).map((col, index) => (
                    <th key={index} className='custom-color-green-font'>{professors[index]}</th>
                  ))}
                  <th colSpan={weightedColumns.length} className='custom-color-green-font'>
                    WEIGHTED GRADE AVERAGE
                  </th>
                  <th rowSpan={2} className='custom-color-green-font'>Certificate of Grades (COG)</th>
                </tr>
                <tr>
                {columns.map((col, index) => (
                  <th key={index} className="bg-success text-white">{col}</th> // Correct comment syntax
                ))}
                {weightedColumns.map((col, index) => (
                  <th key={`wg-${index}`} className="bg-success text-white">{col}</th> // Corrected here
                ))}
              </tr>
              </thead>

              <tbody className='table-success'>
                {Array.from({ length: 15 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className='bg-white'>{rowIndex + 1}</td>
                    <td className='bg-white'>-</td>
                    <td className='bg-white'>-</td>
                    {columns.slice(3).map((_, colIndex) => (
                      <td key={`col-${colIndex}`} className='bg-white'></td>
                    ))}
                    {weightedColumns.map((_, colIndex) => (
                      <td key={`wg-col-${colIndex}`}>0.0</td>
                    ))}
                    <td><Button 
                      variant="success" 
                      className='w-100' 
                      onClick={openModal}
                    >
                      COG
                    </Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ))}
        </div>
      )}

       {/* Modal for COG */}
       <Modal show={showModal} onHide={closeModal} className="modal-xxl" centered>
        <Modal.Header closeButton>
          <Modal.Title className='custom-color-green-font'>Certificate of Grades</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div id="modalContent">
        <div className="d-flex justify-content-center">
       
          <table className="header-logo" style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}>
            <tbody>
              <tr>
                <td style={{ width: '80px'}}>
                  <img src="/pcc.png" alt="Logo" className="img-fluid" style={{ width: '70px' }} />
                </td>
                <td style={{ textAlign: 'left' }}>
                  <p className="fw-bold text-uppercase mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                    Parañaque City <br />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>College</span>
                  </p>
                </td>
                <td style={{ textAlign: 'left'}}>
                  <p className="mb-0" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                    <faMapMarkerAlt className="me-2" /> 
                    Coastal Rd., cor. Victor Medina Street, San Dionisio, Parañaque City, Philippines
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                    <faEnvelope className="me-2" /> 
                    info@parañaquecitycollege.edu.ph
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                    <faPhoneAlt className="me-2" /> 
                    (02) 85343321
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr/>
        <Table className="border-white table-upper">
          <thead>
            <tr>
              <th colSpan="4" className="fs-5 text-center">OFFICE OF THE COLLEGE REGISTRAR</th>
            </tr>
            <tr>
              <th colSpan="4" className="fs-4 text-center">CERTIFICATE OF GRADES</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fs-6 fw-bold">STUDENT NAME:</td>
              <td className="fs-6">(NAME OF THE STUDENT)</td>
              <td className="fs-6 fw-bold">ACADEMIC YEAR:</td>
              <td className="fs-6">(STUDENT ACADEMIC YEAR)</td>
            </tr>
            <tr>
              <td className="fs-6 fw-bold">STUDENT ID NO.:</td>
              <td className="fs-6">(STUDENT NUMBER)</td>
              <td className="fs-6 fw-bold">SEMESTER:</td>
              <td className="fs-6">(FIRST SEMESTER?)</td>
            </tr>
            <tr>
              <td className="fs-6 fw-bold">PROGRAM CODE & DESCRIPTION:</td>
              <td className="fs-6">(BSHM)</td>
              <td className="fs-6 fw-bold">YEAR LEVEL:</td>
              <td className="fs-6">(FIRST SEMESTER)</td>
            </tr>
          </tbody>
        </Table>

          
          <Table bordered className="text-center border-black grades-table">
            <thead>
              <tr>
                <th colSpan="7" className='fs-6'>FIRST SEMESTER</th>
              </tr>
              <tr>
                <th className='fs-6'>CODE</th>
                <th className='fs-6'>COURSE DESCRIPTION</th>
                <th colSpan="2" className='fs-6'>UNITS <br/>LEC LAB</th>
                <th className='fs-6'>TOTAL UNITS</th>
                <th className='fs-6'>GRADES</th>
                <th className='fs-6'>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index}>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              ))}
              <tr>
                <th>TOTAL</th>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <th colspan="2">GENERAL WEIGHTED AVERAGE (GWA) = </th>
                <td colSpan={5}></td>
              </tr>
            </tbody>
          </Table>

          <Table className="border-white grading-system">
            <thead>
              <tr>
                <th colSpan="5">GRADING SYSTEM</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">1.00 = 99-100 Excellent</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">1.75 = 90-92 Good</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">2.50 = 81-83 Satisfactory</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">INC = Incomplete</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">NC = No Credit</td>
              </tr>
              <tr>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">1.25 = 96-98 Superior</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">2.00 = 87-89 Meritorious</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">2.75 = 78-80 Fairly Satisfactory</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">5.00 = Below 50 Failed</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">OD = Officially Dropped / FA = Failure due to Excessive Absences</td>
              </tr>
              <tr>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">1.50 = 93-95 Very Good</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">2.25 = 84-86 Very Satisfactory</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">3.00 = 75-77 Passing</td>
                <td style={{ fontSize: '0.7rem' }} className="fst-italic">UD = Unofficially Dropped</td>
                <td></td>
              </tr>
            </tbody>
          </Table>
          <Table className="text-center border-white bottom-part-print">
            <tbody>
              <tr>
                <td colSpan="2">
                  <p className="fs-6 fw-normal mt-1 certify-statement">
                    I certify to the veracity of the above records of ____________________
                  </p>
                </td>
              </tr>
              <tr>
                <td className="text-start " style={{ width: '50%' }}>
                  <p className="prepared-by" style={{ fontSize: '0.7rem' }}>Prepared by:</p>
                  <p className="prepared-by" style={{ fontSize: '0.7rem' }}>(Name)</p>
                </td>
                <td className="text-end college-registar" style={{ width: '50%' }}>
                  <p className="fs-6 fw-normal text-center college-registrar-center">____________________________</p>
                  <p className="fs-6 fw-normal text-center college-registrar-center">College Registrar</p>
                </td>
              </tr>
            </tbody>
          </Table>


         </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={closeModal}>Close</Button>
          <Button variant="success" onClick={handlePrint}>Download COG</Button>
        </Modal.Footer>

      </Modal>
    </div>
  );
};

export default MasterlistOfGradesTable;
