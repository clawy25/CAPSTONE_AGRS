import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'; // Import minus icon
import '../StudentComponents/Dashboard.css';
import DatePicker from 'react-datepicker';
import StudentModel from '../ReactModels/StudentModel';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // Import menu icon
import { Dropdown } from 'react-bootstrap'; // Import Bootstrap for dropdown
import { Modal, Button } from 'react-bootstrap';


const ClassDetails = () => {

  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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
  

  {/* SEARCH BAR DECLARATION */}
  const [selectedPeriod, setSelectedPeriod] = useState('midterm');
  const [searchTerm, setSearchTerm] = useState('');


  {/* FOR MIDTERMS */}

  {/* ATTENDANCE DECLARATION */}
  const [midtermAttendanceColumns, setmidtermAttendanceColumns] = useState([{ id: 1, date: new Date() }]);
  const [midtermTotalAttendanceDays, setmidtermTotalAttendanceDays] = useState(0);
  const [midtermAttendanceData, setmidtermAttendanceData] = useState([]);
  const [midtermAttendancePercentage, setmidtermAttendancePercentage] = useState(5);

  {/* ASSIGNMENT DECLARATION */}
  const [midtermAssignmentColumns, setmidtermAssignmentColumns] = useState([]);
  const [midtermAssignmentScores, setmidtermAssignmentScores] = useState([]);
  const [midtermAssignmentPercentage, setmidtermAssignmentPercentage] = useState(10); // Default to 10%

  // QUIZZES DECLARATION
  const [midtermQuizColumns, setmidtermQuizColumns] = useState([]); // Initialize quiz columns
  const [midtermQuizScores, setmidtermQuizScores] = useState([]); // Scores for each quiz
  const [midtermQuizMaxScores, setmidtermQuizMaxScores] = useState([]); // Maximum scores for each quiz
  const [midtermQuizPercentage, setmidtermQuizPercentage] = useState(20);

  {/* RECITATION DECLARATION */}
  const [midtermRecitationColumns, setmidtermRecitationColumns] = useState([]);
  const [midtermRecitationScores, setmidtermRecitationScores] = useState([]);
  const [midtermRecitationPercentage, setmidtermRecitationPercentage] = useState(15);

   // PBA Declaration
   const [midtermPBAColumns, setmidtermPBAColumns] = useState([]);
   const [midtermPBAGradeScores, setmidtermPBAGradeScores] = useState([]);  // Store scores for each PBA column per student
   const [midtermPBAGradePercentage, setmidtermPBAGradePercentage] = useState(20);
  
  // MIDTERM EXAM DECLARATION
  const [midtermExamScores, setMidtermExamScores] = useState({});
  const [midtermExamPercentage, setMidtermExamPercentage] = useState(30);
  const [midtermTotalItems, setmidtermTotalItems] = useState(50); // Default total number of items is 100

  //REMARKS
  const [remarks, setRemarks] = useState({});

  {/*FOR FINALS*/}

  {/* ATTENDANCE DECLARATION */}
  const [finalsAttendanceColumns, setfinalsAttendanceColumns] = useState([{ id: 1, date: new Date() }]);
  const [finalsTotalAttendanceDays, setfinalsTotalAttendanceDays] = useState(0);
  const [finalsAttendanceData, setfinalsAttendanceData] = useState([]);
  const [finalsAttendancePercentage, setfinalsAttendancePercentage] = useState(5); // Default value of 0

  {/* ASSIGNMENT DECLARATION */}
  const [finalsAssignmentColumns, setfinalsAssignmentColumns] = useState([]);
  const [finalsAssignmentScores, setfinalsAssignmentScores] = useState([]);
  const [finalsAssignmentPercentage, setfinalsAssignmentPercentage] = useState(10); // Default to 5%

  {/* QUIZZES DECLARATION */}
  const [finalsQuizColumns, setfinalsQuizColumns] = useState([]); // Initialize quiz columns
  const [finalsQuizScores, setfinalsQuizScores] = useState(
    students.map(() => Array(finalsQuizColumns.length).fill(0))
  );
  const [finalsQuizMaxScores, setfinalsQuizMaxScores] = useState([]);
  const [finalsQuizPercentage, setfinalsQuizPercentage] = useState(20);

  {/* RECITATION DECLARATION */}
  const [finalsRecitationColumns, setfinalsRecitationColumns] = useState([]);
  const [finalsRecitationScores, setfinalsRecitationScores] = useState([]);
  const [finalsRecitationPercentage, setfinalsRecitationPercentage] = useState(15);

  {/* PBA DECLARATION */}
  const [finalsPBAColumns, setfinalsPBAColumns] = useState([]);
  const [finalsPBAGradeScores, setfinalsPBAGradeScores] = useState([]);
  const [finalsPBAGradePercentage, setfinalsPBAGradePercentage] = useState(20);

  {/* FINAL EXAM DECLARATION */}
  const [finalsExamScores, setfinalsExamScores] = useState([]);
  const [finalsExamPercentage, setfinalsExamPercentage] = useState(30);
  const [finalsTotalItems, setfinalsTotalItems] = useState(50);



  // Fetch existing students from StudentModel
  const fetchExistingStudents = async () => {
    try {
        const existingStudents = await StudentModel.fetchExistingStudents();
        
        // Modify student.id to start from 0, 1, 2, etc.
        const studentsWithModifiedIds = existingStudents.map((student, index) => ({
            ...student, // Keep the existing student data
            id: index   // Overwrite the id with the new index
        }));

        setStudents(studentsWithModifiedIds);
    } catch (error) {
        console.error('Error fetching existing students:', error);
    }
  };
  
  // Fetch existing students onload
  useEffect(() => {fetchExistingStudents();}, []);

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

  {/*SELECT FOR PERIOD (SWITCH CASES)*/}
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  {/*ATTENDANCE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermAttendanceChange = (studentId, dateIndex, status) => {
    setmidtermAttendanceData((prevData) => {
      const studentAttendance = prevData[studentId] || [];
      const updatedAttendance = [...studentAttendance];

      updatedAttendance[dateIndex] = { date: new Date().toISOString().split('T')[0], status };

      return {
        ...prevData,
        [studentId]: updatedAttendance,
      };
    });
  };
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

  {/* ASSIGNMENTS SCORES FOR BOTH PERIOD (COMPLETE) */}
  const handleMidtermAssignmentScoreChange = (studentId, assignmentIndex, score) => {
    setmidtermAssignmentScores(prevScores => {
      const updatedScores = [...prevScores]; // Create a shallow copy of the array
      if (!updatedScores[studentId]) {
        updatedScores[studentId] = []; // Initialize an array for this student if it doesn't exist
      }
      updatedScores[studentId][assignmentIndex] = score; // Update the score for the student and assignment
      return updatedScores;
    });
  };

  // ASSIGNMENT SCORES FOR FINALS PERIOD
  const handleFinalAssignmentScoreChange = (studentId, assignmentIndex, score) => {
    setfinalsAssignmentScores(prevScores => {
      const updatedScores = [...prevScores]; // Create a shallow copy of the array
      if (!updatedScores[studentId]) {
        updatedScores[studentId] = []; // Initialize an array for this student if it doesn't exist
      }
      updatedScores[studentId][assignmentIndex] = score; // Update the score for the student and assignment
      return updatedScores;
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
    setmidtermQuizScores(prevScores =>
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
    setfinalsQuizScores(prevScores =>
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
  const handleMidtermRecitationScoreChange = (studentId, recitationIndex, score) => {
    setmidtermRecitationScores(prevScores => {
      const updatedScores = [...prevScores];
      if (!updatedScores[studentId]) {
        updatedScores[studentId] = [];
      }
      updatedScores[studentId][recitationIndex] = score;
      return updatedScores;
    });
  };
  const handleFinalsRecitationScoreChange = (studentId, recitationIndex, score) => {
    setfinalsRecitationScores(prevScores => {
      const updatedScores = [...prevScores];
      if (!updatedScores[studentId]) {
        updatedScores[studentId] = [];
      }
      updatedScores[studentId][recitationIndex] = score;
      return updatedScores;
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
  const calculateTotalMidtermCSGrade = (studentIndex) => {
    // Calculate attendance score percentage (out of 100 based on Attendance score)
    const attendanceScore = getMidtermAttendanceTotals(studentIndex).points; // Get points from Attendance calculation
    const attendanceComponent = (attendanceScore / 100) * midtermAttendancePercentage;
  
    // Calculate assignment score percentage
    const assignmentScore = calculateMidtermAssignmentComponentScore(studentIndex, midtermAssignmentPercentage);
  
    // Calculate quiz score percentage
    const quizScore = calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage);
  
    // Calculate recitation score percentage
    const recitationScore = calculateMidtermRecitationComponentScore(studentIndex, midtermRecitationPercentage);
  
    // Total CS Grade as the sum of all components
    const totalCSGrade = attendanceComponent + 
                         parseFloat(assignmentScore) + 
                         parseFloat(quizScore) + 
                         parseFloat(recitationScore);
  
    return totalCSGrade.toFixed(2); // Return the total percentage, formatted to 2 decimal places
  };
  const calculateTotalMidtermCSPercentage = () => {
    // Calculate the total of the inputted percentages
    const totalCSPercentage = 
      parseFloat(midtermAttendancePercentage || 0) + 
      parseFloat(midtermAssignmentPercentage || 0) + 
      parseFloat(midtermQuizPercentage || 0) + 
      parseFloat(midtermRecitationPercentage || 0);
  
    return totalCSPercentage.toFixed(); // Format to 2 decimal places
  };
  
  //CLASS STANDING FOR FINALS
   // Function to calculate total CS Grade based on user-defined percentages
  const calculateTotalFinalsCSGrade = (studentIndex) => {
    // Calculate attendance score percentage (out of 100 based on Attendance score)
    const attendanceScore = getFinalsAttendanceTotals(studentIndex).points; // Get points from Attendance calculation
    const attendanceComponent = (attendanceScore / 100) * finalsAttendancePercentage;
  
    // Calculate assignment score percentage
    const assignmentScore = calculateFinalsAssignmentComponentScore(studentIndex, finalsAssignmentPercentage);
  
    // Calculate quiz score percentage
    const quizScore = calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage);
  
    // Calculate recitation score percentage
    const recitationScore = calculateFinalsRecitationComponentScore(studentIndex, finalsRecitationPercentage);
  
    // Total CS Grade as the sum of all components
    const totalCSGrade = attendanceComponent + 
                         parseFloat(assignmentScore) + 
                         parseFloat(quizScore) + 
                         parseFloat(recitationScore);
  
    return totalCSGrade.toFixed(2); // Return the total percentage, formatted to 2 decimal places
  };
  const calculateTotalFinalsCSPercentage = () => {
    // Calculate the total of the inputted percentages
    const totalCSPercentage = 
      parseFloat(finalsAttendancePercentage || 0) + 
      parseFloat(finalsAssignmentPercentage || 0) + 
      parseFloat(finalsQuizPercentage || 0) + 
      parseFloat(finalsRecitationPercentage || 0);
  
    return totalCSPercentage.toFixed(); // Format to 2 decimal places
  };
  
    {/* PBA */}
      // Handle PBA score change with validation for scores between 50-100
    const handleMidtermPBAScoreChange = (studentIndex, scoreIndex, newScore) => {
      setmidtermPBAGradeScores(prevScores => {
        // Copy the current scores array
        const updatedScores = [...prevScores];
    
        // Initialize the student's scores array if not already present
        if (!Array.isArray(updatedScores[studentIndex])) {
          updatedScores[studentIndex] = [];
        }
    
        // Ensure that the student's scores array has enough slots for all quizzes
        while (updatedScores[studentIndex].length <= scoreIndex) {
          updatedScores[studentIndex].push(0); // Initialize missing quizzes with a default score of 0
        }
    
        // Update the specific quiz score
        updatedScores[studentIndex][scoreIndex] = newScore;
    
        return updatedScores;
      });
  };
  const handleFinalsPBAScoreChange = (studentIndex, scoreIndex, newScore) => {
    setfinalsPBAGradeScores(prevScores => {
      // Copy the current scores array
      const updatedScores = [...prevScores];
  
      // Initialize the student's scores array if not already present
      if (!Array.isArray(updatedScores[studentIndex])) {
        updatedScores[studentIndex] = [];
      }
  
      // Ensure that the student's scores array has enough slots for all quizzes
      while (updatedScores[studentIndex].length <= scoreIndex) {
        updatedScores[studentIndex].push(0); // Initialize missing quizzes with a default score of 0
      }
  
      // Update the specific quiz score
      updatedScores[studentIndex][scoreIndex] = newScore;
  
      return updatedScores;
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
    setMidtermExamScores((prevScores) => ({
      ...prevScores,
      [studentId]: score,
    }));
  };
  const handleFinalsExamScoreChange = (studentId, score) => {
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
    // 1. Calculate the CS Grade
    const csGrade = parseFloat(calculateTotalMidtermCSGrade(studentIndex)) || 0;
  
    // 2. Calculate the PBA Grade (Performance-Based Assessment)
    const pbaScores = midtermPBAGradeScores[studentIndex] || [];
    const { pbaGrade } = calculateTotalsAndPBA(pbaScores, midtermPBAGradePercentage);
    
    // 3. Calculate the Midterm Exam score (using the midterm exam percentage)
    const midtermExamScore = midtermExamScores[students[studentIndex].id] || 0;
    const midtermExamPercentageScore = calculateMidtermPercentage(midtermExamScore); // Adjust the score into percentage
    const weightedMidtermExamScore = (midtermExamPercentageScore * midtermExamPercentage) / 100; // Weighted by midterm exam percentage
  
    // 4. Calculate the total Midterm Grade
    const totalMidtermGrade = csGrade + parseFloat(pbaGrade) + parseFloat(weightedMidtermExamScore);
      
    //Erra: I'm trying to integrate a toast message that can indicate that the grade exceeds 100 but it's not functional yet. Maybe di ko pa lang din nalinaw yung logic niya kaya di ko pa mapagana
      if (totalMidtermGrade > 100) {
        console.log("Toast Warning Triggered"); // For debugging
        toast.warning("Grade cannot exceed 100. Kindly check your component percent allotment.");
    }
      
      const cappedTotal = Math.min(100, totalMidtermGrade); // Cap at 100
      return cappedTotal.toFixed(2); // Return the capped total formatted to 2 decimal places
    };

  //FINAL GRADE
  const calculateFinalsGrade = (studentIndex) => {
    // 1. Calculate the CS Grade
    const csGrade = parseFloat(calculateTotalFinalsCSGrade(studentIndex)) || 0;
  
    // 2. Calculate the PBA Grade (Performance-Based Assessment)
    const pbaScores = finalsPBAGradeScores[studentIndex] || [];
    const { pbaGrade } = calculateTotalsAndPBA(pbaScores, finalsPBAGradePercentage);
    
    // 3. Calculate the Midterm Exam score (using the midterm exam percentage)
    const finalsExamScore = finalsExamScores[students[studentIndex].id] || 0;
    const finalsExamPercentageScore = calculateFinalPercentage(finalsExamScore); // Adjust the score into percentage
    const weightedFinalsExamScore = (finalsExamPercentageScore * finalsExamPercentage) / 100; // Weighted by midterm exam percentage
  
    // 4. Calculate the total Midterm Grade
    const totalFinalsGrade = csGrade + parseFloat(pbaGrade) + parseFloat(weightedFinalsExamScore);
  
    return totalFinalsGrade.toFixed(2); // Return the total midterm grade formatted to 2 decimal places
  };


  //NUMERICAL EQUIVALENT AND REMARKS FOR MIDTERM
  const getMidtermNumericalEquivalentAndRemarks = (studentId, grade, studentIndex) => {
    // If there's a manual selection for the student, return the selected remark
    if (remarks[studentId]) {
      return { numEq: "-", remarks: remarks[studentId] };
    }
  
    // If any component has blank scores, return INC for remarks
    if (MidtermhasBlankScores(studentIndex)) {
      return { numEq: "-", remarks: "INC" };
    }
  
    // Otherwise, calculate based on the grade
    if (grade >= 99 && grade <= 100) return { numEq: (1.00).toFixed(2), remarks: "PASSED" };
    if (grade >= 96 && grade < 99) return { numEq: (1.25).toFixed(2), remarks: "PASSED" };
    if (grade >= 93 && grade < 96) return { numEq: (1.50).toFixed(2), remarks: "PASSED" };
    if (grade >= 90 && grade < 93) return { numEq: (1.75).toFixed(2), remarks: "PASSED" };
    if (grade >= 87 && grade < 90) return { numEq: (2.00).toFixed(2), remarks: "PASSED" };
    if (grade >= 84 && grade < 87) return { numEq: (2.25).toFixed(2), remarks: "PASSED" };
    if (grade >= 81 && grade < 84) return { numEq: (2.50).toFixed(2), remarks: "PASSED" };
    if (grade >= 78 && grade < 81) return { numEq: (2.75).toFixed(2), remarks: "PASSED" };
    if (grade >= 75 && grade < 78) return { numEq: (3.00).toFixed(2), remarks: "PASSED" };
    if (grade < 75) return { numEq: (5.00).toFixed(2), remarks: "FAILED" };
  
    return { numEq: "-", remarks: "-" };
  };
  //NUMERICAL EQUIVALENT AND REMARKS FOR FINALS
  const getFinalsNumericalEquivalentAndRemarks = (studentId, grade, studentIndex) => {
    // If there's a manual selection for the student, return the selected remark
    if (remarks[studentId]) {
      return { numEq: "-", remarks: remarks[studentId] };
    }
  
    // If any component has blank scores, return INC for remarks
    if (FinalshasBlankScores(studentIndex)) {
      return { numEq: "-", remarks: "INC" };
    }
  
    // Otherwise, calculate based on the grade
    if (grade >= 99 && grade <= 100) return { numEq: (1.00).toFixed(2), remarks: "PASSED" };
    if (grade >= 96 && grade < 99) return { numEq: (1.25).toFixed(2), remarks: "PASSED" };
    if (grade >= 93 && grade < 96) return { numEq: (1.50).toFixed(2), remarks: "PASSED" };
    if (grade >= 90 && grade < 93) return { numEq: (1.75).toFixed(2), remarks: "PASSED" };
    if (grade >= 87 && grade < 90) return { numEq: (2.00).toFixed(2), remarks: "PASSED" };
    if (grade >= 84 && grade < 87) return { numEq: (2.25).toFixed(2), remarks: "PASSED" };
    if (grade >= 81 && grade < 84) return { numEq: (2.50).toFixed(2), remarks: "PASSED" };
    if (grade >= 78 && grade < 81) return { numEq: (2.75).toFixed(2), remarks: "PASSED" };
    if (grade >= 75 && grade < 78) return { numEq: (3.00).toFixed(2), remarks: "PASSED" };
    if (grade < 75) return { numEq: (5.00).toFixed(2), remarks: "FAILED" };
  
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

    
  {/* MIDTERMS TAB */}
  const renderTableContent = () => {
    switch (selectedPeriod) {
      case 'midterm':
        return (
          <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
          <table className="details-table" >
            <thead>
              <tr>
              <th colSpan="2" style={{ position: 'sticky', left: 0, background: '#f4f4f4', zIndex: 3 }}>Student Info</th>
                <th colSpan={midtermAttendanceColumns.length + 7} >Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                <th colSpan={midtermAssignmentColumns.length + 3} rowSpan={3} style={{ padding: '60px' }} >Assignments</th>
                <th colSpan={midtermQuizColumns.length + 3} rowSpan={2}>Quizzes/Seatwork</th> 
                <th colSpan={midtermRecitationColumns.length + 3} rowSpan={3}>Recitation/Participation</th>
                <th colSpan="1" rowSpan="3">CS Grade</th>
                <th colSpan={midtermPBAColumns.length + 3} rowSpan={2}>Performance Based Assessment</th>
                <th colSpan="3" rowSpan="3">Midterm Exam</th>
                <th colSpan="1" rowSpan="3">Midterm Grade</th>
                <th colSpan="1" rowSpan="4">Numerical Equivalent</th>
                <th colSpan="1" rowSpan="4">Remarks</th>
              </tr>
              
              <tr>
              <th rowSpan={3} style={{ position: 'sticky',left: 0,top: 0,backgroundColor: '#f4f4f4',padding: '10px',zIndex: 4, borderRight: '2px solid #ccc', boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                Student No
              </th>
              <th rowSpan={3}style={{position: 'sticky',left: 82, top: 0,backgroundColor: '#f4f4f4',padding: '10px',zIndex: 4,borderLeft: '2px solid #ccc', boxShadow: '-1px 0 0 rgba(0, 0, 0, 0.1)',}}>
                Name
              </th>

                {midtermAttendanceColumns.map((column, index) => (
                <th key={index} rowSpan="3">
                  <DatePicker
                    selected={column.date}
                    onChange={(date) =>
                      setmidtermAttendanceColumns((prevColumns) =>
                        prevColumns.map((col, i) => (i === index ? { ...col, date } : col))
                      )
                    }
                    dateFormat="yyyy-MM-dd"
                  />
                  <button
                    onClick={() => removeColumn(index, setmidtermAttendanceColumns)}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                </th>
              ))}

              <th rowSpan="3" style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                <button onClick={() => addColumn(setmidtermAttendanceColumns)} style={{ background: 'none', border: 'none' }}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </th>

              <th colSpan="2">No of Days</th>
              <th colSpan="2">
                <input
                  type="text"
                  style={{ width: '60px', marginLeft: '10px' }}
                  value={midtermTotalAttendanceDays}
                  readOnly
                />
              </th>
              <th colSpan="2" rowSpan="2">Attendance</th>
            </tr>
            <tr>
              <th colSpan="4">Total Student Attendance</th>
                
                {/* Quiz Columns WITH REMOVE BUTTON */}
                {midtermQuizColumns.map((_, index) => (
                <th key={index} rowSpan={2}>
                  Q/S {index + 1}
                  <button onClick={() => removeQuizColumn(index)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <input
                    type="number"
                    value={midtermQuizMaxScores[index] || 0}
                    onChange={(e) => handleMidtermMaxScoreChange(index, parseFloat(e.target.value) || 0)}
                    style={{ width: '50px' }} // Adjust width as needed
                    placeholder="Max"
                  />
                </th>
              ))}

              <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                          <button onClick={addMidtermQuizColumn} style={{ background: 'none', border: 'none' }}>
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </th>
                    <th rowSpan={2}>Total</th>
                    <th rowSpan={2}>
                    <input
                    type="number"
                    value={midtermQuizPercentage}
                    onChange={(e) => setmidtermQuizPercentage(e.target.value)}
                    style={{ width: '60px' }}
                  />
                    %</th>
    
                  {/* PBA Columns */}
                  {midtermPBAColumns.map((_, index) => (
                    <th key={index}>
                      PBA {index + 1}
                      <button onClick={() => removeColumn(index, setmidtermPBAColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                    <button onClick={() => addColumn(setmidtermPBAColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th rowSpan={2}>Total</th>
                  <th>PBA Grade</th>
                </tr>
                <tr>
              <th colSpan="1">P</th>
              <th colSpan="1">L</th>
              <th colSpan="1">E</th>
              <th colSpan="1">A</th>
              <th colSpan="2">
                <input
                  type="number"
                  value={midtermAttendancePercentage}
                  onChange={(e) => setmidtermAttendancePercentage(e.target.value)}
                  style={{ width: '60px' }}
                />
                %</th>
    
                {/* Assignment Column Header */}
                {midtermAssignmentColumns.map((_, index) => (
                  <th key={index}>
                    Assignment {index + 1}
                    <button onClick={() => removeColumn(index, setmidtermAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setmidtermAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th>Total</th>
                {/* Use a `td` for the input field */}
                <th>
            <input
              type="number"
              value={midtermAssignmentPercentage}
              onChange={(e) => setmidtermAssignmentPercentage(e.target.value)}
              style={{ width: '60px' }}
            />%
          </th>
                {/* Recitation Columns */}
                {midtermRecitationColumns.map((_, index) => (
                  <th key={index}>
                    Recitation {index + 1}
                    <button onClick={() => removeColumn(index, setmidtermRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setmidtermRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th>Total</th>
                <th>
                <input
                type="number"
                value={midtermRecitationPercentage}
                onChange={(e) => setmidtermRecitationPercentage(e.target.value)}
                style={{ width: '60px' }}
              />
                %</th>
                <th>{calculateTotalMidtermCSPercentage()}%</th>
    
                {midtermPBAColumns.map((_, index) => (
                  <th key={index}>
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
    
                <th>
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
                <th>
                    <input
                      type="number"
                      value={midtermTotalItems}
                      onChange={(e) => setmidtermTotalItems(e.target.value)}
                      style={{ width: '60px' }}
                      placeholder="Items"
                    />
                          </th>
                  <th colSpan="2">
                    <input
                      type="number"
                      value={midtermExamPercentage}
                      onChange={(e) => setMidtermExamPercentage(e.target.value)}
                      style={{ width: '60px' }}
                      placeholder="%"
                    />
                    %</th>
              <th>Total</th>
    
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
              
              


                
                return (
                  <tr key={student.id}>
                    <td style={{ position: 'sticky',left: 0, backgroundColor: 'white',padding: '10px',zIndex: 3,borderRight: '2px solid #ccc',boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)',}}>
                      {student.studentNumber || 'Guest'}
                    </td>
                    <td style={{position: 'sticky',left: 82,backgroundColor: 'white',padding: '10px',zIndex: 3,borderLeft: '2px solid #ccc',boxShadow: '-1px 0 0 rgba(0, 0, 0, 0.1)',}}
                    >
                      {student.studentNameLast || ''}, {student.studentNameFirst || ''}{' '}{student.studentNameMiddle || ''}
                    </td>

                    {midtermAttendanceColumns.map((_, dateIndex) => (
                    <td key={dateIndex}>
                      <select
                        defaultValue={midtermAttendanceData[student.id]?.[dateIndex]?.status || 'Select'}
                        onChange={(e) => handleMidtermAttendanceChange(student.id, dateIndex, e.target.value)}
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

                  <td>{points.toFixed(2)}</td>
                  <td>{midtermAttendancePercentageScore} %</td>
                    

                    {/*ASSIGNMENT COMPONENT: DEFINE midtermAssignmentScores IN INPUT*/}
                    {midtermAssignmentColumns.map((_, assignmentIndex) => (
                      <td key={assignmentIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={midtermAssignmentScores[studentIndex]?.[assignmentIndex] || ''} // Set the value based on state
                          onChange={(e) => handleMidtermAssignmentScoreChange(studentIndex, assignmentIndex, parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateMidtermAssignmentColumnAverage(student.id)}%</td> {/* Display average directly */}
                    <td>{calculateMidtermAssignmentComponentScore(student.id, midtermAssignmentPercentage)}%</td>

                    {/*QUIZ COMPONENT: DEFINE midtermQuizScores IN INPUT*/}
                    {midtermQuizColumns.map((_, quizIndex) => (
                      <td key={quizIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={midtermQuizScores[studentIndex]?.[quizIndex] || ''} // Ensure that the input shows the current score
                          onChange={(e) => handleMidtermQuizScoreChange(studentIndex, quizIndex, parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateMidtermQuizTotalScore(studentIndex)}%</td> {/* Total Column */}
                    <td>{(calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage))}%</td>
                    
                    {/*RECITATION COMPONENT: DEFINE midtermRecitationScores IN INPUT*/}
                    {midtermRecitationColumns.map((_, index) => (
                      <td key={index}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score" 
                          value={midtermRecitationScores[studentIndex]?.[index] || ''}
                          onChange={(e) => handleMidtermRecitationScoreChange(studentIndex, index, parseFloat(e.target.value) || 0)}/>
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateMidtermRecitationColumnAverage(student.id)}%</td>
                    <td>{calculateMidtermRecitationComponentScore(student.id, midtermRecitationPercentage)}%</td>

                    {/*CLASS STANDING TOTAL: ATTENDANCE + ASSIGN + QUIZSEAT + RECITATION*/}
                    <td>{calculateTotalMidtermCSGrade(studentIndex)}%</td>
                    
                    {midtermPBAColumns.map((_, quizIndex) => (
                      <td key={quizIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={studentScores[quizIndex] !== undefined ? studentScores[quizIndex] : ''} // Display the score if it exists
                          onChange={(e) => handleMidtermPBAScoreChange(studentIndex, quizIndex, parseFloat(e.target.value) || 0)}
                          min="50"
                          max="100"
                        />
                      </td>
                    ))}
                    <td></td>
                    <td>{total.toFixed(2)}</td> {/* This should display the correct average */}
                    <td>{pbaGrade.toFixed(2)}</td> {/* This displays the PBA grade */}

                    {/*MIDTERMS EXAM COMPONENT*/}
                    <td>
                        <input
                          type="number"
                          value={score}
                          onChange={(e) => handleMidtermExamScoreChange(student.id, e.target.value)}
                          style={{ width: '70px' }}
                          placeholder="Score"
                        />
                      </td>
                      <td>{percentage.toFixed(2)}%</td>
                      <td>{weightedScore}%</td>

                    {/*MIDTERM GRADE: CLASS STANDING + PBA + MIDTERM EXAM*/}
                    <td>{calculateMidtermGrade(studentIndex)}</td>
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
        );

      case 'finals':
        return (
            <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
            <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                <th colSpan="2" style={{ position: 'sticky', left: 0, background: '#f4f4f4', zIndex: 3 }}>Student Info</th>
                  <th colSpan={finalsAttendanceColumns.length + 7}>Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                  <th colSpan={finalsAssignmentColumns.length + 3} rowSpan={3} style={{ padding: '60px' }} >Assignments</th>
                  <th colSpan={finalsQuizColumns.length + 3} rowSpan={2}>Quizzes/Seatwork</th> {/* New column header */}
                  <th colSpan={finalsRecitationColumns.length + 3} rowSpan={3}>Recitation/Participation</th>
                  <th colSpan="1" rowSpan="3">CS Grade</th>
                  <th colSpan={finalsPBAColumns.length + 3} rowSpan={2}>Performance Based Assessment</th>
                  <th colSpan="3" rowSpan="3">Final Exam</th>
                  <th colSpan="1" rowSpan="3">Final Grade</th>
                  <th colSpan="1" rowSpan="4">Numerical Equivalent</th>
                  <th colSpan="1" rowSpan="4">Remarks</th>
                </tr>
                
                <tr>
                <th rowSpan={3} style={{ position: 'sticky',left: 0,top: 0,backgroundColor: '#f4f4f4',padding: '10px',zIndex: 4, borderRight: '2px solid #ccc', boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                Student No
              </th>
              <th rowSpan={3}style={{position: 'sticky',left: 82, top: 0,backgroundColor: '#f4f4f4',padding: '10px',zIndex: 4,borderLeft: '2px solid #ccc', boxShadow: '-1px 0 0 rgba(0, 0, 0, 0.1)',}}>
                Name
              </th>

                  {finalsAttendanceColumns.map((column, index) => (
                  <th key={index} rowSpan="3">
                    <DatePicker
                      selected={column.date}
                      onChange={(date) =>
                        setfinalsAttendanceColumns((prevColumns) =>
                          prevColumns.map((col, i) => (i === index ? { ...col, date } : col))
                        )
                      }
                      dateFormat="yyyy-MM-dd"
                    />
                    <button
                      onClick={() => removeColumn(index, setfinalsAttendanceColumns)}
                      style={{ background: 'none', border: 'none' }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
  
                <th rowSpan="3" style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setfinalsAttendanceColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
  
                <th colSpan="2">No of Days</th>
                <th colSpan="2">
                  <input
                    type="text"
                    style={{ width: '60px', marginLeft: '10px' }}
                    value={finalsTotalAttendanceDays}
                    readOnly
                  />
                </th>
                <th colSpan="2" rowSpan="2">Attendance</th>
              </tr>
              <tr>
                <th colSpan="4">Total Student Attendance</th>
                  
                  {/* Quiz Columns WITH REMOVE BUTTON */}
                  {finalsQuizColumns.map((_, index) => (
                  <th key={index} rowSpan={2}>
                    Q/S {index + 1}
                    <button onClick={() => removeQuizColumn(index)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input
                      type="number"
                      value={finalsQuizMaxScores[index] || 0}
                      onChange={(e) => handleFinalsMaxScoreChange(index, parseFloat(e.target.value) || 0)}
                      style={{ width: '50px' }} // Adjust width as needed
                      placeholder="Max"
                    />
                  </th>
                ))}
  
                <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                            <button onClick={addFinalQuizColumn} style={{ background: 'none', border: 'none' }}>
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </th>
                      <th rowSpan={2}>Total</th>
                      <th rowSpan={2}>
                      <input
                      type="number"
                      value={finalsQuizPercentage}
                    onChange={(e) => setfinalsQuizPercentage(e.target.value)}
                      style={{ width: '60px' }}
                    />
                      %</th>
      
                    {/* PBA Columns */}
                    {finalsPBAColumns.map((_, index) => (
                      <th key={index}>
                        PBA {index + 1}
                        <button onClick={() => removeColumn(index, setfinalsPBAColumns)} style={{ background: 'none', border: 'none' }}>
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                      </th>
                    ))}
                    <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                      <button onClick={() => addColumn(setfinalsPBAColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </th>
                    <th rowSpan={2}>Total</th>
                    <th>PBA Grade</th>
                  </tr>
                  <tr>
                <th colSpan="1">P</th>
                <th colSpan="1">L</th>
                <th colSpan="1">E</th>
                <th colSpan="1">A</th>
                <th colSpan="2">
                  <input
                    type="number"
                    value={finalsAttendancePercentage}
                    onChange={(e) => setfinalsAttendancePercentage(e.target.value)}
                    style={{ width: '60px' }}
                  />
                  %</th>
      
                  {/* Assignment Column Header */}
                  {finalsAssignmentColumns.map((_, index) => (
                    <th key={index}>
                      Assignment {index + 1}
                      <button onClick={() => removeColumn(index, setfinalsAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                    <button onClick={() => addColumn(setfinalsAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th>Total</th>
                  {/* Use a `td` for the input field */}
                  <th>
              <input
                type="number"
                value={finalsAssignmentPercentage}
                onChange={(e) => setfinalsAssignmentPercentage(e.target.value)}
                style={{ width: '60px' }}
              />%
            </th>
                  {/* Recitation Columns */}
                  {finalsRecitationColumns.map((_, index) => (
                    <th key={index}>
                      Recitation {index + 1}
                      <button onClick={() => removeColumn(index, setfinalsRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                    <button onClick={() => addColumn(setfinalsRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th>Total</th>
                  <th>
                  <input
                  type="number"
                  value={finalsRecitationPercentage}
                  onChange={(e) => setfinalsRecitationPercentage(e.target.value)}
                  style={{ width: '60px' }}
                />
                  %</th>
                  <th>{calculateTotalFinalsCSPercentage()}%</th>
      
                  {finalsPBAColumns.map((_, index) => (
                    <th key={index}>
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
      
                  <th>
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
                  <th>
                      <input
                        type="number"
                        value={finalsTotalItems}
                        onChange={(e) => setfinalsTotalItems(e.target.value)}
                        style={{ width: '70px' }}
                        placeholder="Items"
                      />
                            </th>
                    <th colSpan="2">
                      <input
                        type="number"
                        value={finalsExamPercentage}
                        onChange={(e) => setfinalsExamPercentage(e.target.value)}
                        style={{ width: '60px' }}
                        placeholder="%"
                      />
                      %</th>
                <th>Total</th>
      
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
                
                
  
  
                  
                  return (
                    <tr key={student.id}>
                    <td style={{ position: 'sticky',left: 0, backgroundColor: 'white',padding: '10px',zIndex: 3,borderRight: '2px solid #ccc',boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)',}}>
                      {student.studentNumber || 'Guest'}
                    </td>
                    <td style={{position: 'sticky',left: 82,backgroundColor: 'white',padding: '10px',zIndex: 3,borderLeft: '2px solid #ccc',boxShadow: '-1px 0 0 rgba(0, 0, 0, 0.1)',}}
                    >
                      {student.studentNameLast || ''}, {student.studentNameFirst || ''}{' '}{student.studentNameMiddle || ''}
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
  
                    <td>{points.toFixed(2)}</td>
                    <td>{finalsAttendancePercentageScore} %</td>
                      
  
                      {/*ASSIGNMENT COMPONENT: DEFINE ASSIGNMENTSCORES IN INPUT*/}
                      {finalsAssignmentColumns.map((_, assignmentIndex) => (
                        <td key={assignmentIndex}>
                          <input
                            type="number"
                            style={{ width: '70px' }}
                            placeholder="Score"
                            value={finalsAssignmentScores[studentIndex]?.[assignmentIndex] || ''} // Set the value based on state
                            onChange={(e) => handleFinalAssignmentScoreChange(studentIndex, assignmentIndex, parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      ))}
                      <td></td>
                      <td>{calculateFinalsAssignmentColumnAverage(student.id)}%</td> {/* Display average directly */}
                      <td>{calculateFinalsAssignmentComponentScore(student.id, finalsAssignmentPercentage)}%</td>
  
                      {/*QUIZ COMPONENT: DEFINE QUIZSEATSCORES IN INPUT*/}
                      {finalsQuizColumns.map((_, quizIndex) => (
                        <td key={quizIndex}>
                          <input
                            type="number"
                            style={{ width: '70px' }}
                            placeholder="Score"
                            value={finalsQuizScores[studentIndex]?.[quizIndex] || ''} // Ensure that the input shows the current score
                            onChange={(e) => handleFinalsQuizScoreChange(studentIndex, quizIndex, parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      ))}
                      <td></td>
                      <td>{calculateFinalsQuizTotalScore(studentIndex)}%</td> {/* Total Column */}
                      <td>{(calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage))}%</td>
                      
                      {/*RECITATION COMPONENT: DEFINE RECITATIONSCORES IN INPUT*/}
                      {finalsRecitationColumns.map((_, index) => (
                        <td key={index}>
                          <input
                            type="number"
                            style={{ width: '70px' }}
                            placeholder="Score" 
                            value={finalsRecitationScores[studentIndex]?.[index] || ''}
                            onChange={(e) => handleFinalsRecitationScoreChange(studentIndex, index, parseFloat(e.target.value) || 0)}/>
                        </td>
                      ))}
                      <td></td>
                      <td>{calculateFinalsRecitationColumnAverage(student.id)}%</td>
                      <td>{calculateFinalsRecitationComponentScore(student.id, finalsRecitationPercentage)}%</td>
  
                      {/*CLASS STANDING TOTAL: ATTENDANCE + ASSIGN + QUIZSEAT + RECITATION*/}
                      <td>{calculateTotalFinalsCSGrade(studentIndex)}%</td>
                      
                      {finalsPBAColumns.map((_, quizIndex) => (
                        <td key={quizIndex}>
                          <input
                            type="number"
                            style={{ width: '70px' }}
                            placeholder="Score"
                            value={studentScores[quizIndex] !== undefined ? studentScores[quizIndex] : ''} // Display the score if it exists
                            onChange={(e) => handleFinalsPBAScoreChange(studentIndex, quizIndex, parseFloat(e.target.value) || 0)}
                            min="50"
                            max="100"
                          />
                        </td>
                      ))}
                      <td></td>
                      <td>{total.toFixed(2)}</td> {/* This should display the correct average */}
                      <td>{pbaGrade.toFixed(2)}</td> {/* This displays the PBA grade */}
  
                      {/*MIDTERMS EXAM COMPONENT*/}
                      <td>
                          <input
                            type="number"
                            value={score}
                            onChange={(e) => handleFinalsExamScoreChange(student.id, e.target.value)}
                            style={{ width: '70px' }}
                            placeholder="Score"
                          />
                        </td>
                        <td>{percentage.toFixed(2)}%</td>
                        <td>{weightedScore}%</td>
  
                      {/*MIDTERM GRADE: CLASS STANDING + PBA + MIDTERM EXAM*/}
                      <td>{calculateFinalsGrade(studentIndex)}</td>
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
                    <tr key={student.id}>
                      <td>{student.studentNumber || 'Guest'}</td>
                      <td>{student.studentNameLast || ''}, {student.studentNameFirst || ''} {student.studentNameMiddle || ''}</td>
                      <td>{calculateTotalMidtermCSGrade(studentIndex)}</td>
                      <td>{calculateTotalsAndPBA(midtermPBAGradeScores[studentIndex], midtermPBAGradePercentage).pbaGrade}</td>
                      <td>{calculateMidtermWeightedScore(calculateMidtermPercentage(midtermExamScores[student.id]))}</td>
                      <td>{calculateMidtermGrade(studentIndex)}</td>
                      <td>{calculateTotalFinalsCSGrade(studentIndex)}</td>
                      <td>{calculateTotalsAndPBA(finalsPBAGradeScores[studentIndex], finalsPBAGradePercentage).pbaGrade}</td>
                      <td>{calculateFinalWeightedScore(calculateFinalPercentage(finalsExamScores[student.id]))}</td>
                      <td>{calculateFinalsGrade(studentIndex)}</td>
                      <td>{calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex))}</td>
                    <td>
                      {getSemestralNumericalEquivalentAndRemarks(student.id,
                        calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                        MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)).numEq}
                    </td>
                    <td>
                      {getSemestralNumericalEquivalentAndRemarks(student.id,
                        calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                        MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)).remarks}
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
                        <td>{student.studentNameLast || ''}, {student.studentNameFirst || ''} {student.studentNameMiddle || ''}</td>
                        
                        {/* Midterm Grade */}
                        <td>{calculateMidtermGrade(studentIndex)}</td>
                        
                        {/* Final Grade */}
                        <td>{calculateFinalsGrade(studentIndex)}</td>
                        
                        {/* Semestral Grade */}
                        <td>
                          {calculateSemestralGrade(
                            calculateMidtermGrade(studentIndex),
                            calculateFinalsGrade(studentIndex)
                          )}
                        </td>
                        
                        {/* Numerical Grade */}
                        <td>
                          {getSemestralNumericalEquivalentAndRemarks(
                            student.id,
                            calculateSemestralGrade(
                              calculateMidtermGrade(studentIndex),
                              calculateFinalsGrade(studentIndex)
                            ),
                            MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                          ).numEq}
                        </td>
                        
                        {/* Remarks */}
                        <td>
                          {getSemestralNumericalEquivalentAndRemarks(
                            student.id,
                            calculateSemestralGrade(
                              calculateMidtermGrade(studentIndex),
                              calculateFinalsGrade(studentIndex)
                            ),
                            MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                          ).remarks}
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
                  color: '#004d00', // Set the menu icon color to green
                }}
              >
                <FontAwesomeIcon icon={faBars} size="lg" />
              </Dropdown.Toggle>
    
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => console.log('Import clicked')}>IMPORT</Dropdown.Item>
                <Dropdown.Item onClick={() => console.log('Export clicked')}>EXPORT</Dropdown.Item>
                <Dropdown.Item onClick={() => console.log('Print clicked')}>PRINT</Dropdown.Item>
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
