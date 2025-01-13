import React, { useState, useEffect, useContext } from 'react';
import { Form, Row, Col, Button, Modal, Table, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import * as XLSX from 'sheetjs-style'; // Use sheetjs-style for formatting
import ProgramModel from '../ReactModels/ProgramModel'; // Ensure this path is correct
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import StudentModel from '../ReactModels/StudentModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import CourseModel from '../ReactModels/CourseModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import SubmissionModel from '../ReactModels/SubmissionModel';
import { UserContext } from '../Context/UserContext'; 
import '../App.css'

// MasterlistOfGradesTable Component
function MasterlistOfGradesTable() {
  const [loading, setLoading] = useState(false); 
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
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });


 
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const allPrograms = await ProgramModel.fetchAllPrograms(user.programNumber);
        const distinctPrograms = allPrograms.filter((program, index, self) =>
          index === self.findIndex((p) => p.programNumber === program.programNumber)
      );
        setPrograms(distinctPrograms);
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
   
    
    fetchStudentData().then(() => setLoading(false));
  }, [user.programNumber]);

  
  const generateAcademicYears = (startYear) => Array.from({ length: 4 }, (_, i) => `${startYear + i}-${startYear + i + 1}`);

  const fetchStudentData = async (programNumber, batchYear) => {
   
    try {

      const academicYears = generateAcademicYears(parseInt(batchYear));
      // Fetch necessary data from models
      const [studentsData, enrolledStudents] = await Promise.all([
        StudentModel.fetchExistingStudents(),
        EnrollmentModel.fetchAllEnrollment()
      ]);

      const schedules = await Promise.all(
        academicYears.map(async (acadYear) => {
          return await ScheduleModel.fetchAllSchedules(acadYear);
        })
      );

      const scheduleData = schedules.flat();

      const submissionsBySchedule = await Promise.all(
        scheduleData.map(async (schedule) => {
          const submissions = await SubmissionModel.fetchSubmissionBySchedule(schedule.scheduleNumber);
          return {
            scheduleNumber: schedule.scheduleNumber,
            status: submissions[0]?.submissionStatus,
          };
        })
      );

      // Example: Logging the submissions grouped by scheduleNumber
      const filter = submissionsBySchedule.filter((submission) => submission.status === 'Verified');

      const verifiedScheduleNumbers = new Set(filter.map((item) => item.scheduleNumber));
      
      
      
  
      const semGradeDataPromises = enrolledStudents.map((enrollment) =>
        SemGradeModel.fetchSemGradeData(enrollment.scheduleNumber)
      );
      const semGradeDataArray = await Promise.all(semGradeDataPromises);
  
      // Flatten the array if fetchSemGradeData returns arrays
      const semGradeData = semGradeDataArray.flat();

      console.log(semGradeData);

  
      // Combine data from students, enrollment, and schedules
      const combinedData = studentsData.map((student) => {
        const studentEnrollments = enrolledStudents.filter(
          (enrollment) => enrollment.studentNumber === student.studentNumber
        );
  
        if (studentEnrollments.length === 0) {
          return null; // Exclude students with no enrollments
        }
  
        // Map courses for the student
        const courses = studentEnrollments.map((enrollment) => {

          const isVerified = verifiedScheduleNumbers.has(enrollment.scheduleNumber);
          const gradeData = semGradeData.find(
            (semGrade) =>
              semGrade.scheduleNumber === enrollment.scheduleNumber &&
              semGrade.studentNumber === enrollment.studentNumber
          );
  
          return {
            courseCode: enrollment.courseCode,
            scheduleNumber: enrollment.scheduleNumber,
            grade: isVerified ? ((gradeData?.numEq || 0).toFixed(2)) : 0
          };
        });
  
        return {
          studentAdmissionYear: student?.studentAdmissionYr || 'N/A',
          studentProgramNumber: student?.studentProgramNumber || 'N/A',
          studentNumber: student.studentNumber,
          studentName: `${student.studentNameLast}, ${student.studentNameFirst} ${student.studentNameMiddle || 'N/A'}`,
          studentGender: student.studentSex || 'N/A',
          studentAddress: student.studentAddress || 'N/A',
          studentBirthDate: student.studentBirthDate || 'N/A',
          studentBirthPlace: student.studentBirthPlace || 'N/A',
          studentGrNumber: student.grNumber || 'N/A',
          studentspecielaNumber: student.specialOrderNumber || 'N/A',
          studentNumberOdSemesterAttended: student.numberOfSemesterAttended || 'N/A',
          studentDateGraduated: student.dateGraduated || 'N/A',
          studentnationality: student.studentNationality || 'N/A',
          studentAdmissionCredentials: student.admissionCredentials || 'N/A',
          studentSchoolLastAttended: student.schoolLastAttended || 'N/A',
          studentCategoryStarnd: student.categoryStrand || 'N/A',
          studentDateSemesterAdmitted: student.dateSemesterAdmitted || 'N/A',
          courses, // Array of course data
        };
      });
  
      // Filter out null values (students with no enrollments)
      const validData = combinedData.filter((student) => student !== null);
  
      // Normalize values for filtering
      const normalizedProgramNumber = String(programNumber);
      const normalizedBatchYear = String(batchYear);
  
      // Filter based on selected program and batch year
      const filteredData = validData.filter(
        (student) =>
          String(student.studentProgramNumber) === normalizedProgramNumber &&
          String(student.studentAdmissionYear) === normalizedBatchYear
      );
  
      // Sort the filtered data by student surname (last name)
      const sortedData = filteredData.sort((a, b) => {
        const lastNameA = a.studentName.split(',')[0].toLowerCase();
        const lastNameB = b.studentName.split(',')[0].toLowerCase();
        return lastNameA.localeCompare(lastNameB);
      });
  
      return sortedData;
    } catch (error) {
      console.error('Failed to fetch and filter student data:', error);
      return [];
    }
  };
  

