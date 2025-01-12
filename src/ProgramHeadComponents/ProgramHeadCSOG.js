import React, { useState, useEffect, useContext } from 'react'; 
import { useLocation } from 'react-router-dom';
import { Table, Form, Button, Row, Col, Modal, ButtonToolbar, Spinner } from 'react-bootstrap';
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
import CourseModel from '../ReactModels/CourseModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import SubmissionModel from '../ReactModels/SubmissionModel';
import '../App.css';


const MasterlistOfGradesTable = () => {
  const [loading, setLoading] = useState(false)
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
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState();
  const [currentAcademicYear, setCurrentAcadYear] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [groupedData, setGroupedData] = useState({}); 
  const [currentSection, setCurrentSection] = useState("");
  const [validatedSections, setValidatedSections] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [verifiedSections, setVerifiedSections] = useState({});

  console.log(verifiedSections);

const handleShowModal = (section) => {
  setCurrentSection(section); // Set the section being validated
  setShowModal(true);         // Show the modal
};

const handleCloseModal = () => {
  setShowModal(false);        // Hide the modal
  setCurrentSection("");      // Clear the current section
};



const toggleSection = (sectionNumber) => {
  setExpandedSection((prevSection) => (prevSection === sectionNumber ? null : sectionNumber));
};

const { state } = useLocation();

useEffect(() => {
  if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester) {
    fetchCourses(); // Fetch sections automatically
  }
}, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester]);
 

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
  
      // Fetch sections filtered by the selected criteria
      const sectionData = await SectionModel.fetchExistingSections(
        selectedAcademicYear,
        yearLevel,
        semester,
        selectedProgramNumber
      );
    
      console.log(sectionData);
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
  
          // If numeric parts are the same, compare the alphanumeric part (HM41A, HM41B, etc.)
          if (alphaA !== alphaB) {
            return alphaA.localeCompare(alphaB);
          }
  
          // If both numeric and alpha parts are the same, compare the suffixes (e.g., B, C, etc.)
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

      console.log(filteredSchedules);
  
      // Fetch personnel data for the selected academic year
      const personnelData = await PersonnelModel.fetchAllPersonnel(selectedAcademicYear);
  
      // Map personnel numbers to their last names
      const personnelNameMap = personnelData.reduce((map, personnel) => {
        map[personnel.personnelNumber] = `${personnel.personnelNameFirst} ${personnel.personnelNameMiddle} ${personnel.personnelNameLast}`;
        return map;
      }, {});


      const courseData = await CourseModel.getCoursesbyProgram(
        selectedAcademicYear,
        parseInt(selectedYearLevel),
        parseInt(selectedSemester),
        selectedProgramNumber
      );

      console.log(courseData);

      const courseDetails = courseData.reduce((map, course) => {
        map[course.courseCode] = {
          courseName: course.courseDescriptiveTitle,
          courseCredits: course.courseLecture + course.courseLaboratory
        };
        return map;
      }, {});

      const classDetails = await filteredSchedules.reduce(async (promiseMap, schedule) => {
        const map = await promiseMap;
        const grades = await SemGradeModel.fetchSemGradeData(schedule.scheduleNumber);
        const studentsData = await StudentModel.fetchExistingStudents();
        const gradesWithNames = grades.map(grade => {
          const student = studentsData.find(student => student.studentNumber === grade.studentNumber);
          return {
            ...grade,
            studentFirstName: student ? student.studentNameFirst : "Unknown",
            studentMiddleName: student ? student.studentNameMiddle : "Unknown",
            studentLastName: student ? student.studentNameLast : "Unknown",
          };
        });
        map[schedule.scheduleNumber] = { grades: gradesWithNames };
        return map;
      }, Promise.resolve({}));

      console.log(classDetails);
      
      
  
      // Group course codes and assigned personnel by section number
      const groupedData = filteredSchedules.reduce((acc, schedule) => {
        const { scheduleNumber, sectionNumber, courseCode, personnelNumber, scheduleDay, startTime, endTime } = schedule;
        const personnelName = personnelNameMap[personnelNumber] || "Unknown";
        const course = courseDetails[courseCode];
        const scheduleGrades = classDetails[scheduleNumber];
      
        // Initialize section entry if not already present
        if (!acc[sectionNumber]) {
          acc[sectionNumber] = {
            sectionNumber: sectionNumber,
            classes: []
          };
        }
      
        // Add course and schedule details to the section
        acc[sectionNumber].classes.push({
          scheduleNumber: scheduleNumber,
          courseCode: courseCode,
          courseName: course?.courseName,
          courseCredits: course?.courseCredits,
          personnelName: personnelName,
          scheduleDay: scheduleDay,
          startTime: startTime,
          endTime: endTime,
          classGrades: scheduleGrades
        });
      
        return acc;
      }, {});
  
      // Save the grouped data to state for rendering
      console.log(groupedData);
      setGroupedData(groupedData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Fetch only the necessary data from the models
      const studentsData = await StudentModel.fetchExistingStudents();
  
      const enrolledStudents = await EnrollmentModel.fetchAllEnrollment();
  
      const scheduleData = await ScheduleModel.fetchAllSchedules(selectedAcademicYear);
  
      // Combine the data and remove duplicates by studentNumber
      const combinedData = enrolledStudents.map((enrollment) => {
        // Match student details
        const student = studentsData.find(
          (student) => student.studentNumber === enrollment.studentNumber
        );
  
        // Match schedule details
        const schedule = scheduleData.find(
          (schedule) => schedule.scheduleNumber === enrollment.scheduleNumber
        );
  
        return {
          studentNumber: enrollment.studentNumber,
          studentName: student
            ? `${student.studentNameFirst} ${student.studentNameMiddle || ''} ${student.studentNameLast}`
            : 'Unknown',
          sectionNumber: schedule ? schedule.sectionNumber : null,
          scheduleNumber: enrollment.scheduleNumber,
        };
      });
  
      // Remove duplicates based on studentNumber
      const distinctData = combinedData.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.studentNumber === value.studentNumber)
      );

      console.log(distinctData);
      // Set the distinct data to the state
      setCombinedData(distinctData);
  
      return distinctData;
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, [user.programNumber]);


  const handleAcademicYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedAcademicYear(selectedYear);
    setSelectedProgram('');
    setSelectedYearLevel('');
    setSelectedSemester('');
    setGroupedData({}); // Reset sections
  };
  
  const handleProgramChange = (e) => {
    const selectedProgram = e.target.value;
    setSelectedProgram(selectedProgram);
    setSelectedYearLevel('');
    setSelectedSemester('');
    setGroupedData({}); // Reset sections
  };
  
  const handleYearLevelChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYearLevel(selectedYear);
    setSelectedSemester('');
    setGroupedData({}); // Reset sections
  };
  
  const handleSemesterChange = (e) => {
    const level = e.target.value;
    setSelectedSemester(level);
    setGroupedData({}); // Reset sections
  };

  const handleSectionChange = (e) => {
    if (e.target.value === ""){
      return;
    }
    setSelectedSection(e.target.value);
  };

  const sectionOptions = Object.keys(groupedData).sort();

  const generateRandomNames = () => {
    const names = [
      "John Doe",
      "Jane Smith",
      "Alice Brown",
      "Bob White",
      "Charlie Black",
      "Emily Davis",
      "Michael Scott",
      "Pam Beesly",
      "Jim Halpert",
      "Dwight Schrute",
      "Abigail Cruz",
    ];
    return Array.from({ length: 20 }, (_, index) => ({
      studentNo: index + 1,
      studentName: names[Math.floor(Math.random() * names.length)],
    }));
  };

  const dummyData = generateRandomNames();

    // Open the modal and set the current section
    const handleVerifyClick = (section) => {
      setCurrentSection(section);
      setShowModal(true);
    };

  // Handle validate action
  const handleValidate = async () => {
    const scheduleNumbers = getScheduleNumbersForSection(groupedData, currentSection);

    console.log(scheduleNumbers);

    const verify = await Promise.all(
      scheduleNumbers.map(scheduleNumber => SubmissionModel.fetchSubmissionBySchedule(scheduleNumber))
    );
    
    // Filter and map the data to update submissionStatus to 'Verified'
    const submissionData = verify
      .filter(submissions => submissions.length > 0) // Ignore empty arrays
      .flatMap(submissions => 
        submissions.map(submission => ({
          ...submission,
          submissionStatus: "Verified" // Update submissionStatus
        }
      )));

    console.log(submissionData);

    // const updatedData = submissionData.map(data => {
    //   const { created_at, ...rest } = data; // Exclude created_at from the update payload
    //   return rest;
    // });

    // console.log(updatedData);

    
    await SubmissionModel.updateSubmissionData(submissionData);


    setVerifiedSections((prev) => ({ ...prev, [currentSection]: true }));
    setShowModal(false);
  };

  // Function to fetch scheduleNumbers for a specific section
