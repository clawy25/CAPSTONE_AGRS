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
  const [selectedPeriod, setSelectedPeriod] = useState('midterm');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceColumns, setAttendanceColumns] = useState([{ id: 1, date: new Date() }]);
  const [assignmentColumns, setAssignmentColumns] = useState([]);
  const [quizColumns, setQuizColumns] = useState([]);
  const [recitationColumns, setRecitationColumns] = useState([]);
  const [pbaColumns, setPbaColumns] = useState([]);  
  const [students, setStudents] = useState([]);
  const [totalAttendanceDays, setTotalAttendanceDays] = useState(0);
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignmentScores, setAssignmentScores] = useState([]);

  


    

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
    useEffect(() => {
      fetchExistingStudents();
  }, []);

  useEffect(() => {
    // Calculate total attendance days whenever attendanceColumns change
    const count = attendanceColumns.filter(col => col.date).length;
    setTotalAttendanceDays(count); // Update the total attendance days
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


  const handleScoreChange = (studentId, index, score) => {
    setAssignmentScores((prevScores) => {
      const studentScores = prevScores[studentId] || [];
      const updatedScores = [...studentScores];
      updatedScores[index] = score; // Update the score at the specified index
      return {
        ...prevScores,
        [studentId]: updatedScores,
      };
    });
  };
  

  // Function to calculate the average score for the assignment column for a specific student
  const calculateAssignmentColumnAverage = (studentIndex) => {
   
    const scores = assignmentScores[studentIndex] || [];
    
    // Calculate the sum of the scores
    const sum = scores.reduce((acc, score) => acc + score, 0);
  
    // Calculate the average (check for divide by zero)
    const average = scores.length > 0 ? sum / scores.length : 0;
  
    return average;
  };
  

  
  // Example usage for student 1
  console.log(calculateAssignmentColumnAverage(1)); // Output: average of scores for student 1
  
  


  
  
  
  
    
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
                <th colSpan={assignmentColumns.length + 3} rowSpan={3}>Assignments 5%</th>
                <th colSpan={quizColumns.length + 3} rowSpan={2}>Quizzes/Seatwork 10%</th> {/* New column header */}
                <th colSpan={recitationColumns.length + 3} rowSpan={3}>Recitation/Participation 10%</th>
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
                <th colSpan="2" rowSpan="2">Attendance 5%</th>
              </tr>
              <tr>

                {/* "Total Student Attendance" header placed below the "No of Days" and "Input Field" */}
                <th colSpan="4">Total Student Attendance</th>

                
                {/* Quiz Columns */}
                {quizColumns.map((_, index) => (
                  <th key={index}>
                    <input type="number" style={{ width: '70px' }} placeholder="Items" />
                  </th>
                ))}
                <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setQuizColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th rowSpan={2}>Total</th>
                <th rowSpan={2}>10%</th>
    
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
                <th colSpan="2">5%</th>
    
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
                <th>5%</th>
    
                {/* Quizzes/Seatwork Columns */}
                {quizColumns.map((_, index) => (
                  <th key={index}>
                    Q/S {index + 1}
                    <button onClick={() => removeColumn(index, setQuizColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
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
                <th>10%</th>
                <th>30%</th>
    
                {/* Quiz Columns */}
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
    
              <th>30%</th>
              <th>
                    <input type="number" style={{ width: '70px' }} placeholder="Items" />
              </th>
              <th colSpan={2}>40%</th>
              <th>Total</th>
    
              </tr>
            </thead>

            {/* PLEA */}
            <tbody>
              {students.map((student) => {
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

                  
                    <td></td>
                    <td>{totals.P}</td>
                    <td>{totals.L}</td>
                    <td>{totals.E}</td>
                    <td>{totals.A}</td>
                    <td></td>
                    <td></td>
                    

                    {assignmentColumns.map((_, index) => (
  <td key={index}>
    <input
      type="number"
      style={{ width: '70px' }}
      placeholder="Score"
      onChange={(e) => handleScoreChange(student.id, index, e.target.value)}
    />
  </td>
))}
<td></td>
<td>{calculateAssignmentColumnAverage(student.id)}%</td> {/* Display average directly */}

        
                    
                    
                    <td></td>
                    <td></td>

                    {quizColumns.map((_, index) => (
                      <td key={index}>
                        <input type="number" style={{ width: '70px' }} placeholder="Score" />
                      </td>
                    ))}
                    
                    <td></td>
                    <td></td>
                    <td></td>

                    {recitationColumns.map((_, index) => (
                      <td key={index}>
                        <input type="number" style={{ width: '70px' }} placeholder="Score" />
                      </td>
                    ))}
                    
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>

                    {pbaColumns.map((_, index) => (
                      <td key={index}>
                        <input type="number" style={{ width: '70px' }} placeholder="Score" />
                      </td>
                    ))}
                    
                    <td></td>
                    <td></td>
                    <td></td>

                    <td><input type="number" style={{ width: '70px' }} placeholder="Score" /></td>
                    <td></td>
                    <td></td>

                    <td></td>
                    <td></td>

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
                <th colSpan={attendanceColumns.length + 7}>Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                <th colSpan={assignmentColumns.length + 3} rowSpan={3}>Assignments 5%</th>
                <th colSpan={quizColumns.length + 3} rowSpan={2}>Quizzes/Seatwork 10%</th> {/* New column header */}
                <th colSpan={recitationColumns.length + 3} rowSpan={3}>Recitation/Participation 10%</th>
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
                  <input type="text" style={{ width: '60px', marginLeft: '10px' }} />
                </th>
                <th colSpan="2" rowSpan="2">Attendance 5%</th>
              </tr>
              <tr>
                {/* "Total Student Attendance" header placed below the "No of Days" and "Input Field" */}
                <th colSpan="4">Total Student Attendance</th>
                {/* Quiz Columns */}
                {quizColumns.map((_, index) => (
                  <th key={index}>
                    <input type="number" style={{ width: '70px' }} placeholder="Items" />
                  </th>
                ))}
                <th rowSpan={2} style={{ background: '#d1e7dd', padding: '0', border: 'none' }}>
                  <button onClick={() => addColumn(setQuizColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th rowSpan={2}>Total</th>
                <th rowSpan={2}>10%</th>
    
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
                <th colSpan="2">5%</th>
    
                {/* Assignment Columns */}
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
                <th>5%</th>
    
                {/* Quizzes/Seatwork Columns */}
                {quizColumns.map((_, index) => (
                  <th key={index}>
                    Q/S {index + 1}
                    <button onClick={() => removeColumn(index, setQuizColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
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
                <th>10%</th>
                <th>30%</th>
    
                {/* Quiz Columns */}
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
    
              <th>30%</th>
              <th>
                    <input type="number" style={{ width: '70px' }} placeholder="Items" />
              </th>
              <th colSpan={2}>40%</th>
              <th>Total</th>
    
              </tr>
            </thead>
            <tbody>
  {/* Iterate over each student in the students array */}
  {students.map((student, studentIndex) => (
    <tr key={studentIndex}> {/* Unique key for each row */}
      <td>{student.studentNumber || 'Guest'}</td> {/* Display studentNumber */}
      <td>{student.studentName || 'Guest'}</td> {/* Display studentName */}
      
      {attendanceColumns.map((_, index) => (
        <td key={index}>
          <select>
            <option value="Select">Select</option>
            <option value="P">P</option>
            <option value="L">L</option>
            <option value="E">E</option>
            <option value="A">A</option>
          </select>
        </td>
      ))}
      
      <td></td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td></td>
      <td></td>

      {assignmentColumns.map((_, index) => (
        <td key={index}>
          <input type="number" style={{ width: '70px' }} placeholder="Score" />
        </td>
      ))}
      
      <td></td>
      <td></td>
      <td></td>

      {quizColumns.map((_, index) => (
        <td key={index}>
          <input type="number" style={{ width: '70px' }} placeholder="Score" />
        </td>
      ))}
      
      <td></td>
      <td></td>
      <td></td>

      {recitationColumns.map((_, index) => (
        <td key={index}>
          <input type="number" style={{ width: '70px' }} placeholder="Score" />
        </td>
      ))}
      
      <td></td>
      <td></td>
      <td></td>
      <td></td>

      {pbaColumns.map((_, index) => (
        <td key={index}>
          <input type="number" style={{ width: '70px' }} placeholder="Score" />
        </td>
      ))}
      
      <td></td>
      <td></td>
      <td></td>

      <td><input type="number" style={{ width: '70px' }} placeholder="Score" /></td>
      <td></td>
      <td></td>

      <td></td>
      <td></td>

      <td>
        <select>
          <option value="Select">Select</option>
          <option value="P">PASSED</option>
          <option value="F">FAILED</option>
          <option value="OD">OD</option>
          <option value="UD">UD</option>
          <option value="F">INC</option>
          <option value="OD">NC</option>
          <option value="UD"></option>
        </select>
      </td>
    </tr>
  ))}
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