const fetchCurriculum = async (programNumber, batchYear) => {
  try {
    // Fetch all courses
    const curricullumCourse = await CourseModel.fetchAllCourses();
    //console.log("Courses:", curricullumCourse);

    const programData = await ProgramModel.fetchProgramData(programNumber); // Updated to programNumber
    //console.log("Programs:", programData);

    // Extract the length of the program
    const programLength = programData.programNumOfYear; // This should provide the number of years
    //console.log("Program Length (Years):", programLength);

    // Filter courses by selected programNumber
    const filteredCourses = curricullumCourse.filter(
      (course) => String(course.programNumber) === String(programNumber)
    );

    // Group courses by year level and semester
    const groupedCourses = filteredCourses.reduce((acc, course) => {
      const {
        courseYearLevel,
        courseSemester,
        courseCode,
        courseDescriptiveTitle,
        courseLecture,
        courseLaboratory,
      } = course;

      // Calculate unit of credits
      const unitOfCredits = (courseLecture || 0) + (courseLaboratory || 0);

      // Ensure yearLevel and semester groups exist
      if (!acc[courseYearLevel]) {
        acc[courseYearLevel] = {};
      }

      if (!acc[courseYearLevel][courseSemester]) {
        acc[courseYearLevel][courseSemester] = [];
      }

      // Push the complete course details
      acc[courseYearLevel][courseSemester].push({
        courseCode,
        courseDescriptiveTitle,
        courseLecture,
        courseLaboratory,
        unitOfCredits,
      });

      return acc;
    }, {});

    console.log("Grouped Courses by Year and Semester:", groupedCourses);

    // Dynamically generate academic years starting from the batchYear
    const academicYears = [];
    for (let i = 0; i < programLength; i++) {
      const startYear = batchYear + i;
      const endYear = startYear + 1;
      academicYears.push(`${startYear}-${endYear}`);
    }

//    console.log("Academic Years:", academicYears);
    setSemestersData(groupedCourses); 
    setAcademicYears(academicYears);
    return { programLength }; // Return grouped courses, academic years, and program length
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
      // Reset previous state
      setSemestersData({});
      setStudents([]);
      setAcademicYears([]);
      setLoading(true); 
      try {
        // Start loading indicator
  
        // Fetch curriculum and students in parallel
        await Promise.all([
          fetchCurriculum(programCode, batchYear),
          fetchStudentData(programCode, batchYear).then((filteredStudents) => {
            setStudents(filteredStudents); // Update students data
          }),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Optionally, display an error modal or message
      } finally {
        setLoading(false); // Stop loading indicator after all fetches complete
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

  function getGradeDescription(grade) {
    // Handle special cases for 'INC', 'NC', 'OD', 'FA', 'UD'
    const specialGrades = {
      'INC': 'Incomplete',
      'NC': 'No Credit',
      'OD': 'Officially Dropped',
      'FA': 'Failure due to Excessive Absences',
      'UD': 'Unofficially Dropped'
    };
    
    // If the grade is a string (like 'INC', 'NC', etc.), return the special description
    if (typeof grade === 'string') {
      return specialGrades[grade] || 'Invalid Grade';
    }
  
    // Handle numeric grades with the provided grade values
    if (grade === 1.00) return 'Excellent';
    if (grade === 1.25) return 'Superior';
    if (grade === 1.50) return 'Very Good';
    if (grade === 1.75) return 'Good';
    if (grade === 2.00) return 'Meritorious';
    if (grade === 2.25) return 'Very Satisfactory';
    if (grade === 2.50) return 'Satisfactory';
    if (grade === 2.75) return 'Fairly Satisfactory';
    if (grade === 3.00) return 'Passing';
    if (grade === 5.00) return 'Failed';
  
    return 'Invalid Grade'; // If the grade doesn't match any of the specified values
  }

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
    const logoURL = '/pcc.png'; // Ensure the image path is correct and accessible.

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print TOR</title>
<style>
@media print {
  @page {
    size: legal;
    margin: 10mm; /* Keep margins small */
    scale: 99;
  }

  body {
    margin: 0;
    font-family: Arial, sans-serif;
  }

  .content {
    page-break-inside: avoid; /* Prevent unnecessary page breaks */
    overflow: visible;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    page-break-inside: auto; /* Allow tables to split naturally across pages */
    page-break-after: auto;
  }

  th, td {
    border: 1px solid black;
    padding: 5px;
    text-align: left;
  }

  tr {
    page-break-inside: avoid; /* Prevent breaking rows */
  }

  thead {
    display: table-header-group; /* Repeat headers on each page */
  }

  tfoot {
    display: table-footer-group; /* Repeat footers on each page */
  }

  .watermark {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-image: url('${logoURL}');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 500px 500px;
    opacity: 0.1;
  }
}
</style>





        </head>
        <body>
          <!-- Watermark -->
          <div class="watermark"></div>

          <!-- Content -->
          <div class="content">
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

  
  return (
    <div className='container-fluid'>
      <h2 className="custom-font custom-color-green-font mb-3 mt-2">MOG</h2>
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
            </div>
          </Form.Group>
        </Col>
      </Row>
    </Form>


   
      {/* Grades Table */}
      {loading ? (
        <div className="text-center py-5 bg-white">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Loading data, please wait...</p>
        </div>
      ) : (
        <>
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
                    rowSpan="3"
                    className="align-middle text-center bg-white custom-color-green-font custom-font"
                  >
                    Transcript of Records (TOR)
                  </th>
                </tr>

                {/* Row for Program Code */}
                <tr>
                  <th className="custom-color-green-font custom-font">PROGRAM CODE</th>
                  <th className="text-center custom-color-green-font custom-font" colSpan={2}>
                    {programCode}
                  </th>
                  {Object.keys(semestersData).map((year, idx) => {
                    const academicYear = getAcademicYear(batchYear, idx + 1);
                    return Object.keys(semestersData[year]).map((semester) => (
                      <th
                        key={`${year}-${semester}`}
                        colSpan={semestersData[year][semester].length}
                        className="text-center bg-white custom-color-green-font custom-font"
                      >
                        {`${semester.toUpperCase()} SEMESTER A.Y. ${academicYear}`}
                      </th>
                    ));
                  })}
                </tr>

                {/* Row for Batch / Year */}
                <tr>
                  <th className="custom-color-green-font custom-font">BATCH / YEAR</th>
                  <th className="text-center custom-color-green-font custom-font" colSpan={2}>
                    ({Object.keys(semestersData).length}) {batchYear}
                  </th>
                  {Object.keys(semestersData).map((year) => {
                    return Object.keys(semestersData[year]).map((semester) =>
                      semestersData[year][semester].map((course, courseIdx) => (
                        <th
                          key={`${year}-${semester}-${courseIdx}`}
                          className="text-center custom-color-green-font bg-white custom-font"
                          rowSpan={1}
                        >
                          {course.courseCode}
                        </th>
                      ))
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
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
                      {/* Student Info */}
                      <td className="text-center bg-white">{rowIdx + 1}</td>
                      <td className="text-center bg-white">{student.studentNumber}</td>
                      <td className="bg-white">{student.studentName}</td>

                      {/* Display Grades */}
                      {Object.keys(semestersData).map((year) =>
                        Object.keys(semestersData[year]).map((semester) =>
                          semestersData[year][semester].map((course, gradeIdx) => {
                            // Find the grade for the course
                            const courseGrade = student.courses.find(
                              (studentCourse) => studentCourse.courseCode === course.courseCode
                            )?.grade;

                            return (
                              <td
                                key={`${year}-${semester}-${gradeIdx}`}
                                className="text-center bg-white"
                              >
                                {courseGrade !== undefined ? courseGrade : '-'}
                              </td>
                            );
                          })
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
        </>
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
<table className="table table-white" style={{ borderCollapse: 'collapse', border: '2px solid black' }}>
  <thead className="no-border">
    <tr>
      <th
        className="text-center"
        style={{ width: '25%', border: 'none' }}
      >
        <img
          src="/pcc.png"
          alt="Logo"
          className="img-fluid"
          style={{ width: '110px' }}
        />
      </th>
      <th
        className="text-center"
        style={{ width: '50%', border: 'none' }}
      >
        <p className="fs-6 mb-0 fw-semibold">
          PARAÑAQUE CITY COLLEGE
        </p>
        <p className="fs-5 mb-0">Office of the College Registrar</p>
        <p
          style={{ fontSize: '0.9rem' }}
          className="mb-0"
        >
          Parañaque City, Philippines
        </p>
        <p className="fs-4 mb-0">
          OFFICIAL TRANSCRIPT OF RECORDS
        </p>
      </th>
      <th
        className="text-center"
        style={{ width: '25%', border: 'none' }}
      >
        <p className="fs-6">UF-REG-018</p>
        <p className="fs-6">Rev.0</p>
        <p className="fs-6">03/01/2022</p>
      </th>
    </tr>
  </thead>
</table>


                        
              <table
                style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}
                className="mb-2"
              >
                <thead className="no-border">
                  <tr>
                    <td
                      className="no-border"
                      colSpan="2"
                      style={{ border: "none" }}
                    >
                      <p
                        className="fw-bold m-0 px-2 py-1"
                        style={{
                          display: "inline-block",
                          border: "5px solid #F7FE28",
                          backgroundColor: "#004d00",
                          color: "white",
                        }}
                      >
                        PERSONAL DATA
                      </p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>STUDENT NUMBER: </p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentNumber}
                      </p>
                    </td>
                  </tr>
                </thead>
                <tbody className="no-border">
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>NAME</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentName}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>SEX:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentGender}</p>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "none",
                      }}
                      rowSpan={2}
                    >
                      <p style={{ fontSize: "0.7rem" }}>PERMANENT ADDRESS:</p>
                    </td>
                    <td style={{ border: "none" }} rowSpan={2}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentAddress}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>GR NO.:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentGrNumber}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>SPECIAL ORDER NO.:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentspecielaNumber}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>DATE OF BIRTH</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentBirthDate}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>ACADEMIC PROGRAM:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{programName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>PLACE OF BIRTH</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentBirthPlace}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>ATTENDED:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentNumberOdSemesterAttended}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>NATIONALITY</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentnationality}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>DATE GRADUATED:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentDateGraduated}</p>
                    </td>
                  </tr>
                </tbody>
              </table>



              <table
                style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}
                className="p-2 mb-0"
              >
                <thead className="no-border">
                  <tr>
                    <td colSpan="1" style={{ border: "none" }}>
                      <p
                        className="fw-bold m-0 px-2 py-1"
                        style={{
                          display: "inline-block",
                          border: "5px solid #F7FE28",
                          backgroundColor: "#004d00",
                          color: "white",
                        }}
                      >
                        ENTRANCE DATA
                      </p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>ADMISSION CREDENTIALS</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentAdmissionCredentials}
                      </p>
                    </td>
                    <td style={{ border: "none" }}></td>
                  </tr>
                </thead>
                <tbody className="no-border">
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>DATE GRADUATED/LAST ATTENDED:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{batchYear}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>SCHOOL LAST ATTENDED:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentSchoolLastAttended}
                      </p>
                    </td>
                    <td style={{ border: "none" }}></td>
                  </tr>
                  <tr>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>CATEGORY:</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentCategoryStarnd}</p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>DATE/SEMESTER ADMITTED: </p>
                    </td>
                    <td style={{ border: "none" }}>
                      <p style={{ fontSize: "0.7rem" }}>
                        {selectedStudent?.studentDateSemesterAdmitted}
                      </p>
                    </td>
                    <td style={{ border: "none" }}></td>
                  </tr>
                </tbody>
              </table>

              <div
