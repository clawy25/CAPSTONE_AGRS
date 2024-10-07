import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars, faChalkboardTeacher, faCalendar, faSearch, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'; // Import minus icon
import '../StudentComponents/Dashboard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../Context/UserContext';

const ClassDetails = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('midterm');
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [status, setStatus] = useState({});
  const [numOfDays, setNumOfDays] = useState(21);
  const [attendanceColumns, setAttendanceColumns] = useState([{ id: 1, date: new Date() }]);

  // Function to change the attendance date in the header
  const handleDateChange = (date, index) => {
    setAttendanceColumns((prevColumns) =>
      prevColumns.map((col, i) => (i === index ? { ...col, date } : col))
    );
  };

  // Function to add a new Attendance Date column
  const handleAddColumn = () => {
    setAttendanceColumns((prevColumns) => [
      ...prevColumns,
      { id: prevColumns.length + 1, date: new Date() }
    ]);
  };

  // Function to remove an Attendance Date column
  const handleRemoveColumn = (index) => {
    setAttendanceColumns((prevColumns) => prevColumns.filter((_, i) => i !== index));
  };

  // Function to handle status change in rows
  const handleStatusChange = (studentId, columnId, newStatus) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [studentId]: {
        ...prevStatus[studentId],
        [columnId]: newStatus,
      }
    }));
  };

  // Function to handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Function to handle changes in the number of days
  const handleDaysChange = (e) => {
    setNumOfDays(e.target.value);
  };

  // Function to handle search input changes
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const students = [
    { id: 123456, name: 'John Doe' },
    { id: 234567, name: 'Jane Smith' },
    { id: 345678, name: 'Michael Brown' },
    { id: 456789, name: 'Alice Johnson' }
  ];

  const renderTableContent = () => {
    switch (selectedPeriod) {
      case 'midterm':
        return (
          <div>
            <table className="details-table">
              <thead>
                <tr>
                  <th colSpan="2" rowSpan="1">Student Info.</th>
                  <th colSpan={6 + attendanceColumns.length} rowSpan="1">
                    Attendance (P-Present; L-Late; E=Excuse; A=Absent)
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}
                      onClick={handleAddColumn}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th colSpan="27" rowSpan="1">Class Standing 30%</th>
                  <th colSpan="6" rowSpan="1">Performance Based Assessment 30%</th>
                  <th colSpan="3" rowSpan="3">Midterm Exam</th>
                  <th colSpan="1" rowSpan="3">Midterm Grade</th>
                  <th colSpan="1" rowSpan="4">Numerical Equivalent</th>
                  <th colSpan="1" rowSpan="4">Remarks</th>
                </tr>
                <tr>
                  <th rowSpan="4">Student No</th>
                  <th rowSpan="4">Name</th>
                  {attendanceColumns.map((column, index) => (
                    <th key={index} rowSpan="3">
                      Attendance Date {index + 1}
                      <br />
                      <DatePicker
                        selected={column.date}
                        onChange={(date) => handleDateChange(date, index)}
                        dateFormat="yyyy-MM-dd"
                        className="date-picker"
                      />
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}
                        onClick={() => handleRemoveColumn(index)} 
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th colSpan="3">No of Days</th>
                  <th colSpan="1">
                    <input
                      type="number"
                      value={numOfDays}
                      onChange={handleDaysChange}
                      placeholder="No of Days"
                      style={{ width: '50px' }}
                    />
                  </th>
                  <th colSpan="2">Attendance (5%)</th>
                  <th colSpan="7" rowSpan="2">Assignment 5%</th>
                  <th colSpan="12">Quizzes/Seatwork 10%</th>
                  <th colSpan="7" rowSpan="2">Recitation/Participation 10%</th>
                  <th colSpan="1" rowSpan="2">CS Grade</th>
                  <th colSpan="1" rowSpan="2">PBA 1</th>
                  <th colSpan="1" rowSpan="2">PBA 2</th>
                  <th colSpan="1" rowSpan="2">PBA 3</th>
                  <th colSpan="1" rowSpan="2">PBA 4</th>
                  <th colSpan="1" rowSpan="3">Total</th>
                  <th colSpan="1" rowSpan="2">PBA Grade</th>
                </tr>
                <tr>
                  <th colSpan="4">Total Student Attendance</th>
                  <th colSpan="2">5%</th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th colSpan="5">Equivalent Rate</th>
                  <th rowSpan="2" colSpan="1">Total</th>
                  <th rowSpan="2" colSpan="1">10%</th>
                </tr>
                <tr>
                  <th>P</th>
                  <th>L</th>
                  <th>E</th>
                  <th className="narrow-column">A</th>
                  <th>50%</th>
                  <th>5%</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>5</th>
                  <th>Total</th>
                  <th>5%</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>5</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>5</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>5</th>
                  <th>Total</th>
                  <th>10%</th>
                  <th>30%</th>
                  <th>
                    <select style={{ width: '100px' }}>
                      <option value="" defaultChecked>Select</option>
                      <option value="Option1">Projects</option>
                      <option value="Option2">Reports</option>
                      <option value="Option3">Reflection</option>
                      <option value="Option2">Portfolio</option>
                      <option value="Option3">Research</option>
                      <option value="Option3">Lab</option>
                    </select>
                  </th>
                  <th>
                    <select style={{ width: '100px' }}>
                      <option value="" defaultChecked>Select</option>
                      <option value="Option1">Projects</option>
                      <option value="Option2">Reports</option>
                      <option value="Option3">Reflection</option>
                      <option value="Option2">Portfolio</option>
                      <option value="Option3">Research</option>
                      <option value="Option3">Lab</option>
                    </select>
                  </th>
                  <th>
                    <select style={{ width: '100px' }}>
                      <option value="" defaultChecked>Select</option>
                      <option value="Option1">Projects</option>
                      <option value="Option2">Reports</option>
                      <option value="Option3">Reflection</option>
                      <option value="Option2">Portfolio</option>
                      <option value="Option3">Research</option>
                      <option value="Option3">Lab</option>
                    </select>
                  </th>
                  <th>
                    <select style={{ width: '100px' }}>
                      <option value="" defaultChecked>Select</option>
                      <option value="Option1">Projects</option>
                      <option value="Option2">Reports</option>
                      <option value="Option3">Reflection</option>
                      <option value="Option2">Portfolio</option>
                      <option value="Option3">Research</option>
                      <option value="Option3">Lab</option>
                    </select>
                  </th>
                  <th>30%</th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th colSpan="2" rowSpan="1">40%</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    {attendanceColumns.map((column, index) => (
                      <td key={index}>
                        <select
                          value={status[student.id]?.[index + 1] || ''}
                          onChange={(e) => handleStatusChange(student.id, index + 1, e.target.value)}
                        >
                          <option value="">Select Status</option>
                          <option value="P">P</option>
                          <option value="L">L</option>
                          <option value="E">E</option>
                          <option value="A">A</option>
                        </select>
                      </td>
                    ))}
                    <td>{status[student.id]?.P ? 1 : 0}</td>
                    <td>{status[student.id]?.L ? 1 : 0}</td>
                    <td>{status[student.id]?.E ? 1 : 0}</td>
                    <td className="narrow-column">{status[student.id]?.A ? 1 : 0}</td>
                    <td></td> 
                    <td></td> 
                    {/* Add input fields for assignments */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 1 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 2 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 3 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 4 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 5 */}
                    <td></td> {/* Total for Assignments */}
                    <td></td> {/* 5% for Assignments */}
                    {/* Quizzes/Seatwork Columns */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 1 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 2 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 3 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 4 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 5 */}
                    <td></td> {/* Equivalent Rate 1 */}
                    <td></td> {/* Equivalent Rate 2 */}
                    <td></td> {/* Equivalent Rate 3 */}
                    <td></td> {/* Equivalent Rate 4 */}
                    <td></td> {/* Equivalent Rate 5 */}
                    <td></td> {/* Total */}
                    <td></td> {/* 10% */}
                    {/* Recitation/Participation Columns */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 1 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 2 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 3 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 4 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 5 */}
                    <td></td> {/* Recitation Total */}
                    <td></td> {/* Recitation 10% */}
                    <td></td> {/* CS GRADE 30% */}
                    <td><input type="number" style={{ width: '100px' }} /></td> {/* PBA 1 */}
                    <td><input type="number" readOnly style={{ width: '100px' }} /></td> {/* PBA 2 */}
                    <td><input type="number" readOnly style={{ width: '100px' }} /></td> {/* PBA 3 */}
                    <td><input type="number" readOnly style={{ width: '100px' }} /></td> {/* PBA 4 */}
                    <td></td>
                    <td></td>
                    <td><input type="number" readOnly style={{ width: '70px' }} /></td> {/* 5% for Assignments */}
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <select
                        value={status[student.id] || ''}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      >
                        <option defaultChecked="">Select Status</option>
                        <option value="Failed">Failed</option>
                        <option value="Passed">Passed</option>
                        <option value="OD">OD</option>
                        <option value="UD">UD</option>
                        <option value="INC">INC</option>
                        <option value="NC">NC</option>
                        <option value="FA">FA</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      
      case 'finals':
        return (
          <div>
            <table className="details-table">
              <thead>
                <tr>
                  <th colSpan="2" rowSpan="1">Student Info.</th>
                  <th colSpan={6 + attendanceColumns.length} rowSpan="1">
                    Attendance (P-Present; L-Late; E=Excuse; A=Absent)
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}
                      onClick={handleAddColumn}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th colSpan="27" rowSpan="1">Class Standing 30%</th>
                  <th colSpan="6" rowSpan="1">Performance Based Assessment 30%</th>
                  <th colSpan="3" rowSpan="3">Midterm Exam</th>
                  <th colSpan="1" rowSpan="3">Midterm Grade</th>
                  <th colSpan="1" rowSpan="4">Numerical Equivalent</th>
                  <th colSpan="1" rowSpan="4">Remarks</th>
                </tr>
                <tr>
                  <th rowSpan="4">Student No</th>
                  <th rowSpan="4">Name</th>
                  {attendanceColumns.map((column, index) => (
                    <th key={index} rowSpan="3">
                      Attendance Date {index + 1}
                      <br />
                      <DatePicker
                        selected={column.date}
                        onChange={(date) => handleDateChange(date, index)}
                        dateFormat="yyyy-MM-dd"
                        className="date-picker"
                      />
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}
                        onClick={() => handleRemoveColumn(index)} 
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    </th>
                  ))}
                  <th colSpan="3">No of Days</th>
                  <th colSpan="1">
                    <input
                      type="number"
                      value={numOfDays}
                      onChange={handleDaysChange}
                      placeholder="No of Days"
                      style={{ width: '50px' }}
                    />
                  </th>
                  <th colSpan="2">Attendance (5%)</th>
                  <th colSpan="7" rowSpan="2">Assignment 5%</th>
                  <th colSpan="12">Quizzes/Seatwork 10%</th>
                  <th colSpan="7" rowSpan="2">Recitation/Participation 10%</th>
                  <th colSpan="1" rowSpan="2">CS Grade</th>
                  <th colSpan="1" rowSpan="2">PBA 1</th>
                  <th colSpan="1" rowSpan="2">PBA 2</th>
                  <th colSpan="1" rowSpan="2">PBA 3</th>
                  <th colSpan="1" rowSpan="2">PBA 4</th>
                  <th colSpan="1" rowSpan="3">Total</th>
                  <th colSpan="1" rowSpan="2">PBA Grade</th>
                </tr>
                <tr>
                  <th colSpan="4">Total Student Attendance</th>
                  <th colSpan="2">5%</th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th colSpan="5">Equivalent Rate</th>
                  <th rowSpan="2" colSpan="1">Total</th>
                  <th rowSpan="2" colSpan="1">10%</th>
                </tr>
                <tr>
                  <th>P</th>
                  <th>L</th>
                  <th>E</th>
                  <th className="narrow-column">A</th>
                  <th>50%</th>
                  <th>5%</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>5</th>
                  <th>Total</th>
                  <th>5%</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>5</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>5</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>5</th>
                  <th>Total</th>
                  <th>10%</th>
                  <th>30%</th>
                  <th>
                    <select style={{ width: '100px' }}>
                      <option value="" defaultChecked>Select</option>
                      <option value="Option1">Projects</option>
                      <option value="Option2">Reports</option>
                      <option value="Option3">Reflection</option>
                      <option value="Option2">Portfolio</option>
                      <option value="Option3">Research</option>
                      <option value="Option3">Lab</option>
                    </select>
                  </th>
                  <th>
                    <select style={{ width: '100px' }}>
                      <option value="" defaultChecked>Select</option>
                      <option value="Option1">Projects</option>
                      <option value="Option2">Reports</option>
                      <option value="Option3">Reflection</option>
                      <option value="Option2">Portfolio</option>
                      <option value="Option3">Research</option>
                      <option value="Option3">Lab</option>
                    </select>
                  </th>
                  <th>
                    <select style={{ width: '100px' }}>
                      <option value="" defaultChecked>Select</option>
                      <option value="Option1">Projects</option>
                      <option value="Option2">Reports</option>
                      <option value="Option3">Reflection</option>
                      <option value="Option2">Portfolio</option>
                      <option value="Option3">Research</option>
                      <option value="Option3">Lab</option>
                    </select>
                  </th>
                  <th>
                    <select style={{ width: '100px' }}>
                      <option value="" defaultChecked>Select</option>
                      <option value="Option1">Projects</option>
                      <option value="Option2">Reports</option>
                      <option value="Option3">Reflection</option>
                      <option value="Option2">Portfolio</option>
                      <option value="Option3">Research</option>
                      <option value="Option3">Lab</option>
                    </select>
                  </th>
                  <th>30%</th>
                  <th><input type="number" style={{ width: '70px' }} placeholder="Items" /></th>
                  <th colSpan="2" rowSpan="1">40%</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    {attendanceColumns.map((column, index) => (
                      <td key={index}>
                        <select
                          value={status[student.id]?.[index + 1] || ''}
                          onChange={(e) => handleStatusChange(student.id, index + 1, e.target.value)}
                        >
                          <option value="">Select Status</option>
                          <option value="P">P</option>
                          <option value="L">L</option>
                          <option value="E">E</option>
                          <option value="A">A</option>
                        </select>
                      </td>
                    ))}
                    <td>{status[student.id]?.P ? 1 : 0}</td>
                    <td>{status[student.id]?.L ? 1 : 0}</td>
                    <td>{status[student.id]?.E ? 1 : 0}</td>
                    <td className="narrow-column">{status[student.id]?.A ? 1 : 0}</td>
                    <td></td> 
                    <td></td> 
                    {/* Add input fields for assignments */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 1 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 2 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 3 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 4 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Assignment 5 */}
                    <td></td> {/* Total for Assignments */}
                    <td></td> {/* 5% for Assignments */}
                    {/* Quizzes/Seatwork Columns */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 1 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 2 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 3 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 4 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Quiz 5 */}
                    <td></td> {/* Equivalent Rate 1 */}
                    <td></td> {/* Equivalent Rate 2 */}
                    <td></td> {/* Equivalent Rate 3 */}
                    <td></td> {/* Equivalent Rate 4 */}
                    <td></td> {/* Equivalent Rate 5 */}
                    <td></td> {/* Total */}
                    <td></td> {/* 10% */}
                    {/* Recitation/Participation Columns */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 1 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 2 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 3 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 4 */}
                    <td><input type="number" style={{ width: '50px' }} /></td> {/* Recitation 5 */}
                    <td></td> {/* Recitation Total */}
                    <td></td> {/* Recitation 10% */}
                    <td></td> {/* CS GRADE 30% */}
                    <td><input type="number" style={{ width: '100px' }} /></td> {/* PBA 1 */}
                    <td><input type="number" readOnly style={{ width: '100px' }} /></td> {/* PBA 2 */}
                    <td><input type="number" readOnly style={{ width: '100px' }} /></td> {/* PBA 3 */}
                    <td><input type="number" readOnly style={{ width: '100px' }} /></td> {/* PBA 4 */}
                    <td></td>
                    <td></td>
                    <td><input type="number" readOnly style={{ width: '70px' }} /></td> {/* 5% for Assignments */}
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <select
                        value={status[student.id] || ''}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      >
                        <option defaultChecked="">Select Status</option>
                        <option value="Failed">Failed</option>
                        <option value="Passed">Passed</option>
                        <option value="OD">OD</option>
                        <option value="UD">UD</option>
                        <option value="INC">INC</option>
                        <option value="NC">NC</option>
                        <option value="FA">FA</option>
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
