import React, { useState, useEffect, useContext } from 'react'; 
import { Table, Form, Button, Row, Col, Modal, Spinner, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint} from '@fortawesome/free-solid-svg-icons';
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
import SubmissionModel from '../ReactModels/SubmissionModel';
import '../App.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MasterlistOfGradesTable = () => {
  const [loading, setLoading] = useState(false); 
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
  const navigate = useNavigate();
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

  //On loading the page
    useEffect(() => {
      if (!user) {
        navigate('/'); // Redirect to login if user is not present
      }
    }, [user, navigate]);

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
  
          const submission = await SubmissionModel.fetchSubmissionBySchedule(
            enrollment.scheduleNumber
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
          let grade = 0;
          if (submission && submission[0]?.submissionStatus === 'Verified') {
            grade = studentGrade ? studentGrade.numEq : 0;
          }
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
            semGrade: studentGrade ? studentGrade.semGrade : null, // Add semGrade here
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
            semGrades: [current.semGrade], // Add semGrades array
            courseCodes: [current.courseCode],
            courseDescriptions: [current.courseDescription],
            courseLectures: [current.courseLecture],
            courseLaboratories: [current.courseLaboratory],
          });
        } else {
          // If student already exists, push the new schedule data to arrays
          existing.scheduleNumbers.push(current.scheduleNumber);
          existing.studentGrades.push(current.studentGrade);
          existing.semGrades.push(current.semGrade); // Push semGrade to semGrades array
          existing.courseCodes.push(current.courseCode);
          existing.courseDescriptions.push(current.courseDescription);
          existing.courseLectures.push(current.courseLecture);
          existing.courseLaboratories.push(current.courseLaboratory);
        }
  
        return acc;
      }, []);
  
      // Set the distinct data to state
      console.log(distinctData);
      setCombinedData(distinctData);
  
      return distinctData;
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    }
  };
  
  useEffect(() => {
    const handleView = async () => {
      if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester) {
        try {
          setLoading(true); // Start loading indicator
          setDataFetched(false); // Reset dataFetched before fetching new data
          
          // Fetch courses and student data in parallel
          await Promise.all([fetchCourses(), fetchStudentData()]);
          
          setDataFetched(true); // Set dataFetched to true if fetch operations succeed
        } catch (error) {
          console.error("Error fetching data:", error);
          setDataFetched(false); // Ensure dataFetched is false if an error occurs
        } finally {
          setLoading(false); // Always stop the loading indicator
        }
      } else {
        // If required filters are incomplete
        setDataFetched(false);
      }
    };
  
    handleView();
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester]);
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


                            
                                    
                                    
                                     
                                    

  const closeShowModalAlert = () => {
    setShowModalAlert(false);
  }

  const closeShowModalAlertView = () => {
    setShowModalAlertView(false);
  }
  
  const printTable = async () => {
    if (!dataFetched) {
      setShowModalAlert(true);
      return;
    }
  
    // Select all sections with tables
    const tables = document.querySelectorAll('.page-break');
  
    if (!tables.length) {
      console.error('No tables found for printing');
      return;
    }
  
    // Function to print a single table with a delay
    const printSingleTable = (table, index) => {
      return new Promise((resolve) => {
        // Create a new jsPDF instance with legal size and landscape orientation
        const pdf = new jsPDF('landscape', 'mm', 'legal'); // Use 'legal' size
  
        if (index === 0) {
          // Add a custom header for the first table
          pdf.addImage('/pcc.png', 'PNG', 85, 10, 20, 20); // PCC Logo
          pdf.setFontSize(14);
          pdf.setTextColor(0, 128, 0); // Set text color to green
          pdf.text('PARAÑAQUE CITY', 110, 17);
          
          pdf.setFontSize(25);
          pdf.setFont('helvetica', 'bold');
          pdf.text('COLLEGE', 110, 26);
          
          // Draw a vertical line
          pdf.setDrawColor(0, 128, 0); // Green color
          pdf.setLineWidth(1);
          pdf.line(160, 10, 160, 30);
  
          // Add additional text
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Coastal Rd., cor. Victor Medina Street,', 165, 15);
          pdf.text('San Dionisio, Paranaque City, Philippines', 165, 20);
          pdf.text('info@paranaquecitycollege.edu.ph | (02) 85343321', 165, 25);
  
          // Add a second logo
          pdf.addImage('/pcc.png', 'PNG', 250, 10, 20, 20); // PCC Logo on the right
  
          // Separator
          pdf.setDrawColor(0, 128, 0); // Green color
          pdf.line(5, 35, 350, 35); // Horizontal line separator
  
          // Reset the text color to black for the following text
          pdf.setTextColor(0, 0, 0); // Black color
  
          // Centered title
          pdf.setFontSize(16);
          const title = 'OFFICE OF THE COLLEGE REGISTRAR';
          const titleWidth = pdf.getTextWidth(title);
          const titleX = 177.5 - (titleWidth / 2); // Center of the page minus half of the text width
          pdf.text(title, titleX, 45);
  
          // Subtitle in black color
          pdf.setFontSize(14);
          const subtitle = 'Summary of Grades';
          const subtitleWidth = pdf.getTextWidth(subtitle);
          const subtitleX = 177.5 - (subtitleWidth / 2); // Center of the page minus half of the text width
          pdf.text(subtitle, subtitleX, 52);
        }
  
        // Add a title or header for each table
        const sectionNumber = table.getAttribute('data-section') || `Section ${index + 1}`;
        const startY = index === 0 ? 80 : 20; // Adjust table start position if a header is added
        pdf.setFontSize(12);
        pdf.text(`Table for ${sectionNumber}`, 10, startY - 10);
  
        // Extract the table data
        const htmlTable = table.querySelector('table');
  
        if (!htmlTable) {
          console.warn(`No table found in section ${sectionNumber}`);
          return resolve();
        }
  
        // Clone the table to avoid altering the DOM
        const clonedTable = htmlTable.cloneNode(true);
  
        // Remove the last column from the header and body
        const headerRow = clonedTable.querySelector('thead tr');
        if (headerRow) {
          headerRow.removeChild(headerRow.lastElementChild);
        }
  
        const bodyRows = clonedTable.querySelectorAll('tbody tr');
        bodyRows.forEach((row) => {
          row.removeChild(row.lastElementChild);
        });
  
        // Use jsPDF's autoTable plugin to add the table content
        pdf.autoTable({
          html: clonedTable,
          startY: startY, // Position the table below the header or title
          styles: {
            fontSize: 7, // Smaller font size for table content
            cellPadding: 2,
            lineWidth: 0.1, // Line width for cell borders
            lineColor: [0, 0, 0], // Black color for borders
          },
          headStyles: {
            fillColor: [76, 175, 80], // Green header background color
            textColor: [255, 255, 255], // White text color
            fontSize: 8, // Slightly larger font size for headers
            lineWidth: 0.1, // Border line width for header cells
            lineColor: [0, 0, 0], // Black border for header cells
          },
          tableLineColor: [0, 0, 0], // Black border color for all cells
          tableLineWidth: 0.1, // Border width for all cells
        });
  
        // Download the PDF file
        pdf.save(`Table_${sectionNumber}.pdf`);
  
        resolve(); // Resolve when done printing a table
      });
    };
  
    // Print each table one by one with a delay
    for (let i = 0; i < tables.length; i++) {
      await printSingleTable(tables[i], i);
    }
  
    console.log('All tables have been printed sequentially.');
  };
  
  
  const openModal = (student) => {
    setShowModal(true);
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const customPrintFunctionForFirstTable = (sectionNumber) => {
    const container = document.querySelector(`.page-break[data-section="${sectionNumber}"]`);
    if (!container) {
      console.error('Container not found for section:', sectionNumber);
      return;
    }
  
    const table = container.querySelector('table');
    if (!table) {
      console.error('Table not found for section:', sectionNumber);
      return;
    }
  
    // Clone the table to avoid modifying the original table
    const tableClone = table.cloneNode(true);
  
    // Insert the "WGA" header in the second-last column if not already there
    const thElements = tableClone.querySelectorAll('th');
    if (thElements.length > 0) {
      const headerRow = tableClone.querySelectorAll('tr')[1]; // Access the second row of header
      const lastColumnIndex = headerRow.cells.length - 1;
  
      // Check if "WGA" already exists in the second last column before adding
      if (headerRow.cells[lastColumnIndex - 1].textContent !== "WGA") {
        const newHeader = document.createElement('th');
        newHeader.textContent = "WGA";
        headerRow.cells[lastColumnIndex - 1].appendChild(newHeader);
      }
    }
  
    // Create the print window
    const printWindow = window.open('', '', 'height=500,width=1000');
    const isFirstTable = sectionNumber === 1; // Assuming sectionNumber 1 represents the first table
  
    // Constructing the content
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            /* General styles for printing */
            @media print {
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
  
              /* Page setup for landscape and legal size */
              @page {
                size: legal landscape; /* Set paper size to legal and orientation to landscape */
                margin: 20mm; /* Default margin */
              }
  
              .header-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
  
              .header-table img {
                width: 60px;
                height: 60px;
              }
  
              .header-table td {
                vertical-align: middle;
                text-align: center;
                border: none;
                padding: 0;
              }
  
              .header-left {
                width: 30%;
                text-align: center;
              }
  
              .header-right {
                width: 30%;
                text-align: center;
              }
  
              .header-center {
                text-align: left;
                font-size: 14px;
              }
  
              .header-center h1 {
                margin: 0;
                font-size: 20px;
                color: green;
                text-align: left;
              }
  
              .header-center h5 {
                margin: 0;
                font-size: 18px;
                font-weight: bold;
                color: green;
                text-align: left;
              }
  
              .header-center p {
                margin: 2px 0;
                font-size: 12px;
                color: black;
                text-align: left;
                width: 100%;
                color: green;
              }
  
              .separator {
                border-top: 2px solid green;
                margin: 10px 0;
              }
  
              table {
                width: 100%; /* Ensure table fits within page width */
                border-collapse: collapse; /* Collapse borders for a clean design */
                margin: 0 auto; /* Center the table */
              }
  
              th, td {
                border: 1px solid #000; /* Ensure borders are visible */
                padding: 8px; /* Add spacing for readability */
                text-align: center; /* Center-align text for consistency */
              }
  
              th {
                background-color: #28a745; /* Use the same header background color as UI */
                color: #fff; /* White text for headers */
              }
  
              .custom-color-green-font {
                background-color: #d4edda; /* Match UI's green cell color */
              }
  
              .bg-success {
                background-color: #28a745; /* Match green background in UI */
                color: white; /* Match white text */
              }
  
              .bg-white {
                background-color: #fff; /* Match white background */
              }
  
              /* Hide the last column data (td) but keep the last column header (th) */
              table td:last-child {
                display: none; /* Hide the last column data */
              }
  
              /* Adjust colSpan dynamically for the print layout */
              @media print {
                table th:last-child,
                table td:last-child {
                  display: none; /* Hide last column's header and data for print */
                }
  
                /* Adjust colSpan for the header row */
                table tr:first-child th:last-child {
                  /* Adjust colSpan dynamically for header row to reflect hidden last column */
                  colspan: calc(100% - 1); /* Update the colSpan to exclude last column */
                }
  
                table th[colspan] {
                  /* Make sure colSpan is properly calculated for each row */
                  colspan: 100;
                }
  
                .vertical-line {
                  border-right: 2px solid black; /* Adds vertical line */
                  padding-right: 10px; /* Space between text and the line */
                }
              }
            </style>
          </head>
          <body>
            <table class="header-table">
              <tr colspan={4}>
                <td class="header-left">
                  <img src="/pcc.png" alt="PCC Logo">
                </td>
                <td class="header-center vertical-line">
                  <h5>PARAÑAQUE CITY</h5>
                  <h1><big><big><big>COLLEGE</big></big></big></h1>
                </td>
                <td class="header-center">
                  <p>Coastal Rd., cor. Victor Medina Street,</p>
                  <p>San Dionisio, Paranaque City, Philippines</p>
                  <p>info@paranaquecitycollege.edu.ph</p>
                  <p> (02) 85343321</p>
                </td>
                <td class="header-right">
                  <img src="/pcc.png" alt="PCC Logo">
                </td>
                <td></td>
              </tr>
            </table>
            <hr class="separator">
            ${tableClone.outerHTML}
          </body>
        </html>
    `);
  
    printWindow.document.close();
    printWindow.print();
  };
  

  const printSpecificTable = (sectionNumber) => {
    const container = document.querySelector(`.page-break[data-section="${sectionNumber}"]`);
    if (!container) {
      console.error('Container not found for section:', sectionNumber);
      return;
    }
  
    const table = container.querySelector('table');
    if (!table) {
      console.error('Table not found for section:', sectionNumber);
      return;
    }
  
    // Clone the table to avoid modifying the original table
    const tableClone = table.cloneNode(true);
  
    // Insert the "WGA" header in the second-last column if not already there
    const thElements = tableClone.querySelectorAll('th');
    if (thElements.length > 0) {
      const headerRow = tableClone.querySelectorAll('tr')[1]; // Access the second row of header
      const lastColumnIndex = headerRow.cells.length - 1;
  
      // Check if "WGA" already exists in the second last column before adding
      if (headerRow.cells[lastColumnIndex - 1].textContent !== "WGA") {
        const newHeader = document.createElement('th');
        newHeader.textContent = "WGA";
        headerRow.cells[lastColumnIndex - 1].appendChild(newHeader);
      }
    }
  
    // Create the print window
    const printWindow = window.open('', '', 'height=500,width=1000');
    const isFirstTable = sectionNumber === 1; // Assuming sectionNumber 1 represents the first table
  
    // Constructing the content
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            /* General styles for printing */
            @media print {
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              table {
                width: 100%; /* Ensure table fits within page width */
                border-collapse: collapse; /* Collapse borders for a clean design */
                margin: 0 auto; /* Center the table */
              }
              th, td {
                border: 1px solid #000; /* Ensure borders are visible */
                padding: 8px; /* Add spacing for readability */
                text-align: center; /* Center-align text for consistency */
              }
              th {
                background-color: #28a745; /* Use the same header background color as UI */
                color: #fff; /* White text for headers */
              }
              .custom-color-green-font {
                background-color: #d4edda; /* Match UI's green cell color */
              }
              .bg-success {
                background-color: #28a745; /* Match green background in UI */
                color: white; /* Match white text */
              }
              .bg-white {
                background-color: #fff; /* Match white background */
              }
              /* Hide the last column data (td) but keep the last column header (th) */
              table td:last-child {
                display: none; /* Hide the last column data */
              }
  
              /* Adjust colSpan dynamically for the print layout */
              @media print {
                table th:last-child,
                table td:last-child {
                  display: none; /* Hide last column's header and data for print */
                }
  
                /* Adjust colSpan for the header row */
                table tr:first-child th:last-child {
                  /* Adjust colSpan dynamically for header row to reflect hidden last column */
                  colspan: calc(100% - 1); /* Update the colSpan to exclude last column */
                }
  
                table th[colspan] {
                  /* Make sure colSpan is properly calculated for each row */
                  colspan: 100;
                }
              }
            </style>
          </head>
          <body>
            ${isFirstTable ? `<div class="custom-header">This is a Custom Header for the First Table</div>` : ''}
            ${tableClone.outerHTML}
          </body>
        </html>
    `);
  
    printWindow.document.close();
    printWindow.print();
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


              .modalContent {
                position: relative;
                width: 100%;
                padding: 10px;
                box-sizing: border-box;
                margin-bottom: 20px;
                border: 1px solid #ccc;
                background: #fff;
              }

              .modalContent .label {
                position: absolute;
                top: 0;
                left: -30px; /* Adjust the left positioning if needed */
                height: 100%; /* Match the height of the modalContent */
                writing-mode: vertical-rl; /* Text flows vertically, right to left */
                text-orientation: mixed; /* Ensures text is readable (not upside down) */
                text-align: center;
                font-size: 1.2rem;
                font-weight: bold;
                text-transform: uppercase;
                background-color: green;
                color: white;
                padding: 10px 5px;
                border-radius: 5px 0 0 5px; /* Rounded corners for the right side */
                white-space: nowrap; /* Prevent text from wrapping */
                width: 30px; /* Smaller width for the label */
                box-sizing: border-box;
              }

              .modalContent .tableContainer {
                margin-left: 10px; /* Add space to accommodate the label */
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
      <h2 className="custom-font custom-color-green-font mb-3 mt-2"> Consolidated Summary of Grades</h2>
      <Form className="p-3 mb-4 bg-white border border-success rounded">
      <Row className="align-items-center justify-content-between gx-3 gy-2">
      <Col sm={12} md={2} className='mb-3'>
          <Form.Group controlId="academicYear">
            <Form.Label className='custom-color-green-font custom-font text-nowrap'>Academic Year</Form.Label>
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
        <Col sm={12} md={2}  className='mb-3'>
          <Form.Group controlId="program">
            <Form.Label className='custom-color-green-font custom-font text-nowrap'>Program</Form.Label>
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
        <Col sm={12} md={2} className='mb-3'>
          <Form.Group controlId="yearLevel">
            <Form.Label className='custom-color-green-font custom-font text-nowrap'>Year Level</Form.Label>
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
        <Col  sm={12} md={2} className='mb-3'>
          <Form.Group controlId="semester">
            <Form.Label className='custom-color-green-font custom-font text-nowrap'>Semester</Form.Label>
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
      

        <Col sm={12} md={2} className='mb-3'>
        <Form.Group controlId="viewButton">
            <Form.Label className="custom-color-green-font custom-font text-nowrap">Action</Form.Label>
              <div className='d-flex'>
                  <Button className="w-100 btn-success me-2" onClick={printTable}>PDF</Button>
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

        {loading ? (
  <div className="text-center py-5">
    <Spinner animation="border" variant="success" />
    <p className="mt-3">Loading data, please wait...</p>
  </div>
) : Object.keys(groupedData).length === 0 || combinedData.length === 0 ? (
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
      <div
        className="page-break"
        key={sectionIndex}
        data-section={sectionNumber}
        style={{ marginBottom: "50px", position: "relative" }}
      >
       {/* Table Component */}
       <div className="d-flex justify-content-end align-items-end mb-2 mx-2">
  {sectionIndex === 0 ? (
    // Check if it's the first table
    <Button
      variant="warning"
      className="print-button text-white"
      onClick={() => customPrintFunctionForFirstTable(sectionNumber)}
    >
     <FontAwesomeIcon icon={faPrint}/>  Print 
    </Button>
  ) : (
    <Button
      variant="warning"
      className="print-button text-white"
      onClick={() => printSpecificTable(sectionNumber)}
    >
      <FontAwesomeIcon icon={faPrint}/>  Print 
    </Button>
  )}
</div>

       <Container fluid className='table-responsive mt-3 mx-auto mb-2 shadow-sm'>
       <Table bordered hover className="text-center mb-3 shadow-sm">
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

                          {sectionData.courses.map((course, courseIndex) => {
                            // Find the corresponding grade for this courseCode in the student's data
                            const studentIndex = studentData.courseCodes.indexOf(course.courseCode);
                            const semGrade = studentIndex !== -1
                              ? studentData.semGrades[studentIndex] || '-'
                              : '-';
        
                            // Check if the grade is a number and format it to two decimal places
                            const formattedGrade = typeof semGrade === 'number'
                              ? semGrade
                              : semGrade;
        
                            return (
                              <td key={`semGrade-${courseIndex}`} className="bg-white fixed-width">
                                {formattedGrade}
                              </td>
                            );
                          })}
        
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
             
                          {/* Weighted Grade Average */}
                          <td className="bg-white fixed-width">
                            {(() => {
                              // Filter studentGrades to include only valid numbers
                              const validGrades = studentData.studentGrades.filter(
                                (grade) => typeof grade === 'number' && !isNaN(grade)
                              );

                              // Calculate the weighted average if there are valid grades
                              const average = validGrades.length > 0
                                ? (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(2)
                                : '0.00';

                              return average;
                            })()}
                          </td>
        
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
       </Container>
       
        {/* Print Button Positioned Below the Table */}
  


  
      </div>
    ))
)}
  

       {/* Modal for COG */}
       <Modal show={showModal} onHide={closeModal} className="modal-xxl" centered animation={false} >
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
    </div>
  );
};

export default MasterlistOfGradesTable;
