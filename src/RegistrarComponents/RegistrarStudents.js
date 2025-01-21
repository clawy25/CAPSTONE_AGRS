import React, { useState, useEffect, useContext } from 'react';
import '../App.css'; // Custom styling
import {Spinner, Modal, Button, Table, Container} from 'react-bootstrap'
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
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [showModal, setShowModal] = useState(false);
    const [programName, setProgramName] = useState("");
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const [groupedCourseDetails, setGroupedCourseDetails] = useState({});

    const getAcademicYear = (studentAdmissionYr, yearIdx) => {
        return `${studentAdmissionYr + yearIdx}-${studentAdmissionYr + yearIdx + 1}`;
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
    
      const handleCloseModal = () => setShowModal(false);

    const fetchCurrentAcadYear = async () => {
        try {
            const years = await AcademicYearModel.fetchExistingAcademicYears();
            console.log(years);
    
            const currentYear = years.find((year) => year.isCurrent === true); 
            console.log("Current year found:", currentYear);
    
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

                console.log(trimmedProgramData);
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
            console.log(existingStudents); 
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
        const reader = new FileReader();

        reader.onload = async (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            const existingStudentNumbers = new Set(students.map(student => student.studentNumber));
            
            const newStudents = [];
            const timelineData = [];

            const currentMonth = new Date().getMonth() + 1;
            const academicYear = currentAcademicYear.academicYear;
            //const startYear = parseInt(academicYear.trim().split('-')[0]);
            const [currentYear, nextYear] = academicYear.trim().split('-').map(year => parseInt(year));
            const semester = currentMonth >= 7 && currentMonth <= 12 ? 1 : 2;

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
                            semester: semester,
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
            console.log("New students to insert:", newStudents);
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
                console.log('Duplicate Emails:', duplicateEmails);
                console.log('Duplicate Contacts:', duplicateContacts);
                return;
            } else {
                await insertStudents(newStudents, timelineData);
                await fetchExistingStudents();
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
          const courseDetails = await fetchCourseDetails(selectedStudent.studentNumber);
    
          if (courseDetails) {
            setGroupedCourseDetails(courseDetails);
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
      

    const fetchCourseDetails = async (studentNumber) => {
        console.log("Fetching course details for Student:", studentNumber);
      
        // Validate input
        if (!studentNumber) {
          console.error("Student number is required.");
          return;
        }
      
        try {
          // Step 1: Fetch all courses, enrollments, and grades in parallel
          const [allCourses, allEnrollments] = await Promise.all([
            CourseModel.fetchAllCourses(),
            EnrollmentModel.fetchAllEnrollment(),
          ]);
      
          console.log("Fetched courses and enrollments");
      
          // Step 2: Filter enrollments for the given student
          const studentEnrollments = allEnrollments.filter(
            (enrollment) => String(enrollment.studentNumber) === String(studentNumber)
          );
      
          if (studentEnrollments.length === 0) {
            console.log(`No enrollments found for student ${studentNumber}`);
            return;
          }
      
          console.log(`Filtered ${studentEnrollments.length} enrollments for student ${studentNumber}`);
      
          // Step 3: Create an index of enrollments by courseCode for quick lookup
          const enrollmentIndex = studentEnrollments.reduce((acc, enrollment) => {
            acc[enrollment.courseCode] = enrollment.scheduleNumber;
            return acc;
          }, {});
      
          console.log("Created enrollment index");
      
          // Step 4: Map through courses and fetch grades and curriculum info
          const courseDetailsPromises = allCourses.map(async (course) => {
            const { courseCode, courseDescriptiveTitle, academicYear, courseSemester, courseLecture, courseLaboratory } = course;
            const scheduleNumber = enrollmentIndex[courseCode];
      
            if (!scheduleNumber) {
              console.log(`No scheduleNumber found for courseCode: ${courseCode}`);
              return null;
            }
      
            // Fetch semGrade data for this course's schedule
            const semGradeData = await fetchSemGrade(scheduleNumber, studentNumber);
            const numEq = semGradeData?.numEq || "N/A";
            const remarks = semGradeData?.remarks || "N/A";
      
            // Add course details to return object, including numEq and credits (if available)
            return {
              courseCode,
              courseDescriptiveTitle,
              academicYear,
              courseSemester,
              numEq,
              remarks,
              credits: courseLecture + courseLaboratory || "N/A",  // Assuming the course has a 'credits' property
            };
          });
      
          // Step 5: Resolve all promises and filter out nulls
          const resolvedCourseDetails = (await Promise.all(courseDetailsPromises)).filter(Boolean);
      
          console.log("Resolved course details:", resolvedCourseDetails);
      
          // Step 6: Group courses by academicYear and courseSemester
          const groupedCourseDetails = resolvedCourseDetails.reduce((acc, course) => {
            const { academicYear, courseSemester } = course;
      
            acc[academicYear] = acc[academicYear] || {};
            acc[academicYear][courseSemester] =
              acc[academicYear][courseSemester] || [];
            acc[academicYear][courseSemester].push(course);
      
            return acc;
          }, {});
      
          console.log("Grouped Course Details:", groupedCourseDetails);
      
          return groupedCourseDetails;
        } catch (error) {
          console.error("Failed to fetch course details:", error);
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
console.log('Filtered Students:', filteredStudents);

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
                        <FontAwesomeIcon icon={faFileAlt} /> Import Students {/* Font Awesome file icon */}
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
                                                <td className='d-flex align-itmes-cneter justify-content-center'>
                                                    
                                                    <button className="btn btn-success btn-sm" onClick={() => handleTORClick(student)}>
                                                        <FontAwesomeIcon icon={faFileSignature} /> View TOR {/* Font Awesome signature icon */}
                                                    </button>
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
                  {course.credits || '-'}
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
                  {course.numEq || '0.00'}
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