style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  width: '100%',
  gap: '0px',  // Set gap to 0 for shared borders
  textAlign: 'center',
  border: '1px solid black', // Outer border
}}
>
  {/* Header Row */}
  <div style={{ gridColumn: 'span 6', borderBottom: '1px solid black' , fontSize: '0.8rem',}}>
    <p className="fs-6 text-start mb-1"><strong>ACADEMIC RECORD</strong></p>
  </div>
  {/* Column Headers */}
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', gridRow: 'span 2', fontSize: '0.8rem', }}>
    TERM & SCHOOL YEAR
  </div>
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', gridRow: 'span 2', fontSize: '0.8rem',  }}>
    SUBJECT CODE
  </div>
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', gridRow: 'span 2', fontSize: '0.8rem',  }}>
    DESCRIPTIVE TITLE
  </div>
  
  {/* Final Header that spans two columns */}
  <div
    style={{
      gridColumn: 'span 2',  // Spans across "FINAL GRADES" and "COMPLETION"
      border: '1px solid black',
      padding: '8px',
      fontWeight: 'bold',
      fontSize: '0.8rem',
    }}
  >
    FINAL
  </div>

  {/* FINAL GRADES and COMPLETION Column Headers */}
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', gridRow: 'span 2', fontSize: '0.8rem', }}>
  UNITS OF CREDIT
  </div>
  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', fontSize: '0.8rem', }}>
    GRADES
  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', fontSize: '0.8rem', }}>
    COMPLETION
  </div>


  {/* Rows of Data */}
  {Object.keys(semestersData).map((yearLevel, idx) =>
    [1, 2].map((semester) => {
      const courses = semestersData[yearLevel][semester] || [];
      const academicYear = getAcademicYear(batchYear, idx + 1);
      return (
        <>
          {courses.length > 0 ? (
            courses.map((course, subIdx) => (
              <>
                {subIdx === 0 && (
                  <div
                    style={{
                      gridColumn: '1',
                      gridRow: `span ${courses.length}`,
                      border: '1px solid black',
                      padding: '8px',
                      fontSize: '0.8rem', 
                    }}
                  ><strong>
                    {semester === 1 ? '1st' : '2nd'} Semester <br />
                    {academicYear} </strong>
                  </div>
                )}
<div style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', fontSize: '0.8rem', lineHeight: '1.0'}}>
  {course.courseCode}
</div>
<div style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', fontSize: '0.8rem', lineHeight: '1.0'  }}>
  {course.courseDescriptiveTitle}
</div>
<div style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', fontSize: '0.8rem', lineHeight: '1.0'  }}>
  {selectedStudent?.courses.find(
    (c) => c.courseCode === course.courseCode
  )?.grade || '-'}
</div>
<div style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', fontSize: '0.8rem', lineHeight: '1.0'  }}>
  {getGradeDescription(
    selectedStudent?.courses.find(
      (c) => c.courseCode === course.courseCode
    )?.grade || '-'
  )}
</div>
<div style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', fontSize: '0.8rem', lineHeight: '1.0' }}>
  {course.unitOfCredits}
</div>


              </>
            ))
          ) : (
            <div
              style={{
                gridColumn: 'span 6',
                border: '1px solid black',
                padding: '8px',
                textAlign: 'center',
                fontSize: '0.8rem',
              }}
            >
              No courses available
            </div>
          )}
        </>
      );
    })
  )}