function getScheduleNumbersForSection(sections, sectionKey) {
  if (!sections[sectionKey]) {
    return `Section ${sectionKey} does not exist.`;
  }
  return sections[sectionKey].classes.map(cls => cls.scheduleNumber);
}

const printTable = () => {
  if (!dataFetched) {
    setShowModalAlert(true);
    return;
  }

  const printableSection = document.getElementById('printableTable');
  if (!printableSection) {
    console.error('Printable section not found');
    return;
  }

  // Clone the entire printable section
  const clonedSection = printableSection.cloneNode(true);

  // Remove unnecessary elements (like forms or buttons)
  clonedSection.querySelectorAll('form, .d-flex.justify-content-end').forEach((element) => element.remove());

  // Open the print window
  const printWindow = window.open('', '', 'height=500,width=1000');
  printWindow.document.write('<html><head><title>Print</title>');
  printWindow.document.write(`
    <style>
      @media print {
        @page {
          size: legal landscape;
          margin: 'minimum';
        }
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        .main-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .main-header img {
          max-width: 100px; /* Adjust the size of the logo */
          display: block;
          margin: 0 auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          page-break-after: always;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: center;
        }
        tbody {
          background-color: #f2f2f2;
        }
        th {
          background-color: #4CAF50;
          color: white;
        }
        th[colspan="2"]:contains("Midterm"), td[colspan="2"]:contains("Midterm") {
          background-color: #FFA500;
          color: white;
        }
        th[colspan="2"]:contains("Finals"), td[colspan="2"]:contains("Finals") {
          background-color: #90EE90;
          color: white;
        }
        thead {
          display: table-row-group;
        }
        h5, h6, p {
          text-align: center;
          margin: 0;
        }
        form, .d-flex.justify-content-end {
          display: none !important;
        }
      }
    </style>
  `);
  printWindow.document.write('</head><body>');

  // Iterate over each table in the cloned section
  const tables = clonedSection.querySelectorAll('table');
  tables.forEach((table) => {
    // Find the "ACADEMIC AFFAIRS" header cloned from the UI
    const academicHeader = table.previousElementSibling;

    // Create the main header for each table
    const mainHeader = document.createElement('div');
    mainHeader.className = 'main-header';
    mainHeader.innerHTML = `
      <img src="/pcc.png" alt="Logo"> <!-- Insert logo image here -->
      <h5>PARANAQUE CITY</h5>
      <h5>COLLEGE</h5>
    `;

    // Insert the main header BEFORE the "ACADEMIC AFFAIRS" header
    if (academicHeader) {
      academicHeader.parentNode.insertBefore(mainHeader, academicHeader);
    } else {
      // Fallback: If no academic header exists, just insert the main header before the table
      table.parentNode.insertBefore(mainHeader, table);
    }
  });

  // Write the cloned section to the print window
  printWindow.document.write(clonedSection.outerHTML);

  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};



  const getSemesterText = (sem) => {
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


  const handleView = async () => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection) {
     setLoading(true);
       try {
                                          // Fetch both data sets concurrently
         await Promise.all([fetchCourses(), fetchStudentData()]);
         setDataFetched(true); // Indicate that data has been fetched successfully
         } catch (error) {
         console.error('Error fetching data:', error);
         setDataFetched(false); // Handle error state for data fetching
         } finally {
         setLoading(false); // Ensure loading is false after data fetch attempts
        }
        } else {
        setShowModalAlertView(true);
        setDataFetched(false); // Ensure dataFetched is false if filters are incomplete
        }
        };
                                    

  
  useEffect(() => {
    const fetchData = async () => {
      if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection && groupedData) {
        // Get schedule numbers for the section
        const scheduleNumbers = getScheduleNumbersForSection(groupedData, selectedSection);
  
        // Check if scheduleNumbers is an array
        if (Array.isArray(scheduleNumbers) && scheduleNumbers.length > 0) {
          // Fetch the submissions for each schedule number
          const verify = await Promise.all(
            scheduleNumbers.map(scheduleNumber => SubmissionModel.fetchSubmissionBySchedule(scheduleNumber))
          );

          console.log(verify);
  
          // Filter and flatten the results
          const filteredVerify = verify.filter(submissions => submissions.length > 0)
                                        .flatMap(submissions => submissions);

          console.log(filteredVerify);
          if(filteredVerify.length > 0){
            // Check if all submissions are verified
            const allVerified = filteredVerify.every(row => row.submissionStatus === "Verified");
            // Update the state if all are verified
            if (allVerified) {
              setVerifiedSections((prev) => ({ ...prev, [selectedSection]: true }));
            }
          }
        }
      }
    };
  
    fetchData(); // Call the async function inside useEffect
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester, selectedSection, groupedData]);
  
  const closeShowModalAlert = () => {
    setShowModalAlert(false);
  }

  const closeShowModalAlertView = () => {
    setShowModalAlertView(false);
  }
  
  const openModal = (student) => {
    setShowModal(true);
    console.log('sstudent',student)
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  
  return (
    <div>
      <h2 className="custom-font custom-color-green-font mb-3 mt-2">Grades Verification</h2>
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
    <Col md={2} className='mb-3'>
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

    <Col md={2} className='mb-3'>
      <Form.Group controlId="sectionSelect">
        <Form.Label className='custom-color-green-font custom-font'>Section</Form.Label>
        <Form.Select value={selectedSection} onChange={handleSectionChange} className="border-success"
          disabled={!selectedSemester}>
          <option value="">Select Section</option>
          {sectionOptions.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </Col>

    {/* Aligning the "View" button beside the section */}
    <Col md={2} className='mb-3'>
      <Form.Group controlId="viewButton">
        <Form.Label className="custom-color-green-font custom-font">Action</Form.Label>
        <div className='d-flex align-items-center'>
          <Button className="w-100 btn-success" onClick={handleView}>View</Button>
        </div>
      </Form.Group>
    </Col>
  </Row>
</Form>

      

      <div id="printableTable" className="bg-white rounded pt-5 px-3 pb-3 table-responsive">
      {loading ? (
        <div className="text-center py-5 bg-white mt-4">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Loading data, please wait...</p>
    </div>
      ): Object.keys(groupedData).length === 0 || combinedData.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="custom-color-green-font fs-5">No Data Available</h5>
          <p className="fs-6">
            Please ensure that all filters are applied or data is available to display.
          </p>
        </div>
      ) : (
        <>
          {(selectedSection && selectedSection !== '' && groupedData[selectedSection] ? [[selectedSection, groupedData[selectedSection]]] : Object.entries(groupedData))
            .filter(([sectionNumber]) => sectionNumber)
            .map(([sectionNumber, sectionData], sectionIndex) => (
              <div key={sectionIndex}>
                {sectionData?.classes?.map((Class, courseIndex) => (
                  <div key={courseIndex} className="section-container mb-5 p-4 border rounded shadow-sm bg-white">
                  {/* First Table for the section */}
                  <div className="mb-4">
                    {/* Information above the first table */}
                    <h5 className="text-center custom-color-green-font">ACADEMIC AFFAIRS</h5>
                    <p className="text-center">Institute</p>
                    <h6 className="text-center">SUMMARY OF GRADES</h6>
                    <p className="text-center">{getSemesterText(parseInt(selectedSemester)).toUpperCase()} SEMESTER, SCHOOL YEAR {selectedAcademicYear}</p>
                    <br></br>
                    </div>

                    <Table bordered hover className="text-center mb-3">
                      {/* Table Header */}
                      <thead>
                        <tr>
                          <td colSpan={3} style={{ fontWeight: 'bold', padding: '4px' }}>SUBJECT CODE:</td>
                          <td colSpan={4} style={{ padding: '4px' }}>{Class.courseCode}</td>
                          <td colSpan={3} style={{ fontWeight: 'bold', padding: '4px' }}>DAY AND TIME:</td>
                          <td colSpan={3} style={{ padding: '4px' }}>{`${Class.scheduleDay}, ${Class.startTime} - ${Class.endTime}`}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} style={{ fontWeight: 'bold', padding: '4px' }}>SUBJECT DESCRIPTION:</td>
                          <td colSpan={4} style={{ padding: '4px' }}>{Class.courseName}</td>
                          <td colSpan={3} style={{ fontWeight: 'bold', padding: '4px' }}>FACULTY:</td>
                          <td colSpan={3} style={{ padding: '4px' }}>{Class.personnelName}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} style={{ fontWeight: 'bold', padding: '4px' }}>CREDIT UNITS:</td>
                          <td colSpan={4} style={{ padding: '4px' }}>{Class.courseCredits}</td>
                          <td colSpan={3} style={{ fontWeight: 'bold', padding: '4px' }}>SECTION</td>
                          <td colSpan={3} style={{ padding: '4px' }}>{sectionNumber}</td>
                        </tr>
                      </thead>

                    <thead className="table-success">
                      <tr>
                        <th rowSpan={2} className="custom-color-green-font fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          STUDENT NO
                        </th>
                        <th rowSpan={2} className="custom-color-green-font fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          STUDENT NAME
                        </th>
                        <th colSpan={4} className="custom-color-green-font fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          MIDTERM %
                        </th>
                        <th colSpan={4} className="custom-color-green-font fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          FINALS %
                        </th>
                        <th rowSpan={2} className="custom-color-green-font fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          SEMESTRAL GRADE
                        </th>
                        <th rowSpan={2} className="custom-color-green-font fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          NUMERICAL EQUIVALENT
                        </th>
                        <th rowSpan={2} className="custom-color-green-font fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          REMARKS
                        </th>
                      </tr>
                      <tr>
                        <th className="bg-success text-white fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>CLASS STANDING %</th>
                        <th className="bg-success text-white fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>OUTCOME BASED ASSESSMENT %</th>
                        <th className="bg-success text-white student-name" style={{ textAlign: 'center', verticalAlign: 'middle' }}>MIDTERM EXAM %</th>
                        <th className="bg-success text-white student-name"style={{ textAlign: 'center', verticalAlign: 'middle' }} >MIDTERM GRADE</th>
                        <th className="bg-success text-white fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>CLASS STANDING %</th>
                        <th className="bg-success text-white fixed-width" style={{ textAlign: 'center', verticalAlign: 'middle' }}>OUTCOME BASED ASSESSMENT %</th>
                        <th className="bg-success text-white student-name" style={{ textAlign: 'center', verticalAlign: 'middle' }}>FINAL EXAM %</th>
                        <th className="bg-success text-white student-name" style={{ textAlign: 'center', verticalAlign: 'middle' }}>FINAL GRADE</th>
                      </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody>
                      {Class.classGrades.grades.map((student, index) => (
                        <tr key={index}>
                          <td>{student.studentNumber}</td>
                          <td>{student.studentLastName}, {student.studentFirstName} {student.studentMiddleName}</td>
                          <td>{student.midtermCS.toFixed(2)}</td>
                          <td>{student.midtermPBA.toFixed(2)}</td>
                          <td>{student.midtermExam.toFixed(2)}</td>
                          <td>{student.midtermGrade.toFixed(2)}</td>
                          <td>{student.finalCS.toFixed(2)}</td>
                          <td>{student.finalPBA.toFixed(2)}</td>
                          <td>{student.finalExam.toFixed(2)}</td>
                          <td>{student.finalGrade.toFixed(2)}</td>
                          <td>{student.semGrade.toFixed(2)}</td>
                          <td>{student.numEq.toFixed(2)}</td>
                          <td>{student.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                    <thead>
                    <tr>
                        <td colSpan={2}>Submitted by:</td>
                        <td colSpan={2}>Date:</td>
                        <td colSpan={2}>Checked by:</td>
                        <td colSpan={2}>Noted by:</td>
                        <td colSpan={2}>Approved by:</td>
                        <td colSpan={3}>Received by:</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ height: '50px' }}></td>
                        <td colSpan={2} rowSpan={2}></td>
                        <td colSpan={2}></td>
                        <td colSpan={2}></td>
                        <td colSpan={2}></td>
                        <td colSpan={3}></td>
                      </tr>

                      <tr>
                        <td colSpan={2}>Faculty</td>
                        <td colSpan={2}>Program Chair</td>
                        <td colSpan={2}>Dean</td>
                        <td colSpan={2}>VPAA</td>
                        <td colSpan={3}>College Registar</td>
                      </tr>
                    </thead>
                    </Table>

                    {/* Partition for the second table */}
                    <div className="mt-5">
                      <h5 className="text-center custom-color-green-font">ACADEMIC AFFAIRS</h5>
                      <p className="text-center">Institute</p>
                      <h6 className="text-center">GRADE SHEET</h6>
                      <p className="text-center">{getSemesterText(parseInt(selectedSemester)).toUpperCase()} SEMESTER, SCHOOL YEAR {selectedAcademicYear}</p>
                      <br></br>
                    {/*<p className="text-center">DATE: 0</p>*/}
                    </div>

                    <Table bordered hover className="text-center mb-3">
                    {/* Table Header */}
                    <thead>
                        <tr>
                          <td colSpan={2} style={{ fontWeight: 'bold', padding: '4px' }}>SUBJECT CODE:</td>
                          <td colSpan={2} style={{ padding: '4px' }}>{Class.courseCode}</td>
                          <td colSpan={1} style={{ fontWeight: 'bold', padding: '4px' }}>DAY AND TIME:</td>
                          <td colSpan={2} style={{ padding: '4px' }}>{`${Class.scheduleDay}, ${Class.startTime} - ${Class.endTime}`}</td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ fontWeight: 'bold', padding: '4px' }}>SUBJECT DESCRIPTION:</td>
                          <td colSpan={2} style={{ padding: '4px' }}>{Class.courseName}</td>
                          <td colSpan={1} style={{ fontWeight: 'bold', padding: '4px' }}>FACULTY:</td>
                          <td colSpan={2} style={{ padding: '4px' }}>{Class.personnelName}</td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ fontWeight: 'bold', padding: '4px' }}>CREDIT UNITS:</td>
                          <td colSpan={2} style={{ padding: '4px' }}>{Class.courseCredits}</td>
                          <td colSpan={1} style={{ fontWeight: 'bold', padding: '4px' }}>SECTION</td>
                          <td colSpan={2} style={{ padding: '4px' }}>{sectionNumber}</td>
                        </tr>
                      </thead>
                    <thead className="table-success">
                      <tr>
                        <th className="custom-color-green-font fixed-width">STUDENT NO</th>
                        <th className="custom-color-green-font fixed-width">STUDENT NAME</th>
                        <th className="custom-color-green-font fixed-width">MIDTERM %</th>
                        <th className="custom-color-green-font fixed-width">FINALS %</th>
                        <th className="custom-color-green-font fixed-width">SEMESTRAL GRADE</th>
                        <th className="custom-color-green-font fixed-width">NUMERICAL EQUIVALENT</th>
                        <th className="custom-color-green-font fixed-width">REMARKS</th>
                      </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody>
                      {Class.classGrades.grades.map((student, index) => (
                        <tr key={index}>
                          <td>{student.studentNumber}</td>
                          <td>{student.studentLastName}, {student.studentFirstName} {student.studentMiddleName}</td>
                          <td>{student.midtermGrade.toFixed(2)}</td>
                          <td>{student.finalGrade.toFixed(2)}</td>
                          <td>{student.semGrade.toFixed(2)}</td>
                          <td><strong>{student.numEq.toFixed(2)}</strong></td>
                          <td>{student.remarks} </td>
                        </tr>
                        
                      ))}
                    </tbody>
                    <thead>
                    <tr>
                        <td>Submitted by:</td>
                        <td>Date:</td>
                        <td>Checked by:</td>
                        <td>Noted by:</td>
                        <td>Approved by:</td>
                        <td colSpan={2}>Received by:</td>
                      </tr>
                      <tr>
                        <td style={{ height: '50px' }}></td>
                        <td rowSpan={2}></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td colSpan={2}></td>
                      </tr>
                      <tr>
                      <td>Faculty</td>
                        <td>Program Chair</td>
                        <td>Dean</td>
                        <td>VPAA</td>
                        <td colSpan={2}>College Registrar</td>
                      </tr>
                    </thead>
                    </Table>
                  </div>
                  )
                )}
                {/* Verify Button */}
                <div className="d-flex justify-content-end">
                  {verifiedSections[sectionNumber] ? (
                    <>
                      <Button variant="success" disabled>
                        VERIFIED
                      </Button>
                      <Button vaiant="secondary" className="mx-2" onClick={printTable}>PRINT</Button>
                    </>
                  ) : (
                      <Button variant="primary" disabled={groupedData[selectedSection].classes.some(cls => cls.classGrades.grades.length === 0)}
                                                className="mt-2" onClick={() => handleVerifyClick(sectionNumber)}>
                        VERIFY
                      </Button>
                  )}
                </div>
              </div>
          ))}
        </>
      )}

      {/* Validation Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Verification Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This is to formally acknowledge that the grades submitted by the faculty for the <strong>{currentSection}</strong> have been reviewed and approved by <strong>{user.personnelNameFirst} {user.personnelNameMiddle} {user.personnelNameLast} </strong>. The grades are deemed accurate and final for submission to the Registrar’s Office for recording in the official academic records.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleValidate}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
      </div>

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
