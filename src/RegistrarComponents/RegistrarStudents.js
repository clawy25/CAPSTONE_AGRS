import React, { useState, useEffect, useContext } from 'react';
import '../App.css'; // Custom styling
import {Spinner, Modal, Button, Table, Container, Dropdown} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileAlt, faCog, faFileSignature, faFilter } from '@fortawesome/free-solid-svg-icons'; // Import the icons you want to use
import * as XLSX from 'xlsx';

import CourseModel from '../ReactModels/CourseModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import StudentModel from '../ReactModels/StudentModel';
import TimelineModel from '../ReactModels/TimelineModel';
import ProgramModel from '../ReactModels/ProgramModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import { UserContext } from '../Context/UserContext'; 

export default function RegistrarStudents() {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(false); 
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [students, setStudents] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [currentAcademicYear, setcurrentAcademicYear] = useState(null);
    const [currentSemester, setCurrentSemester] = useState();
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [showModal, setShowModal] = useState(false);
    const [showModalCog, setShowModalCog] = useState(false); 
    const [programName, setProgramName] = useState("");
    const currentDate = new Date();
    const [isProcessing, setIsProcessing] = useState(false);
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const [groupedCourseDetails, setGroupedCourseDetails] = useState({});
    const openModal = (student) => {
      setShowModalCog(true);
      setSelectedStudent(student);
    };
  
    const closeModal = () => {
      setShowModalCog(false);
      setSelectedStudent(null);
    };
  

    const getAcademicYear = (studentAdmissionYr, yearIdx) => {
        return `${studentAdmissionYr + yearIdx}-${studentAdmissionYr + yearIdx + 1}`;
      };

      const handlePrintCOR = () => {
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
        scale: 97;
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

    const handleTORClick = (students) => {
        setSelectedStudent(students);
        setShowModal(true);
      };
    
      const handleCloseModal = () => {
        setShowModal(false);  
        setSelectedStudent(null);
      };

    const fetchCurrentAcadYear = async () => {
        try {
            const years = await AcademicYearModel.fetchExistingAcademicYears();
            //console.log(years);
    
            const currentYear = years.find((year) => year.isCurrent === true); 
            const check = await TimelineModel.fetchTimelineByAcademicYear(currentYear.academicYear);
            const highestSemester = check.reduce((max, row) => Math.max(max, row.semester), 0);

            // Set the current semester based on the highest value found
            setCurrentSemester(highestSemester || 1);
    
            setcurrentAcademicYear(currentYear); // Update state with current year
        } catch (error) {
            console.error("Error fetching current academic Year:", error);
        }
    };
    
    // Fetch programs when currentAcademicYear is updated
    useEffect(() => {
        const fetchPrograms = async () => {
        if (currentAcademicYear) {
            try {
                const existingPrograms = await ProgramModel.fetchAllPrograms();
                const filteredPrograms = existingPrograms.filter((program) => program.academicYear === currentAcademicYear.academicYear);

                const trimmedProgramData = [];
                const addedPrograms = new Set();

                filteredPrograms.forEach(row => {
                    if (!addedPrograms.has(row.programNumber)) {
                        trimmedProgramData.push({
                            programNumber: row.programNumber,
                            programName: row.programName
                        });
                        addedPrograms.add(row.programNumber); // Mark this program as added
                    }
                })

                //console.log(trimmedProgramData);
                setPrograms(trimmedProgramData);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        }
    };
    fetchPrograms();
}, [currentAcademicYear]); // Run this effect when currentAcademicYear changes
    
    // Fetch existing students from StudentModel
    const fetchExistingStudents = async () => {
        setLoading(true); 
        try {
            const existingStudents = await StudentModel.fetchExistingStudents();
            //console.log(existingStudents); 
            setStudents(existingStudents);
        } catch (error) {
            console.error('Error fetching existing students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch existing students and programs onload
    useEffect(() => {
        fetchCurrentAcadYear();
        fetchExistingStudents();
    }, []);


    // Insert the list of newStudents into the database
    const insertStudents = async (newStudents, timelineData) => {
        try {
            await StudentModel.insertStudent(newStudents);
            await TimelineModel.createAndInsertTimeline(timelineData);
            
        } catch (error) {
            console.error('Error inserting students in bulk:', error);
        }
    };

    // Scan the spreadsheet to get the list of newStudents
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            console.error('No file selected');
            return; // Exit if no file is selected
        }

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
          try {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            const existingStudentNumbers = new Set(students.map(student => student.studentNumber));
            
            const newStudents = [];
            const timelineData = [];

            const academicYear = currentAcademicYear.academicYear;
            const [currentYear, nextYear] = academicYear.trim().split('-').map(year => parseInt(year));


            for (const row of data) {
                let studentPassword;
                let studentType = row["Status"] || 'Regular'; // Default to 'Regular'
                const studentNameFirst = row["Given Name"] || '';
                const studentNameMiddle = row["Middle Name"] || '';
                const studentNameLast = row["Last Name"] || '';
                const studentSex = row["Gender"] || '';
                const studentEmail = row["Personal Email"] || '';
                const studentBirthDate = row["Birth Date"] || '';
                let studentPccEmail;
                const studentProgramName = row["Program"] || '';
                const studentContact = row["Contact No."] || '';
                const studentAddress = row["Address"];
                const isABMgraduate = row["ABM Graduate"] || true;

                // Validate the row and add it to newStudents if valid
                if (validateRow(studentNameFirst, studentNameMiddle, studentNameLast, studentContact)) {
                    const admissionYear = row["Year Admitted"] || ''; // Admission year
                    const admissionYearInt = parseInt(row["Year Admitted"], 10);
                    let studentYrLevel = 1; // Default to 1
                    let studentNumber = '';
                    if (admissionYearInt < currentYear) {
                        studentYrLevel = (currentYear - admissionYearInt) + 1; // Calculate year level based on difference
                        studentNumber = generateNextStudentNumber(existingStudentNumbers, admissionYearInt); // Generate number based on admission year

                        // If the year level is greater than 4, set the student type to 'Graduated'
                        if (studentYrLevel > 4) {
                            studentType = 'Graduated';
                        }

                    } else if (admissionYearInt === currentYear) {
                        studentYrLevel = 1; // First year if admission year is the current year
                        studentNumber = generateNextStudentNumber(existingStudentNumbers, currentYear); // Generate number based on current year
                    }
                    //AUTO-GENERATE PASSWORD AND PCC EMAIL
                    studentPassword = generatePassword(studentNameFirst,studentNameLast, admissionYear);
                    studentPccEmail = generatePCCemail(studentNameFirst, studentNameLast, admissionYearInt);

                    //SETTING THE PROGRAM NUMBERS; ADDED CURRENT ACADEMIC YEAR VALIDATION
                    let studentProgramNumber;

                    const program = programs.find((p) => p.programName === studentProgramName);
                    if (program) {
                        studentProgramNumber = program.programNumber;
                    }                    
                    

                    // Ensure unique student number
                    while (existingStudentNumbers.has(studentNumber)) {
                        studentNumber = generateNextStudentNumber(existingStudentNumbers, admissionYearInt);
                    }

                    // Add new student to the array
                    newStudents.push(new StudentModel(
                        students.length + newStudents.length + 1, // Generate ID
                        null,
                        studentNumber,
                        studentPassword,
                        studentType,
                        studentNameFirst,
                        studentNameMiddle,
                        studentNameLast,
                        studentSex,
                        studentEmail,
                        studentBirthDate,
                        studentPccEmail,
                        admissionYear,
                        studentYrLevel, // Set year level based on admission year
                        studentProgramNumber,
                        studentContact,
                        studentAddress,
                        isABMgraduate,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    ));


                    // Insert timeline data if yearLevel is 4 or below
                    if (studentYrLevel <= 4) {
                        const newTimeline = {
                            academicYear: academicYear,
                            studentNumber: studentNumber,
                            yearLevel: studentYrLevel,
                            semester: currentSemester,
                            startEnroll: new Date(),
                            endEnroll: null,
                            isRepeating: false,
                            isLeaving: false,
                            admissionYear: admissionYearInt
                        };
                        timelineData.push(newTimeline);
                    }
                    

                    // Add the newly generated student number to the existing set
                    existingStudentNumbers.add(studentNumber);
                }
            }

            // Insert all valid records in bulk
           // console.log("New students to insert:", newStudents);
            let emailSet = new Set();
            let contactSet = new Set();
            let duplicateEmails = [];
            let duplicateContacts = [];

            newStudents.forEach(student => {
                // Check for duplicate email
                if (emailSet.has(student.studentEmail)) {
                  duplicateEmails.push(student.studentEmail);
                } else {
                  emailSet.add(student.studentEmail);
                }
              
                // Check for duplicate contact
                if (contactSet.has(student.studentContact)) {
                  duplicateContacts.push(student.studentContact);
                } else {
                  contactSet.add(student.studentContact);
                }
            });

            if (duplicateEmails.length > 0 || duplicateContacts.length > 0) {
              //  console.log('Duplicate Emails:', duplicateEmails);
               // console.log('Duplicate Contacts:', duplicateContacts);
                return;
            } else {
                await insertStudents(newStudents, timelineData);
                await fetchExistingStudents();
            }
          } catch (error) {
            console.error("Error processing file:", error);
        } finally {
            // Reset processing status
            setIsProcessing(false);
        }
        };

        reader.readAsArrayBuffer(file);
    };

    //AUTOMATE GENERATION OF PCC EMAIL
    const generatePCCemail = (FirstName, LastName, admissionYear) => {
        const PCCemail = `${LastName.toLowerCase().replace(/\s+/g, "")}_${FirstName.toLowerCase().replace(/\s+/g, "")}${admissionYear}@paranaquecitycollege.edu.ph`;
        return PCCemail;
    };
    
    const generatePassword = (FirstName, LastName, admissionYear) => {
        const password = `${FirstName.replace(/\s+/g, "")}${admissionYear}${LastName.replace(/\s+/g, "")}`;
        return password;
    };

    useEffect(() => {
        const fetchAndDisplayCourseDetails = async () => {
          const courseDetails = await fetchCourseDetails(selectedStudent ?.studentNumber);
    
          if (courseDetails) {
            setGroupedCourseDetails(courseDetails);
          } else {
            setGroupedCourseDetails([]);
          }
        };
    
        if (selectedStudent?.studentNumber) {
          fetchAndDisplayCourseDetails();
        }
      }, [selectedStudent]);

    const fetchSemGrade = async (scheduleNumber, studentNumber) => {
        try {
          const semGrades = await SemGradeModel.fetchSemGradeData(scheduleNumber);
          const findgrades = semGrades.find((grade) => grade.studentNumber === studentNumber) || {};
      
          return findgrades;
        } catch (error) {
          console.error("Error fetching SemGrade:", error);
          return {};
        }
      };


      const convertTo12HourFormat = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
        return `${adjustedHours}:${String(minutes).padStart(2, "0")} ${period}`;
      };
      
      
const fetchCourseDetails = async (studentNumber) => {
  console.log("Fetching course details for Student:", studentNumber);

  if (!studentNumber) {
    console.error("Student number is required.");
    return;
  }

  try {
    // Step 1: Fetch all courses, enrollments, schedules, and program data in parallel
    const [allCourses, allEnrollments, allSchedules, programData] = await Promise.all([
      CourseModel.fetchAllCourses(),
      EnrollmentModel.fetchAllEnrollment(),
      ScheduleModel.fetchSchedules(),
      ProgramModel.fetchAllPrograms(),
    ]);

    //console.log("Fetched courses, enrollments, schedules, and program data");

    // Step 2: Filter enrollments for the given student
    const studentEnrollments = allEnrollments.filter(
      (enrollment) => String(enrollment.studentNumber) === String(studentNumber)
    );

    if (studentEnrollments.length === 0) {
      console.log(`No enrollments found for student ${studentNumber}`);

      return null;
    }

   // console.log(`Filtered ${studentEnrollments.length} enrollments for student ${studentNumber}`);

    // Step 3: Create an index of enrollments by courseCode for quick lookup
    const enrollmentIndex = studentEnrollments.reduce((acc, enrollment) => {
      acc[enrollment.courseCode] = enrollment.scheduleNumber;
      return acc;
    }, {});

   // console.log("Created enrollment index");

    // Step 4: Map through courses and fetch additional details
    const courseDetailsPromises = allCourses.map(async (course) => {
      const {
        courseCode,
        courseDescriptiveTitle,
        academicYear,
        courseSemester,
        courseLecture,
        courseLaboratory,
        programNumber, // Add programNumber from course
      } = course;

      const scheduleNumber = enrollmentIndex[courseCode];

      if (!scheduleNumber) {
        console.log(`No scheduleNumber found for courseCode: ${courseCode}`);
        return null;
      }

      // Fetch semGrade data for this course's schedule
      const semGradeData = await fetchSemGrade(scheduleNumber, studentNumber);
      const numEq = semGradeData?.numEq ? parseFloat(semGradeData.numEq).toFixed(2) : "0.00";
      const remarks = semGradeData?.remarks || "-";

      // Fetch schedule details for this course's scheduleNumber
      const scheduleData = allSchedules.find(
        (schedule) => schedule.scheduleNumber === scheduleNumber
      );

      if (!scheduleData) {
        console.log(`No schedule found for scheduleNumber: ${scheduleNumber}`);
        return null;
      }

      const { scheduleDay, startTime, endTime, personnelNumber, sectionNumber, room } = scheduleData;

      const startTime12Hour = convertTo12HourFormat(startTime);
const endTime12Hour = convertTo12HourFormat(endTime);


      // Fetch personnel details to get initials
      const personnel = await PersonnelModel.getProfessorByPersonnelNumber(personnelNumber);
      const personnelNameFirst = personnel?.firstName || "";
      const personnelNameLast = personnel?.lastName || "";
      const personnelInitials = `${personnelNameFirst.charAt(0)}. ${personnelNameLast.charAt(0)}.`.toUpperCase();

      // Find the program title based on programNumber
      const programDetails = programData.find((program) => program.programNumber === programNumber);
      const programDescriptiveTitle = programDetails?.programName || "N/A";

      // Add course details to return object
      return {
        courseCode,
        courseDescriptiveTitle,
        academicYear,
        courseSemester,
        numEq,
        remarks,
        credits: (courseLecture + courseLaboratory || 0).toFixed(2),
        scheduleDay,
        startTime: startTime12Hour,
        endTime: endTime12Hour,
        personnelInitials,
        sectionNumber,
        programNumber,
        room,
        programName: programDescriptiveTitle, // Include program title
      };
    });

    // Step 5: Resolve all promises and filter out nulls
    const resolvedCourseDetails = (await Promise.all(courseDetailsPromises)).filter(Boolean);

    //console.log("Resolved course details:", resolvedCourseDetails);

    // Step 6: Group courses by academicYear and courseSemester
    const groupedCourseDetails = resolvedCourseDetails.reduce((acc, course) => {
      const { academicYear, courseSemester } = course;

      acc[academicYear] = acc[academicYear] || {};
      acc[academicYear][courseSemester] =
        acc[academicYear][courseSemester] || [];
      acc[academicYear][courseSemester].push(course);

      return acc;
    }, {});

    //console.log("Grouped Course Details:", groupedCourseDetails);

    return groupedCourseDetails;
  } catch (error) {
    console.error("Failed to fetch course details:", error);
  }
};

const getSemesterText = (semester) => {
  const sem = parseInt(semester, 10);
  switch (sem) {
    case 1:
      return "First (1st)";
    case 2:
      return "Second (2nd)";
    case 3:
      return "Summer";
    default:
      return `${sem}`;
  }
};
      
    
    
    // Modify the generateNextStudentNumber function to accept a year parameter
    const generateNextStudentNumber = (existingNumbers, year) => {
        let highestNumber = 0;
    
        // Loop through existing student numbers to find the highest for the given year
        existingNumbers.forEach(num => {
            const currentYear = num.split('-')[0];
            if (currentYear === year.toString()) {
                const numberPart = parseInt(num.split('-')[1]);
                if (numberPart > highestNumber) {
                    highestNumber = numberPart;
                }
            }
        });
    
        const nextNumber = highestNumber + 1;
        return `${year}-${nextNumber.toString().padStart(6, '0')}`; // Format as '2024-000001'
    };

    {/* DONT DELETE THIS YET
    const generateNextSectionNumber = (year, studentProgramNumber, existingSectionNumbers) => {
        let highestNumber = 1;
        let sectionCount = 0;
    
        // Loop through existing section numbers
        existingSectionNumbers.forEach(section => {
            const [sectionYear, programNumber, sectionNumber] = section.split('-');
    
            // Check if the section matches the current year and student program number
            if (sectionYear === year.toString() && programNumber === studentProgramNumber.toString()) {
                const numberPart = parseInt(sectionNumber, 10); // Parse section number
    
                // Update highest section number
                if (numberPart > highestNumber) {
                    highestNumber = numberPart;
                }
    
                // Increment the count of students in this section
                sectionCount++;
            }
        });
    
        // Count the number of students in the highest section number
        const highestSectionCount = existingSectionNumbers.filter(section => {
            const [, , secNum] = section.split('-');
            return secNum === highestNumber.toString().padStart(3, '0'); // Match with padded number
        }).length;
    
        // Check if there are already 60 or more students in the current highest section
        if (highestSectionCount >= 60) {
            // Increment the highest number to create a new section
            highestNumber++;
        }
    
        // Return the new or current section number
        return `${year}-${studentProgramNumber}-${highestNumber.toString().padStart(3, '0')}`; // Format as '2024-101-001'
    };*/}
    
    // Validate each row
    const validateRow = (studentNameFirst, studentNameMiddle, studentNameLast, studentContact) => {
    const hasCompleteName = studentNameFirst && studentNameMiddle && studentNameLast;
    if (!hasCompleteName) {
        return false; // Invalid row
    }
    // Validate contact number (must be 11 digits)
    const isValidContact = studentContact && /^\d{11}$/.test(studentContact);
    if (!isValidContact) {
        return false; // Invalid row
    }

    // Add other validations if necessary

    return true; // Row is valid
    };


    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (option) => {
        setFilterOption(option);
        setShowFilterDropdown(false); // Close the dropdown after selection
    };

    const handleStatusChange = (id, newStatus) => {
        const updatedStudents = students.map(student =>
            student.id === id ? { ...student, status: newStatus } : student
        );
        setStudents(updatedStudents);
    };

    //Query Function
    const filteredStudents = students
    .map(student => {
        // Ensure programName is mapped correctly
        const program = programs.find(prog => prog.programNumber === student.studentProgramNumber);
        const programName = program ? program.programName : 'Unknown';

        // Return the updated student object with programName
        return { ...student, programName };
    })
    .filter(student => {
        const searchQueryLower = searchQuery.toLowerCase();
        return (
            (student.studentNameFirst && student.studentNameFirst.toLowerCase().includes(searchQueryLower)) ||
            (student.studentNameLast && student.studentNameLast.toLowerCase().includes(searchQueryLower)) ||
            (student.studentNumber && student.studentNumber.toLowerCase().includes(searchQueryLower)) ||
            (student.admissionYear && student.admissionYear.toLowerCase().includes(searchQueryLower)) ||
            (student.studentType && student.studentType.toLowerCase().includes(searchQueryLower)) ||
            (student.programName && student.programName.toLowerCase().includes(searchQueryLower)) && // Include programName in the search
            (filterOption === 'All' || student.studentType === filterOption)
        );
    });

// Log the final filtered students for debugging
//console.log('Filtered Students:', filteredStudents);

    //Page Layout
    return (
        <Container fluid className="container-fluid">
            <h2 className="custom-font custom-color-green-font mb-3 mt-2">Students Masterlist</h2>
            <div class="mt-4  mx- auto alert alert-warning text-center px-auto" role="alert">
            <span className='fw-bold fs-6'>Note: </span> The master list enables users to search for students based on criteria such as student number, name, program, or student type. The available search filters facilitate the efficient retrieval of relevant information. </div>
        
            <section className='container-fluid bg-white p-2 px-4 rounded table-responsive hide-scrollbar'>
            <div className="d-flex align-items-center justify-content-between gap-2 w-100 mt-4">
                {/* Upper left: Search input with icon on the right side */}
                <div className="mb-2 mb-md-0 w-100 w-md-auto">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <span className="input-group-text">
                            <FontAwesomeIcon icon={faSearch} /> {/* Font Awesome search icon */}
                        </span>
                    </div>
                </div>

                {/* Upper right: Import Student Classlist button */}
                <div className="mb-2 mb-md-0 w-100 w-md-auto mx-md-2">
                    <button className="btn btn-success custom-font w-100 w-md-50" onClick={() => document.querySelector('input[type="file"]').click()}>
                        <FontAwesomeIcon icon={faFileAlt} /> {isProcessing ? 'Processing' : 'Import Students'} {/* Font Awesome file icon */}
                    </button>
                    <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        accept=".xlsx, .xls" 
                        onChange={handleFileUpload} 
                    />
                </div>
            </div>



                {/* Student list table */}
                <div className="row mt-3">
                    <div className="col-md-12">
                        <div className=""> {/* Add table-responsive class for responsive scrolling */}
                            {loading ? ( <div className="text-center py-5 bg-white mt-4">
                                        <Spinner animation="border" variant="success" />
                                        <p className="mt-3">Loading data, please wait...</p>
                                    </div>
                                    ):(
                                      <Container fluid className='mx-auto mb-3 table-responsive shadow-sm hide-scrollbar'>
                               <Table hover className="table table-hover success-border mt-4 shadow-sm hide-scrollbar" style={{tableLayout:'fixed'}}>
                                <thead className="table-success" style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                    <tr>
                                        <th className='custom-color-green-font custom-font text-center pt-3'>Student Number</th>
                                        <th className='custom-color-green-font custom-font text-center pt-3'>Name</th>
                                        <th className='custom-color-green-font custom-font text-center pt-3'>PCC Email</th>
                                        <th className='custom-color-green-font custom-font text-center pt-3'>Program</th>
                                        <th className='custom-color-green-font custom-font text-center pt-3'>Status</th>
                                        <th className='custom-color-green-font custom-font text-center pt-3'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white'>
                                    {filteredStudents.map((student) => {

                                        return (
                                            <tr key={student.id}>
                                                <td className='custom-color-green-font text-center'>{student.studentNumber}</td>
                                                <td className='custom-color-green-font text-center'>{student.studentNameLast || ''}, {student.studentNameFirst || ''} {student.studentNameMiddle || ''}</td>
                                                <td className='custom-color-green-font text-center'>{student.studentPccEmail}</td>
                                                <td className='custom-color-green-font text-center'>
                                                    {programs.find(program => program.programNumber === student.studentProgramNumber)?.programName || 'No Program Assigned'}
                                                </td>
                                                <td className='custom-color-green-font text-center'>
                                               {student.studentType}
                                                </td>
                                                <td className="d-flex align-items-center justify-content-center">
                                                  <Dropdown align="end" className="h-100 w-100 d-flex align-items-center justify-content-center">
                                                    <Dropdown.Toggle
                                                      variant="link"
                                                      className="p-0 border-0"
                                                      style={{ color: '#000' }}
                                                    >
                                                      <i className="fas fa-ellipsis-v"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                      <Dropdown.Item onClick={() => handleTORClick(student)}>
                                                        View TOR
                                                      </Dropdown.Item>
                                                      <Dropdown.Item onClick={() => openModal(student)}>View COR</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                  </Dropdown>
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                            </Container>
                            )}
                        </div>
                    </div>
                </div>
            </section>


                   {/* Modal for COG */}
       <Modal show={showModalCog} onHide={closeModal} className="modal-xxl" centered animation={false} >
        <Modal.Header closeButton>
        <FontAwesomeIcon icon="certificate" style={{ marginRight: '8px' }} />
          <Modal.Title className='custom-color-green-font'>Certificate of Registration</Modal.Title>
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
          {selectedStudent && (
            <>
             <Table className="border-white table-upper">
        <thead style={{textAlign: 'center' }}>
          <tr>
            <th colSpan="6" className="fs-5 text-center">OFFICE OF THE COLLEGE REGISTRAR</th>
          </tr>
          <tr>
            <th colSpan="6" className="fs-4 text-center">CERTIFICATE OF REGISTRATION</th>
          </tr>
        </thead>
        <tbody>
  <tr>
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>FULL NAME:</td>
    <td className="fs-6">
      {selectedStudent ? `${selectedStudent?.studentNameLast}, ${selectedStudent?.studentNameFirst} ${selectedStudent?.studentNameMiddle}` : "N/A"}
    </td>
    <td></td>
    <td></td>
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>SCHOOL YEAR:</td>
    <td className="fs-6">{Object.keys(groupedCourseDetails)[0] || "N/A"}</td>
  </tr>
  <tr>
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>STUDENT ID N#.:</td>
    <td className="fs-6">
      {selectedStudent ? selectedStudent.studentNumber : "N/A"}
    </td>
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>SEX:</td>
    <td className="fs-6">{selectedStudent ? selectedStudent.studentSex : "N/A"}</td>
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>SEMESTER:</td>
    <td className="fs-6">
    {getSemesterText(Object.keys(groupedCourseDetails).length > 0
        ? Object.keys(groupedCourseDetails[Object.keys(groupedCourseDetails)[0]])[0]
        : "N/A")}
    </td>
  </tr>
  <tr>
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>PROGRAM:</td>
  
    <td className="fs-6">
    {groupedCourseDetails && Object.keys(groupedCourseDetails).length > 0
        ? groupedCourseDetails[Object.keys(groupedCourseDetails)[0]][
            Object.keys(groupedCourseDetails[Object.keys(groupedCourseDetails)[0]])[0]
          ][0]?.programName || "N/A"
        : "N/A"}
    </td>
    <td colSpan="2"></td>
    
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>YEAR LEVEL & SECTION:</td>
    <td className="fs-6">
      {groupedCourseDetails && Object.keys(groupedCourseDetails).length > 0
        ? groupedCourseDetails[Object.keys(groupedCourseDetails)[0]][
            Object.keys(groupedCourseDetails[Object.keys(groupedCourseDetails)[0]])[0]
          ][0]?.sectionNumber || "N/A"
        : "N/A"}
    </td>
  </tr>
  <tr>
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>PROGRAM CODE:</td>
    <td className="fs-6">{selectedStudent ? selectedStudent.studentProgramNumber : "N/A"}</td>
    <td></td>
    <td></td>
    <td className="fs-6 fw-bold" style={{ fontWeight: 'bold' }}>ADMISSION STATUS:</td>
    <td className="fs-6">{selectedStudent ? selectedStudent.studentType : "N/A"}</td>
  </tr>
</tbody>


      </Table>

      {/* Grades Table */}
      <Table bordered className="text-center border-black grades-table">
      <thead style={{ backgroundColor: 'green', textAlign: 'center' }}>

  <tr>
    <th className="fs-6">COURSE CODE</th>
    <th colSpan="2" className="fs-6">DESCRIPTION</th>
    <th className="fs-6 text-center">UNITS <br /> LEC LAB</th>  {/* Adjusted for colspan */}
    <th className="fs-6">TIME</th>
    <th className="fs-6">DAY/S</th>
    <th className="fs-6">ROOM</th>
    <th className="fs-6">PROF. INITIAL</th>
  </tr>
</thead>

<tbody style={{textAlign: 'center' }}>
  {Object.keys(groupedCourseDetails).length > 0 ? (
    Object.keys(groupedCourseDetails).map((academicYear, yearIndex) => (
      Object.keys(groupedCourseDetails[academicYear]).map((semester, semIndex) => (
        groupedCourseDetails[academicYear][semester].map((course, courseIndex) => (
          <tr key={`${yearIndex}-${semIndex}-${courseIndex}`}>
            <td className="fs-6">{course.courseCode}</td>
            <td colSpan="2" className="fs-6">{course.courseDescriptiveTitle}</td>
            <td className="fs-6">
              {`${course.credits || 'N/A'}`}
            </td>
            <td className="fs-6">
              {`${course.startTime || 'N/A'} - ${course.endTime || 'N/A'}`}
            </td>
            <td className="fs-6">{course.scheduleDay || 'N/A'}</td>
            <td className="fs-6">{course.room || 'N/A'}</td>
            <td className="fs-6">{course.personnelInitials || 'N/A'}</td>
          </tr>
        ))
      ))
    ))
  ) : (
    <tr>
      <td colSpan="8" className="fs-6">No data available</td>
    </tr>
  )}


  {/* Registrar Evaluator/Print Row */}
  <tr style={{border: 'none'}}>
    <td className='fs-6' style={{border: 'none'}}>Registrar Evaluator/Print:</td>
    <td colSpan="2" className='fs-6' style={{textAlign: 'left', border: 'none'}}>{`${user.personnelNameFirst} ${user.personnelNameMiddle} ${user.personnelNameLast}`}</td>
    <td  className="fs-6" style={{border: 'none'}}>Total Unit {Object.keys(groupedCourseDetails).reduce((total, academicYear) => {
        return total + Object.keys(groupedCourseDetails[academicYear]).reduce((semesterTotal, semester) => {
          return semesterTotal + groupedCourseDetails[academicYear][semester].reduce((courseTotal, course) => {
            return courseTotal + (parseFloat(course.credits) || 0); // Add up credits for each course
          }, 0);
        }, 0);
      }, 0).toFixed(2)}</td>
    <td className="fs-6 text-right" style={{border: 'none'}}>Date</td>
    <td colSpan={3} style={{border: 'none'}}></td>
  </tr>
  <tr style={{border: 'none'}}>
  <td className='fs-6' style={{border: 'none'}}></td>
    <td colSpan="2" className='fs-6' style={{textAlign: 'left', border: 'none', fontStyle: 'italic'}}>College Registrar</td>
    <td colSpan={5} style={{border: 'none'}}></td>
    
    </tr>
</tbody>

</Table>
            </>
          )}


         </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          <Button variant="primary" onClick={handlePrintCOR}>Download COR</Button>
        </Modal.Footer>

      </Modal>

            <Modal show={showModal} onHide={handleCloseModal} size="xl"  className="custom-modal-width" animation={false}>
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
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.programName}</p>
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
                      <p style={{ fontSize: "0.7rem" }}>{selectedStudent?.studentAdmissionYr}</p>
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
                  {Object.keys(groupedCourseDetails).map((academicYear, idx) =>
  Object.keys(groupedCourseDetails[academicYear]).map((semesterKey) => {
    const semester = parseInt(semesterKey, 10); // Convert the semester key to a number
    const courses = groupedCourseDetails[academicYear][semester] || [];
    const academicYearLabel = getAcademicYear(selectedStudent.studentAdmissionYr, idx);

    return (
      <>
        {courses.length > 0 ? (
          <>
            {/* Render Courses for the Current Semester */}
            {courses.map((course, subIdx) => (
              <React.Fragment key={subIdx}>
                {/* TERM & SCHOOL YEAR */}
                {subIdx === 0 && (
                  <div
                    style={{
                      gridColumn: '1',
                      gridRow: `span ${courses.length}`,
                      border: '1px solid black',
                      padding: '8px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <strong>
                      {semester === 1
                        ? '1st'
                        : semester === 2
                        ? '2nd'
                        : '3rd'}{' '}
                      Semester
                    </strong>
                    <br />
                    {academicYearLabel}
                  </div>
                )}
                {/* SUBJECT CODE */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.courseCode}
                </div>

                {/* DESCRIPTIVE TITLE */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.courseDescriptiveTitle}
                </div>

                {/* GRADES */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.numEq || '-'}
                </div>

                {/* COMPLETION */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.remarks || '-'}
                </div>

                {/* UNITS OF CREDIT */}
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderRight: '1px solid black',
                    padding: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.credits || '0.00'}
                </div>
              </React.Fragment>
            ))}
          </>
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
    gap: '0px', // Set gap to 0 for shared borders
    textAlign: 'center',
    border: '1px solid black', // Outer border
  }}
>
  {/* Header Row */}
  <div style={{ gridColumn: 'span 1', border: '1px solid black', padding: '8px' }}>
    <p style={{ fontSize: '0.7rem', marginBottom: '2px', textAlign: 'start' }}>REMARKS:</p>
  </div>
  <div style={{ gridColumn: 'span 7', border: '1px solid black', padding: '8px' }}>
    <p style={{ fontSize: '0.7rem', marginBottom: '2px', textAlign: 'start' }}>
      <strong>CLEARED OF ALL PROPERTY AND MONEY ACCOUNTABILITIES</strong>
    </p>
  </div>

  {/* Grading System Header */}
  <div style={{ gridColumn: 'span 3', border: '1px solid black', padding: '4px' }}>
    <p style={{ fontSize: '0.6rem', margin: '0' }}><strong>GRADING SYSTEM</strong></p>
  </div>
  <div
    style={{
      gridColumn: 'span 5',
      gridRow: 'span 2',
      border: '1px solid black',
      padding: '4px',
      fontSize: '0.5rem',
      fontStyle: 'italic',
      textAlign: 'start',
    }}
  >
    <p style={{ margin: '0' }}>
      This Transcript is valid only when it bears the school seal and the original signature of the
      Registrar. Any erasure or alteration made on this document renders it void unless initialed
      by the foregoing official.
    </p>
  </div>

  {/* Sub-Headers */}
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem' }}>
    <p style={{ margin: '0' }}>GRADE</p>
  </div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem' }}>
    <p style={{ margin: '0' }}>EQUIVALENCE</p>
  </div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem' }}>
    <p style={{ margin: '0' }}>DESCRIPTION</p>
  </div>

  {/* Body Rows */}
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>1.00</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>99-100%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>EXCELLENT</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'left',
      fontSize: '0.5rem',
      lineHeight: '1.2',
    }}
  >
    Prepared by:
  </div>

  <div
    style={{
      gridColumn: 'span 2',
      gridRow: 'span 14',
      border: '1px solid black',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      textAlign: 'center',
      height: '100%',
      fontSize: '0.5rem',
    }}
  >
    <p>
      Transcript is <strong>NOT</strong> valid without PCC seal
    </p>
  </div>

  {/* Remaining Rows */}
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>1.25</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>96-98%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>SUPERIOR</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem',
      lineHeight: '1.2',
    }}
  >
    <strong> <big>
      {`${user.personnelNameFirst} ${user.personnelNameMiddle} ${user.personnelNameLast}`}
      </big></strong>
  </div>

    {/* Repeat for remaining rows */}
    <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>1.50</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>93-95%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>VERY GOOD</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    Program Records-In-Charge
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>1.75</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>90-92%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>GOOD</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'left',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    Checked & Verified by:
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>2.00</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>87-89%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>MERITORIOUS</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'left',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >

  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>2.25</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>84-86%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>VERY SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    Registrar 1
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>2.50</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>81-83%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'left',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    Date Issued
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>2.75</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>76-80%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>FAIRLY SATISFACTORY</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    <big>{formattedDate}</big>
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>3.00</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>75-77%</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>PASSING</div>
  <div
    style={{
      gridColumn: 'span 3',
      gridRow: 'span 4',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
    
  </div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>5.00</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>Below 50</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>FAILED</div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>INC</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}></div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>INCOMPLETE</div>

  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>OD</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}></div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>OFFICIALY DROPPED</div>


  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>UD</div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}></div>
  <div style={{ border: '1px solid black', padding: '4px', fontSize: '0.5rem', lineHeight: '1.2' }}>UNOFICIALLY DROPPED</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
    }}
  >
      <strong>
      <big>{`${user.personnelNameFirst} ${user.personnelNameMiddle} ${user.personnelNameLast}`}</big>
    </strong>
  </div>

  <div style={{ border: '1px solid black', padding: '4px' , fontSize: '0.5rem', lineHeight: '1.2'}}>FA</div>
  <div style={{ border: '1px solid black', padding: '4px' , fontSize: '0.5rem', lineHeight: '1.2'}}></div>
  <div style={{ border: '1px solid black', padding: '4px' , fontSize: '0.5rem', lineHeight: '1.2'}}>FAILURE DUE TO EXCESSIVE ABSENCES</div>
  <div
    style={{
      gridColumn: 'span 3',
      border: '1px solid black',
      padding: '4px',
      textAlign: 'center',
      fontSize: '0.5rem', lineHeight: '1.2'
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
        </Container>
    );
}