</div>


<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    width: '100%',
    gap: '0px',  // Set gap to 0 for shared borders
    textAlign: 'center',
    border: '1px solid black', // Outer border
  }}
>
  {/* Header Row */}
  <div style={{ gridColumn: 'span 1', border: '1px solid black', padding: '8px' }}>
    <p className="fs-6 text-start mb-1">REMARKS:</p>
  </div>
  <div style={{ gridColumn: 'span 7', border: '1px solid black', padding: '8px' }}>
    <p className="fs-6 text-start mb-1"><strong>CLEARED OF ALL PROPERTY AND MONEY ACCOUNTABILITIES</strong></p>
  </div>

  {/* Grading System Header */}
  <div style={{ gridColumn: 'span 3', border: '1px solid black', padding: '8px' }}>
    <p style={{ fontSize: '0.9rem' }}><strong>GRADING SYSTEM</strong></p>
  </div>
  <div
    style={{
      gridColumn: 'span 5',
      gridRow: 'span 2',
      border: '1px solid black',
      padding: '8px',
    }}
  >
<p style={{ paddingTop: '10px' ,textAlign: 'left', fontSize: '0.8rem', fontStyle: 'italic' }}>
  This Transcript is valid only when it bears the school seal and the original signature of the
  Registrar. Any erasure or alteration made on this document renders it void unless initialed
  by the foregoing official.
