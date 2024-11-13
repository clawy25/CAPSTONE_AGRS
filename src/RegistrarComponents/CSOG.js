import React, { useState, useEffect } from 'react'; 
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
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

  const clonedTable = table.cloneNode(true);
  const rows = clonedTable.querySelectorAll('tr');

  // Remove the last column from each row
  rows.forEach(row => row.deleteCell(row.cells.length - 1));

  const printWindow = window.open('', '', 'height=500,width=1000');
  printWindow.document.write('<html><head><title>Print Table</title>');
  printWindow.document.write(`
    <style>
      @media print {
        @page { size: landscape; margin: 0.5in; }
        body { font-family: Arial, sans-serif; }
        table { width: 100%; table-layout: auto; border-collapse: collapse; page-break-before: auto; }
        th, td { border: 1px solid black; padding: 8px; text-align: center; }
        td { background-color: white; }
        th { background-color: #4CAF50; color: white; }
        
        /* Ensure the table header is only printed once per page */
        thead { display: table-header-group; }
        tbody { display: table-row-group; }
        
        /* Control page breaks */
        tr { page-break-inside: avoid; }
        
        /* Flex container for logo and text */
        .header-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          margin-top: 40px; /* Double line space above the header */
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
          color: green; /* Set text color to green */
        }

        .college {
          font-size: 29px;
          font-weight: bold;
        }

        /* Vertical line after the text */
        .vertical-line {
          border-left: 2px solid green; /* Set vertical line color to green */
          height: 80px;
          margin-left: 20px;
          margin-right: 20px;
        }

        /* Additional text after the vertical line */
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
          color: green; /* Set all address text to green */
        }

        .icon {
          margin-right: 8px;
          font-size: 18px;
          min-width: 24px;
          color: green; /* Set icons color to green */
        }

        /* For the first two address lines sharing one icon */
        .address-container {
          display: flex;
          align-items: flex-start;
        }

        .address-container .address-text {
          display: flex;
          flex-direction: column;
        }

        /* Additional space before the second logo */
        .second-logo {
          height: 80px;
          margin-left: 40px; /* Adds space before the second logo */
        }

        /* Horizontal line styling */
        .separator {
          border: 0;
          border-top: 2px solid green; /* Set horizontal line color to green */
          width: 80%; /* Adjust to control the line length */
          margin: 20px auto; /* Center and add vertical spacing */
        }

        /* Centered text for heading and paragraphs */
        .centered-text {
          text-align: center;
        }
      }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"> <!-- Font Awesome CDN -->
  `);
  printWindow.document.write('</head><body>');

  // Map program codes to their full names
  let fullProgramName;
  if (program === "BSHM") {
    fullProgramName = "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT";
  } else if (program === "BSEntrep") {
    fullProgramName = "BACHELOR OF SCIENCE IN ENTREPRENEURSHIP";
  } else {
    fullProgramName = program; // Default to the program code if no match
  }

  // Add the header content, vertical line, and horizontal line
  printWindow.document.write(`
    <div class="header-container">
      <img src="/pcc.png" alt="PCC Logo" class="logo">
      <div class="text">
        <div class="city">PARANAQUE CITY</div>
        <div class="college">COLLEGE</div>
      </div>
      <div class="vertical-line"></div> <!-- Vertical Line -->
      <div class="additional-text">
        <!-- Address with single icon -->
        <div class="additional-line address-container">
          <span class="icon"><i class="fas fa-map-marker-alt"></i></span> <!-- Font Awesome location icon -->
          <div class="address-text">
            <div>Coastal Rd., cor. Victor Medina Street,</div>
            <div>San Dionisio, Paranaque City, Philippines</div>
          </div>
        </div>
        <!-- Email with mail icon -->
        <div class="additional-line">
          <span class="icon"><i class="fas fa-envelope"></i></span>info@paranaquecitycollege.edu.ph <!-- Font Awesome mail icon -->
        </div>
        <!-- Phone with phone icon -->
        <div class="additional-line">
          <span class="icon"><i class="fas fa-phone-alt"></i></span>(02)85343321 <!-- Font Awesome phone icon -->
        </div>
      </div>
      <img src="/pcc.png" alt="PCC Logo" class="second-logo"> <!-- Second PCC logo with added margin -->
    </div>
    <hr class="separator"> <!-- Horizontal Line -->
    
    <!-- Centered Content -->
    <div class="centered-text">
      <h1>OFFICE OF THE COLLEGE REGISTRAR</h1>
      <h2>Summary of Grades</h2>
      <h2>${fullProgramName}</h2> <!-- Dynamically displaying full course name -->
      <h2>${yearLevel}</h2>
      <h2>${semester} Semester S.Y. ${academicYear}</h2> <!-- Semester and Academic Year on the same line -->
    </div>
  `);

  printWindow.document.write(clonedTable.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};

  
    

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className='custom-color-green-font'>Certificate of Grades</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered className="text-center">
            <thead className='table-success'>
              <tr>
                <th colSpan="2" className='custom-color-green-font'>STUDENT NAME:</th>
                <th colSpan="3" className='custom-color-green-font'>STUDENT ID NO.:</th>
              </tr>
              <tr>
                <th colSpan="2" className='custom-color-green-font'>PROGRAM CODE & DESCRIPTION:</th>
                <th className='custom-color-green-font'>ACADEMIC YEAR:</th>
                <th className='custom-color-green-font'>SEMESTER:</th>
                <th className='custom-color-green-font'>YEAR LEVEL:</th>
              </tr>
              <tr>
                <th className='custom-color-green-font'>CODE</th>
                <th className='custom-color-green-font'>COURSE DESCRIPTION</th>
                <th className='custom-color-green-font'>UNITS</th>
                <th className='custom-color-green-font'>GRADE</th>
                <th className='custom-color-green-font'>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index}>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={closeModal}>Close</Button>
          <Button variant="success" >Download COG</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MasterlistOfGradesTable;
