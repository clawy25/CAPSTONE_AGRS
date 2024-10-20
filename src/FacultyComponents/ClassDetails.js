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
  const [attendancePercentage, setAttendancePercentage] = useState(0); // Default value of 0

  {/* ASSIGNMENT DECLARATION */}
  const [assignmentColumns, setAssignmentColumns] = useState([]);
  const [assignmentScores, setAssignmentScores] = useState([]);
  const [assignmentPercentage, setAssignmentPercentage] = useState(5); // Default to 5%

  {/* QUIZZES DECLARATION */}
  const [quizColumns, setQuizColumns] = useState([]); // Initialize quiz columns
  const [quizseatScores, setQuizseatScores] = useState(
    students.map(() => Array(quizColumns.length).fill(0)));
  const [quizseatPercentage, setQuizseatPercentage] = useState(0);

  {/* RECITATION DECLARATION */}
  const [recitationColumns, setRecitationColumns] = useState([]);
  const [recitationScores, setRecitationScores] = useState([]);
  const [recitationPercentage, setRecitationPercentage] = useState(0);

  {/* CLASS STANDING DECLARATION */}
  const [csGradeScores, setCsGradeScores] = useState([]);
  const [csGradePercentage, setCsGradePercentage] = useState(0);

  {/* PBA DECLARATION */}
  const [pbaColumns, setPbaColumns] = useState([]);
  const [pbaGradeScores, setPbaGradeScores] = useState([]);
  const [pbaGradePercentage, setPbaGradePercentage] = useState(0);
  
  {/* MIDTERM DECLARATION */}  
  const [midtermExamScores, setMidtermExamScores] = useState([]);
  const [midtermExamPercentage, setMidtermExamPercentage] = useState(0);



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

  
  const handleAttendanceChange = (studentId, dateIndex, status) => {
    setAttendanceData((prevData) => {
      const studentAttendance = prevData[studentId] || [];
      const updatedAttendance = [...studentAttendance];

      // Update or add the attendance record
      updatedAttendance[dateIndex] = { date: new Date().toISOString().split('T')[0], status };

      return {
        ...prevData,
        [studentId]: updatedAttendance,
      };
    });
    setFinalsAttendanceData((prevData) => {
      const studentAttendance = prevData[studentId] || [];
      const updatedAttendance = [...studentAttendance];

      // Update or add the attendance record
      updatedAttendance[dateIndex] = { date: new Date().toISOString().split('T')[0], status };

      return {
        ...prevData,
        [studentId]: updatedAttendance,
      };
    });
  };
  
  const calculateTotals = (studentId) => {
    const studentAttendance = attendanceData[studentId] || [];
    const totals = { P: 0, L: 0, E: 0, A: 0 };

    // Iterate through each attendance record for the student
    studentAttendance.forEach(({ status }) => {
      if (status === 'P') totals.P++;
      else if (status === 'L') totals.L++;
      else if (status === 'E') totals.E++;
      else if (status === 'A') totals.A++;
    });

    return totals;
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
 
  {/* QUIZZES/SEATWORKS */}
  useEffect(() => {
    // Adjust the length of quizseatScores based on the quizColumns length
    setQuizseatScores(prevScores =>
      prevScores.map(studentScores => {
        const updatedScores = [...studentScores];
        while (updatedScores.length < quizColumns.length) {
          updatedScores.push(0); // Add new columns with default value 0
        }
        while (updatedScores.length > quizColumns.length) {
          updatedScores.pop(); // Remove extra columns
        }
        return updatedScores;
      })
    );
  }, [quizColumns]); // Trigger this effect when quizColumns changes
  
  const addQuizColumn = () => {
    setQuizColumns([...quizColumns, {}]);
    setQuizseatScores(prevScores => prevScores.map(scores => [...scores, 0]));
  };
  
  const removeQuizColumn = (indexToRemove) => {
    // Remove the selected column from quizColumns
    setQuizColumns(prevColumns => prevColumns.filter((_, index) => index !== indexToRemove));
  
    // Remove the corresponding score from each student's scores in quizseatScores
    setQuizseatScores(prevScores => 
      prevScores.map(studentScores => 
        studentScores.filter((_, index) => index !== indexToRemove)
      )
    );
  };
  
  const handleQuizseatScoreChange = (studentIndex, quizIndex, score) => {
    console.log(`Updating scores for student ${studentIndex}, quiz ${quizIndex} to ${score}`);
    setQuizseatScores(prevScores =>
      prevScores.map((scores, index) => {
        if (index === studentIndex) {
          // Clone the existing scores array
          const updatedScores = [...scores];
          updatedScores[quizIndex] = score; // Update the specific quiz score
          return updatedScores; // Return the updated scores for this student
        }
        return scores; // Return the existing scores for other students
      })
    );
  };
  
  const calculateQuizseatColumnAverage = (studentIndex) => {
    const scores = quizseatScores[studentIndex] || [];
    const validScores = scores.map(score => parseFloat(score) || 0);
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    return average.toFixed(2);
  };
  
  const calculateQuizseatComponentScore = (studentIndex, percentage) => {
    const scores = quizseatScores[studentIndex] || [];
    const validScores = scores.map(score => parseFloat(score) || 0);
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2);
  };

  useEffect(() => {
    console.log(quizseatScores);
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



                {/* Attendance Columns */}
                {attendanceColumns.map((column, index) => (
                  <th rowSpan="3">
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

              
                {/* Add Column Button */}
                <th rowSpan="3" style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setAttendanceColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>

                {/* New Row for No of Days and Input Field */}
                <th colSpan="2">No of Days</th>
                  <th colSpan="2">
                    <input
                      type="text"
                      style={{ width: '60px', marginLeft: '10px' }}
                      value={totalAttendanceDays} // Display the total attendance days
                      readOnly // Make the input field read-only
                    />
                  </th>
                <th colSpan="2" rowSpan="2">Attendance</th>
              </tr>
              <tr>

                {/* "Total Student Attendance" header placed below the "No of Days" and "Input Field" */}
                <th colSpan="4">Total Student Attendance</th>

                
                {/* Quiz Columns WITH REMOVE BUTTON */}
                {quizColumns.map((_, index) => (
  <th key={index}>
    Q/S {index + 1}
    <button onClick={() => removeQuizColumn(index)} style={{ background: 'none', border: 'none' }}>
      <FontAwesomeIcon icon={faMinus} />
    </button>
  </th>
))}

                <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addQuizColumn(setQuizColumns)} style={{ background: 'none', border: 'none' }}>
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
                  <th key={index} >
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

{/* Quizzes/Seatwork SCORE THRESHOLD */}
{quizColumns.map((_, index) => (
                  <th key={index}>
                    <input type="number" style={{ width: '70px' }} placeholder="Items" />
                  </th>
                ))}



    
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
                  <th>
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
                onChange={(e) => setPbaGradePercentage(e.target.value)}
                style={{ width: '30px' }}
              />
                %</th>
              <th>
                    <input type="number" style={{ width: '70px' }} placeholder="Items" />
              </th>
              <th colSpan={2}>
              <input
                type="number"
                value={midtermExamPercentage}
                onChange={(e) => setMidtermExamPercentage(e.target.value)}
                style={{ width: '30px' }}
              />
                %</th>
              <th>Total</th>
    
              </tr>
            </thead>


            <tbody>
              {students.map((student, studentIndex) => {
                const totals = calculateTotals(student.id);
                console.log(`Totals for ${student.id}:`, totals); // Calculate totals for this student
                return (
                  <tr key={student.id}>
                    <td>{student.studentNumber || 'Guest'}</td>
                    <td>{student.studentName || 'Guest'}</td>

                    
                    
                    {/* PLEA DROPDOWN */}
                    {attendanceColumns.map((_, dateIndex) => (
                    <td key={dateIndex}>  
                      <select
                        defaultValue={attendanceData[student.id]?.[dateIndex]?.status || 'Select'} // Set default value here
                        onChange={(e) =>
                          handleAttendanceChange(student.id, dateIndex, e.target.value)
                        }
                      >
                        <option value="Select">Select</option>
                        <option value="P">P</option>
                        <option value="L">L</option>
                        <option value="E">E</option>
                        <option value="A">A</option>
                      </select>
                    </td>
                    ))}
                    {/*EXPECTING ATTENDANCESCORES HERE*/}
                    <td></td>
                    <td>{totals.P}</td>
                    <td>{totals.L}</td>
                    <td>{totals.E}</td>
                    <td>{totals.A}</td>
                    
                    <td colspan = '2'><center>0.00%</center></td>
                    

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
                          value={quizseatScores[studentIndex]?.[quizIndex] || ''}
                          onChange={(e) => handleQuizseatScoreChange(studentIndex, quizIndex, parseFloat(e.target.value) || 0)}/>
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateQuizseatColumnAverage(studentIndex)}%</td>
                    <td>{calculateQuizseatComponentScore(studentIndex, quizseatPercentage)}%</td>
                    
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
                    <td>0.00%</td>
                    
                    {/*PBA COMPONENT: DEFINE PBASCORES IN INPUT*/}
                    {pbaColumns.map((_, index) => (
                      <td key={index}>
                        <input
                          type="number"
                          style={{ width: '70px' }} 
                          placeholder="Score" 
                          />{/*INSERT VALUE AND ONCHANGE*/}
                      </td>
                    ))}
                    <td></td>
                    <td>0.00%</td>
                    <td>0.00%</td>

                    {/*MIDTERMS EXAM COMPONENT*/}
                    <td><input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          />{/*INSERT VALUE AND ONCHANGE*/}
                    </td>

                    <td colspan ='2' >0.00%</td>

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

      {/* FINALS TAB */}
      case 'finals':
        return (
          <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
          <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th colSpan="2">Student Info</th>
                <th colSpan={finalsAttendanceColumns.length + 7}>Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                <th colSpan={finalsAssignmentColumns.length + 3} rowSpan={3} style={{ padding: '60px' }} >Assignments</th>
                <th colSpan={finalsQuizColumns.length + 3} rowSpan={2}>Quizzes/Seatwork</th> {/* New column header */}
                <th colSpan={finalsRecitationColumns.length + 3} rowSpan={3}>Recitation/Participation</th>
                <th colSpan="1" rowSpan="3">CS Grade</th>
                <th colSpan={finalsPbaColumns.length + 3} rowSpan={2}>Performance Based Assessment</th>
                <th colSpan="3" rowSpan="3">Finals Exam</th>
                <th colSpan="1" rowSpan="3">Finals Grade</th>
                <th colSpan="1" rowSpan="4">Numerical Equivalent</th>
                <th colSpan="1" rowSpan="4">Remarks</th>
              </tr>
              
              <tr>
                <th rowSpan="3">Student No</th>
                <th rowSpan="3">Name</th>



                {/* Attendance Columns */}
                {finalsAttendanceColumns.map((column, index) => (
                  <th rowSpan="3">
                    <DatePicker
                      selected={column.date}
                      onChange={(date) =>
                        setFinalsAttendanceColumns((prevColumns) =>
                          prevColumns.map((col, i) => (i === index ? { ...col, date } : col))
                        )
                      }
                      dateFormat="yyyy-MM-dd"
                    /> 
                    <button
                      onClick={() => removeColumn(index, setFinalsAttendanceColumns)}
                      style={{ background: 'none', border: 'none' }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}

              
                {/* Add Column Button */}
                <th rowSpan="3" style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setFinalsAttendanceColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>

                {/* New Row for No of Days and Input Field */}
                <th colSpan="2">No of Days</th>
                  <th colSpan="2">
                    <input
                      type="text"
                      style={{ width: '60px', marginLeft: '10px' }}
                      value={finalsTotalAttendanceDays} // Display the total attendance days
                      readOnly // Make the input field read-only
                    />
                  </th>
                <th colSpan="2" rowSpan="2">Attendance</th>
              </tr>
              <tr>

                {/* "Total Student Attendance" header placed below the "No of Days" and "Input Field" */}
                <th colSpan="4">Total Student Attendance</th>

                
                {/* Quiz Columns WITH REMOVE BUTTON */}
                {finalsQuizColumns.map((_, index) => (
                  <th key={index}>
                    Q/S {index + 1}
                    <button onClick={() => removeQuizColumn(index)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}

                <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addQuizColumn(setFinalsQuizColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th rowSpan={2}>Total</th>
                <th rowSpan={2}>
                <input
                type="number"
                value={finalsQuizseatPercentage}
                onChange={(e) => setFinalsQuizseatPercentage(e.target.value)}
                style={{ width: '60px' }}
              />
                %</th>
    
                {/* PBA Columns */}
                {finalsPbaColumns.map((_, index) => (
                  <th key={index} >
                    PBA {index + 1}
                    <button onClick={() => removeColumn(index, setFinalsPbaColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setFinalsPbaColumns)} style={{ background: 'none', border: 'none' }}>
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
                onChange={(e) => setFinalsAttendancePercentage(e.target.value)}
                style={{ width: '60px' }}
              />
                %</th>
    
                {/* Assignment Column Header */}
                {finalsAssignmentColumns.map((_, index) => (
                  <th key={index}>
                    Assignment {index + 1}
                    <button onClick={() => removeColumn(index, setFinalsAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setFinalsAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th>Total</th>
                {/* Use a `td` for the input field */}
                <th>
            <input
              type="number"
              value={finalsAssignmentPercentage}
              onChange={(e) => setFinalsAssignmentPercentage(e.target.value)}
              style={{ width: '30px' }}
            />%
          </th>
          
                {/* Quizzes/Seatwork SCORE THRESHOLD */}
                  {finalsQuizColumns.map((_, index) => (
                    <th key={index}>
                      <input type="number" style={{ width: '70px' }} placeholder="Items" />
                    </th>
                ))}

                {/* Recitation Columns */}
                {finalsRecitationColumns.map((_, index) => (
                  <th key={index}>
                    Recitation {index + 1}
                    <button onClick={() => removeColumn(index, setFinalsRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </th>
                ))}
                <th style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setFinalsRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th>Total</th>
                <th>
                <input
                type="number"
                value={finalsRecitationPercentage}
                onChange={(e) => setFinalsRecitationPercentage(e.target.value)}
                style={{ width: '30px' }}
              />
                %</th>
                <th>
                <input
                type="number"
                value={finalsCsGradePercentage}
                onChange={(e) => finalsCsGradePercentage(e.target.value)}
                style={{ width: '30px' }}
              />
                %</th>
    
                {finalsPbaColumns.map((_, index) => (
                  <th>
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
                value={finalsPbaGradePercentage}
                onChange={(e) => finalsPbaGradePercentage(e.target.value)}
                style={{ width: '30px' }}
              />
                %</th>
              <th>
                    <input type="number" style={{ width: '70px' }} placeholder="Items" />
              </th>
              <th colSpan={2}>
              <input
                type="number"
                value={finalsExamPercentage}
                onChange={(e) => setFinalsExamPercentage(e.target.value)}
                style={{ width: '30px' }}
              />
                %</th>
              <th>Total</th>
    
              </tr>
            </thead>


            <tbody>
              {students.map((student, studentIndex) => {
                const totals = calculateTotals(student.id);
                console.log(`Totals for ${student.id}:`, totals); // Calculate totals for this student
                return (
                  <tr key={student.id}>
                    <td>{student.studentNumber || 'Guest'}</td>
                    <td>{student.studentName || 'Guest'}</td>

                    
                    
                    {/* PLEA DROPDOWN */}
                    {finalsAttendanceColumns.map((_, dateIndex) => (
                    <td key={dateIndex}>  
                      <select
                        defaultValue={finalsAttendanceData[student.id]?.[dateIndex]?.status || 'Select'} // Set default value here
                        onChange={(e) =>
                          handleAttendanceChange(student.id, dateIndex, e.target.value)
                        }
                      >
                        <option value="Select">Select</option>
                        <option value="P">P</option>
                        <option value="L">L</option>
                        <option value="E">E</option>
                        <option value="A">A</option>
                      </select>
                    </td>
                    ))}
                    {/*EXPECTING ATTENDANCESCORES HERE*/}
                    <td></td>
                    <td>{totals.P}</td>
                    <td>{totals.L}</td>
                    <td>{totals.E}</td>
                    <td>{totals.A}</td>
                    
                    <td colspan = '2'><center>0.00%</center></td>
                    

                    {/*ASSIGNMENT COMPONENT*/}
                    {finalsAssignmentColumns.map((_, index) => (
                      <td key={index}>
                      <input
                        type="number"
                        style={{ width: '70px' }}
                        placeholder="Score"
                        value={finalsAssignmentScores[studentIndex]?.[index]}
                        onChange={(e) => handleScoreChange(student.id, index, parseFloat(e.target.value) || 0)}/>
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateAssignmentColumnAverage(student.id)}%</td> {/* Display average directly */}
                    <td>{calculateAssignmentComponentScore(student.id, finalsAssignmentPercentage)}%</td>

                    {/*QUIZ COMPONENT*/}
                    {finalsQuizColumns.map((_, quizIndex) => (
                      <td key={quizIndex}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          value={finalsQuizseatScores[studentIndex]?.[quizIndex] || ''}
                          onChange={(e) => handleQuizseatScoreChange(studentIndex, quizIndex, parseFloat(e.target.value) || 0)}/>
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateQuizseatColumnAverage(studentIndex)}%</td>
                    <td>{calculateQuizseatComponentScore(studentIndex, finalsQuizseatPercentage)}%</td>
                    
                    {/*RECITATION COMPONENT*/}
                    {finalsRecitationColumns.map((_, index) => (
                      <td key={index}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score" 
                          value={finalsRecitationScores[studentIndex]?.[index] || ''}
                          onChange={(e) => handleRecitationScoreChange(studentIndex, index, parseFloat(e.target.value) || 0)}/>
                      </td>
                    ))}
                    <td></td>
                    <td>{calculateRecitationColumnAverage(student.id)}%</td>
                    <td>{calculateRecitationComponentScore(student.id, finalsRecitationPercentage)}%</td>

                    {/*CLASS STANDING TOTAL: ATTENDANCE + ASSIGN + QUIZSEAT + RECITATION*/}
                    <td>0.00%</td>
                    
                    {/*PBA COMPONENT*/}
                    {finalsPbaColumns.map((_, index) => (
                      <td key={index}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          />
                      </td>
                    ))}

                    {/*EXPECTING PBASCORES HERE*/}

                    <td></td>
                    <td>0.00%</td>
                    <td>0.00%</td>

                    {/*FINAL EXAM COMPONENT*/}
                    <td><input type="number" style={{ width: '70px' }} placeholder="Score" /></td>

                    {/*EXPECTING FINALSSCORES HERE*/}

                    <td colspan ='2' >0.00%</td>

                    {/*FINAL GRADE: CLASS STANDING + PBA + FINALS EXAM*/}
                    <td>FINALS</td>
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
                  <th>Class Standing 30%</th>
                  <th>Performance Based Assessment 30%</th>
                  <th>Midterm Exam 40%</th>
                  <th>Midterm Grade</th>
                  <th>Class Standing 30%</th>
                  <th>Performance Based Assessment 30%</th>
                  <th>Final Exam 40%</th>
                  <th>Final Grade</th>
                </tr>
              </thead>
              <tbody>
   
                <tr>
                  <td>123456</td>
                  <td>John Doe</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>234567</td>
                  <td>Jane Smith</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>345678</td>
                  <td>Michael Brown</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>456789</td>
                  <td>Alice Johnson</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>567890</td>
                  <td>David Wilson</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
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
   
                  <tr>
                    <td>123456</td>
                    <td>John Doe</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>

                  <tr>
                    <td>234567</td>
                    <td>Jane Smith</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>

                  <tr>
                    <td>345678</td>
                    <td>Michael Brown</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>

                  <tr>
                    <td>456789</td>
                    <td>Alice Johnson</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>

                  <tr>
                    <td>567890</td>
                    <td>David Wilson</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>

                </tbody>
              </table>
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
