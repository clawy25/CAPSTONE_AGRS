import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMinus, faMapMarkerAlt,  faEnvelope, faPhoneAlt } from '@fortawesome/free-solid-svg-icons'; // Import minus icon
import '../StudentComponents/Dashboard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // Import menu icon
import { Dropdown } from 'react-bootstrap'; // Import Bootstrap for dropdown
import { Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';



const ClassDetails = ({classList , classDetails}) => {

  const [students, setStudents] = useState(classList);
  const [classInfo, setClassInfo] = useState(classDetails[0]);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');



  useEffect(() => {
    students.sort((a, b) => {
      const lastNameComparison = a.studentLastName.localeCompare(b.studentLastName);
      if (lastNameComparison !== 0) return lastNameComparison; // If last names are different, sort by last name
      return a.studentFirstName.localeCompare(b.studentFirstName); // If last names are the same, sort by first name
    });
    
    // 2️⃣ Add an incremental ID starting from 0
    const studentsWithIds = students.map((student, index) => ({
      id: index, // Add an ID starting from 0
      ...student // Spread the original student data
    }));
    console.log(studentsWithIds);
    setStudents(studentsWithIds);
  }, []);
  

  const handleModalShow = (action) => {
    setModalMessage(`Grades ${action} successfully!`);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSubmit = () => {
    // Your submit logic here
    handleModalShow('submitted');
  };

  const handlePost = () => {
    // Your post logic here
    handleModalShow('posted');
  };

  // Import function
const handleImport = () => {
  // Logic for importing files
  console.log('Import action triggered');
  // Example: Show a file upload dialog
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv, .xlsx'; // Adjust formats as needed
  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      // Add your file processing logic here
    }
  };
  fileInput.click();
};

const handleExport = () => {
  console.log('Export action triggered');
  
  // Find the current table based on `selectedPeriod`
  const table = document.querySelector('.details-table'); // Ensure this matches your table's class

  if (table) {
    // Convert the table to a worksheet
    const worksheet = XLSX.utils.table_to_sheet(table);

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Export the workbook to Excel
    XLSX.writeFile(workbook, `${selectedPeriod}_data.xlsx`);
  } else {
    console.error('Table not found');
  }
};

const handlePrint = () => {
  console.log('Print action triggered');

  // Find the current table based on `selectedPeriod`
  const table = document.querySelector('.details-table'); // Ensure this matches your table's class

  if (table) {
    // Clone the table to avoid manipulation of the DOM
    const clonedTable = table.cloneNode(true);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Write the content with styles and header
    printWindow.document.write('<html><head><title>Print Table</title>');
    printWindow.document.write(`
      <style>
        @media print {
          @page { size: landscape; margin: 0.5in; }
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; table-layout: auto; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: center; }
          td { background-color: white; }
          th { background-color: #4CAF50; color: white; }
          thead { display: table-header-group; }
          tbody { display: table-row-group; }
          tr { page-break-inside: avoid; }
          .header-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          .logo {
            height: 80px;
            margin-right: 20px;
          }
          .text {
            text-align: left;
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
            margin-left: 20px;
          }
          .additional-line {
            color: green;
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
    `);
    printWindow.document.write('</head><body>');

    // Add the header content
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
    
      <div class="centered-text">
        <h2>ACADEMIC AFFAIRS</h2>
        <h3>Institue</h3>
        <h3>${selectedPeriod === 'summary' ? 'SUMMARY OF GRADES' : 'GRADE SHEET'}</h3>
      </div>
    `);

    // Add the table content
    printWindow.document.write(clonedTable.outerHTML);

    // Close the document to ensure styles are applied
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();

    // Trigger the print dialog
    printWindow.print();

    // Close the print window after printing
    printWindow.close();
  } else {
    console.error('Table not found');
  }
};


  {/* SEARCH BAR DECLARATION */}
  const [selectedPeriod, setSelectedPeriod] = useState('midterm');
  const [searchTerm, setSearchTerm] = useState('');


  {/* FOR MIDTERMS */}

  {/* ATTENDANCE DECLARATION */}
  const [midtermAttendanceColumns, setmidtermAttendanceColumns] = useState([{ id: 1 }]);
  console.log(midtermAttendanceColumns);
  const [midtermTotalAttendanceDays, setmidtermTotalAttendanceDays] = useState(0);
  const [midtermAttendanceData, setmidtermAttendanceData] = useState([]);
  console.log(midtermAttendanceData);
  const [midtermAttendancePercentage, setmidtermAttendancePercentage] = useState();

  {/* ASSIGNMENT DECLARATION */}
  const [midtermAssignmentColumns, setmidtermAssignmentColumns] = useState([]);
  const [midtermAssignmentScores, setmidtermAssignmentScores] = useState([]);
  const [midtermAssignmentPercentage, setmidtermAssignmentPercentage] = useState(); // Default to 10%
  const [invalidAssignmentScores, setInvalidAssignmentScores] = useState([]);

  // QUIZZES DECLARATION
  const [midtermQuizColumns, setmidtermQuizColumns] = useState([]); // Initialize quiz columns
  const [midtermQuizScores, setmidtermQuizScores] = useState([]); // Scores for each quiz
  const [midtermQuizMaxScores, setmidtermQuizMaxScores] = useState([]); // Maximum scores for each quiz
  const [midtermQuizPercentage, setmidtermQuizPercentage] = useState();

  {/* RECITATION DECLARATION */}
  const [midtermRecitationColumns, setmidtermRecitationColumns] = useState([]);
  const [midtermRecitationScores, setmidtermRecitationScores] = useState([]);
  const [midtermRecitationPercentage, setmidtermRecitationPercentage] = useState();
  const [invalidRecitationScores, setInvalidRecitationScores] = useState([]);

   // PBA Declaration
   const [midtermPBAColumns, setmidtermPBAColumns] = useState([]);
   const [midtermPBAGradeScores, setmidtermPBAGradeScores] = useState([]);  // Store scores for each PBA column per student
   const [midtermPBAGradePercentage, setmidtermPBAGradePercentage] = useState();
   const [invalidPBAScores, setInvalidPBAScores] = useState([]);

  // MIDTERM EXAM DECLARATION
  const [midtermExamScores, setMidtermExamScores] = useState({});
  const [midtermExamPercentage, setMidtermExamPercentage] = useState();
  const [midtermTotalItems, setmidtermTotalItems] = useState(); // Default total number of items is 100

  //REMARKS
  const [remarks, setRemarks] = useState({});

  {/*FOR FINALS*/}

  {/* ATTENDANCE DECLARATION */}
  const [finalsAttendanceColumns, setfinalsAttendanceColumns] = useState([{ id: 1, date: new Date() }]);
  const [finalsTotalAttendanceDays, setfinalsTotalAttendanceDays] = useState(0);
  const [finalsAttendanceData, setfinalsAttendanceData] = useState([]);
  const [finalsAttendancePercentage, setfinalsAttendancePercentage] = useState(); // Default value of 0

  {/* ASSIGNMENT DECLARATION */}
  const [finalsAssignmentColumns, setfinalsAssignmentColumns] = useState([]);
  const [finalsAssignmentScores, setfinalsAssignmentScores] = useState([]);
  const [finalsAssignmentPercentage, setfinalsAssignmentPercentage] = useState(); // Default to 5%
  const [finalsinvalidAssignmentScores, setfinalsInvalidAssignmentScores] = useState([]);

  {/* QUIZZES DECLARATION */}
  const [finalsQuizColumns, setfinalsQuizColumns] = useState([]); // Initialize quiz columns
  const [finalsQuizScores, setfinalsQuizScores] = useState(
    students.map(() => Array(finalsQuizColumns.length).fill(0))
  );
  const [finalsQuizMaxScores, setfinalsQuizMaxScores] = useState([]);
  const [finalsQuizPercentage, setfinalsQuizPercentage] = useState();

  {/* RECITATION DECLARATION */}
  const [finalsRecitationColumns, setfinalsRecitationColumns] = useState([]);
  const [finalsRecitationScores, setfinalsRecitationScores] = useState([]);
  const [finalsRecitationPercentage, setfinalsRecitationPercentage] = useState();
  const [finalsinvalidRecitationScores, setfinalsInvalidRecitationScores] = useState([]);

  {/* PBA DECLARATION */}
  const [finalsPBAColumns, setfinalsPBAColumns] = useState([]);
  const [finalsPBAGradeScores, setfinalsPBAGradeScores] = useState([]);
  const [finalsPBAGradePercentage, setfinalsPBAGradePercentage] = useState();
  const [finalsinvalidPBAScores, setfinalsInvalidPBAScores] = useState([]);

  {/* FINAL EXAM DECLARATION */}
  const [finalsExamScores, setfinalsExamScores] = useState([]);
  const [finalsExamPercentage, setfinalsExamPercentage] = useState();
  const [finalsTotalItems, setfinalsTotalItems] = useState();



  // // Fetch existing students from StudentModel
  // const fetchExistingStudents = async () => {
  //   try {
  //       const existingStudents = await StudentModel.fetchExistingStudents();
        
  //       // Modify student.id to start from 0, 1, 2, etc.
  //       const studentsWithModifiedIds = existingStudents.map((student, index) => ({
  //           ...student, // Keep the existing student data
  //           id: index   // Overwrite the id with the new index
  //       }));

  //       setStudents(studentsWithModifiedIds);
  //   } catch (error) {
  //       console.error('Error fetching existing students:', error);
  //   }
  // };
  
  // // Fetch existing students onload
  // useEffect(() => {fetchExistingStudents();}, []);

  {/*ATTENDANCE FOR MIDTERM AND FINALS (COMPLETE)*/}
  useEffect(() => {
    const count = midtermAttendanceColumns.filter(col => col.date).length;
    const finalscount = finalsAttendanceColumns.filter(col => col.date).length;
    setmidtermTotalAttendanceDays(count); // Update the total attendance days
    setfinalsTotalAttendanceDays(finalscount);
  }, [midtermAttendanceColumns, finalsAttendanceColumns]);

  {/*ADD AND REMOVE COLUMN FOR MIDTERM AND FINALS (COMPLETE)*/}
  const addColumn = (setColumns) => {
    setColumns((prevColumns) => [...prevColumns, { id: prevColumns.length + 1 }]);
  };
  const removeColumn = (index, setColumns) => {
    setColumns((prevColumns) => prevColumns.filter((_, i) => i !== index));
  };
  // Dedicated removeColumn function for attendance data only
const removeAttendanceColumn = (index, setColumns, setAttendanceData) => {
  setColumns((prevColumns) => {
    const updatedColumns = prevColumns.filter((_, i) => i !== index);

    // Update attendance data by removing the corresponding column (index)
    setAttendanceData((prevData) => {
      const updatedData = { ...prevData };
      Object.keys(updatedData).forEach(studentId => {
        const studentAttendance = updatedData[studentId] || [];
        studentAttendance.splice(index, 1); // Remove the corresponding column data for this student
      });
      return updatedData;
    });

    return updatedColumns;
  });
};


  {/*SELECT FOR PERIOD (SWITCH CASES)*/}
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  {/*ATTENDANCE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermAttendanceChange = (studentId, studentNumber, dateIndex, status) => {
    
    setmidtermAttendanceData((prevData) => {
      const studentAttendance = prevData[studentId] || [];
      const updatedAttendance = [...studentAttendance];

      updatedAttendance[dateIndex] = { date: new Date().toISOString().split('T')[0], status };

      return {
        ...prevData,
        [studentId]: updatedAttendance,
      };
    });
    setmidtermAttendanceColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== dateIndex) return column;//Check if this is the correct date (based on dateIndex)
        
        if (index === dateIndex) {// Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
  
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              status 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              status
            });
          }
  
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );
  };
  useEffect(() => {//Generation of objects for database storage (Attendance)
    const AttendanceData = []; //For Database: gradeData
    const AttendanceColumns = []; //For Database: attendanceData
    //const AttendanceScores = []; //For computations
  
    midtermAttendanceColumns?.forEach((column) => {
      AttendanceColumns.push({
          instanceNumber: column.id,
          scheduleNumber: classInfo.scheduleNumber,
          date: column.date
      });
      column.grade?.forEach((student) => {
        
        AttendanceData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 1, 
          instanceNumber: column.id, 
          period: 1, 
          value: student.status 
        });

        // AttendanceScores.push({
        //   [student.studentNumber]: student.status
        // });
      });
    });
  
    const filteredAttendance = AttendanceData.filter(attendance => attendance.value !== "Select");
    
    console.log("Rows for Database:",filteredAttendance);
    console.log("List of Dates:", AttendanceColumns);
    //console.log(AttendanceScores);
    //setmidtermAttendanceData(AttendanceScores);
    
  }, [midtermAttendanceColumns, classInfo]);


  const handleFinalsAttendanceChange = (studentId, dateIndex, status) => {
    setfinalsAttendanceData((prevData) => {
      const studentAttendance = prevData[studentId] || [];
      const updatedAttendance = [...studentAttendance];

      updatedAttendance[dateIndex] = { date: new Date().toISOString().split('T')[0], status };

      return {
        ...prevData,
        [studentId]: updatedAttendance,
      };
    });
  };

  {/*ATTENDANCE TOTALS FOR BOTH PERIOD (COMPLETE)*/}
  const getMidtermAttendanceTotals = (studentId) => {
    const studentAttendance = midtermAttendanceData[studentId] || [];
    const Atotals = { P: 0, L: 0, E: 0, A: 0 };
    let points = 100;

    studentAttendance.forEach(({ status }) => {
      if (status === 'P') Atotals.P++;
      else if (status === 'L') Atotals.L++;
      else if (status === 'E') Atotals.E++;
      else if (status === 'A') Atotals.A++;
    });


    const convertedAbsents = Math.floor(Atotals.L / 3); // 3 Lates = 1 Absent
    Atotals.A += convertedAbsents; // Add converted absents to total absents
    Atotals.L = Atotals.L % 3; // Remaining lates after conversion

    points -= Atotals.A * 3; // Deduct points for each Absent
    points -= Atotals.E * 3; // Deduct points for each Excused

    return { Atotals, points };
  };
  const getFinalsAttendanceTotals = (studentId) => {
    const studentAttendance = finalsAttendanceData[studentId] || [];
    const Atotals = { P: 0, L: 0, E: 0, A: 0 };
    let points = 100;

    studentAttendance.forEach(({ status }) => {
      if (status === 'P') Atotals.P++;
      else if (status === 'L') Atotals.L++;
      else if (status === 'E') Atotals.E++;
      else if (status === 'A') Atotals.A++;
    });


    const convertedAbsents = Math.floor(Atotals.L / 3); // 3 Lates = 1 Absent
    Atotals.A += convertedAbsents; // Add converted absents to total absents
    Atotals.L = Atotals.L % 3; // Remaining lates after conversion

    points -= Atotals.A * 3; // Deduct points for each Absent
    points -= Atotals.E * 3; // Deduct points for each Excused

    return { Atotals, points };
  };

  {/*ATTENDANCE SCORES FOR BOTH PERIOD (COMPLETE)*/}
  const getMidtermAttendanceScorePercentage = (points) => {
    const totalComputations = 100; // Assuming this is the maximum point you are working with
    const attendanceInputPercentage = midtermAttendancePercentage / 100; // Convert percentage to decimal
    const calculatedPoints = Math.max(0, (points / totalComputations) * attendanceInputPercentage * totalComputations);
    return calculatedPoints.toFixed(2); // Return the value with 2 decimal points
  };
  const getFinalsAttendanceScorePercentage = (points) => {
    const totalComputations = 100; // Assuming this is the maximum point you are working with
    const attendanceInputPercentage = finalsAttendancePercentage / 100; // Convert percentage to decimal
    const calculatedPoints = Math.max(0, (points / totalComputations) * attendanceInputPercentage * totalComputations);
    return calculatedPoints.toFixed(2); // Return the value with 2 decimal points
  };

  const handleMidtermAssignmentScoreChange = (studentIndex, assignmentIndex, score) => {
    // Update the assignment scores state
    setmidtermAssignmentScores((prevScores) => {
      const updatedScores = [...prevScores];
      if (!updatedScores[studentIndex]) {
        updatedScores[studentIndex] = [];
      }
      updatedScores[studentIndex][assignmentIndex] = score;
      return updatedScores;
    });
  
    // Update the invalid state for real-time border change
    setInvalidAssignmentScores((prevInvalid) => {
      const updatedInvalid = [...prevInvalid];
      if (!updatedInvalid[studentIndex]) {
        updatedInvalid[studentIndex] = {};
      }
      updatedInvalid[studentIndex][assignmentIndex] = score < 50 || score > 100; // Mark as invalid if out of range
      return updatedInvalid;
    });
  };
  
  

  // ASSIGNMENT SCORES FOR FINALS PERIOD
  const handleFinalAssignmentScoreChange = (studentIndex, assignmentIndex, score) => {
    // Update the assignment scores state
    setfinalsAssignmentScores((prevScores) => {
      const finalsupdatedScores = [...prevScores];
      if (!finalsupdatedScores[studentIndex]) {
        finalsupdatedScores[studentIndex] = [];
      }
      finalsupdatedScores[studentIndex][assignmentIndex] = score;
      return finalsupdatedScores;
    });
  
    // Update the invalid state for real-time border change
    setfinalsInvalidAssignmentScores((prevInvalid) => {
      const finalsupdatedInvalid = [...prevInvalid];
      if (!finalsupdatedInvalid[studentIndex]) {
        finalsupdatedInvalid[studentIndex] = {};
      }
      finalsupdatedInvalid[studentIndex][assignmentIndex] = score < 50 || score > 100; // Mark as invalid if out of range
      return finalsupdatedInvalid;
    });
  };


  {/* ASSIGNMENTS AVERAGE FOR MIDTERM */}
  const calculateMidtermAssignmentColumnAverage = (studentIndex) => {
    const scores = midtermAssignmentScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Optional: format to 2 decimal places
  };
  {/* ASSIGNMENTS AVERAGE FOR FINALS */}
  const calculateFinalsAssignmentColumnAverage = (studentIndex) => {
    const scores = finalsAssignmentScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Optional: format to 2 decimal places
  };

  {/* ASSIGNMENTS COMPONENT FOR MIDTERM */}
  const calculateMidtermAssignmentComponentScore = (studentIndex, percentage) => {
    const scores = midtermAssignmentScores[studentIndex] || [];
    const validScores = scores.map(score => parseFloat(score) || 0);
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2);
  };
  {/* ASSIGNMENTS COMPONENT FOR FINALS */}
  const calculateFinalsAssignmentComponentScore = (studentIndex, percentage) => {
    const scores = finalsAssignmentScores[studentIndex] || [];
    const validScores = scores.map(score => parseFloat(score) || 0);
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2);
  };

  //QUIZ COLUMNS FOR BOTH PERIODS (COMPLETE)
  useEffect(() => {
    setmidtermQuizScores(prevScores =>
      students.map((_, index) => prevScores[index] || Array(midtermQuizColumns.length).fill(0)) // Retain previous scores
    );
    setmidtermQuizMaxScores(prevMaxScores => 
      prevMaxScores.length < midtermQuizColumns.length 
        ? [...prevMaxScores, ...Array(midtermQuizColumns.length - prevMaxScores.length).fill(0)] 
        : prevMaxScores
    );

    setfinalsQuizScores(prevScores =>
      students.map((_, index) => prevScores[index] || Array(finalsQuizColumns.length).fill(0)) // Retain previous scores
    );
    setfinalsQuizMaxScores(prevMaxScores => 
      prevMaxScores.length < finalsQuizColumns.length 
        ? [...prevMaxScores, ...Array(finalsQuizColumns.length - prevMaxScores.length).fill(0)] 
        : prevMaxScores
    );
  }, [students]);
  
  {/*ADD QUIZ COLUMNS FOR BOTH PERIODS (COMPLETE)*/}
  // ADD MIDTERM QUIZ COLUMN
  const addMidtermQuizColumn = () => {
    setmidtermQuizColumns(prevColumns => [...prevColumns, {}]);
    setmidtermQuizScores(prevScores =>
      prevScores.map(studentScores => [...studentScores, 0]) // Append a new score (0) for the new column
    );
    setmidtermQuizMaxScores(prevMaxScores => [...prevMaxScores, 0]);
  };

  // ADD FINALS QUIZ COLUMN
  const addFinalQuizColumn = () => {
    setfinalsQuizColumns(prevColumns => [...prevColumns, {}]);
    setfinalsQuizScores(prevScores =>
      prevScores.map(studentScores => [...studentScores, 0]) // Append a new score (0) for the new column
    );
    setfinalsQuizMaxScores(prevMaxScores => [...prevMaxScores, 0]);
  };

  
  {/*REMOVE QUIZ COLUMNS FOR BOTH PERIODS (COMPLETE)*/}
  const removeQuizColumn = (indexToRemove) => {
    //MIDTERM
    setmidtermQuizColumns(prevColumns => prevColumns.filter((_, index) => index !== indexToRemove));
    setmidtermQuizScores(prevScores =>
      prevScores.map(studentScores =>
        studentScores.filter((_, index) => index !== indexToRemove) // Remove the column at the specified index
      )
    );
    setmidtermQuizMaxScores(prevMaxScores => 
      prevMaxScores.filter((_, index) => index !== indexToRemove)
    );
    //FINALS
    setfinalsQuizColumns(prevColumns => prevColumns.filter((_, index) => index !== indexToRemove));
    setfinalsQuizScores(prevScores =>
      prevScores.map(studentScores =>
        studentScores.filter((_, index) => index !== indexToRemove) // Remove the column at the specified index
      )
    );
    setfinalsQuizMaxScores(prevMaxScores => 
      prevMaxScores.filter((_, index) => index !== indexToRemove)
    );
  };
  
  {/*QUIZ SCORE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermQuizScoreChange = (studentIndex, quizIndex, score) => {
    // Validate that the score does not exceed the max score
    const maxScore = midtermQuizMaxScores[quizIndex];
    
    if (score > maxScore) {
      toast.error(`Score cannot exceed ${maxScore} for Quiz ${quizIndex + 1}`);
      return; // Do not update if validation fails
    }
  
    setmidtermQuizScores((prevScores) =>
      prevScores.map((scores, index) => {
        if (index === studentIndex) {
          const updatedScores = [...scores];
          updatedScores[quizIndex] = score; // Set the new score for the quiz
          return updatedScores;
        }
        return scores;
      })
    );
  };

  const handleFinalsQuizScoreChange = (studentIndex, quizIndex, score) => {
    // Validate that the score does not exceed the max score
    const maxScore = finalsQuizMaxScores[quizIndex];
    
    if (score > maxScore) {
      toast.error(`Score cannot exceed ${maxScore} for Quiz ${quizIndex + 1}`);
      return; // Do not update if validation fails
    }
  
    setfinalsQuizScores((prevScores) =>
      prevScores.map((scores, index) => {
        if (index === studentIndex) {
          const updatedScores = [...scores];
          updatedScores[quizIndex] = score; // Set the new score for the quiz
          return updatedScores;
        }
        return scores;
      })
    );
  };

  {/*QUIZ MAX SCORE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermMaxScoreChange = (quizIndex, value) => {
    setmidtermQuizMaxScores(prev => {
      const updatedMaxScores = [...prev];
      updatedMaxScores[quizIndex] = value;
      return updatedMaxScores;
    });
  };
  const handleFinalsMaxScoreChange = (quizIndex, value) => {
    setfinalsQuizMaxScores(prev => {
      const updatedMaxScores = [...prev];
      updatedMaxScores[quizIndex] = value;
      return updatedMaxScores;
    });
  };
  
  
  {/*EQUIVALENT RATE FOR BOTH PERIOD*/}
  const calculateEquivalentRate = (score, maxScore) => {
    if (maxScore === 0) return 0; // Prevent division by zero
    return ((score / maxScore) * 50) + 50;
  };

  {/* QUIZ COMPONENT FOR MIDTERM */}
  const calculateMidtermQuizComponentScore = (studentIndex, percentage) => {
    const scores = midtermQuizScores[studentIndex] || [];
    const maxScores = midtermQuizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    const averageEquivalentRate = equivalentRates.length > 0 ? totalEquivalentRate / equivalentRates.length : 0;

    const componentScore = averageEquivalentRate * (percentage / 100);
    return componentScore.toFixed(2);
  };
  {/* QUIZ COMPONENT FOR FINALS */}
  const calculateFinalsQuizComponentScore = (studentIndex, percentage) => {
    const scores = finalsQuizScores[studentIndex] || [];
    const maxScores = finalsQuizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    const averageEquivalentRate = equivalentRates.length > 0 ? totalEquivalentRate / equivalentRates.length : 0;

    const componentScore = averageEquivalentRate * (percentage / 100);
    return componentScore.toFixed(2);
  };

  {/* QUIZ MAX FOR MIDTERM */}
  const calculateMidtermQuizTotalScore = (studentIndex) => {
    const scores = midtermQuizScores[studentIndex] || [];
    const maxScores = midtermQuizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    return (totalEquivalentRate / equivalentRates.length).toFixed(2); // Return the total equivalent rate
  };
  {/* QUIZ MAX FOR FINALS */}
  const calculateFinalsQuizTotalScore = (studentIndex) => {
    const scores = finalsQuizScores[studentIndex] || [];
    const maxScores = finalsQuizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    return (totalEquivalentRate / equivalentRates.length).toFixed(2); // Return the total equivalent rate
  };
  
  {/* RECITATION/PARTICIPATION */}

  {/* RECITATION CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermRecitationScoreChange = (studentIndex, recitationIndex, score) => {
    // Update the recitation scores
    setmidtermRecitationScores((prevScores) => {
      const updatedScores = [...prevScores];
      if (!updatedScores[studentIndex]) {
        updatedScores[studentIndex] = [];
      }
      updatedScores[studentIndex][recitationIndex] = score;
      return updatedScores;
    });
  
    // Real-time validation for red border
    setInvalidRecitationScores((prevInvalid) => {
      const updatedInvalid = [...prevInvalid];
      if (!updatedInvalid[studentIndex]) {
        updatedInvalid[studentIndex] = {};
      }
      updatedInvalid[studentIndex][recitationIndex] = score < 50 || score > 100; // Mark as invalid if out of range
      return updatedInvalid;
    });
  };
  

  const handleFinalsRecitationScoreChange = (studentIndex, recitationIndex, score) => {
    // Update the recitation scores
    setfinalsRecitationScores((prevScores) => {
      const updatedScores = [...prevScores];
      if (!updatedScores[studentIndex]) {
        updatedScores[studentIndex] = [];
      }
      updatedScores[studentIndex][recitationIndex] = score;
      return updatedScores;
    });
  
    // Real-time validation for red border
    setfinalsInvalidRecitationScores((prevInvalid) => {
      const updatedInvalid = [...prevInvalid];
      if (!updatedInvalid[studentIndex]) {
        updatedInvalid[studentIndex] = {};
      }
      updatedInvalid[studentIndex][recitationIndex] = score < 50 || score > 100; // Mark as invalid if out of range
      return updatedInvalid;
    });
  };
  

  {/*RECITATION AVERAGE FOR MIDTERM*/}
  const calculateMidtermRecitationColumnAverage = (studentIndex) => {
    const scores = midtermRecitationScores[studentIndex] || [];
  
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
  
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
  
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Format to 2 decimal places
  };
  {/*RECITATION AVERAGE FOR FINALS*/}
  const calculateFinalsRecitationColumnAverage = (studentIndex) => {
    const scores = finalsRecitationScores[studentIndex] || [];
  
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
  
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
  
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Format to 2 decimal places
  };
  
  {/*RECITATION COMPONENT FOR MIDTERM*/}
  const calculateMidtermRecitationComponentScore = (studentIndex, percentage) => {
    const scores = midtermRecitationScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    
    // Multiply by the percentage and return the score
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2); // Format to 2 decimal places
  };
  {/*RECITATION COMPONENT FOR FINALS*/}
  const calculateFinalsRecitationComponentScore = (studentIndex, percentage) => {
    const scores = finalsRecitationScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    
    // Multiply by the percentage and return the score
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2); // Format to 2 decimal places
  };

  //CLASS STANDING FOR MIDTERMS
   // Function to calculate total CS Grade based on user-defined percentages
// Function to calculate total CS Grade based on user-defined percentages
const calculateTotalMidtermCSGrade = (studentIndex) => {
  // Retrieve scores for the components
  const attendanceScore = getMidtermAttendanceTotals(studentIndex).points || 0; // Raw attendance score
  const assignmentScore = calculateMidtermAssignmentComponentScore(studentIndex, midtermAssignmentPercentage) || 0;
  const quizScore = calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage) || 0;
  const recitationScore = calculateMidtermRecitationComponentScore(studentIndex, midtermRecitationPercentage) || 0;

  // Retrieve component percentages
  const attendancePercentage = midtermAttendancePercentage || 0;
  const assignmentPercentage = midtermAssignmentPercentage || 0;
  const quizPercentage = midtermQuizPercentage || 0;
  const recitationPercentage = midtermRecitationPercentage || 0;

  // If all components are zero, return 0 for CS Grade
  if (attendanceScore === 0 && assignmentScore === 0 && quizScore === 0 && recitationScore === 0) {
    return 0; // No computation
  }

  // Scale scores based on their percentages
  const attendanceComponent = attendanceScore > 0 
    ? (attendanceScore / 100) * attendancePercentage 
    : 0;

  const assignmentComponent = assignmentScore > 0 
    ? parseFloat(assignmentScore) 
    : 0;

  const quizComponent = quizScore > 0 
    ? parseFloat(quizScore) 
    : 0;

  const recitationComponent = recitationScore > 0 
    ? parseFloat(recitationScore) 
    : 0;

  // Total CS Grade
  const totalCSGrade = attendanceComponent + assignmentComponent + quizComponent + recitationComponent;

  return totalCSGrade.toFixed(2); // Return grade rounded to 2 decimal places
};








  
const calculateTotalMidtermCSPercentage = () => {
  // Sum only the valid input percentages (those greater than 0)
  const totalCSPercentage = 
    (parseFloat(midtermAttendancePercentage) > 0 ? parseFloat(midtermAttendancePercentage) : 0) + 
    (parseFloat(midtermAssignmentPercentage) > 0 ? parseFloat(midtermAssignmentPercentage) : 0) + 
    (parseFloat(midtermQuizPercentage) > 0 ? parseFloat(midtermQuizPercentage) : 0) + 
    (parseFloat(midtermRecitationPercentage) > 0 ? parseFloat(midtermRecitationPercentage) : 0);

  return totalCSPercentage.toFixed(2); // Format the total percentage to 2 decimal places
};


  
  //CLASS STANDING FOR FINALS
   // Function to calculate total CS Grade based on user-defined percentages
   const calculateTotalFinalsCSGrade = (studentIndex) => {
    // Calculate attendance score percentage (out of 100 based on Attendance score)
    const attendanceScore = getFinalsAttendanceTotals(studentIndex).points || 0; // Default to 0 if no score
    const attendanceComponent = (attendanceScore > 0) ? (attendanceScore / 100) * finalsAttendancePercentage : 0;
  
    // Calculate assignment score percentage
    const assignmentScore = calculateFinalsAssignmentComponentScore(studentIndex, finalsAssignmentPercentage) || 0;
    
    // Calculate quiz score percentage
    const quizScore = calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage) || 0;
    
    // Calculate recitation score percentage
    const recitationScore = calculateFinalsRecitationComponentScore(studentIndex, finalsRecitationPercentage) || 0;
  
    // Debug: Log the individual scores
    console.log('Attendance:', attendanceScore, 'Assignment:', assignmentScore, 'Quiz:', quizScore, 'Recitation:', recitationScore);
  
    // Total CS Grade: Only add components that are greater than 0
    let totalCSGrade = 0;
  
    if (attendanceComponent > 0) {
      totalCSGrade += attendanceComponent;
    }
    if (assignmentScore > 0) {
      totalCSGrade += parseFloat(assignmentScore);
    }
    if (quizScore > 0) {
      totalCSGrade += parseFloat(quizScore);
    }
    if (recitationScore > 0) {
      totalCSGrade += parseFloat(recitationScore);
    }
  
    // Debug: Log the totalCSGrade before returning
    console.log('Total CS Grade:', totalCSGrade);
  
    // Return formatted total CS grade or 0.00% if no components are valid
    return totalCSGrade > 0 ? totalCSGrade.toFixed(2) : '0.00'; // Ensure the grade is formatted
  };
  
  
  
    
  const calculateTotalFinalsCSPercentage = () => {
    // Sum only the valid input percentages (those greater than 0)
    const totalCSPercentage = 
      (parseFloat(finalsAttendancePercentage) > 0 ? parseFloat(finalsAttendancePercentage) : 0) + 
      (parseFloat(finalsAssignmentPercentage) > 0 ? parseFloat(finalsAssignmentPercentage) : 0) + 
      (parseFloat(finalsQuizPercentage) > 0 ? parseFloat(finalsQuizPercentage) : 0) + 
      (parseFloat(finalsRecitationPercentage) > 0 ? parseFloat(finalsRecitationPercentage) : 0);
  
    return totalCSPercentage.toFixed(2); // Format the total percentage to 2 decimal places
  };
  
  
    {/* PBA */}
      // Handle PBA score change with validation for scores between 50-100
      const handleMidtermPBAScoreChange = (studentIndex, pbaIndex, score) => {
        // Update the PBA scores
        setmidtermPBAGradeScores((prevScores) => {
          const updatedScores = [...prevScores];
          if (!updatedScores[studentIndex]) {
            updatedScores[studentIndex] = [];
          }
          updatedScores[studentIndex][pbaIndex] = score;
          return updatedScores;
        });
      
        // Real-time validation for red border
        setInvalidPBAScores((prevInvalid) => {
          const updatedInvalid = [...prevInvalid];
          if (!updatedInvalid[studentIndex]) {
            updatedInvalid[studentIndex] = {};
          }
          updatedInvalid[studentIndex][pbaIndex] = score < 50 || score > 100; // Mark as invalid if out of range
          return updatedInvalid;
        });
      };
      
      // Handle PBA score change with validation for scores between 50-100
      const handleFinalsPBAScoreChange = (studentIndex, pbaIndex, score) => {
        // Update the PBA scores
        setfinalsPBAGradeScores((prevScores) => {
          const updatedScores = [...prevScores];
          if (!updatedScores[studentIndex]) {
            updatedScores[studentIndex] = [];
          }
          updatedScores[studentIndex][pbaIndex] = score;
          return updatedScores;
        });
      
        // Real-time validation for red border
        setfinalsInvalidPBAScores((prevInvalid) => {
          const updatedInvalid = [...prevInvalid];
          if (!updatedInvalid[studentIndex]) {
            updatedInvalid[studentIndex] = {};
          }
          updatedInvalid[studentIndex][pbaIndex] = score < 50 || score > 100; // Mark as invalid if out of range
          return updatedInvalid;
        });
      };

  {/* PBA CALCULATION FOR BOTH PERIOD (COMPLETE)*/}
  const calculateTotalsAndPBA = (studentScores = [], PBAGradePercentage) => {
    // Check if studentScores is an array with elements
    if (!Array.isArray(studentScores) || studentScores.length === 0) {
      return { total: 0, pbaGrade: 0 }; // Default values when scores are unavailable
    }
    const total = studentScores.reduce((sum, score) => sum + score, 0);
  
    // Calculate the average score (total divided by number of quizzes)
    const average = total / studentScores.length;
  
    // Calculate the PBA grade (using the percentage provided)
    const pbaGrade = average * (PBAGradePercentage / 100);
  
    return { total: average, pbaGrade };
  };

   {/* SEMESTRAL EXAM */}
   
   {/* EXAM SCORE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
   const handleMidtermExamScoreChange = (studentId, score) => {
    // Validate that the score does not exceed the maximum items
    if (score > midtermTotalItems) {
      toast.error(`Score cannot exceed the total items (${midtermTotalItems}) for the Midterm Exam.`);
      return; // Do not update if validation fails
    }
  
    // Update the score if valid
    setMidtermExamScores((prevScores) => ({
      ...prevScores,
      [studentId]: score,
    }));
  };
  
  const handleFinalsExamScoreChange = (studentId, score) => {
    if (score > finalsTotalItems) {
      toast.error(`Score cannot exceed the total items ${finalsTotalItems} for the Finals Exam.`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    setfinalsExamScores((prevScores) => ({
      ...prevScores,
      [studentId]: score,
    }));
  };
  

  // Computation functions
  const calculateMidtermPercentage = (score) => {
    return ((score / midtermTotalItems) * 50) + 50;
  };
  const calculateFinalPercentage = (score) => {
    return ((score / finalsTotalItems) * 50) + 50;
  };

  const calculateMidtermWeightedScore = (percentage) => {
    return (percentage * midtermExamPercentage) / 100;
  };
  const calculateFinalWeightedScore = (percentage) => {
    return (percentage * finalsExamPercentage) / 100;
  };

  //MIDTERM GRADE
  const calculateMidtermGrade = (studentIndex) => {
    // Check if there is at least one score inputted in any component
    const hasScores =
      (midtermAssignmentScores[studentIndex] || []).some(score => score) ||
      (midtermQuizScores[studentIndex] || []).some(score => score) ||
      (midtermRecitationScores[studentIndex] || []).some(score => score) ||
      midtermExamScores[students[studentIndex].id] !== undefined;
  
    if (!hasScores) {
      return "Select"; // If no scores inputted, default to "Select"
    }
  
    // Retrieve CS Grade
    const csGrade = parseFloat(calculateTotalMidtermCSGrade(studentIndex)) || 0;
  
    // Retrieve PBA Grade
    const pbaScores = midtermPBAGradeScores[studentIndex] || [];
    const { pbaGrade } = calculateTotalsAndPBA(pbaScores, midtermPBAGradePercentage);
  
    // Retrieve Midterm Exam Score
    const midtermExamScore = midtermExamScores[students[studentIndex].id];
  
    // Check for incomplete components
    const isMidtermExamIncomplete = midtermExamScore === undefined;
    if (csGrade === 0 || pbaGrade === 0 || isMidtermExamIncomplete) {
      return "INC"; // Mark as incomplete
    }
  
    // Calculate Weighted Midterm Exam Score
    const midtermExamPercentageScore = calculateMidtermPercentage(midtermExamScore);
    const weightedMidtermExamScore = (midtermExamPercentageScore * midtermExamPercentage) / 100;
  
    // Calculate the Total Midterm Grade
    const totalMidtermGrade = csGrade + parseFloat(pbaGrade) + parseFloat(weightedMidtermExamScore);
  
    // Cap the grade at 100 and return the formatted value
    return Math.min(100, totalMidtermGrade).toFixed(2);
  };
  
  
  //FINAL GRADE
  const calculateFinalsGrade = (studentIndex) => {
    // Check if there is at least one score inputted in any component
    const hasScores =
      (finalsAssignmentScores[studentIndex] || []).some(score => score) ||
      (finalsQuizScores[studentIndex] || []).some(score => score) ||
      (finalsRecitationScores[studentIndex] || []).some(score => score) ||
      finalsExamScores[students[studentIndex].id] !== undefined;
  
    if (!hasScores) {
      return "Select"; // If no scores inputted, default to "Select"
    }
  
    // Retrieve CS Grade
    const csGrade = parseFloat(calculateTotalFinalsCSGrade(studentIndex)) || 0;
  
    // Retrieve PBA Grade
    const pbaScores = finalsPBAGradeScores[studentIndex] || [];
    const { pbaGrade } = calculateTotalsAndPBA(pbaScores, finalsPBAGradePercentage);
  
    // Retrieve Midterm Exam Score
    const finalsExamScore = finalsExamScores[students[studentIndex].id];
  
    // Check for incomplete components
    const isFinalsExamIncomplete = finalsExamScore === undefined;
    if (csGrade === 0 || pbaGrade === 0 || isFinalsExamIncomplete) {
      return "INC"; // Mark as incomplete
    }
  
    // Calculate Weighted Midterm Exam Score
    const finalsExamPercentageScore = calculateFinalPercentage(finalsExamScore);
    const weightedFinalsExamScore = (finalsExamPercentageScore * finalsExamPercentage) / 100;
  
    // Calculate the Total Midterm Grade
    const totalFinalsGrade = csGrade + parseFloat(pbaGrade) + parseFloat(weightedFinalsExamScore);
  
    // Cap the grade at 100 and return the formatted value
    return Math.min(100, totalFinalsGrade).toFixed(2);
  };
  

  //NUMERICAL EQUIVALENT AND REMARKS FOR MIDTERM
  const getMidtermNumericalEquivalentAndRemarks = (studentId, grade, studentIndex) => {
    // If grade is "INC" (incomplete), return as is
    if (grade === "INC") {
      return { numEq: "-", remarks: "INC" };
    }
  
    // Grading logic
    if (grade >= 99 && grade <= 100) return { numEq: "1.00", remarks: "PASSED" };
    if (grade >= 96 && grade < 99) return { numEq: "1.25", remarks: "PASSED" };
    if (grade >= 93 && grade < 96) return { numEq: "1.50", remarks: "PASSED" };
    if (grade >= 90 && grade < 93) return { numEq: "1.75", remarks: "PASSED" };
    if (grade >= 87 && grade < 90) return { numEq: "2.00", remarks: "PASSED" };
    if (grade >= 84 && grade < 87) return { numEq: "2.25", remarks: "PASSED" };
    if (grade >= 81 && grade < 84) return { numEq: "2.50", remarks: "PASSED" };
    if (grade >= 78 && grade < 81) return { numEq: "2.75", remarks: "PASSED" };
    if (grade >= 75 && grade < 78) return { numEq: "3.00", remarks: "PASSED" };
    if (grade < 75) return { numEq: "5.00", remarks: "FAILED" };
  
    // Default case for unexpected input
    return { numEq: "-", remarks: "-" };
  };
  
  //NUMERICAL EQUIVALENT AND REMARKS FOR FINALS
  const getFinalsNumericalEquivalentAndRemarks = (studentId, grade, studentIndex) => {
    // If grade is "INC" (incomplete), return as is
    if (grade === "INC") {
      return { numEq: "-", remarks: "INC" };
    }
  
    // Grading logic
    if (grade >= 99 && grade <= 100) return { numEq: "1.00", remarks: "PASSED" };
    if (grade >= 96 && grade < 99) return { numEq: "1.25", remarks: "PASSED" };
    if (grade >= 93 && grade < 96) return { numEq: "1.50", remarks: "PASSED" };
    if (grade >= 90 && grade < 93) return { numEq: "1.75", remarks: "PASSED" };
    if (grade >= 87 && grade < 90) return { numEq: "2.00", remarks: "PASSED" };
    if (grade >= 84 && grade < 87) return { numEq: "2.25", remarks: "PASSED" };
    if (grade >= 81 && grade < 84) return { numEq: "2.50", remarks: "PASSED" };
    if (grade >= 78 && grade < 81) return { numEq: "2.75", remarks: "PASSED" };
    if (grade >= 75 && grade < 78) return { numEq: "3.00", remarks: "PASSED" };
    if (grade < 75) return { numEq: "5.00", remarks: "FAILED" };
  
    // Default case for unexpected input
    return { numEq: "-", remarks: "-" };
  };
  
  const handleRemarksChange = (studentId, selectedRemark) => {
    setRemarks(prevRemarks => ({
      ...prevRemarks,
      [studentId]: selectedRemark
    }));
  };

  // REMARKS FOR MIDTERM
  const MidtermhasBlankScores = (studentIndex) => {
    // Check for blank attendance scores
    const attendanceScores = midtermAttendanceData[students[studentIndex].id] || [];
    const isAttendanceIncomplete = attendanceScores.some(score => score.status === "Select" || !score.status);
  
    // Check for blank assignment scores
    const isAssignmentIncomplete = midtermAssignmentScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank quiz scores
    const isQuizIncomplete = midtermQuizScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank recitation scores
    const isRecitationIncomplete = midtermRecitationScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank exam scores
    const isMidtermExamIncomplete = midtermExamScores[students[studentIndex].id] === "" || midtermExamScores[students[studentIndex].id] === null || midtermExamScores[students[studentIndex].id] === undefined;
  
    // If any component has blank scores, return true
    return isAttendanceIncomplete || isAssignmentIncomplete || isQuizIncomplete || isRecitationIncomplete || isMidtermExamIncomplete;
  };
  // REMARKS FOR FINALS
  const FinalshasBlankScores = (studentIndex) => {
    // Check for blank attendance scores
    const attendanceScores = finalsAttendanceData[students[studentIndex].id] || [];
    const isAttendanceIncomplete = attendanceScores.some(score => score.status === "Select" || !score.status);
  
    // Check for blank assignment scores
    const isAssignmentIncomplete = finalsAssignmentScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank quiz scores
    const isQuizIncomplete = finalsQuizScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank recitation scores
    const isRecitationIncomplete = finalsRecitationScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank exam scores
    const isMidtermExamIncomplete = finalsExamScores[students[studentIndex].id] === "" || midtermExamScores[students[studentIndex].id] === null || midtermExamScores[students[studentIndex].id] === undefined;
  
    // If any component has blank scores, return true
    return isAttendanceIncomplete || isAssignmentIncomplete || isQuizIncomplete || isRecitationIncomplete || isMidtermExamIncomplete;
  };
  


  // Constants for midterm and finals weight
const MIDTERM_WEIGHT = 0.4; // 40%
const FINALS_WEIGHT = 0.6;  // 60%

// Function to calculate the Semestral Grade based on Midterm and Finals Grades
const calculateSemestralGrade = (midtermGrade, finalsGrade) => {
  // Applying weights to midterm and finals grades
  const weightedMidterm = midtermGrade * MIDTERM_WEIGHT;
  const weightedFinals = finalsGrade * FINALS_WEIGHT;

  // Calculating the semestral grade and ensuring it does not exceed 100
  const semestralGrade = Math.min(100, weightedMidterm + weightedFinals);
  return semestralGrade.toFixed(2); // Format to 2 decimal places
};

// Semestral Grade Numerical Equivalent and Remarks Constant
const getSemestralNumericalEquivalentAndRemarks = (studentId, grade, hasBlankScores) => {
  // If there's a manual selection for the student, return the selected remark
  if (remarks[studentId]) {
    return { numEq: "-", remarks: remarks[studentId] };
  }

  // If any component has blank scores, return INC for remarks
  if (hasBlankScores) {
    return { numEq: "-", remarks: "INC" };
  }

  // Otherwise, calculate based on the grade
  if (grade >= 99 && grade <= 100) return { numEq: "1.00", remarks: "PASSED" };
  if (grade >= 96 && grade < 99) return { numEq: "1.25", remarks: "PASSED" };
  if (grade >= 93 && grade < 96) return { numEq: "1.50", remarks: "PASSED" };
  if (grade >= 90 && grade < 93) return { numEq: "1.75", remarks: "PASSED" };
  if (grade >= 87 && grade < 90) return { numEq: "2.00", remarks: "PASSED" };
  if (grade >= 84 && grade < 87) return { numEq: "2.25", remarks: "PASSED" };
  if (grade >= 81 && grade < 84) return { numEq: "2.50", remarks: "PASSED" };
  if (grade >= 78 && grade < 81) return { numEq: "2.75", remarks: "PASSED" };
  if (grade >= 75 && grade < 78) return { numEq: "3.00", remarks: "PASSED" };
  if (grade < 75) return { numEq: "5.00", remarks: "FAILED" };

  return { numEq: "-", remarks: "-" };
};

// Add this function to validate total percentage
const validateTotalPercentage = () => {
  const totalPercentage =
    parseFloat(midtermAttendancePercentage || 0) +
    parseFloat(midtermAssignmentPercentage || 0) +
    parseFloat(midtermQuizPercentage || 0) +
    parseFloat(midtermRecitationPercentage || 0) +
    parseFloat(midtermPBAGradePercentage || 0) +
    parseFloat(midtermExamPercentage || 0);

  if (totalPercentage > 100) {
    toast.error("Total percentage exceeds 100%. Please adjust the inputs.");
    return false;
  }
  return true;
};

// Call this function wherever relevant
const handlePercentageChange = (setter, value) => {
  setter(value);
  validateTotalPercentage();
};

    
  {/* MIDTERMS TAB */}
  const renderTableContent = () => {
    switch (selectedPeriod) {
      case 'midterm':
        return (
          <div>
          <ToastContainer />
          {/* Other components */}
          
          <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
          <table className="details-table" >
            <thead>
              <tr>
              <th colSpan="2" style={{ backgroundColor: '#F6F7C4' }}  className='sticky-style'>Student Info</th>
                <th colSpan={midtermAttendanceColumns.length + 7} className='sticky-header'>Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                <th colSpan={midtermAssignmentColumns.length + 3} rowSpan={3} className='sticky-header'>Assignments</th>
                <th colSpan={midtermQuizColumns.length + 3} rowSpan={2} className='sticky-header'>Quizzes/Seatwork</th> 
                <th colSpan={midtermRecitationColumns.length + 3} rowSpan={3} className='sticky-header'>Recitation/Participation</th>
                <th colSpan="1" rowSpan="3"className='sticky-header'>CS Grade</th>
                <th colSpan={midtermPBAColumns.length + 3} rowSpan={2} className='sticky-header' >Performance Based Assessment</th>
                <th colSpan="3" rowSpan="3" className='sticky-header'>Midterm Exam</th>
                <th colSpan="1" rowSpan="3" className='sticky-header'>Midterm Grade</th>
                <th colSpan="1" rowSpan="4" className='sticky-header'>Numerical Equivalent</th>
                <th colSpan="1" rowSpan="4" className='sticky-header'>Remarks</th>
              </tr>
              
              <tr>
              <th rowSpan={3} style={{ backgroundColor: '#F6F7C4' }} className="sticky-student-no">
                Student No
              </th>
              <th rowSpan={3} style={{ backgroundColor: '#F6F7C4' }}  className="sticky-name">
                Name
              </th>


              {midtermAttendanceColumns.map((column, index) => (
  <th key={index} rowSpan="3" className='sticky-top-left-up'>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {index === midtermAttendanceColumns.length - 1 && ( // Show button only for the last column
        <button
          onClick={() => removeAttendanceColumn(index, setmidtermAttendanceColumns, setmidtermAttendanceData)}
          style={{ background: 'none', border: 'none', marginRight: '10px' }}
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
      )}
      <DatePicker
        selected={column.date}
        onChange={(date) =>
          setmidtermAttendanceColumns((prevColumns) =>
            prevColumns.map((col, i) => (i === index ? { ...col, date, grade: [] } : col))
          )
        }
        dateFormat="yyyy-MM-dd"
        className="custom-datepicker"
      />
    </div>
  </th>
))}


              <th rowSpan="3" style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 42,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                <button onClick={() => addColumn(setmidtermAttendanceColumns)} style={{background: 'none', border: 'none'}}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </th>

              <th colSpan="2" className='sticky-top-left'>No of Days</th>
              <th colSpan="2" className='sticky-top-left'>
                <input
                  type="text"
                  style={{ width: '60px', marginLeft: '10px' }}
                  value={midtermTotalAttendanceDays}
                  readOnly
                />
              </th>
              <th colSpan="2" rowSpan="2" className='sticky-top-left'>Attendance</th>
            </tr>
            <tr>
              <th colSpan="4" className='sticky-top-left-offset'>Total Student Attendance</th>
                
                {/* Quiz Columns WITH REMOVE BUTTON */}
                {midtermQuizColumns.map((_, index) => (
                <th key={index} rowSpan={2}  className='sticky-top-left-offset'>
                  Q/S {index + 1}
                  <button onClick={() => removeQuizColumn(index)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <input
                    type="number"
                    value={midtermQuizMaxScores[index] || ''}
                    onChange={(e) => handleMidtermMaxScoreChange(index, parseFloat(e.target.value) || '')} // Avoid setting 0 as default
                    style={{ width: '60px' }} // Adjust width as needed
                    placeholder="Items"
                  />

                </th>
              ))}

              <th rowSpan={2} style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 105,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                          <button onClick={addMidtermQuizColumn} style={{ background: 'none', border: 'none' }}>
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </th>
                    <th rowSpan={2} className='sticky-top-left-offset'>Total</th>
                    <th rowSpan={2} className='sticky-top-left-offset'>
                    <input
                    type="number"
                    value={midtermQuizPercentage}
                    onChange={(e) => setmidtermQuizPercentage(e.target.value)}
                    style={{ width: '60px' }}
                  />
                    %</th>
    
                  {/* PBA Columns */}
                  {midtermPBAColumns.map((_, index) => (
                    <th key={index} className='sticky-top-left-offset'>
                      PBA {index + 1}
                      <button onClick={() => removeColumn(index, setmidtermPBAColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th rowSpan={2} style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 105,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                    <button onClick={() => addColumn(setmidtermPBAColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th rowSpan={2} className='sticky-top-left-offset'>Total</th>
                  <th className='sticky-top-left-offset'>PBA Grade</th>
                </tr>
                <tr>
              <th colSpan="1" className='sticky-top-left-offset-168'>P</th>
              <th colSpan="1" className='sticky-top-left-offset-168'>L</th>
              <th colSpan="1" className='sticky-top-left-offset-168'>E</th>
              <th colSpan="1" className='sticky-top-left-offset-168'>A</th>
              <th colSpan="2" className='sticky-top-left-offset-168'>
                <input
                  type="number"
                  value={midtermAttendancePercentage}
                  onChange={(e) => setmidtermAttendancePercentage(e.target.value)}
                  style={{ width: '60px' }}
                />
                %</th>
    
                {/* Assignment Column Header */}
                {midtermAssignmentColumns.map((_, index) => (
                  <th key={index} className='sticky-top-left-offset-168'>
                    A {index + 1}
                    <button onClick={() => removeColumn(index, setmidtermAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 168,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                  <button onClick={() => addColumn(setmidtermAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th className='sticky-top-left-offset-168'> Total</th>
                {/* Use a `td` for the input field */}
                <th className='sticky-top-left-offset-168'>
            <input
              type="number"
              value={midtermAssignmentPercentage}
              onChange={(e) => setmidtermAssignmentPercentage(e.target.value)}
              style={{ width: '60px' }}
            />%
          </th>
                {/* Recitation Columns */}
                {midtermRecitationColumns.map((_, index) => (
                  <th key={index} className='sticky-top-left-offset-168'>
                    R {index + 1}
                    <button onClick={() => removeColumn(index, setmidtermRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 168,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                  <button onClick={() => addColumn(setmidtermRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th className='sticky-top-left-offset-168'>Total</th>
                <th className='sticky-top-left-offset-168'>
                <input
                type="number"
                value={midtermRecitationPercentage}
                onChange={(e) => setmidtermRecitationPercentage(e.target.value)}
                style={{ width: '60px' }}
              />
                %</th>
                <th className='sticky-top-left-offset-168'>{calculateTotalMidtermCSPercentage()}%</th>
    
                {midtermPBAColumns.map((_, index) => (
                  <th key={index} className='sticky-top-left-offset-168'>
                    <select>
                      <option value="Project">Select</option>
                      <option value="Project">Project</option>
                      <option value="Reports">Reports</option>
                      <option value="Reflection">Reflection</option>
                      <option value="Portfolio">Portfolio</option>
                      <option value="Research">Research</option>
                      <option value="Laboratory">Laboratory</option>
                    </select>
                  </th>
                ))}
    
                <th className='sticky-top-left-offset-168'>
                  <input
                    type="number"
                    value={midtermPBAGradePercentage}
                    onChange={(e) => setmidtermPBAGradePercentage(parseFloat(e.target.value) || 0)}
                    style={{ width: '60px' }}
                    min="0"
                    max="100"
                  />
                  %
                </th>
                <th className='sticky-top-left-offset-168'>
                <input
                  type="number"
                  value={midtermTotalItems}
                  onChange={(e) => setmidtermTotalItems(parseInt(e.target.value) || 0)} // Update total items
                  style={{ width: '60px' }}
                  placeholder="Items"
                />                       </th>
                  <th colSpan="2" className='sticky-top-left-offset-168'>
                    <input
                      type="number"
                      value={midtermExamPercentage}
                      onChange={(e) => setMidtermExamPercentage(e.target.value)}
                      style={{ width: '60px' }}
                      placeholder="%"
                    />
                    %</th>
              <th className='sticky-top-left-offset-168'>Total</th>
    
              </tr>
            </thead>


            <tbody>
              {students.map((student, studentIndex) => {
                const studentScores = midtermPBAGradeScores[studentIndex] || [];
       
                const { total, pbaGrade } = calculateTotalsAndPBA(studentScores, midtermPBAGradePercentage);
                const score = midtermExamScores[student.id] || 0;
                const percentage = calculateMidtermPercentage(score);
                const weightedScore = calculateMidtermWeightedScore(percentage).toFixed(2);
                const { Atotals, points } = getMidtermAttendanceTotals(student.id);
                const midtermAttendancePercentageScore = getMidtermAttendanceScorePercentage(points); 
                const midtermGrade = calculateMidtermGrade(studentIndex); // Calculate the midterm grade
                const { numEq, remarks: autoRemarks } = getMidtermNumericalEquivalentAndRemarks(student.id, midtermGrade, studentIndex); // Pass studentIndex to check for blank scores

                    // Determine row background color based on remarks
                    const getRowClass = (remark) => {
                      if (remark === "FAILED") return "row-failed";
                      if (remark === "PASSED") return "row-passed";
                      if (remark === "INC") return "row-inc";
                      if (remark === "Select") return "row-select"; // Highlight with a white color
                      return "";
                    };
                    
                              
              


                
                return (
                  <tr key={student.id} className={getRowClass(autoRemarks)}>
                    <td style={{position: 'sticky',left: 0,backgroundColor: '#F6F7C4',padding: '10px',zIndex: 3,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)',}}className="sticky-student-no">{student.studentNumber || 'Guest'}</td>
                    <td style={{position: 'sticky',left: 73,backgroundColor: '#F6F7C4',padding: '10px', zIndex: 3,whiteSpace: 'nowrap', overflow: 'hidden',   textOverflow: 'ellipsis', }}className="sticky-name">
                      {student.studentLastName || ''}, {student.studentFirstName || ''} {student.studentMiddleName || ''}
                    </td>



                    {midtermAttendanceColumns.map((dateColumn, dateIndex) => (
                      <td key={dateColumn.id}>
                        <select
                          defaultValue={midtermAttendanceData[student.id]?.[dateIndex]?.status || 'Select'}
                          //defaultValue={dateColumn?.grade?.find(g => g.studentNumber === student.studentNumber)?.status || 'Select'}
                          disabled={!dateColumn?.date}
                          onChange={(e) => {handleMidtermAttendanceChange(student.id, student.studentNumber, dateIndex, e.target.value);
                            /*const date = new Date(dateColumn.date).toISOString().split('T')[0];
                            if (!date) {
                              alert(`Invalid date for student ${student.studentNumber} at Assignment ${dateIndex}. Please check the date.`);
                              return e.target.value = 'Select'; // Exit early
                            } else {
                              handleMidtermAttendanceChange(student.id, student.studentNumber, dateIndex, e.target.value);
                            }*/
                          }}
                        >
                          <option value="Select">Select</option>
                          <option value="P">P</option>
                          <option value="L">L</option>
                          <option value="E">E</option>
                          <option value="A">A</option>
                        </select>
                      </td>
                    ))}

                    <td></td>

                    <td>{Atotals.P}</td> {/* Present count */}
                    <td>{Atotals.L}</td> {/* Late count */}
                    <td>{Atotals.E}</td> {/* Excused count */}
                    <td>{Atotals.A}</td> {/* Absent count */}

                    {/* Check if any attendance status is 'Select' for all dates */}
                    <td>
                      {Object.values(midtermAttendanceData[student.id] || {}).every(
                        (attendance) => attendance.status === 'Select'
                      )
                        ? 0  // Set points to 0 if all statuses are 'Select'
                        : points.toFixed(2)}  {/* Otherwise, display the points */}
                    </td>

                    <td>
                      {Object.values(midtermAttendanceData[student.id] || {}).every(
                        (attendance) => attendance.status === 'Select'
                      )
                        ? '0.00 %'  // If all are 'Select', attendance is 0%
                        : isNaN(Number(midtermAttendancePercentageScore)) || midtermAttendancePercentageScore === null
                        ? '0.00 %'
                        : `${Number(midtermAttendancePercentageScore).toFixed(2)} %`}
                    </td>


                    {/* ASSIGNMENT COMPONENT: DEFINE midtermAssignmentScores IN INPUT */}
                    {midtermAssignmentColumns.map((_, assignmentIndex) => (
                    <td key={assignmentIndex}>
                      <input
                        type="number"
                        style={{
                          width: '70px',
                          borderColor:
                            invalidAssignmentScores[studentIndex]?.[assignmentIndex] ? 'red' : 'initial',
                          borderWidth:
                            invalidAssignmentScores[studentIndex]?.[assignmentIndex] ? '2px' : '1px',
                        }}
                        placeholder="Score"
                        value={midtermAssignmentScores[studentIndex]?.[assignmentIndex] || ''}
                        onChange={(e) => {
                          const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); // Treat empty input as null
                          handleMidtermAssignmentScoreChange(studentIndex, assignmentIndex, inputScore);

                          // Show the red border in real-time
                          if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                            setInvalidAssignmentScores((prevInvalid) => {
                              const updatedInvalid = [...prevInvalid];
                              if (!updatedInvalid[studentIndex]) {
                                updatedInvalid[studentIndex] = {};
                              }
                              updatedInvalid[studentIndex][assignmentIndex] = true; // Mark as invalid
                              return updatedInvalid;
                            });
                          }
                        }}
                        onBlur={(e) => {
                          const inputScore = parseFloat(e.target.value);

                          // Trigger toast only when input is invalid and not empty
                          if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                            toast.error(`Score must be between 50 and 100 for Assignment ${assignmentIndex + 1}`);
                          }
                        }}
                      />
                    </td>
                  ))}



                    <td></td>
                    <td>{calculateMidtermAssignmentColumnAverage(student.id)}%</td> {/* Display average directly */}
                    <td>
                      {(() => {
                        const assignmentScore = calculateMidtermAssignmentComponentScore(student.id, midtermAssignmentPercentage);
                        return isNaN(Number(assignmentScore)) || assignmentScore === null
                          ? '0.00%'
                          : `${Number(assignmentScore).toFixed(2)}%`;
                      })()}
                    </td>



                    {/*QUIZ COMPONENT: DEFINE midtermQuizScores IN INPUT*/}
                    {midtermQuizColumns.map((_, quizIndex) => (
                      <td key={quizIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={midtermQuizScores[studentIndex]?.[quizIndex] || ''} // Ensure that the input shows the current score
                          onChange={(e) => {
                            const inputScore = parseFloat(e.target.value) || 0;
                            handleMidtermQuizScoreChange(studentIndex, quizIndex, inputScore);
                          }}
                        />

                      </td>
                    ))}

                    <td></td>
                    <td>
                      {/* Check if there are no quiz scores for this student */}
                      {midtermQuizScores[studentIndex]?.every(score => score === 0 || score === undefined) 
                        ? '0.00%'  // If no scores are inputted, show 0%
                        : isNaN(Number(calculateMidtermQuizTotalScore(studentIndex))) || calculateMidtermQuizTotalScore(studentIndex) === null
                        ? '0.00%'  // If the total score is invalid or null, show 0%
                        : `${Number(calculateMidtermQuizTotalScore(studentIndex)).toFixed(2)}%`}  {/* Display total score */}
                    </td>
                    <td>
                      {/* Check if there are no quiz scores for this student */}
                      {midtermQuizScores[studentIndex]?.every(score => score === 0 || score === undefined) 
                        ? '0.00%'  // If no scores are inputted, show 0%
                        : isNaN(Number(calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage))) || 
                          calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage) === null
                        ? '0.00%'  // If the component score is invalid or null, show 0%
                        : `${Number(calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage)).toFixed(2)}%`}  {/* Display component score */}
                    </td>


                    
                  {/* RECITATION COMPONENT: DEFINE midtermRecitationScores IN INPUT */}
                  {midtermRecitationColumns.map((_, recitationIndex) => (
                  <td key={recitationIndex}>
                    <input
                      type="number"
                      style={{
                        width: '70px',
                        borderColor:
                          invalidRecitationScores[studentIndex]?.[recitationIndex] ? 'red' : 'initial',
                        borderWidth:
                          invalidRecitationScores[studentIndex]?.[recitationIndex] ? '2px' : '1px',
                      }}
                      placeholder="Score"
                      value={midtermRecitationScores[studentIndex]?.[recitationIndex] || ''}
                      onChange={(e) => {
                        const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); // Treat empty input as null
                        handleMidtermRecitationScoreChange(studentIndex, recitationIndex, inputScore);

                        // Show the red border in real-time
                        if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                          setInvalidRecitationScores((prevInvalid) => {
                            const updatedInvalid = [...prevInvalid];
                            if (!updatedInvalid[studentIndex]) {
                              updatedInvalid[studentIndex] = {};
                            }
                            updatedInvalid[studentIndex][recitationIndex] = true; // Mark as invalid
                            return updatedInvalid;
                          });
                        }
                      }}
                      onBlur={(e) => {
                        const inputScore = parseFloat(e.target.value);

                        // Trigger toast only when input is invalid and not empty
                        if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                          toast.error(`Score must be between 50 and 100 for Recitation ${recitationIndex + 1}`);
                        }
                      }}
                    />
                  </td>
                ))}

                  <td></td>
                  <td>{calculateMidtermRecitationColumnAverage(student.id)}%</td>
                  <td>
                    {(() => {
                      const recitationScore = calculateMidtermRecitationComponentScore(student.id, midtermRecitationPercentage);
                      return isNaN(Number(recitationScore)) || recitationScore === null
                        ? '0.00%'
                        : `${Number(recitationScore).toFixed(2)}%`;
                    })()}
                  </td>



                  {/* CLASS STANDING TOTAL: ATTENDANCE + ASSIGN + QUIZSEAT + RECITATION */}
                  <td>
                    {(() => {
                      // Get all the relevant values for the class standing components (attendance, assignments, quizzes, recitation)
                      const totalAttendance = Atotals.P + Atotals.L + Atotals.E + Atotals.A; // Example for attendance
                      const totalAssignment = midtermAssignmentScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for assignments
                      const totalQuiz = midtermQuizScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for quizzes
                      const totalRecitation = midtermRecitationScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for recitation

                      // Check if all fields are 0 or missing
                      const isAllZero = totalAttendance === 0 && totalAssignment === 0 && totalQuiz === 0 && totalRecitation === 0;

                      // If all fields are 0 or missing, don't compute and show '0.00%'
                      if (isAllZero) {
                        return '0.00%';
                      }

                      // Otherwise, compute the total class standing grade
                      const totalCSGrade = calculateTotalMidtermCSGrade(studentIndex);

                      // Return the computed grade, or '0.00%' if invalid
                      return totalCSGrade || '0.00%';
                    })()}
                  </td>

                  {midtermPBAColumns.map((_, pbaIndex) => (
                  <td key={pbaIndex}>
                    <input
                      type="number"
                      style={{
                        width: '70px',
                        borderColor:
                          invalidPBAScores[studentIndex]?.[pbaIndex] ? 'red' : 'initial',
                        borderWidth:
                          invalidPBAScores[studentIndex]?.[pbaIndex] ? '2px' : '1px',
                      }}
                      placeholder="Score"
                      value={midtermPBAGradeScores[studentIndex]?.[pbaIndex] || ''}
                      onChange={(e) => {
                        const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); // Treat empty input as null
                        handleMidtermPBAScoreChange(studentIndex, pbaIndex, inputScore);

                        // Show the red border in real-time
                        if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                          setInvalidPBAScores((prevInvalid) => {
                            const updatedInvalid = [...prevInvalid];
                            if (!updatedInvalid[studentIndex]) {
                              updatedInvalid[studentIndex] = {};
                            }
                            updatedInvalid[studentIndex][pbaIndex] = true; // Mark as invalid
                            return updatedInvalid;
                          });
                        }
                      }}
                      onBlur={(e) => {
                        const inputScore = parseFloat(e.target.value);

                        // Trigger toast only when input is invalid and not empty
                        if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                          toast.error(`Score must be between 50 and 100 for PBA ${pbaIndex + 1}`);
                        }
                      }}
                    />
                  </td>
                ))}

                  <td></td>
                  <td>{total.toFixed(2)}</td> {/* This should display the correct average */}
                  <td>
                    {(() => {
                      const formattedPbaGrade = isNaN(Number(pbaGrade)) || pbaGrade === null
                        ? '0.00'
                        : Number(pbaGrade).toFixed(2);
                      return formattedPbaGrade;
                    })()}
                  </td>




                    {/*MIDTERMS EXAM COMPONENT*/}
                    <td>
                    <input
                      type="number"
                      style={{ width: '70px' }}
                      placeholder="Score"
                      value={midtermExamScores[student.id] || ''} // Display the current score or empty
                      onChange={(e) => {
                        const inputScore = parseFloat(e.target.value) || 0;
                        handleMidtermExamScoreChange(student.id, inputScore);
                      }}
                    />


                  </td>
                  <td>{isNaN(percentage) ? '0.00' : percentage.toFixed(2)}%</td>
                  <td>
                    {isNaN(Number(weightedScore)) || weightedScore === null
                      ? '0.00%'
                      : `${Number(weightedScore).toFixed(2)}%`}
                  </td>


                    {/*MIDTERM GRADE: CLASS STANDING + PBA + MIDTERM EXAM*/}
                    <td>
                      {isNaN(Number(calculateMidtermGrade(studentIndex))) || calculateMidtermGrade(studentIndex) === null
                        ? '0.00'
                        : Number(calculateMidtermGrade(studentIndex)).toFixed(2)}
                    </td>
                    <td><center>{numEq}</center></td>

                    {/*REMARKS DROP-DOWN*/}
                    <td>
                      <select
                        value={remarks[student.id] || autoRemarks} // Use manual selection or default to auto-calculated remarks
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      >
                        <option value="Select">Select</option>
                        <option value="PASSED">PASSED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="OD">OD</option>
                        <option value="UD">UD</option>
                        <option value="INC">INC</option>
                        <option value="NC">NC</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          </div>
              
        );

      case 'finals':
        return (
          <div>
            <ToastContainer />
            <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
            <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                <th colSpan="2" style={{ backgroundColor: '#F6F7C4' }}  className='sticky-style'>Student Info</th>
                  <th colSpan={finalsAttendanceColumns.length + 7} className='sticky-header'>Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                  <th colSpan={finalsAssignmentColumns.length + 3} rowSpan={3} style={{ padding: '60px' }} className='sticky-header' >Assignments</th>
                  <th colSpan={finalsQuizColumns.length + 3} rowSpan={2} className='sticky-header'>Quizzes/Seatwork</th> {/* New column header */}
                  <th colSpan={finalsRecitationColumns.length + 3} rowSpan={3} className='sticky-header'>Recitation/Participation</th>
                  <th colSpan="1" rowSpan="3"className='sticky-header'>CS Grade</th>
                  <th colSpan={finalsPBAColumns.length + 3} rowSpan={2} className='sticky-header'>Performance Based Assessment</th>
                  <th colSpan="3" rowSpan="3" className='sticky-header'>Final Exam</th>
                  <th colSpan="1" rowSpan="3" className='sticky-header'>Final Grade</th>
                  <th colSpan="1" rowSpan="4" className='sticky-header'>Numerical Equivalent</th>
                  <th colSpan="1" rowSpan="4" className='sticky-header'>Remarks</th>
                </tr>
                
                <tr>
                <th rowSpan={3} style={{ backgroundColor: '#F6F7C4' }}  className="sticky-student-no">
                  Student No
                </th>
                <th rowSpan={3} style={{ backgroundColor: '#F6F7C4' }} className="sticky-name">
                  Name
                </th>
                {finalsAttendanceColumns.map((column, index) => (
                <th key={index} rowSpan="3" className='sticky-top-left'>
                <DatePicker
                  selected={column.date}
                  onChange={(date) =>
                    setfinalsAttendanceColumns((prevColumns) =>
                      prevColumns.map((col, i) => (i === index ? { ...col, date } : col))
                    )
                  }
                  dateFormat="yyyy-MM-dd"
                  className="custom-datepicker" // Add custom class for width control
                />
                <button
                  onClick={() => removeColumn(index, setfinalsAttendanceColumns)}
                  style={{ background: 'none', border: 'none' }}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              </th>
              
              ))}
  
                <th rowSpan="3" style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 42,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                  <button onClick={() => addColumn(setfinalsAttendanceColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
  
                <th colSpan="2" className='sticky-top-left'>No of Days</th>
                <th colSpan="2" className='sticky-top-left'>
                  <input
                    type="text"
                    style={{ width: '60px', marginLeft: '10px' }}
                    value={finalsTotalAttendanceDays}
                    readOnly
                  />
                </th>
                <th colSpan="2" rowSpan="2" className='sticky-top-left'>Attendance</th>
              </tr>
              <tr>
                <th colSpan="4" className='sticky-top-left-offset'>Total Student Attendance</th>
                  
                  {/* Quiz Columns WITH REMOVE BUTTON */}
                  {finalsQuizColumns.map((_, index) => (
                <th key={index} rowSpan={2} className='sticky-top-left-offset'>
                  Q/S {index + 1}
                  <button onClick={() => removeQuizColumn(index)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <input
                    type="number"
                    value={finalsQuizMaxScores[index] || ''}
                    onChange={(e) => handleFinalsMaxScoreChange(index, parseFloat(e.target.value) || '')} // Avoid setting 0 as default
                    style={{ width: '60px' }} // Adjust width as needed
                    placeholder="Items"
                  />

                </th>
              ))}
  
                <th rowSpan={2} style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 105,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                            <button onClick={addFinalQuizColumn} style={{ background: 'none', border: 'none' }}>
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </th>
                      <th rowSpan={2} className='sticky-top-left-offset'>Total</th>
                      <th rowSpan={2} className='sticky-top-left-offset'>
                      <input
                      type="number"
                      value={finalsQuizPercentage}
                    onChange={(e) => setfinalsQuizPercentage(e.target.value)}
                      style={{ width: '60px' }}
                    />
                      %</th>
      
                    {/* PBA Columns */}
                    {finalsPBAColumns.map((_, index) => (
                      <th key={index} className='sticky-top-left-offset'>
                        PBA {index + 1}
                        <button onClick={() => removeColumn(index, setfinalsPBAColumns)} style={{ background: 'none', border: 'none' }}>
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                      </th>
                    ))}
                    <th rowSpan={2} style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 105,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                      <button onClick={() => addColumn(setfinalsPBAColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </th>
                    <th rowSpan={2} className='sticky-top-left-offset'>Total</th>
                    <th className='sticky-top-left-offset'>PBA Grade</th>
                  </tr>
                  <tr>
                <th colSpan="1" className='sticky-top-left-offset-168'>P</th>
                <th colSpan="1" className='sticky-top-left-offset-168'>L</th>
                <th colSpan="1" className='sticky-top-left-offset-168'>E</th>
                <th colSpan="1" className='sticky-top-left-offset-168'>A</th>
                <th colSpan="2" className='sticky-top-left-offset-168'>
                  <input
                    type="number"
                    value={finalsAttendancePercentage}
                    onChange={(e) => setfinalsAttendancePercentage(e.target.value)}
                    style={{ width: '60px' }}
                  />
                  %</th>
      
                  {/* Assignment Column Header */}
                  {finalsAssignmentColumns.map((_, index) => (
                    <th key={index} className='sticky-top-left-offset-168'>
                      A {index + 1}
                      <button onClick={() => removeColumn(index, setfinalsAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 168,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                    <button onClick={() => addColumn(setfinalsAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th className='sticky-top-left-offset-168'>Total</th>
                  {/* Use a `td` for the input field */}
                  <th className='sticky-top-left-offset-168'>
              <input
                type="number"
                value={finalsAssignmentPercentage}
                onChange={(e) => setfinalsAssignmentPercentage(e.target.value)}
                style={{ width: '60px' }}
              />%
            </th>
                  {/* Recitation Columns */}
                  {finalsRecitationColumns.map((_, index) => (
                    <th key={index} className='sticky-top-left-offset-168'>
                      R {index + 1}
                      <button onClick={() => removeColumn(index, setfinalsRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 168,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                    <button onClick={() => addColumn(setfinalsRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th className='sticky-top-left-offset-168'>Total</th>
                  <th className='sticky-top-left-offset-168'>
                  <input
                  type="number"
                  value={finalsRecitationPercentage}
                  onChange={(e) => setfinalsRecitationPercentage(e.target.value)}
                  style={{ width: '60px' }}
                />
                  %</th>
                  <th className='sticky-top-left-offset-168'>{calculateTotalFinalsCSPercentage()}%</th>
      
                  {finalsPBAColumns.map((_, index) => (
                    <th key={index} className='sticky-top-left-offset-168'>
                      <select>
                        <option value="Project">Select</option>
                        <option value="Project">Project</option>
                        <option value="Reports">Reports</option>
                        <option value="Reflection">Reflection</option>
                        <option value="Portfolio">Portfolio</option>
                        <option value="Research">Research</option>
                        <option value="Laboratory">Laboratory</option>
                      </select>
                    </th>
                  ))}
      
                  <th className='sticky-top-left-offset-168'>
                    <input
                      type="number"
                      value={finalsPBAGradePercentage}
                      onChange={(e) => setfinalsPBAGradePercentage(parseFloat(e.target.value) || 0)}
                      style={{ width: '60px' }}
                      min="0"
                      max="100"
                    />
                    %
                  </th>
                  <th className='sticky-top-left-offset-168'>
                      <input
                        type="number"
                        value={finalsTotalItems}
                        onChange={(e) => setfinalsTotalItems(e.target.value)}
                        style={{ width: '70px' }}
                        placeholder="Items"
                      />
                            </th>
                    <th colSpan="2" className='sticky-top-left-offset-168'>
                      <input
                        type="number"
                        value={finalsExamPercentage}
                        onChange={(e) => setfinalsExamPercentage(e.target.value)}
                        style={{ width: '60px' }}
                        placeholder="%"
                      />
                      %</th>
                <th className='sticky-top-left-offset-168'>Total</th>
      
                </tr>
              </thead>
  
  
              <tbody>
                {students.map((student, studentIndex) => {
                  const studentScores = finalsPBAGradeScores[studentIndex] || [];
         
                  const { total, pbaGrade } = calculateTotalsAndPBA(studentScores, finalsPBAGradePercentage);
                  const score = finalsExamScores[student.id] || 0;
                  const percentage = calculateFinalPercentage(score);
                  const weightedScore = calculateFinalWeightedScore(percentage).toFixed(2);
                  const { Atotals, points } = getFinalsAttendanceTotals(student.id);
                  const finalsAttendancePercentageScore = getFinalsAttendanceScorePercentage(points); 
                  const midtermGrade = calculateFinalsGrade(studentIndex); // Calculate the midterm grade
                  const { numEq, remarks: autoRemarks } = getFinalsNumericalEquivalentAndRemarks(student.id, midtermGrade, studentIndex); // Pass studentIndex to check for blank scores


                    // Determine row background color based on remarks
                    const getRowClass = (remark) => {
                      if (remark === "FAILED") return "row-failed";
                      if (remark === "PASSED") return "row-passed";
                      if (remark === "INC") return "row-inc";
                      if (remark === "Select") return "row-select"; // Highlight with a white color
                      return "";
                    };
                              

                return (
                  <tr key={student.id} className={getRowClass(autoRemarks)}>
                    <td style={{position: 'sticky',left: 0,backgroundColor: '#F6F7C4',padding: '10px',zIndex: 3,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)',}}className="sticky-student-no">{student.studentNumber || 'Guest'}</td>
                    <td style={{position: 'sticky',left: 73,backgroundColor: '#F6F7C4',padding: '10px', zIndex: 3,whiteSpace: 'nowrap', overflow: 'hidden',  textOverflow: 'ellipsis', }}className="sticky-name">
                      {student.studentNameLast || ''}, {student.studentNameFirst || ''} {student.studentNameMiddle || ''}
                    </td>


                      {finalsAttendanceColumns.map((_, dateIndex) => (
                      <td key={dateIndex}>
                        <select
                          defaultValue={finalsAttendanceData[student.id]?.[dateIndex]?.status || 'Select'}
                          onChange={(e) => handleFinalsAttendanceChange(student.id, dateIndex, e.target.value)}
                        >
                          <option value="Select">Select</option>
                          <option value="P">P</option>
                          <option value="L">L</option>
                          <option value="E">E</option>
                          <option value="A">A</option>
                        </select>
                      </td>
                    ))}
  
                    <td></td>
  
                    <td>{Atotals.P}</td> {/* Present count */}
                    <td>{Atotals.L}</td> {/* Late count */}
                    <td>{Atotals.E}</td> {/* Excused count */}
                    <td>{Atotals.A}</td> {/* Absent count */}
  
                    {/* Check if any attendance status is 'Select' for all dates */}
                    <td>
                      {Object.values(finalsAttendanceData[student.id] || {}).every(
                        (attendance) => attendance.status === 'Select'
                      )
                        ? 0  // Set points to 0 if all statuses are 'Select'
                        : points.toFixed(2)}  {/* Otherwise, display the points */}
                    </td>

                    <td>
                      {Object.values(finalsAttendanceData[student.id] || {}).every(
                        (attendance) => attendance.status === 'Select'
                      )
                        ? '0.00 %'  // If all are 'Select', attendance is 0%
                        : isNaN(Number(finalsAttendancePercentageScore)) || finalsAttendancePercentageScore === null
                        ? '0.00 %'
                        : `${Number(finalsAttendancePercentageScore).toFixed(2)} %`}
                    </td>

                      
  

                    {/* ASSIGNMENT COMPONENT: DEFINE finalsAssignmentScores IN INPUT */}
                    {finalsAssignmentColumns.map((_, assignmentIndex) => (
                      <td key={assignmentIndex}>
                        <input
                          type="number"
                          style={{
                            width: '70px',
                            borderColor:
                              finalsinvalidAssignmentScores[studentIndex]?.[assignmentIndex] ? 'red' : 'initial',
                            borderWidth:
                              finalsinvalidAssignmentScores[studentIndex]?.[assignmentIndex] ? '2px' : '1px',
                          }}
                          placeholder="Score"
                          value={finalsAssignmentScores[studentIndex]?.[assignmentIndex] || ''}
                          onChange={(e) => {
                            const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); // Treat empty input as null
                            handleFinalAssignmentScoreChange(studentIndex, assignmentIndex, inputScore);

                            // Show the red border in real-time for finals
                            if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                              setfinalsInvalidAssignmentScores((prevInvalid) => {
                                const updatedInvalid = [...prevInvalid];
                                if (!updatedInvalid[studentIndex]) {
                                  updatedInvalid[studentIndex] = {};
                                }
                                updatedInvalid[studentIndex][assignmentIndex] = true; // Mark as invalid
                                return updatedInvalid;
                              });
                            }
                          }}
                          onBlur={(e) => {
                            const inputScore = parseFloat(e.target.value);

                            // Trigger toast only when input is invalid and not empty for finals
                            if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                              toast.error(`Score must be between 50 and 100 for Assignment ${assignmentIndex + 1}`);
                            }
                          }}
                        />
                      </td>
                    ))}

                    <td></td>
                    <td>{calculateFinalsAssignmentColumnAverage(student.id)}%</td> 
                    <td>
                      {(() => {
                        const assignmentScore = calculateFinalsAssignmentComponentScore(student.id, finalsAssignmentPercentage);
                        return isNaN(Number(assignmentScore)) || assignmentScore === null
                          ? '0.00%'
                          : `${Number(assignmentScore).toFixed(2)}%`;
                      })()}
                    </td>

    
                    {finalsQuizColumns.map((_, quizIndex) => (
                      <td key={quizIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={finalsQuizScores[studentIndex]?.[quizIndex] || ''} 
                          onChange={(e) => {
                            const inputScore = parseFloat(e.target.value) || 0;
                            handleFinalsQuizScoreChange(studentIndex, quizIndex, inputScore);
                          }}
                        />

                      </td>
                    ))}

                    <td></td>
                    <td>
                      
                      {finalsQuizScores[studentIndex]?.every(score => score === 0 || score === undefined) 
                        ? '0.00%'  // If no scores are inputted, show 0%
                        : isNaN(Number(calculateFinalsQuizTotalScore(studentIndex))) || calculateFinalsQuizTotalScore(studentIndex) === null
                        ? '0.00%'  // If the total score is invalid or null, show 0%
                        : `${Number(calculateFinalsQuizTotalScore(studentIndex)).toFixed(2)}%`}  {/* Display total score */}
                    </td>
                    <td>
                      {/* Check if there are no quiz scores for this student */}
                      {finalsQuizScores[studentIndex]?.every(score => score === 0 || score === undefined) 
                        ? '0.00%'  // If no scores are inputted, show 0%
                        : isNaN(Number(calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage))) || 
                          calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage) === null
                        ? '0.00%'  // If the component score is invalid or null, show 0%
                        : `${Number(calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage)).toFixed(2)}%`}  {/* Display component score */}
                    </td>

                    {/* RECITATION COMPONENT: DEFINE midtermRecitationScores IN INPUT */}
                    {finalsRecitationColumns.map((_, recitationIndex) => (
                    <td key={recitationIndex}>
                      <input
                        type="number"
                        style={{
                          width: '70px',
                          borderColor:
                            finalsinvalidRecitationScores[studentIndex]?.[recitationIndex] ? 'red' : 'initial',
                          borderWidth:
                            finalsinvalidRecitationScores[studentIndex]?.[recitationIndex] ? '2px' : '1px',
                        }}
                        placeholder="Score"
                        value={finalsRecitationScores[studentIndex]?.[recitationIndex] || ''}
                        onChange={(e) => {
                          const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); // Treat empty input as null
                          handleFinalsRecitationScoreChange(studentIndex, recitationIndex, inputScore);

                          // Show the red border in real-time
                          if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                            setfinalsInvalidRecitationScores((prevInvalid) => {
                              const updatedInvalid = [...prevInvalid];
                              if (!updatedInvalid[studentIndex]) {
                                updatedInvalid[studentIndex] = {};
                              }
                              updatedInvalid[studentIndex][recitationIndex] = true; // Mark as invalid
                              return updatedInvalid;
                            });
                          }
                        }}
                        onBlur={(e) => {
                          const inputScore = parseFloat(e.target.value);

                          // Trigger toast only when input is invalid and not empty
                          if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                            toast.error(`Score must be between 50 and 100 for Recitation ${recitationIndex + 1}`);
                          }
                        }}
                      />
                    </td>
                  ))}
                  <td></td>
                  <td>{calculateFinalsRecitationColumnAverage(student.id)}%</td>
                  <td>
                    {(() => {
                      const recitationScore = calculateFinalsRecitationComponentScore(student.id, finalsRecitationPercentage);
                      return isNaN(Number(recitationScore)) || recitationScore === null
                        ? '0.00%'
                        : `${Number(recitationScore).toFixed(2)}%`;
                    })()}
                  </td>

                    {/* CLASS STANDING TOTAL: ATTENDANCE + ASSIGN + QUIZSEAT + RECITATION */}
                    <td>
                    {(() => {
                      // Get all the relevant values for the class standing components (attendance, assignments, quizzes, recitation)
                      const totalAttendance = Atotals.P + Atotals.L + Atotals.E + Atotals.A; // Example for attendance
                      const totalAssignment = finalsAssignmentScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for assignments
                      const totalQuiz = finalsQuizScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for quizzes
                      const totalRecitation = finalsRecitationScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for recitation

                      // Check if all fields are 0 or missing
                      const isAllZero = totalAttendance === 0 && totalAssignment === 0 && totalQuiz === 0 && totalRecitation === 0;

                      // If all fields are 0 or missing, don't compute and show '0.00%'
                      if (isAllZero) {
                        return '0.00%';
                      }

                      // Otherwise, compute the total class standing grade
                      const totalCSGrade = calculateTotalFinalsCSGrade(studentIndex);

                      // Return the computed grade, or '0.00%' if invalid
                      return totalCSGrade || '0.00%';
                    })()}
                  </td>      

                  {finalsPBAColumns.map((_, pbaIndex) => (
                  <td key={pbaIndex}>
                    <input
                      type="number"
                      style={{
                        width: '70px',
                        borderColor:
                          finalsinvalidPBAScores[studentIndex]?.[pbaIndex] ? 'red' : 'initial',
                        borderWidth:
                          finalsinvalidPBAScores[studentIndex]?.[pbaIndex] ? '2px' : '1px',
                      }}
                      placeholder="Score"
                      value={finalsPBAGradeScores[studentIndex]?.[pbaIndex] || ''}
                      onChange={(e) => {
                        const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); // Treat empty input as null
                        handleFinalsPBAScoreChange(studentIndex, pbaIndex, inputScore);

                      
                        if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                          setfinalsInvalidPBAScores((prevInvalid) => {
                            const updatedInvalid = [...prevInvalid];
                            if (!updatedInvalid[studentIndex]) {
                              updatedInvalid[studentIndex] = {};
                            }
                            updatedInvalid[studentIndex][pbaIndex] = true; 
                            return updatedInvalid;
                          });
                        }
                      }}
                      onBlur={(e) => {
                        const inputScore = parseFloat(e.target.value);

                     
                        if (inputScore !== null && (inputScore < 50 || inputScore > 100)) {
                          toast.error(`Score must be between 50 and 100 for PBA ${pbaIndex + 1}`);
                        }
                      }}
                    />
                  </td>
                ))}

                  <td></td>
                  <td>{total.toFixed(2)}</td> {/* This should display the correct average */}
                  <td>
                    {(() => {
                      const formattedPbaGrade = isNaN(Number(pbaGrade)) || pbaGrade === null
                        ? '0.00'
                        : Number(pbaGrade).toFixed(2);
                      return formattedPbaGrade;
                    })()}
                  </td>

                    {/*FINALS EXAM COMPONENT*/}
                  <td>
                    <input
                      type="number"
                      value={score || ''}  // Ensure score is either the current value or an empty string
                      onChange={(e) => handleFinalsExamScoreChange(student.id, parseFloat(e.target.value) || '')}  // Avoid defaulting to 0
                      style={{ width: '70px' }}
                      placeholder="Score"
                    />

                  </td>
                  <td>{isNaN(percentage) ? '0.00' : percentage.toFixed(2)}%</td>
                  <td>
                    {isNaN(Number(weightedScore)) || weightedScore === null
                      ? '0.00%'
                      : `${Number(weightedScore).toFixed(2)}%`}
                  </td>
  
                    {/*MIDTERM GRADE: CLASS STANDING + PBA + MIDTERM EXAM*/}
                    <td>
                      {isNaN(Number(calculateFinalsGrade(studentIndex))) || calculateFinalsGrade(studentIndex) === null
                        ? '0.00'
                        : Number(calculateFinalsGrade(studentIndex)).toFixed(2)}
                    </td>
                    <td><center>{numEq}</center></td>
  
                      {/*REMARKS DROP-DOWN*/}
                      <td>
                        <select
                          value={remarks[student.id] || autoRemarks} // Use manual selection or default to auto-calculated remarks
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        >
                          <option value="Select">Select</option>
                          <option value="PASSED">PASSED</option>
                          <option value="FAILED">FAILED</option>
                          <option value="OD">OD</option>
                          <option value="UD">UD</option>
                          <option value="INC">INC</option>
                          <option value="NC">NC</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
          );
  
      

          case 'summary':
            return (
              <table className="details-table">
                <thead>
                  <tr>
                    <th rowSpan="2">Student No</th>
                    <th rowSpan="2">Student Name</th>
                    <th colSpan="4">Midterm 40%</th>
                    <th colSpan="4">Finals 60%</th>
                    <th rowSpan="2">Semestral Grade</th>
                    <th rowSpan="2">Numerical Equivalent</th>
                    <th rowSpan="2">Remarks</th>
                  </tr>
                  <tr>
                    <th>Class Standing {calculateTotalMidtermCSPercentage()}%</th> {/* working */}
                    <th>Performance Based Assessment {midtermPBAGradePercentage}%</th> {/* working */}
                    <th>Midterm Exam {calculateMidtermPercentage()}%</th>
                    <th>Midterm Grade</th>
                    <th>Class Standing {calculateTotalFinalsCSPercentage()}%</th> {/* working */}
                    <th>Performance Based Assessment {finalsPBAGradePercentage}%</th>
                    <th>Final Exam {calculateFinalPercentage()}%</th>
                    <th>Final Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, studentIndex) => (
                    <tr key={student.id} >
                      <td>{student.studentNumber || 'Guest'}</td>
                      <td>
                        {`${student.studentNameLast || ''}, ${student.studentNameFirst || ''} ${student.studentNameMiddle || ''}`}
                      </td>

                      <td>
                        {isNaN(Number(calculateTotalMidtermCSGrade(studentIndex))) || calculateTotalMidtermCSGrade(studentIndex) === null || calculateTotalMidtermCSGrade(studentIndex) === 0
                          ? ''
                          : `${Number(calculateTotalMidtermCSGrade(studentIndex)).toFixed(2)}%`}
                      </td>
                      <td>
                        {(() => {
                          const pbaGrade = calculateTotalsAndPBA(midtermPBAGradeScores[studentIndex], midtermPBAGradePercentage).pbaGrade;
                          return isNaN(Number(pbaGrade)) || pbaGrade === null || pbaGrade === 0 ? '' : `${Number(pbaGrade).toFixed(2)}`;
                        })()}
                      </td>
                      <td>
                        {isNaN(Number(calculateMidtermWeightedScore(calculateMidtermPercentage(midtermExamScores[student.id])))) || 
                        calculateMidtermWeightedScore(calculateMidtermPercentage(midtermExamScores[student.id])) === null
                          ? ''
                          : `${Number(calculateMidtermWeightedScore(calculateMidtermPercentage(midtermExamScores[student.id]))).toFixed(2)}`}
                      </td>
                      <td>
                        {isNaN(Number(calculateMidtermGrade(studentIndex))) || calculateMidtermGrade(studentIndex) === null || calculateMidtermGrade(studentIndex) === 0
                          ? ''
                          : `${Number(calculateMidtermGrade(studentIndex)).toFixed(2)}`}
                      </td>
                      <td>
                        {isNaN(Number(calculateTotalFinalsCSGrade(studentIndex))) || calculateTotalFinalsCSGrade(studentIndex) === null || calculateTotalFinalsCSGrade(studentIndex) === 0
                          ? ''
                          : `${Number(calculateTotalFinalsCSGrade(studentIndex)).toFixed(2)}%`}
                      </td>
                      <td>
                        {(() => {
                          const pbaGrade = calculateTotalsAndPBA(finalsPBAGradeScores[studentIndex], finalsPBAGradePercentage).pbaGrade;
                          return isNaN(Number(pbaGrade)) || pbaGrade === null || pbaGrade === 0 ? '' : `${Number(pbaGrade).toFixed(2)}`;
                        })()}
                      </td>
                      <td>
                        {isNaN(Number(calculateFinalWeightedScore(calculateFinalPercentage(finalsExamScores[student.id])))) || 
                        calculateFinalWeightedScore(calculateFinalPercentage(finalsExamScores[student.id])) === null
                          ? ''
                          : `${Number(calculateFinalWeightedScore(calculateFinalPercentage(finalsExamScores[student.id]))).toFixed(2)}`}
                      </td>
                      <td>
                        {isNaN(Number(calculateFinalsGrade(studentIndex))) || calculateFinalsGrade(studentIndex) === null || calculateFinalsGrade(studentIndex) === 0
                          ? ''
                          : `${Number(calculateFinalsGrade(studentIndex)).toFixed(2)}`}
                      </td>
                      <td>
                        {isNaN(Number(calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)))) || 
                        calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)) === null || 
                        calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)) === 0
                          ? ''
                          : `${Number(calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex))).toFixed(2)}`}
                      </td>
                      <td>
                        {(() => {
                          const { numEq } = getSemestralNumericalEquivalentAndRemarks(
                            student.id,
                            calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                            MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                          );
                          return isNaN(Number(numEq)) || numEq === null || numEq === 0 ? '' : numEq;
                        })()}
                      </td>
                      <td>
                        {(() => {
                          const { remarks } = getSemestralNumericalEquivalentAndRemarks(
                            student.id,
                            calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                            MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                          );
                          return remarks || '';
                        })()}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            );

        
            case 'gradeSheet':
              return (
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Student No</th>
                      <th>Student Name</th>
                      <th>Midterm Grade 40%</th>
                      <th>Final Grade 60%</th>
                      <th>Semestral Grade</th>
                      <th>Numerical Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, studentIndex) => (
                      <tr key={student.id}>
                    <td>{student.studentNumber || 'Guest'}</td>
                    <td>
                      {student.studentNameLast || ''}, {student.studentNameFirst || ''} {student.studentNameMiddle || ''}
                    </td>

                    {/* Midterm Grade */}
                    <td>
                      {isNaN(Number(calculateMidtermGrade(studentIndex))) || calculateMidtermGrade(studentIndex) === null || calculateMidtermGrade(studentIndex) === 0
                        ? ''
                        : `${Number(calculateMidtermGrade(studentIndex)).toFixed(2)}`}
                    </td>

                    {/* Final Grade */}
                    <td>
                      {isNaN(Number(calculateFinalsGrade(studentIndex))) || calculateFinalsGrade(studentIndex) === null || calculateFinalsGrade(studentIndex) === 0
                        ? ''
                        : `${Number(calculateFinalsGrade(studentIndex)).toFixed(2)}`}
                    </td>

                    {/* Semestral Grade */}
                    <td>
                      {isNaN(Number(calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)))) || 
                      calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)) === null || 
                      calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)) === 0
                        ? ''
                        : `${Number(calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex))).toFixed(2)}`}
                    </td>

                    {/* Numerical Grade */}
                    <td>
                      {(() => {
                        const { numEq } = getSemestralNumericalEquivalentAndRemarks(
                          student.id,
                          calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                          MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                        );
                        return isNaN(Number(numEq)) || numEq === null || numEq === 0 ? '' : numEq;
                      })()}
                    </td>

                    {/* Remarks */}
                    <td>
                      {(() => {
                        const { remarks } = getSemestralNumericalEquivalentAndRemarks(
                          student.id,
                          calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                          MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                        );
                        return remarks || '';
                      })()}
                    </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            
        default:
          return <p>Please select a period.</p>;
      }
    };

    return (
      <div className="class-details">
        <div
          className="buttons-container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Left Section: Period Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`period-button ${selectedPeriod === 'midterm' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('midterm')}
            >
              Midterm
            </button>
            <button
              className={`period-button ${selectedPeriod === 'finals' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('finals')}
            >
              Finals
            </button>
            <button
              className={`period-button ${selectedPeriod === 'summary' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('summary')}
            >
              Summary
            </button>
            <button
              className={`period-button ${selectedPeriod === 'gradeSheet' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('gradeSheet')}
            >
              Grade Sheet
            </button>
          </div>
    
          {/* Right Section: Menu Dropdown */}
          <div>
          <Dropdown className="custom-dropdown">
            <Dropdown.Toggle
              variant="link"
              id="dropdown-basic"
              style={{
                background: 'none',
                border: 'none',
                color: '#004d00',
              }}
            >
              <FontAwesomeIcon icon={faBars} size="lg" />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {selectedPeriod === 'midterm' || selectedPeriod === 'finals' ? (
                <>
                  <Dropdown.Item onClick={handleImport}>IMPORT</Dropdown.Item>
                  <Dropdown.Item onClick={handleExport}>EXPORT</Dropdown.Item>
                </>
              ) : selectedPeriod === 'summary' || selectedPeriod === 'gradeSheet' ? (
                <>
                  <Dropdown.Item onClick={handleExport}>EXPORT</Dropdown.Item>
                  <Dropdown.Item onClick={handlePrint}>PRINT</Dropdown.Item>
                </>
              ) : null}
            </Dropdown.Menu>
          </Dropdown>
          </div>
        </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
      <div className="table-container">
        {renderTableContent()}
      </div>

      {/* Button Container */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button
          className="submit-button"
          style={{
            backgroundColor: '#004d00',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
          onClick={handleSubmit} // Attach handler for Submit
        >
          SUBMIT
        </button>
        <button
          className="post-button"
          style={{
            backgroundColor: '#508D4E',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
            marginLeft: '10px',
          }}
          onClick={handlePost} // Attach handler for Post
        >
          POST
        </button>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClassDetails;
