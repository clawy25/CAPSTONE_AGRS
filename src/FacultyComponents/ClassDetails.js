import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'; // Import minus icon
import '../StudentComponents/Dashboard.css';
import DatePicker from 'react-datepicker';
import StudentModel from '../ReactModels/StudentModel';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { calculatePLEAStatus } from './GradesComputation';

const ClassDetails = () => {

  const [students, setStudents] = useState([]);

  {/* SEARCH BAR DECLARATION */}
  const [selectedPeriod, setSelectedPeriod] = useState('midterm');
  const [searchTerm, setSearchTerm] = useState('');


  {/* FOR MIDTERMS */}

  {/* ATTENDANCE DECLARATION */}
  const [attendanceColumns, setAttendanceColumns] = useState([{ id: 1, date: new Date() }]);
  const [totalAttendanceDays, setTotalAttendanceDays] = useState(0);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  {/* ASSIGNMENT DECLARATION */}
  const [assignmentColumns, setAssignmentColumns] = useState([]);
  const [assignmentScores, setAssignmentScores] = useState([]);
  const [assignmentPercentage, setAssignmentPercentage] = useState(5); // Default to 5%

  // QUIZZES DECLARATION
  const [quizColumns, setQuizColumns] = useState([]); // Initialize quiz columns
  const [quizseatScores, setQuizseatScores] = useState([]); // Scores for each quiz
  const [quizMaxScores, setQuizMaxScores] = useState([]); // Maximum scores for each quiz
  const [quizseatPercentage, setQuizseatPercentage] = useState(0);


  {/* RECITATION DECLARATION */}
  const [recitationColumns, setRecitationColumns] = useState([]);
  const [recitationScores, setRecitationScores] = useState([]);
  const [recitationPercentage, setRecitationPercentage] = useState(0);

  {/* CLASS STANDING DECLARATION */}
  const [csGradeScores, setCsGradeScores] = useState([]);
  const [csGradePercentage, setCsGradePercentage] = useState(0);

   // PBA Declaration
   const [pbaColumns, setPbaColumns] = useState([]);
   const [pbaGradeScores, setPbaGradeScores] = useState([]);  // Store scores for each PBA column per student
   const [pbaGradePercentage, setPbaGradePercentage] = useState(0);
  
  // MIDTERM DECLARATION
  const [midtermExamScores, setMidtermExamScores] = useState({});
  const [midtermExamPercentage, setMidtermExamPercentage] = useState(0);
  const [totalItems, setTotalItems] = useState(100); // Default total number of items is 100


  {/*FOR FINALS*/}

  {/* ATTENDANCE DECLARATION */}
  const [finalsAttendanceColumns, setFinalsAttendanceColumns] = useState([{ id: 1, date: new Date() }]);
  const [finalsTotalAttendanceDays, setFinalsTotalAttendanceDays] = useState(0);
  const [finalsAttendanceData, setFinalsAttendanceData] = useState([]);
  const [finalsAttendancePercentage, setFinalsAttendancePercentage] = useState(0); // Default value of 0

  {/* ASSIGNMENT DECLARATION */}
  const [finalsAssignmentColumns, setFinalsAssignmentColumns] = useState([]);
  const [finalsAssignmentScores, setFinalsAssignmentScores] = useState([]);
  const [finalsAssignmentPercentage, setFinalsAssignmentPercentage] = useState(5); // Default to 5%

  {/* QUIZZES DECLARATION */}
  const [finalsQuizColumns, setFinalsQuizColumns] = useState([]); // Initialize quiz columns
  const [finalsQuizseatScores, setFinalsQuizseatScores] = useState(
    students.map(() => Array(finalsQuizColumns.length).fill(0))
  );
  const [finalsQuizseatPercentage, setFinalsQuizseatPercentage] = useState(0);

  {/* RECITATION DECLARATION */}
  const [finalsRecitationColumns, setFinalsRecitationColumns] = useState([]);
  const [finalsRecitationScores, setFinalsRecitationScores] = useState([]);
  const [finalsRecitationPercentage, setFinalsRecitationPercentage] = useState(0);

  {/* CLASS STANDING DECLARATION */}
  const [finalsCsGradeScores, setFinalsCsGradeScores] = useState([]);
  const [finalsCsGradePercentage, setFinalsCsGradePercentage] = useState(0);

  {/* PBA DECLARATION */}
  const [finalsPbaColumns, setFinalsPbaColumns] = useState([]);
  const [finalsPbaGradeScores, setFinalsPbaGradeScores] = useState([]);
  const [finalsPbaGradePercentage, setFinalsPbaGradePercentage] = useState(0);

  {/* MIDTERM DECLARATION */}
  const [finalsExamScores, setFinalsExamScores] = useState([]);
  const [finalsExamPercentage, setFinalsExamPercentage] = useState(0);

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

  useEffect(() => {
    // Calculate total attendance days whenever attendanceColumns change
    const count = attendanceColumns.filter(col => col.date).length;
    const finalscount = finalsAttendanceColumns.filter(col => col.date).length;
    setTotalAttendanceDays(count); // Update the total attendance days
    setFinalsTotalAttendanceDays(finalscount);
  }, [attendanceColumns]);

  
  const addColumn = (setColumns) => {
    setColumns((prevColumns) => [...prevColumns, { id: prevColumns.length + 1 }]);
  };

  const removeColumn = (index, setColumns) => {
    setColumns((prevColumns) => prevColumns.filter((_, i) => i !== index));
  };

  // Function to handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Function to handle search input changes
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  //ATTENDANCE
  
  const handleAttendanceChange = (studentId, dateIndex, status) => {
    setAttendanceData((prevData) => {
      const studentAttendance = prevData[studentId] || [];
      const updatedAttendance = [...studentAttendance];

      updatedAttendance[dateIndex] = { date: new Date().toISOString().split('T')[0], status };

      return {
        ...prevData,
        [studentId]: updatedAttendance,
      };
    });
  };

  const getAttendanceTotals = (studentId) => {
    const studentAttendance = attendanceData[studentId] || [];
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

  const getAttendanceScorePercentage = (points) => {
    const totalComputations = 100; // Assuming this is the maximum point you are working with
    const attendanceInputPercentage = attendancePercentage / 100; // Convert percentage to decimal
    const calculatedPoints = Math.max(0, (points / totalComputations) * attendanceInputPercentage * totalComputations);
    return calculatedPoints.toFixed(2); // Return the value with 2 decimal points
  };



{/* ASSIGNMENTS */}
  const handleScoreChange = (studentId, assignmentIndex, score) => {
    setAssignmentScores(prevScores => {
      const updatedScores = [...prevScores]; // Create a shallow copy of the array
      if (!updatedScores[studentId]) {
        updatedScores[studentId] = []; // Initialize an array for this student if it doesn't exist
      }
      updatedScores[studentId][assignmentIndex] = score; // Update the score for the student and assignment
      return updatedScores;
    });
  };
  
  const calculateAssignmentColumnAverage = (studentIndex) => {
    const scores = assignmentScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Optional: format to 2 decimal places
  };
  
  const calculateAssignmentComponentScore = (studentIndex, percentage) => {
    const scores = assignmentScores[studentIndex] || [];
    const validScores = scores.map(score => parseFloat(score) || 0);
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2);
  };
  // Example usage for student 1
  console.log(calculateAssignmentColumnAverage(1)); // Output: average of scores for student 1

  
  //QUIZZES/SEAT

  useEffect(() => {
    // Initialize quizseatScores only when students change, keeping existing quiz columns intact
    setQuizseatScores(prevScores =>
      students.map((_, index) => prevScores[index] || Array(quizColumns.length).fill(0)) // Retain previous scores
    );
  
    // Initialize quizMaxScores to match the length of quizColumns, keeping existing data intact
    setQuizMaxScores(prevMaxScores => 
      prevMaxScores.length < quizColumns.length 
        ? [...prevMaxScores, ...Array(quizColumns.length - prevMaxScores.length).fill(0)] 
        : prevMaxScores
    );
  }, [students]);
  
  
  
  
  const addQuizColumn = () => {
    // Add a new quiz column (no need to modify quizseatScores here)
    setQuizColumns(prevColumns => [...prevColumns, {}]);
  
    // Update quizseatScores: Ensure existing student quiz scores are retained and a new score is appended
    setQuizseatScores(prevScores =>
      prevScores.map(studentScores => [...studentScores, 0]) // Append a new score (0) for the new column
    );
  
    // Update quizMaxScores: Ensure existing max scores are retained and append a default value for the new column
    setQuizMaxScores(prevMaxScores => [...prevMaxScores, 0]);
  };
  
  
  
  
  const removeQuizColumn = (indexToRemove) => {
    setQuizColumns(prevColumns => prevColumns.filter((_, index) => index !== indexToRemove));
  
    setQuizseatScores(prevScores =>
      prevScores.map(studentScores =>
        studentScores.filter((_, index) => index !== indexToRemove) // Remove the column at the specified index
      )
    );
  
    setQuizMaxScores(prevMaxScores => 
      prevMaxScores.filter((_, index) => index !== indexToRemove)
    );
  };
  
  const handleQuizseatScoreChange = (studentIndex, quizIndex, score) => {
    setQuizseatScores(prevScores =>
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
  

  const handleMaxScoreChange = (quizIndex, value) => {
    setQuizMaxScores(prev => {
      const updatedMaxScores = [...prev];
      updatedMaxScores[quizIndex] = value; // Update the max score for this quiz
      return updatedMaxScores;
    });
  };

  const calculateEquivalentRate = (score, maxScore) => {
    if (maxScore === 0) return 0; // Prevent division by zero
    return ((score / maxScore) * 50) + 50;
  };

  const calculateQuizseatComponentScore = (studentIndex, percentage) => {
    const scores = quizseatScores[studentIndex] || [];
    const maxScores = quizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    const averageEquivalentRate = equivalentRates.length > 0 ? totalEquivalentRate / equivalentRates.length : 0;

    const componentScore = averageEquivalentRate * (percentage / 100);
    return componentScore.toFixed(2);
  };

  const calculateTotalScore = (studentIndex) => {
    const scores = quizseatScores[studentIndex] || [];
    const maxScores = quizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    return (totalEquivalentRate / equivalentRates.length).toFixed(2); // Return the total equivalent rate
  };
  
  useEffect(() => {
    console.log('Updated quizseatScores:', quizseatScores);
  }, [quizseatScores]);
  
  
  


  
  {/* RECITATION/PARTICIPATION */}
  const handleRecitationScoreChange = (studentId, recitationIndex, score) => {
    setRecitationScores(prevScores => {
      const updatedScores = [...prevScores];
      if (!updatedScores[studentId]) {
        updatedScores[studentId] = [];
      }
      updatedScores[studentId][recitationIndex] = score;
      return updatedScores;
    });
  };

    // Function to calculate average scores
    const calculateAverage = (scores) => {
      if (!scores.length) return 0;
      const total = scores.reduce((sum, score) => sum + (score || 0), 0);
      return total / scores.length;
    };

  
  const calculateRecitationColumnAverage = (studentIndex) => {
    const scores = recitationScores[studentIndex] || [];
  
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
  
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
  
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Format to 2 decimal places
  };
  
  const calculateRecitationComponentScore = (studentIndex, percentage) => {
    const scores = recitationScores[studentIndex] || [];
    
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


  //CLASS STANDING
   // Function to calculate total CS Grade based on user-defined percentages
   const calculateTotalCSGrade = () => {
    // Calculate averages
    const attendanceAverage = calculateAverage(Object.values(attendanceData).flatMap(att => att.map(a => a.status === 'present' ? 1 : 0)));
    const assignmentAverage = calculateAverage(assignmentScores.flat());
    const quizAverage = calculateAverage(quizseatScores.flat());
    const recitationAverage = calculateAverage(recitationScores.flat());

    // Apply user-defined percentages
    const totalGrade =
      (attendanceAverage * (attendancePercentage / 100)) +
      (assignmentAverage * (assignmentPercentage / 100)) +
      (quizAverage * (quizseatPercentage / 100)) +
      (recitationAverage * (recitationPercentage / 100));

    return totalGrade;
  };

  
    {/* PBA */}
      // Handle PBA score change with validation for scores between 50-100
  const handlePBAScoreChange = (studentIndex, scoreIndex, newScore) => {
    setPbaGradeScores(prevScores => {
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
  

  // Calculate the total and PBA grade for each student
  const calculateTotalsAndPBA = (studentScores, pbaGradePercentage) => {
    // Calculate the total score
    const total = studentScores.reduce((sum, score) => sum + score, 0);
  
    // Calculate the average score (total divided by number of quizzes)
    const average = total / studentScores.length;
  
    // Calculate the PBA grade (using the percentage provided)
    const pbaGrade = average * (pbaGradePercentage / 100);
  
    return { total: average, pbaGrade };
  };




   {/* MIDTERM EXAM */}
     // Handle changes in student scores
  const handleMTScoreChange = (studentId, score) => {
    setMidtermExamScores((prevScores) => ({
      ...prevScores,
      [studentId]: score,
    }));
  };

  // Computation functions
  const calculatePercentage = (score) => {
    return ((score / totalItems) * 50) + 50;
  };

  const calculateWeightedScore = (percentage) => {
    return (percentage * midtermExamPercentage) / 100;
  };

  


  
    
{/* MIDTERMS TAB */}
  const renderTableContent = () => {
    switch (selectedPeriod) {
      case 'midterm':
        return (
          <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
          <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th colSpan="2">Student Info</th>
                <th colSpan={attendanceColumns.length + 7}>Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                <th colSpan={assignmentColumns.length + 3} rowSpan={3} style={{ padding: '60px' }} >Assignments</th>
                <th colSpan={quizColumns.length + 3} rowSpan={2}>Quizzes/Seatwork</th> {/* New column header */}
                <th colSpan={recitationColumns.length + 3} rowSpan={3}>Recitation/Participation</th>
                <th colSpan="1" rowSpan="3">CS Grade</th>
                <th colSpan={pbaColumns.length + 3} rowSpan={2}>Performance Based Assessment</th>
                <th colSpan="3" rowSpan="3">Midterm Exam</th>
                <th colSpan="1" rowSpan="3">Midterm Grade</th>
                <th colSpan="1" rowSpan="4">Numerical Equivalent</th>
                <th colSpan="1" rowSpan="4">Remarks</th>
              </tr>
              
              <tr>
                <th rowSpan="3">Student No</th>
                <th rowSpan="3">Name</th>



                {attendanceColumns.map((column, index) => (
                <th key={index} rowSpan="3">
                  <DatePicker
                    selected={column.date}
                    onChange={(date) =>
                      setAttendanceColumns((prevColumns) =>
                        prevColumns.map((col, i) => (i === index ? { ...col, date } : col))
                      )
                    }
                    dateFormat="yyyy-MM-dd"
                  />
                  <button
                    onClick={() => removeColumn(index, setAttendanceColumns)}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                </th>
              ))}

              <th rowSpan="3" style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                <button onClick={() => addColumn(setAttendanceColumns)} style={{ background: 'none', border: 'none' }}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </th>

              <th colSpan="2">No of Days</th>
              <th colSpan="2">
                <input
                  type="text"
                  style={{ width: '60px', marginLeft: '10px' }}
                  value={totalAttendanceDays}
                  readOnly
                />
              </th>
              <th colSpan="2" rowSpan="2">Attendance</th>
            </tr>
            <tr>
              <th colSpan="4">Total Student Attendance</th>
                
                {/* Quiz Columns WITH REMOVE BUTTON */}
                {quizColumns.map((_, index) => (
                <th key={index} rowSpan={2}>
                  Q/S {index + 1}
                  <button onClick={() => removeQuizColumn(index)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <input
                    type="number"
                    value={quizMaxScores[index] || 0}
                    onChange={(e) => handleMaxScoreChange(index, parseFloat(e.target.value) || 0)}
                    style={{ width: '50px' }} // Adjust width as needed
                    placeholder="Max"
                  />
                </th>
              ))}

              <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                          <button onClick={addQuizColumn} style={{ background: 'none', border: 'none' }}>
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </th>
                    <th rowSpan={2}>Total</th>
                    <th rowSpan={2}>
                    <input
                    type="number"
                    value={quizseatPercentage}
                    onChange={(e) => setQuizseatPercentage(e.target.value)}
                    style={{ width: '60px' }}
                  />
                    %</th>
    
                  {/* PBA Columns */}
                  {pbaColumns.map((_, index) => (
                    <th key={index}>
                      PBA {index + 1}
                      <button onClick={() => removeColumn(index, setPbaColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                    <button onClick={() => addColumn(setPbaColumns)} style={{ background: 'none', border: 'none' }}>
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
                  value={attendancePercentage}
                  onChange={(e) => setAttendancePercentage(e.target.value)}
                  style={{ width: '60px' }}
                />
                %</th>
    
                {/* Assignment Column Header */}
                {assignmentColumns.map((_, index) => (
                  <th key={index}>
                    Assignment {index + 1}
                    <button onClick={() => removeColumn(index, setAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th>Total</th>
                {/* Use a `td` for the input field */}
                <th>
            <input
              type="number"
              value={assignmentPercentage}
              onChange={(e) => setAssignmentPercentage(e.target.value)}
              style={{ width: '30px' }}
            />%
          </th>
                {/* Recitation Columns */}
                {recitationColumns.map((_, index) => (
                  <th key={index}>
                    Recitation {index + 1}
                    <button onClick={() => removeColumn(index, setRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th>Total</th>
                <th>
                <input
                type="number"
                value={recitationPercentage}
                onChange={(e) => setRecitationPercentage(e.target.value)}
                style={{ width: '30px' }}
              />
                %</th>
                <th>
                <input
                type="number"
                value={csGradePercentage}
                onChange={(e) => setCsGradePercentage(e.target.value)}
                style={{ width: '30px' }}
              />
                %</th>
    
                {pbaColumns.map((_, index) => (
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
                    value={pbaGradePercentage}
                    onChange={(e) => setPbaGradePercentage(parseFloat(e.target.value) || 0)}
                    style={{ width: '50px' }}
                    min="0"
                    max="100"
                  />
                  %
                </th>
                <th>
                    <input
                      type="number"
                      value={totalItems}
                      onChange={(e) => setTotalItems(e.target.value)}
                      style={{ width: '70px' }}
                      placeholder="Items"
                    />
                          </th>
                  <th colSpan="2">
                    <input
                      type="number"
                      value={midtermExamPercentage}
                      onChange={(e) => setMidtermExamPercentage(e.target.value)}
                      style={{ width: '30px' }}
                      placeholder="%"
                    />
                    %</th>
              <th>Total</th>
    
              </tr>
            </thead>


            <tbody>
              {students.map((student, studentIndex) => {
                const studentScores = pbaGradeScores[studentIndex] || [];
       
                const { total, pbaGrade } = calculateTotalsAndPBA(studentScores, pbaGradePercentage);
                const score = midtermExamScores[student.id] || 0;
                const percentage = calculatePercentage(score);
                const weightedScore = calculateWeightedScore(percentage).toFixed(2);
                const { Atotals, points } = getAttendanceTotals(student.id);
                const attendancePercentageScore = getAttendanceScorePercentage(points); 
                
                return (
                  <tr key={student.id}>
                    <td>{student.studentNumber || 'Guest'}</td>
                    <td>{student.studentName || 'Guest'}</td>

                    
                    
      

                    {attendanceColumns.map((_, dateIndex) => (
                    <td key={dateIndex}>
                      <select
                        defaultValue={attendanceData[student.id]?.[dateIndex]?.status || 'Select'}
                        onChange={(e) => handleAttendanceChange(student.id, dateIndex, e.target.value)}
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
                  <td>{attendancePercentageScore} %</td>
                    

                    {/*ASSIGNMENT COMPONENT: DEFINE ASSIGNMENTSCORES IN INPUT*/}
                    {assignmentColumns.map((_, assignmentIndex) => (
                      <td key={assignmentIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={assignmentScores[studentIndex]?.[assignmentIndex] || ''} // Set the value based on state
                          onChange={(e) => handleScoreChange(studentIndex, assignmentIndex, parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateAssignmentColumnAverage(student.id)}%</td> {/* Display average directly */}
                    <td>{calculateAssignmentComponentScore(student.id, assignmentPercentage)}%</td>

                    {/*QUIZ COMPONENT: DEFINE QUIZSEATSCORES IN INPUT*/}
                    {quizColumns.map((_, quizIndex) => (
                      <td key={quizIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={quizseatScores[studentIndex]?.[quizIndex] || ''} // Ensure that the input shows the current score
                          onChange={(e) => handleQuizseatScoreChange(studentIndex, quizIndex, parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateTotalScore(studentIndex)}%</td> {/* Total Column */}
                    <td>{(calculateQuizseatComponentScore(studentIndex, quizseatPercentage))}%</td>
                    
                    {/*RECITATION COMPONENT: DEFINE RECITATIONSCORES IN INPUT*/}
                    {recitationColumns.map((_, index) => (
                      <td key={index}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score" 
                          value={recitationScores[studentIndex]?.[index] || ''}
                          onChange={(e) => handleRecitationScoreChange(studentIndex, index, parseFloat(e.target.value) || 0)}/>
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateRecitationColumnAverage(student.id)}%</td>
                    <td>{calculateRecitationComponentScore(student.id, recitationPercentage)}%</td>

                    {/*CLASS STANDING TOTAL: ATTENDANCE + ASSIGN + QUIZSEAT + RECITATION*/}
                    <td>{calculateTotalCSGrade().toFixed(2)}%</td>
                    
                    {pbaColumns.map((_, quizIndex) => (
                      <td key={quizIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={studentScores[quizIndex] !== undefined ? studentScores[quizIndex] : ''} // Display the score if it exists
                          onChange={(e) => handlePBAScoreChange(studentIndex, quizIndex, parseFloat(e.target.value) || 0)}
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
                          onChange={(e) => handleMTScoreChange(student.id, e.target.value)}
                          style={{ width: '70px' }}
                          placeholder="Score"
                        />
                      </td>
                      <td>{percentage.toFixed(2)}%</td>
                      <td>{weightedScore}%</td>

                    {/*MIDTERM GRADE: CLASS STANDING + PBA + MIDTERM EXAM*/}
                    <td>Midterm</td>
                    <td><center>1.0</center></td>

                    {/*REMARKS DROP-DOWN*/}
                    <td>
                      <select>
                        <option value="Select">Select</option>
                        <option value="P">PASSED</option>
                        <option value="F">FAILED</option>
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
      default:
        return <p>Please select a period.</p>;
    }
  };

  return (
   
     
        
        <div className="class-details">
          <div className="buttons-container">
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
          {/* PANSAMANTALA LANG TONG CSS DITO AH */}
                {/* Button Container */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button
          className="export-button"
          style={{
            backgroundColor: '#004d00',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          IMPORT
        </button>
        <button
          className="print-button"
          style={{
            backgroundColor: '#004d00',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          EXPORT
        </button>

        <button
          className="print-button"
          style={{
            backgroundColor: '#004d00',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          PRINT
        </button>
      </div>
      </div>
      
  );
};

export default ClassDetails;