</p>


  </div>

  {/* Sub-Headers */}
  <div style={{ border: '1px solid black', padding: '8px' }}>
    <p style={{ fontSize: '0.7rem' }}>GRADE</p>
  </div>
  <div style={{ border: '1px solid black', padding: '8px' }}>
    <p style={{ fontSize: '0.7rem' }}>EQUIVALENCE</p>
  </div>
  <div style={{ border: '1px solid black', padding: '8px' }}>
    <p style={{ fontSize: '0.7rem' }}>DESCRIPTION</p>
  </div>

  {/* Body Rows */}
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>1.00</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>99-100%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>EXCELLENT</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'left',
      fontSize: '0.7rem', 
      lineHeight: '1.0'
    }}
  >
    Prepared by:
  </div>
  <div
  style={{
    gridColumn: 'span 2',
    gridRow: 'span 14',
    border: '1px solid black',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end', // Aligns content to the bottom
    height: '100%', // Ensures the div takes up the full height
    fontSize: '0.7rem', 
  }}
>
  <p style={{ fontSize: '0.7rem' }}>
    Transcript is <strong>NOT</strong> valid without PCC seal
  </p>
</div>


  {/* Repeat for remaining rows */}
  <div style={{ border: '1px solid black', padding: '8px' , fontSize: '0.7rem', lineHeight: '1.0' }}>1.25</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>96-98%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>SUPERIOR</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'center',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
    <strong>
      <big>{`${user.personnelNameFirst} ${user.personnelNameMiddle} ${user.personnelNameLast}`}</big>
    </strong>
  </div>

    {/* Repeat for remaining rows */}
    <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>1.50</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>93-95%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>VERY GOOD</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'center',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
    Program Records-In-Charge
  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>1.75</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>90-92%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>GOOD</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'left',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
    Checked & Verified by:
  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>2.00</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>87-89%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>MERITORIOUS</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'left',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >

  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>2.25</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>84-86%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>VERY SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'center',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
    Registrar 1
  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>2.50</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>81-83%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'left',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
    Date Issued
  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>2.75</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>76-80%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>FAIRLY SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'center',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
    <big>{formattedDate}</big>
  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>3.00</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>75-77%</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>PASSING</div>
  <div
    style={{
      gridColumn: 'span 3',
      gridRow: 'span 4',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'center',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
    
  </div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>5.00</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>Below 50</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>FAILED</div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>INC</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}></div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>INCOMPLETE</div>

  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>OD</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}></div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>OFFICIALY DROPPED</div>


  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>UD</div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}></div>
  <div style={{ border: '1px solid black', padding: '8px', fontSize: '0.7rem', lineHeight: '1.0' }}>UNOFICIALLY DROPPED</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'center',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
      <strong>
      <big>{`${user.personnelNameFirst} ${user.personnelNameMiddle} ${user.personnelNameLast}`}</big>
    </strong>
  </div>

  <div style={{ border: '1px solid black', padding: '8px' , fontSize: '0.7rem', lineHeight: '1.0'}}>FA</div>
  <div style={{ border: '1px solid black', padding: '8px' , fontSize: '0.7rem', lineHeight: '1.0'}}></div>
  <div style={{ border: '1px solid black', padding: '8px' , fontSize: '0.7rem', lineHeight: '1.0'}}>FAILURE DUE TO EXCESSIVE ABSENCES</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '8px',
      textAlign: 'center',
      fontSize: '0.7rem', lineHeight: '1.0'
    }}
  >
  College Registrar
  </div>
  {/* Add other rows in similar fashion */}
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


