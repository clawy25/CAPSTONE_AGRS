import React, { useState, useEffect, useContext } from 'react'; 
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt,  faEnvelope, faPhoneAlt} from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../Context/UserContext';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import SectionModel from '../ReactModels/SectionModel';
import StudentModel from '../ReactModels/StudentModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import CourseModel from '../ReactModels/CourseModel';
import '../App.css';


const MasterlistOfGradesTable = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('First');
  const [program, setProgram] = useState('');
  //const [sections, setSections] = useState(Array(8).fill(null).map((_, index) => `Section ${index + 1}`));
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [programs, setPrograms] = useState([]);
  //const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [showModal, setShowModal] = useState(false); 
  const [showModalAlert, setShowModalAlert] =useState(false);
  const [showModalAlertView, setShowModalAlertView] =useState(false);
  const { user } = useContext(UserContext);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('First');
  const [selectedSection, setSelectedSection] = useState('A'); // Default to Section A
  const [currentAcademicYear, setCurrentAcadYear] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [groupedData, setGroupedData] = useState({});  

  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
      setAcademicYears(fetchedAcademicYears);

      const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);
      setCurrentAcadYear(current);
  
      const fetchedProgram = await ProgramModel.fetchAllPrograms(user.programNumber);

      setPrograms(fetchedProgram);
  
      if (fetchedProgram.length > 0) {
        const data = [];
      
        fetchedProgram.forEach(row => {
          // Check if there is already an entry for the current academicYear
          let existingAcadYear = data.find(item => item.academicYear === row.academicYear);
      
          if (!existingAcadYear) {
            // Filter programs for the current academicYear
            const programsForYear = fetchedProgram.filter(item => item.academicYear === row.academicYear);
            
            // Collect unique programs for the academicYear
            const programs = [];
            const programNamesSet = new Set();
      
            programsForYear.forEach(row => {
              if (!programNamesSet.has(row.programName)) {
                programNamesSet.add(row.programName);
      
                // Create yearLevels with default semesters [1, 2], and add semester 3 if programYrLvlSummer matches
                const yearLevels = Array.from({ length: row.programNumOfYear }, (_, i) => {
                  const yearLevel = i + 1;
                  const semesters = yearLevel === row.programYrLvlSummer ? [1, 2, 3] : [1, 2];
                  return { yearLevel, semesters };
                });
      
                programs.push({
                  programName: row.programName,
                  yearLevels: yearLevels
                });
              }
            });
      
            // Create a new entry for the academicYear
            const entry = {
              academicYear: row.academicYear,
              programs
            };
            data.push(entry); // Push the new entry into the data array
          }
        });

        setMappedData(data);
      }      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      // Find the selected program based on academic year and program name
      const program = programs.find(
        (p) =>
          p.academicYear === selectedAcademicYear &&
          p.programName === selectedProgram
      );
  
      const selectedProgramNumber = program ? program.programNumber : null;
      const yearLevel = parseInt(selectedYearLevel, 10);
      const semester = parseInt(selectedSemester, 10);
  
      if (!selectedProgramNumber) {
        console.error("No matching program found for the selected criteria.");
        return;
      }
  
      const coursesData = await CourseModel.fetchAllCourses();
  
      // Create a map of course codes to course details for quick lookup
      const courseDetailsMap = coursesData.reduce((map, course) => {
        map[course.courseCode] = {
          courseDescriptiveTitle: course.courseDescriptiveTitle || '-',
          courseLecture: course.courseLecture || 0, // Assuming lecture units are numerical
          courseLaboratory: course.courseLaboratory || 0, // Assuming lab units are numerical
        };
        return map;
      }, {});
  
      // Fetch sections filtered by the selected criteria
      const sectionData = await SectionModel.fetchExistingSections(
        selectedAcademicYear,
        yearLevel,
        semester,
        selectedProgramNumber
      );
  
      // Extract section numbers from sectionData and sort them in ascending order
      const sectionNumbers = sectionData
        .map((section) => section.sectionNumber)
        .sort((a, b) => {
          // Regex to split the section number into numeric part and alphanumeric part
          const regex = /(\d+)-([A-Za-z]+)(\d*)/;
          const [, numA, alphaA, suffixA] = a.match(regex) || [];
          const [, numB, alphaB, suffixB] = b.match(regex) || [];
  
          // First compare the numeric part
          if (parseInt(numA) !== parseInt(numB)) {
            return parseInt(numA) - parseInt(numB);
          }
  
          // If numeric parts are the same, compare the alphanumeric part
          if (alphaA !== alphaB) {
            return alphaA.localeCompare(alphaB);
          }
  
          // If both numeric and alpha parts are the same, compare the suffixes
          return suffixA.localeCompare(suffixB);
        });
  
      if (sectionNumbers.length === 0) {
        console.warn("No sections found for the selected criteria.");
        setGroupedData([]); // Clear data if no sections found
        return;
      }
  
      // Fetch all schedules for the selected academic year
      const scheduleData = await ScheduleModel.fetchAllSchedules(selectedAcademicYear);
  
      // Filter schedules to match the sorted section numbers
      const filteredSchedules = scheduleData.filter((schedule) =>
        sectionNumbers.includes(schedule.sectionNumber)
      );
  
      // Fetch personnel data for the selected academic year
      const personnelData = await PersonnelModel.fetchAllPersonnel(selectedAcademicYear);
  
      // Map personnel numbers to their last names
      const personnelNameLastMap = personnelData.reduce((map, personnel) => {
        map[personnel.personnelNumber] = personnel.personnelNameLast;
        return map;
      }, {});
  
      // Group course-related information (courseCode, personnelNames, courseDetails) by section number
      const groupedData = filteredSchedules.reduce((acc, schedule) => {
        const { sectionNumber, courseCode, personnelNumber } = schedule;
        const personnelLastName = personnelNameLastMap[personnelNumber] || "Unknown";
  
  
        // Initialize section entry if not already present
        if (!acc[sectionNumber]) {
          acc[sectionNumber] = { courses: [] }; // Now `courses` will hold course-related data
        }
  
        // Add the course data to the section's courses list
        acc[sectionNumber].courses.push({
          courseCode,
          personnelLastName, // Add total units to the course data
        });
  
        return acc;
      }, {});
  
      // Save the grouped data to state for rendering
      setGroupedData(groupedData);
      console.log('groupedData', groupedData);
  
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  
  const fetchStudentData = async () => {
    try {
      // Fetch necessary data
      const studentsData = await StudentModel.fetchExistingStudents();
      const enrolledStudents = await EnrollmentModel.fetchAllEnrollment();
      const scheduleData = await ScheduleModel.fetchAllSchedules(selectedAcademicYear);
      const coursesData = await CourseModel.fetchAllCourses(); // Fetch courses data
  
      // Combine and group data by studentNumber
      const combinedData = await Promise.all(
        enrolledStudents.map(async (enrollment) => {
          // Match student details
          const student = studentsData.find(
            (student) => student.studentNumber === enrollment.studentNumber
          );
  
          // Match schedule details
          const schedule = scheduleData.find(
            (schedule) => schedule.scheduleNumber === enrollment.scheduleNumber
          );
  
          // Fetch semester grades based on scheduleNumber
          const semesterGrades = await SemGradeModel.fetchSemGradeData(
            enrollment.scheduleNumber
          );
  
          // Find the grade for the student based on studentNumber and scheduleNumber
          const studentGrade = semesterGrades.find(
            (grade) => grade.studentNumber === enrollment.studentNumber
          );
  
          // Separate scheduleNumber, studentGrade, and courseCode into arrays
          const scheduleNumber = enrollment.scheduleNumber || null;
          const grade = studentGrade ? studentGrade.grade : 0;
          const courseCode = schedule?.courseCode || null;
  
          // Fetch the course details based on courseCode
          const course = coursesData.find(course => course.courseCode === courseCode);
          const courseDescription = course ? course.courseDescriptiveTitle : '-';
          const courseLecture = course ? course.courseLecture : '-';
          const courseLaboratory = course ? course.courseLaboratory : '-';
  
          return {
            studentNumber: enrollment.studentNumber,
            studentName: student
              ? `${student.studentNameFirst} ${student.studentNameMiddle || ''} ${student.studentNameLast}`
              : 'Unknown',
            sectionNumber: schedule?.sectionNumber || null,
            scheduleNumber,
            studentGrade: grade,
            courseCode,
            courseDescription,
            courseLecture,
            courseLaboratory,
          };
        })
      );
  
      // Group data by studentNumber to ensure each student is distinct
      const distinctData = combinedData.reduce((acc, current) => {
        const existing = acc.find((item) => item.studentNumber === current.studentNumber);
  
        if (!existing) {
          // If student doesn't exist yet, create a new entry
          acc.push({
            studentNumber: current.studentNumber,
            studentName: current.studentName,
            sectionNumber: current.sectionNumber,
            scheduleNumbers: [current.scheduleNumber],
            studentGrades: [current.studentGrade],
            courseCodes: [current.courseCode],
            courseDescriptions: [current.courseDescription],
            courseLectures: [current.courseLecture],
            courseLaboratories: [current.courseLaboratory],
          });
        } else {
          // If student already exists, push the new schedule data to arrays
          existing.scheduleNumbers.push(current.scheduleNumber);
          existing.studentGrades.push(current.studentGrade);
          existing.courseCodes.push(current.courseCode);
          existing.courseDescriptions.push(current.courseDescription);
          existing.courseLectures.push(current.courseLecture);
          existing.courseLaboratories.push(current.courseLaboratory);
        }
  
        return acc;
      }, []);
  
      // Set the distinct data to state
      setCombinedData(distinctData);
  
      return distinctData;
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    }
  };

  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, [user.programNumber]);


  const handleAcademicYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedAcademicYear(selectedYear);
    setSelectedProgram('');  // Reset dependent fields
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleProgramChange = (e) => {
    const selectedProgram = e.target.value;
    setSelectedProgram(selectedProgram);
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleYearLevelChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYearLevel(selectedYear);
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleSemesterChange = (e) => {
    const level = (e.target.value);
    setSelectedSemester(level);
    setSelectedSection('');
    
  };


  const getSemesterText = (semester) => {
    const sem = parseInt(semester, 10);
    switch (sem) {
      case 1:
        return "First";
      case 2:
        return "Second";
      case 3:
        return "Summer";
      default:
        return `${sem}`;
    }
  };

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
  

  function calculateGWA(studentGrades) {
    if (studentGrades.length === 0) return 0; // Return 0 if there are no grades
  
    // Calculate the sum of the grades
    const totalGrades = studentGrades.reduce((acc, grade) => acc + grade, 0);
  
    // Calculate the General Weighted Average (GWA)
    const gwa = totalGrades / studentGrades.length;
    
    return gwa.toFixed(2); // Return GWA rounded to 2 decimal places
  }

  function calculateGradeSum(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
  
    const total = values.reduce((acc, value) => {
      if (typeof value === 'number' && !isNaN(value)) {
        return acc + value;
      } else {
        console.warn("Invalid value encountered:", value); // Log invalid values
        return acc; // Ignore invalid values
      }
    }, 0);
  
    return total;
  }
  
  
  const selectedProgramData = mappedData?.filter(p => p.academicYear === selectedAcademicYear)
                                        ?.flatMap(p => p.programs)
                                        ?.filter(p => p.programName === selectedProgram)
                                        ?.flatMap(p => p.yearLevels);

  const selectedYearData = mappedData?.filter(p => p.academicYear === selectedAcademicYear)
                                     ?.flatMap(p => p.programs)
                                     ?.filter(p => p.programName === selectedProgram)
                                     ?.flatMap(p => p.yearLevels)
                                     ?.filter(p => p.yearLevel === Number(selectedYearLevel))
                                     ?.flatMap(p => p.semesters);


  const handleView = () => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester) {
      fetchCourses();
      fetchStudentData();
      setDataFetched(true); // Indicate that data has been fetched successfully.
    } else {
      setShowModalAlertView(true);
      setDataFetched(false); // Ensure dataFetched is false if filters are incomplete.
    }
  };

  const closeShowModalAlert = () => {
    setShowModalAlert(false);
  }

  const closeShowModalAlertView = () => {
    setShowModalAlertView(false);
  }
  
  const printTable = () => {
    if (!dataFetched) {
      setShowModalAlert(true);
      return;
    }

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
            width: 125%;
            table-layout: auto;
            border-collapse: collapse;
            page-break-before: auto;
          }

  
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
            width: 500px;
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
            border: 10;
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
        <h2>${semester} Semester S.Y. ${selectedAcademicYear}</h2>
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
  
  const openModal = (student) => {
    setShowModal(true);
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
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
          <title>Print COG</title>
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
                transform: scale(0.90);
                transform-origin: center center;
                width: 100%;
                height: 100%;
              }
  
              .tableContainer {
                display: block;
                width: 100%;
                padding: 50px;
              }
  
              .modalContent {
                width: 100%;
                padding: 10px;
                box-sizing: border-box;
                margin-bottom: 20px;
                border: 1px solid #ccc;
                background: #fff;
                position: relative;
              }

              .modalContent::before {
                content: '';
                position: absolute;
                top: 100;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('${logoURL}'), url('${logoURL}'), url('${logoURL}'),
                                  url('${logoURL}'), url('${logoURL}'), url('${logoURL}');
                background-position: 16% 16%, 50% 16%, 84% 16%, 
                                    16% 50%, 50% 50%, 84% 50%; /* Centered positions for six logos */
                background-repeat: no-repeat;
                background-size: 100px 100px; /* Adjust size of each logo */
                opacity: 0.15; /* Low opacity for watermark */
                z-index: 0;
              }


            .modalContent * {
              position: relative;
              z-index: 1; /* Ensure content is above the watermark */
            }
              
  
              .modalContent .label {
                position: absolute;
                top: 50%;
                left: -280px; /* Position the label outside the table */
                transform: translateY(-50%) rotate(-90deg); /* Rotate to vertical and center align */
                font-size: 1rem;
                font-weight: bold;
                text-transform: uppercase;
                background-color: green;
                color: white;
                padding: 10px 5px;
                border-radius: 5px;
                width: 525px; /* Increase width to accommodate longer text */
                text-align: center;
                white-space: nowrap; /* Prevent text from wrapping */
                box-sizing: border-box; /* Ensure padding fits inside the label */
              }

  
              .modalContent:first-of-type .label {
                content: "STUDENT'S COPY";
              }
  
              .modalContent:nth-of-type(2) .label {
                content: "REGISTRAR'S COPY";
              }
  
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
  
              .broken-line {
                border: none;
                border-top: 2px dashed black;
                margin: 20px 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="tableContainer">
            <div class="modalContent">
              <div class="label">STUDENT'S COPY</div>
              ${content}
            </div>
            <br>
            <hr class="broken-line">
            <br>
            <div class="modalContent">
              <div class="label">REGISTRAR'S COPY</div>
              ${content}
            </div>
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
    <div>
      <Form className="p-3 mb-4 bg-white border border-success rounded">
      <Row className="align-items-center">
      <Col md={2} className='mb-3'>
          <Form.Group controlId="academicYear">
            <Form.Label className='custom-color-green-font custom-font'>Academic Year</Form.Label>
            <Form.Select value={selectedAcademicYear} onChange={handleAcademicYearChange} className="border-success">
              <option value="">Select Academic Year</option>
              {academicYears.sort((a, b) => {
                let yearA = parseInt(a.academicYear.split('-')[0]);
                let yearB = parseInt(b.academicYear.split('-')[0]);
                return yearB - yearA; // Sorting in descending order
              })
              .map((program) => (
                <option key={program.academicYear} value={program.academicYear}>
                  {program.academicYear}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}  className='mb-3'>
          <Form.Group controlId="program">
            <Form.Label className='custom-color-green-font custom-font'>Program</Form.Label>
            <Form.Select value={selectedProgram} onChange={handleProgramChange} className="border-success"
              disabled={!selectedAcademicYear}>
            <option value="">Select Program</option>
              {mappedData
                ?.filter(p => p.academicYear === selectedAcademicYear)
                ?.flatMap(p => p.programs)
                .map((program) => (
                  <option key={program.programNumber} value={program.programNumber}>
                    {program.programName}
                  </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2} className='mb-3'>
          <Form.Group controlId="yearLevel">
            <Form.Label className='custom-color-green-font custom-font'>Year Level</Form.Label>
            <Form.Select value={selectedYearLevel} onChange={handleYearLevelChange} className="border-success"
              disabled={!selectedAcademicYear || !selectedProgram}>
              <option value="">Select Year Level</option>
              {selectedProgramData // Get year levels for selected academic year
                ?.map(level => (
                  <option key={level.yearLevel} value={level.yearLevel}>
                    Year {level.yearLevel}
                  </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2} className='mb-3'>
          <Form.Group controlId="semester">
            <Form.Label className='custom-color-green-font custom-font'>Semester</Form.Label>
            <Form.Select value={selectedSemester} onChange={handleSemesterChange} className="border-success"
              disabled={!selectedYearLevel || !selectedAcademicYear || !selectedProgram}>
            <option value="">Select Semester</option>
              {selectedYearData
                ?.map((sem, index) => (
                  <option key={index} value={sem}>
                    {getSemesterText(sem)}
                  </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      

        <Col md={4} className='mb-3'>
        <Form.Group controlId="viewButton">
            <Form.Label className="custom-color-green-font custom-font">Action</Form.Label>
              <div className='d-flex'>
                  <Button className="w-100 btn-success me-2" onClick={handleView}>View</Button>
                  <Button className="w-100 bg-white custom-color-green-font btn-outline-success py-2" onClick={printTable}>Print</Button>
              </div>
          </Form.Group>
        </Col>
      </Row>
      </Form>
      

     
      <div id="printableTable" className="bg-white rounded pt-5 px-3 pb-3 table-responsive">
        <style>
          {`
            table {
              table-layout: fixed; /* Fixes column widths */
              width: 120%;
              border-collapse: collapse; /* Clean table borders */
            }
            th, td {
              border: 1px solid #ddd; /* Light borders for clarity */
              word-wrap: break-word; /* Prevent content overflow */
            }
            th {
              background-color: #d1e7dd; /* Green header background */
            }
            .student-name {
              width: 250px; /* Extra width for Student Name column */
            }
            .fixed-width {
              width: 150px; /* Fixed width for all other columns */
            }
            .no-data-row {
              text-align: center;
              font-style: italic;
              color: #999;
              background-color: white !important;
            }
          `}
        </style>

        {Object.keys(groupedData).length === 0 || combinedData.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="custom-color-green-font fs-5">No Data Available</h5>
            <p className="fs-6">
              Please ensure that all filters are applied or data is available to display.
            </p>
          </div>
        ) : (
          Object.entries(groupedData)
          .sort(([sectionNumberA], [sectionNumberB]) =>
            sectionNumberA.localeCompare(sectionNumberB)
          )
          .map(([sectionNumber, sectionData], sectionIndex) => (
            <Table bordered hover key={sectionIndex} className="text-center mb-3">
              {/* Table Header */}
              <thead className="table-success">
                <tr>
                  <th colSpan="3" className="custom-color-green-font fixed-width">
                    {sectionNumber}
                  </th>
                  {sectionData.courses.map((course, index) => (
                    <th key={`course-${index}`} className="bg-success text-white fixed-width">
                      {course.personnelLastName}
                    </th>
                  ))}
                  <th colSpan={sectionData.courses.length + 1} className="custom-color-green-font fixed-width">
                    WEIGHTED GRADE AVERAGE
                  </th>
                  <th rowSpan={2} className="custom-color-green-font fixed-width">
                    Certificate of Grades (COG)
                  </th>
                </tr>
                <tr>
                  <th className="bg-success text-white fixed-width">ITEM</th>
                  <th className="bg-success text-white fixed-width">SNUMBER</th>
                  <th className="bg-success text-white student-name">STUDENT NAME</th>
                  {sectionData.courses.map((course, index) => (
                    <th key={`course-grade-${index}`} className="bg-success text-white fixed-width">
                      {course.courseCode}
                    </th>
                  ))}
                  {sectionData.courses.map((course, index) => (
                    <th key={`course-grade-${index}`} className="bg-success text-white fixed-width">
                      {course.courseCode}
                    </th>
                  ))}
                  <th className="bg-success text-white fixed-width">WGA</th>
                </tr>
              </thead>
        
              {/* Table Body */}
              <tbody className="table-success">
                {/* Check if there’s no student data for this section */}
                {combinedData.filter((data) => data.sectionNumber === sectionNumber).length === 0 ? (
                  <tr>
                    <td colSpan={3 + sectionData.courses.length + 5} className="no-data-row">
                      No Student Data Available
                    </td>
                  </tr>
                ) : (
                  combinedData
                    .filter((studentData) => studentData.sectionNumber === sectionNumber)
                    .map((studentData, rowIndex) => {
                      return (
                        <tr key={rowIndex}>
                          <td className="bg-white fixed-width">{rowIndex + 1}</td>
                          <td className="bg-white fixed-width">{studentData.studentNumber}</td>
                          <td className="bg-white student-name">{studentData.studentName}</td>
        
                          {/* Loop through the courses for this section */}
                          {sectionData.courses.map((course, courseIndex) => {
                            // Find the corresponding grade for this courseCode in the student's data
                            const studentIndex = studentData.courseCodes.indexOf(course.courseCode);
                            const studentGrade = studentIndex !== -1
                              ? studentData.studentGrades[studentIndex] || '-'
                              : '-';
        
                            // Check if the grade is a number and format it to two decimal places
                            const formattedGrade = typeof studentGrade === 'number'
                              ? studentGrade.toFixed(2)
                              : studentGrade;
        
                            return (
                              <td key={`student-grade-${courseIndex}`} className="bg-white fixed-width">
                                {formattedGrade}
                              </td>
                            );
                          })}
        
                          {/* Render 0.0 for course grades */}
                          {sectionData.courses.map((course, courseIndex) => (
                            <td key={`course-grade-${courseIndex}`} className="bg-white fixed-width">
                              0.0
                            </td>
                          ))}
        
                          {/* Weighted Grade Average */}
                          <td className="bg-white fixed-width">0.0</td>
        
                          {/* COG Button */}
                          <td className="bg-white fixed-width">
                            <Button variant="success" className="w-100" onClick={() => openModal(studentData)}>
                              COG
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </Table>
          ))
        
        )}
      </div>
  

       {/* Modal for COG */}
       <Modal show={showModal} onHide={closeModal} className="modal-xxl" centered>
        <Modal.Header closeButton>
        <FontAwesomeIcon icon="certificate" style={{ marginRight: '8px' }} />
          <Modal.Title className='custom-color-green-font'>Certificate of Grades</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div id="modalContent">
        <div className="d-flex justify-content-center">
          <table
            className="header-logo"
            style={{
              width: '100%',
              maxWidth: '500px',
              marginLeft: '100px',
              marginRight: '100px',
              paddingLeft: '200px',
            }}
          >
          <tbody>
            <tr>
              {/* Logo Section */}
              <td
                style={{
                  width: '80px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  padding: '0',
                  margin: '0',
                }}
              >
                <img
                  src="/pcc.png"
                  alt="Logo"
                  className="img-fluid"
                  style={{
                    width: '70px',
                    margin: '0',
                  }}
                />
              </td>

              {/* Text Section */}
              <td
                style={{
                  textAlign: 'left',
                  verticalAlign: 'middle',
                  color: '#07770b', // Set text color to green
                }}
              >
                <p
                  className="fw-bold text-uppercase mb-0"
                  style={{
                    fontSize: '0.8rem',
                    lineHeight: '1.2',
                    margin: '0',
                    padding: '0',
                  }}
                >
                  Parañaque City <br />
                  <span
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      margin: '0',
                      padding: '0',
                    }}
                  >
                    College
                  </span>
                </p>
              </td>

              {/* Contact Information Section */}
              <td
                style={{
                  verticalAlign: 'middle',
                  borderLeft: '2px solid #07770b', // Set vertical line color to green
                  paddingLeft: '10px', // Adjust this to control the space between the line and text
                  marginLeft: '0',
                  paddingRight: '0',
                  color: '#07770b', // Set text color to green
                }}
              >
                <p
                  className="mb-0"
                  style={{
                    fontSize: '0.7rem',
                    lineHeight: '1',
                  }}
                >
                  <i
                    className="fas fa-map-marker-alt"
                    style={{ marginRight: '5px', color: '#07770b' }}
                  ></i>
                  Coastal Rd., cor. Victor Medina Street <br />
                  <span style={{ paddingLeft: '14px' }}>
                    San Dionisio, Parañaque City, Philippines
                  </span>
                </p>

                <p
                  className="mb-0"
                  style={{
                    fontSize: '0.7rem',
                    lineHeight: '1',
                  }}
                >
                  <i
                    className="fas fa-envelope"
                    style={{ marginRight: '5px', color: '#07770b' }}
                  ></i>
                  info@parañaquecitycollege.edu.ph
                </p>
                <p
                  className="mb-0"
                  style={{
                    fontSize: '0.7rem',
                    lineHeight: '1',
                  }}
                >
                  <i
                    className="fas fa-phone-alt"
                    style={{ marginRight: '5px', color: '#07770b' }}
                  ></i>
                  (02) 85343321
                </p>
              </td>
            </tr>
          </tbody>


          </table>
          {/* Add the external stylesheet in the <head> of your HTML or as a global import */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
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
              <td className="fs-6">{selectedStudent ? selectedStudent.studentName : "(Name of the Student)"}</td>
              <td className="fs-6 fw-bold">ACADEMIC YEAR:</td>
              <td className="fs-6">{selectedAcademicYear}</td>
            </tr>
            <tr>
              <td className="fs-6 fw-bold">STUDENT ID NO.:</td>
              <td className="fs-6">{selectedStudent ? selectedStudent.studentNumber : "(Student Number of the Student)"}</td>
              <td className="fs-6 fw-bold">SEMESTER:</td>
              <td className="fs-6">{getSemesterText(selectedSemester)}</td>
            </tr>
            <tr>
              <td className="fs-6 fw-bold">PROGRAM CODE & DESCRIPTION:</td>
              <td className="fs-6">{selectedProgram}</td>
              <td className="fs-6 fw-bold">YEAR LEVEL:</td>
              <td className="fs-6">{selectedYearLevel}</td>
            </tr>
          </tbody>
        </Table>

          
          <Table bordered className="text-center border-black grades-table">
            <thead>
              <tr>
                <th colSpan="7" className='fs-6 text-uppercase'>{getSemesterText(selectedSemester)} SEMESTER</th>
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
            {combinedData
              .filter(student => student.studentNumber === selectedStudent?.studentNumber)
              .map((studentData) => studentData.courseCodes.map((courseCode, index) => {
                const courseDescription = studentData.courseDescriptions[index];
                const courseLecture = parseFloat(studentData.courseLectures[index]) || 0;
                const courseLaboratory = parseFloat(studentData.courseLaboratories[index]) || 0;
                const totalUnits = courseLecture + courseLaboratory;
                const studentGrade = studentData.studentGrades[index];

                return (
                  <tr key={index}>
                    <td className='fs-6'>{courseCode}</td>
                    <td className='fs-6'>{courseDescription}</td>
                    <td className='fs-6'>{courseLecture}</td>
                    <td className='fs-6'>{courseLaboratory}</td>
                    <td className='fs-6'>{totalUnits}</td>
                    <td className='fs-6'>{studentGrade.toFixed(2)}</td>
                    <td className='fs-6'>{getGradeDescription(studentGrade)}</td>
                  </tr>
                );
              }))}

            <tr>
              <th>TOTAL</th>
              <td>-</td>
              {/* Calculate the total for course lectures */}
              <td className='fs-6'>{calculateGradeSum(combinedData
                .filter(student => student.studentNumber === selectedStudent?.studentNumber)
                .map(studentData => studentData.courseLectures.map(lecture => parseFloat(lecture) || 0))
                .flat())}</td>
              
              {/* Calculate the total for course laboratories */}
              <td className='fs-6'>{calculateGradeSum(combinedData
                .filter(student => student.studentNumber === selectedStudent?.studentNumber)
                .map(studentData => studentData.courseLaboratories.map(laboratory => parseFloat(laboratory) || 0))
                .flat())}</td>
              
              {/* Calculate the total units (sum of lecture and laboratory) */}
              <td className='fs-6'>{calculateGradeSum(combinedData
                .filter(student => student.studentNumber === selectedStudent?.studentNumber)
                .map(studentData => studentData.courseLectures.map((lecture, index) => {
                  const laboratory = parseFloat(studentData.courseLaboratories[index]) || 0;
                  return parseFloat(lecture) + laboratory;
                })
                ).flat())}</td>
              
              <td>-</td>
              <td>-</td>
            </tr>

              <tr>
                <th colSpan={2} className='fs-6'>GENERAL WEIGHTED AVERAGE (GWA) = </th>
                <td colSpan={5} className="fs-6">
    {combinedData
      .filter(student => student.studentNumber === selectedStudent?.studentNumber)
      .map(studentData => calculateGWA(studentData?.studentGrades)) // Calculate the average grade for the student
    }
  </td>
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
                  <p className="prepared-by fs-6">{user.personnelNameFirst} {user.personnelNameMiddle} {user.personnelNameLast}</p>
                </td>
                <td className="text-end college-registar" style={{ width: '50%' }}>
                  <p className="fs-6 fw-normal text-center college-registrar-center text-decoration-underline">{user.personnelNameFirst} {user.personnelNameMiddle} {user.personnelNameLast}</p>
                  <p className="fs-6 fw-normal text-center college-registrar-center">College Registrar</p>
                </td>
              </tr>
            </tbody>
          </Table>


         </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          <Button variant="primary" onClick={handlePrint}>Download COG</Button>
        </Modal.Footer>

      </Modal>


      <Modal show={showModalAlert} onHide={closeShowModalAlert} centered>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please click "View" to load the data before printing.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeShowModalAlert}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalAlertView} onHide={closeShowModalAlertView} centered>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please complete all filters (Academic Year, Program, Year Level, Semester) to view schedules.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeShowModalAlertView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MasterlistOfGradesTable;
