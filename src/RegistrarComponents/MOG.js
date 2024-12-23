import React, { useState, useEffect, useContext } from 'react';
import { Form, Row, Col, Button, Modal, Table } from 'react-bootstrap';
import * as XLSX from 'sheetjs-style'; // Use sheetjs-style for formatting
import ProgramModel from '../ReactModels/ProgramModel'; // Ensure this path is correct
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import StudentModel from '../ReactModels/StudentModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import CourseModel from '../ReactModels/CourseModel';
import { UserContext } from '../Context/UserContext'; 
import '../App.css'

// MasterlistOfGradesTable Component
function MasterlistOfGradesTable() {
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [programName, setProgramName] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [tableContent, setTableContent] = useState("");
  const { user } = useContext(UserContext);
  const [admissionYears, setAdmissionYears] = useState([]);
  const [students, setStudents] = useState([]);
  const [semestersData, setSemestersData] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [showModalAlertView, setShowModalAlertView] =useState(false);
 
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const allPrograms = await ProgramModel.fetchAllPrograms(user.programNumber);
        setPrograms(allPrograms);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };

    const fetchAdmissionYears = async () => {
      try {
        const allAdmissionYear = await StudentModel.fetchExistingStudents();
        const admissionYr = allAdmissionYear.map((admission) => admission.studentAdmissionYr);
        const distinctAdmissionYr = [...new Set(admissionYr)];
        const sortedAdmissionYears = distinctAdmissionYr.sort((a, b) => b - a);
        setAdmissionYears(sortedAdmissionYears);

      }catch(error){
        console.error("Error fetching admission years:", error);
      }
    }
    fetchPrograms();
    fetchAdmissionYears()
    fetchStudentData();
  }, [user.programNumber]);

  const fetchStudentData = async (programNumber, batchYear) => {
    try {
      // Fetch necessary data from models
      const [studentsData, enrolledStudents, scheduleData] = await Promise.all([
        StudentModel.fetchExistingStudents(),
        EnrollmentModel.fetchAllEnrollment(),
        ScheduleModel.fetchAllSchedules(),
      ]);
  
      //console.log('Students Data:', studentsData);
  
      // Combine data from students, enrollment, and schedules
      const combinedData = enrolledStudents.map((enrollment) => {
        const student = studentsData.find(
          (student) => student.studentNumber === enrollment.studentNumber
        );
        const schedule = scheduleData.find(
          (schedule) => schedule.scheduleNumber === enrollment.scheduleNumber
        );
  
        return {
          studentAdmissionYear: student?.studentAdmissionYr || '',
          studentProgramNumber: student?.studentProgramNumber || '',
          studentNumber: enrollment.studentNumber,
          studentName: student
            ? `${student.studentNameFirst} ${student.studentNameMiddle || ''} ${student.studentNameLast}`
            : 'Unknown',
          scheduleNumber: enrollment.scheduleNumber,
          studentGender: student.studentSex,
          studentAddress: student.studentAddress,
          studentBirthDate: student.studentBirthDate,
          studentProgramNumber: student.studentProgramNumber,

        };
      });
  
      // Remove duplicates by studentNumber
      const distinctData = combinedData.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.studentNumber === value.studentNumber)
      );
  
     // console.log('Distinct Data:', distinctData);
  
      // Normalize values for filtering
      const normalizedProgramNumber = String(programNumber);
      const normalizedBatchYear = String(batchYear);
  
      // Filter based on selected program and batch year
      const filteredData = distinctData.filter(
        (student) =>
          String(student.studentProgramNumber) === normalizedProgramNumber &&
          String(student.studentAdmissionYear) === normalizedBatchYear
      );
  
      console.log('Filtered Student Data:', filteredData);
  
      return filteredData;
    } catch (error) {
      console.error('Failed to fetch and filter student data:', error);
      return [];
    }
  };
  
  const fetchCurriculum = async (programNumber, batchYear) => {
    try {
      // Fetch all courses
      const curricullumCourse = await CourseModel.fetchAllCourses();
      console.log("Courses:", curricullumCourse);
  
      // Filter courses by selected programNumber
      const filteredCourses = curricullumCourse.filter(
        (course) => String(course.programNumber) === String(programNumber)
      );
  
      //console.log("Filtered Courses for Program:", filteredCourses);
  
      // Group courses by year level and semester
      const groupedCourses = filteredCourses.reduce((acc, course) => {
        const { courseYearLevel, courseSemester, courseCode } = course;
  
        if (!acc[courseYearLevel]) {
          acc[courseYearLevel] = {};
        }
  
        if (!acc[courseYearLevel][courseSemester]) {
          acc[courseYearLevel][courseSemester] = [];
        }
  
        acc[courseYearLevel][courseSemester].push(courseCode);
        return acc;
      }, {});
  
      //console.log("Grouped Courses by Year and Semester:", groupedCourses);
  
      // Dynamically generate academic years starting from the batchYear
      const academicYears = [];
      for (let i = 0; i < 4; i++) { // Assume a 4-year program
        const startYear = batchYear + i;
        const endYear = startYear + 1;
        academicYears.push(`${startYear}-${endYear}`);
      }
  
     // console.log("Academic Years:", academicYears);
  
      return { groupedCourses, academicYears }; // Return both grouped courses and academic years
    } catch (error) {
      console.error("Failed to fetch Curriculum data:", error);
      return {};
    }
  };

  const closeShowModalAlertView = () => {
    setShowModalAlertView(false);
  }
  
  const handleView = async () => {
    if (programCode && batchYear) {
      setSemestersData({});
      setStudents([]);
      setAcademicYears([]);
      try {
        const { groupedCourses, academicYears } = await fetchCurriculum(programCode, batchYear);
        const filteredStudents = await fetchStudentData(programCode, batchYear);
        setSemestersData(groupedCourses); // Update semestersData
        setStudents(filteredStudents); // Update students data
        setAcademicYears(academicYears); // Update academic years
      } catch (error) {
        console.error("Error fetching data:", error);
        // Optionally, display an error modal here
      }
    } else {
      setShowModalAlertView(true); // Show alert for missing inputs
    }
  };

  const handleProgramNameChange = (e) => {
    const selectedProgramName = e.target.value;
    setProgramName(selectedProgramName);

    const selectedProgram = programs.find((program) => program.programName === selectedProgramName);
    setProgramCode(selectedProgram ? selectedProgram.programNumber : "");
  };


  const handleBatchYearSelected = (e) => {
    setBatchYear(e.target.value);
    setSemestersData({});
    setStudents([]);
    setAcademicYears([]);
    setProgramName("");
    setProgramCode("");

  }
  
  const handleTORClick = (students) => {
    setSelectedStudent(students);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // Example students data
  const getAcademicYear = (batchYear, yearLevel) => {
    // Ensure both batchYear and yearLevel are integers using unary `+`
    const startYear = (+batchYear) + (+yearLevel) - 1;  // Corrects the start year
    const endYear = startYear + 1;  // End year will always be one year ahead of start year
    return `${startYear}-${endYear}`; // Correct academic year format
  };
  
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

  const downloadExcel = () => {
    const table = document.querySelector('.table-success');
    const workbook = XLSX.utils.table_to_book(table, { raw: true });
    const ws = workbook.Sheets[workbook.SheetNames[0]];

    // Set sheet protection with a password (basic protection)
    ws['!protect'] = {
        password: 'AGRS',  // This is a simple password
        sheet: true,
        objects: true,
        scenarios: true,
        content: true,  // Prevent content editing
        formatCells: true,  // Prevent formatting
        formatColumns: true,  // Prevent column width changes
        formatRows: true,  // Prevent row height changes
        insertColumns: false,  // Prevent column insertion
        insertRows: false,  // Prevent row insertion
        deleteColumns: false,  // Prevent column deletion
        deleteRows: false,  // Prevent row deletion
        sort: false,  // Prevent sorting
        autoFilter: false,  // Prevent filters
        pivotTables: false,  // Prevent pivot table modification
    };

    // Apply styles and formatting (optional)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = { r: row, c: col };
            const cellRef = XLSX.utils.encode_cell(cellAddress);
            const cell = ws[cellRef];

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
        }
    }

    // Write the workbook to an Excel file with password protection
    XLSX.writeFile(workbook, `${programName || "Masterlist"}_Grades.xlsx`);
};

const downloadPDF = () => {
  const table = document.querySelector('.table-success');

  if (!table) {
    console.error("Table not found.");
    return;
  }

  // Temporarily hide the last column
  const lastColumnIndex = table.rows[0].cells.length - 1;
  for (let row of table.rows) {
    if (row.cells[lastColumnIndex]) {
      row.cells[lastColumnIndex].style.display = "none";
    }
  }

  html2canvas(table, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4"); // Landscape orientation, mm units, A4 size
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${programName || "Masterlist"}_Grades.pdf`);

    // Restore the visibility of the last column
    for (let row of table.rows) {
      if (row.cells[lastColumnIndex]) {
        row.cells[lastColumnIndex].style.display = "";
      }
    }
  });
};
  
  return (
    <div className='container-fluid'>
      {/* Program Filter Component */}
      <Form className="p-3 mb-4 bg-white border border-success rounded">
      <Row className="align-items-center">

      <Col xs={12} sm={6} md={2} lg={2}>
          <Form.Group controlId="batchYear">
            <Form.Label className="custom-color-green-font custom-font">
              Batch Year
            </Form.Label>
            <Form.Select
              value={batchYear}
              onChange={handleBatchYearSelected}
              className="border-success"
            >
              <option value="">Select Batch Year</option>
              {admissionYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select>

          </Form.Group>
        </Col>
        <Col xs={12} sm={6} md={2} lg={2}>
          <Form.Group controlId="programName">
            <Form.Label className="custom-color-green-font custom-font">Program Name</Form.Label>
            <Form.Select 
              value={programName} 
              onChange={handleProgramNameChange} 
              className="border-success"
              disabled={!batchYear}
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

        <Col xs={12} sm={6} md={2} lg={2}>
        <Form.Group controlId="programCode">
          <Form.Label className="custom-color-green-font custom-font">Program Code</Form.Label>
          <Form.Control 
            type="text"
            value={programCode}
            readOnly
            disabled
            className="border-success bg-white"
            placeholder="Select Program Name first"
          />
        </Form.Group>
      </Col>


        <Col xs={12} sm={6} md={6} lg={6}>
          <Form.Group>
            <Form.Label className="custom-color-green-font custom-font">Action</Form.Label>
            <div className="d-flex">
              <Button className="w-50 btn-success me-2" onClick={handleView}>View</Button>
              <Button className="bg-white custom-color-green-font btn-outline-success w-50 me-2" onClick={downloadExcel}>Download Excel</Button>
              <Button className="bg-white custom-color-green-font btn-outline-success w-50" onClick={downloadPDF}>Download PDF</Button>
            </div>
          </Form.Group>
        </Col>
      </Row>
    </Form>


   
      {/* Grades Table */}

      {Object.keys(semestersData).length === 0 && students.length === 0 ? (
  <div className="text-center py-5 bg-white rounded pt-5 px-4 pb-5">
    <h5 className="custom-color-green-font mt-5 fs-5">No Data Available</h5>
    <p className="fs-6 mb-4">
      Please ensure that all filters are applied then click "View" to display the data.
    </p>
  </div>
) : (
  <Table bordered responsive hover className="table-success mt-2 mb-4">
    <thead className="table-success">
      {/* Row for Year Levels */}
      <tr>
        <th className="custom-color-green-font custom-font">PROGRAM</th>
        <th className="text-center custom-color-green-font custom-font" colSpan={2}>
          {programName}
        </th>
        {Object.keys(semestersData).map((year, idx) => {
          // Calculate academic year for this year level
          const academicYear = getAcademicYear(batchYear, idx + 1);
          return (
            <th
              key={year}
              colSpan={Object.values(semestersData[year]).flat().length}
              className="text-center custom-color-green-font custom-font"
            >
              {`${year} YEAR A.Y. ${academicYear}`}
            </th>
          );
        })}
        <th
          rowSpan="4"
          className="align-middle text-center bg-white custom-color-green-font custom-font"
        >
          Transcript of Records(TOR)
        </th>
      </tr>

      {/* Row for Program Code */}
      <tr>
        <th className="custom-color-green-font custom-font">PROGRAM CODE</th>
        <th className="text-center custom-color-green-font custom-font" colSpan={2}>
          {programCode}
        </th>
        {Object.keys(semestersData).map((year) =>
          Object.keys(semestersData[year]).map((semester) => (
            <th
              key={`${year}-${semester}`}
              colSpan={semestersData[year][semester].length}
              className="text-center bg-white custom-color-green-font custom-font"
            >
              {`${semester.toUpperCase()} SEMESTER`}
            </th>
          ))
        )}
      </tr>

      {/* Row for Batch / Year */}
      <tr>
        <th className="custom-color-green-font custom-font">BATCH / YEAR</th>
        <th className="text-center custom-color-green-font custom-font" colSpan={2}>
          ({Object.keys(semestersData).length}) {batchYear}
        </th>
        {Object.keys(semestersData).map((year) =>
          Object.keys(semestersData[year]).map((semester) =>
            semestersData[year][semester].map((subject, idx) => (
              <th
                key={`${year}-${semester}-${idx}`}
                className="text-center custom-color-green-font bg-white custom-font"
                rowSpan={2}
              >
                {subject}
              </th>
            ))
          )
        )}
      </tr>
    </thead>
    <tbody>
      {students.length === 0 ? (
        <tr>
          {/* Dynamically set colSpan to cover all columns */}
          <td
            colSpan={
              3 +
              Object.keys(semestersData).reduce(
                (acc, year) =>
                  acc +
                  Object.keys(semestersData[year]).reduce(
                    (acc2, semester) =>
                      acc2 + semestersData[year][semester].length,
                    0
                  ),
                0
              ) +
              1
            }
            className="text-center fst-italic bg-white"
          >
            No Student Data Available
          </td>
        </tr>
      ) : (
        students.map((student, rowIdx) => (
          <tr key={rowIdx}>
            <td className="text-center bg-white">{rowIdx + 1}</td>
            <td className="text-center bg-white">{student.studentNumber}</td>
            <td className="bg-white">{student.studentName}</td>

            {/* Loop through semestersData to generate columns for each student */}
            {Object.keys(semestersData).map((year) =>
              Object.keys(semestersData[year]).map((semester) =>
                semestersData[year][semester].map((_, gradeIdx) => (
                  <td
                    key={`${year}-${semester}-${gradeIdx}`}
                    className="text-center bg-white"
                  ></td>
                ))
              )
            )}

            {/* TOR Button */}
            <td className="bg-white">
              <Button
                variant="success"
                className="w-100"
                onClick={() => handleTORClick(student)}
              >
                TOR
              </Button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </Table>
)}

      {/* Modal for displaying student's TOR */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl"  className="custom-modal-width">
        <Modal.Header closeButton>
          <Modal.Title className="custom-color-green-font">Transcription of Records (TOR) - {selectedStudent?.studentName}</Modal.Title>
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
            <td><p style={{ fontSize: '0.7rem' }}>{selectedStudent?.studentNumber}</p></td>
          </tr>
        </thead>
        <tbody className="no-border">
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>NAME</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>{selectedStudent?.studentName}</p></td>

            <td><p style={{ fontSize: '0.7rem' }}>SEX:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>{selectedStudent?.studentGender}</p></td>
          </tr>
          <tr>
            <td rowSpan={2}><p style={{ fontSize: '0.7rem' }}>PERMANENT ADDRESS:</p></td>
            <td rowSpan={2}><p style={{ fontSize: '0.7rem' }}>{selectedStudent?.studentAddress}</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>GR NO.:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>(COPC-032 s. 2023 CRO)</p></td>
          </tr>
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>SPECIAL ORDER NO.:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>((B) 50-343924 - 0028 S. 2024, Dated April 27,2024)</p></td>
          </tr>
          <tr>
            <td><p style={{ fontSize: '0.7rem' }}>DATE OF BIRTH</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>{selectedStudent?.studentBirthDate}</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>ACADEMIC PROGRAM:</p></td>
            <td><p style={{ fontSize: '0.7rem' }}>{programName}</p></td>
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
            <td><p style={{ fontSize: '0.7rem' }}>{batchYear}</p></td>
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


      <Modal show={showModalAlertView} onHide={closeShowModalAlertView} centered>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please complete all filters (Program, & Admission Year) to view schedules.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeShowModalAlertView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MasterlistOfGradesTable;


