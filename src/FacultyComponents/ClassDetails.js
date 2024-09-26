import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars, faChalkboardTeacher, faCalendar, faSearch } from '@fortawesome/free-solid-svg-icons';
import '../StudentComponents/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClassDetails = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('midterm'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleProfileClick = () => {
    setSelectedSection('profile');
    setShowDropdown(false);
  };
  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleChangePasswordClick = () => {
    setSelectedSection('change-password');
    setShowDropdown(false);
  };

  const handleClassClick = (className) => {
    setSelectedClass(className);
    navigate(`/class-details/${className}`);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showDropdown]);

  const renderTableContent = () => {
    switch (selectedPeriod) {
      case 'midterm':
        return (
          <table className="details-table">
            <thead>
              <tr>
                <th colSpan="2">Student Info</th>
                <th colSpan="2">Attendance</th>
                <th colSpan="6">Total Student Attendance</th>
                <th colSpan="22">Class Standing</th>
                <th colSpan="6">Performance Based Assessment 30%</th>
                <th colSpan="4">Midterm Exam</th> 
                <th colSpan="1">Midterm Grade</th>
                <th colSpan="1">Numerical Equivalent</th>
                <th colSpan="1">Remarks</th>
              </tr>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>P</th>
                <th>L</th>
                <th>E</th>
                <th>A</th>
                <th>TOTAL</th>
                <th>5%</th>
                <th>Assignment 1</th>
                <th>Assignment 2</th>
                <th>Assignment 3</th>
                <th>Assignment 4</th>
                <th>Assignment 5</th>
                <th>Total Assignment</th>
                <th>5%</th>
                <th>Quiz 1</th>
                <th>Quiz 2</th>
                <th>Quiz 3</th>
                <th>Quiz 4</th>
                <th>Quiz 5</th>
                <th>Total Quiz</th>
                <th>10%</th>
                <th>Recitation 1</th>
                <th>Recitation 2</th>
                <th>Recitation 3</th>
                <th>Recitation 4</th>
                <th>Recitation 5</th>
                <th>Total Recitation</th>
                <th>10%</th>
                <th>CS GRADE 30%</th>
                <th>PBA 1</th>
                <th>PBA 2</th>
                <th>PBA 3</th>
                <th>PBA 4</th>
                <th>TOTAL</th>
                <th>PBA GRADE 30%</th>
                <th>No of Items</th> 
                <th>Extra Items</th> 
                <th colSpan="2">40%</th>
                <th>TOTAL</th> 
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>123456</td>
                <td>John Doe</td>
                <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                <td><input type="text" placeholder="Status" /></td>
                <td></td> 
                <td></td> 
                <td></td> 
                <td></td> 
                <td></td> 
                <td></td> 
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td> 
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td> 
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td> 
                <td></td> 
                <td><input type="number" placeholder="Enter PBA 1" /></td>
                <td><input type="number" placeholder="Enter PBA 2" /></td>
                <td><input type="number" placeholder="Enter PBA 3" /></td>
                <td><input type="number" placeholder="Enter PBA 4" /></td>
                <td></td>
                <td></td> 
                <td><input type="number" placeholder="Enter No of Items" /></td> 
                <td><input type="number" placeholder="Enter Extra Items" /></td> 
                <td><input type="number" placeholder="Enter" /></td> 
                <td><input type="number" placeholder="Enter" /></td> 
                <td></td> 
                <td></td>
                <td></td>
              </tr>
      
              <tr>
                <td>234567</td>
                <td>Jane Smith</td>
                <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                <td><input type="text" placeholder="Status" /></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter PBA 1" /></td>
                <td><input type="number" placeholder="Enter PBA 2" /></td>
                <td><input type="number" placeholder="Enter PBA 3" /></td>
                <td><input type="number" placeholder="Enter PBA 4" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter No of Items" /></td>
                <td><input type="number" placeholder="Enter Extra Items" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
      
              <tr>
                <td>345678</td>
                <td>Michael Brown</td>
                <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                <td><input type="text" placeholder="Status" /></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter PBA 1" /></td>
                <td><input type="number" placeholder="Enter PBA 2" /></td>
                <td><input type="number" placeholder="Enter PBA 3" /></td>
                <td><input type="number" placeholder="Enter PBA 4" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter No of Items" /></td>
                <td><input type="number" placeholder="Enter Extra Items" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td>456789</td>
                <td>Alice Johnson</td>
                <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                <td><input type="text" placeholder="Status" /></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter PBA 1" /></td>
                <td><input type="number" placeholder="Enter PBA 2" /></td>
                <td><input type="number" placeholder="Enter PBA 3" /></td>
                <td><input type="number" placeholder="Enter PBA 4" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter No of Items" /></td>
                <td><input type="number" placeholder="Enter Extra Items" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td>567890</td>
                <td>David Wilson</td>
                <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                <td><input type="text" placeholder="Status" /></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter PBA 1" /></td>
                <td><input type="number" placeholder="Enter PBA 2" /></td>
                <td><input type="number" placeholder="Enter PBA 3" /></td>
                <td><input type="number" placeholder="Enter PBA 4" /></td>
                <td></td>
                <td></td>
                <td><input type="number" placeholder="Enter No of Items" /></td>
                <td><input type="number" placeholder="Enter Extra Items" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td><input type="number" placeholder="Enter" /></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        );

      
      case 'finals':
        return (
            <table className="details-table">
              <thead>
                <tr>
                  <th colSpan="2">Student Info</th>
                  <th colSpan="2">Attendance</th>
                  <th colSpan="6">Total Student Attendance</th>
                  <th colSpan="22">Class Standing</th>
                  <th colSpan="6">Performance Based Assessment 30%</th>
                  <th colSpan="4">Final Exam</th> 
                  <th colSpan="1">Final Grade</th> 
                  <th colSpan="1">Numerical Equivalent</th>
                  <th colSpan="1">Remarks</th>
                </tr>
                <tr>
                  <th>Student Number</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>P</th>
                  <th>L</th>
                  <th>E</th>
                  <th>A</th>
                  <th>TOTAL</th>
                  <th>5%</th>
                  <th>Assignment 1</th>
                  <th>Assignment 2</th>
                  <th>Assignment 3</th>
                  <th>Assignment 4</th>
                  <th>Assignment 5</th>
                  <th>Total Assignment</th>
                  <th>5%</th>
                  <th>Quiz 1</th>
                  <th>Quiz 2</th>
                  <th>Quiz 3</th>
                  <th>Quiz 4</th>
                  <th>Quiz 5</th>
                  <th>Total Quiz</th>
                  <th>10%</th>
                  <th>Recitation 1</th>
                  <th>Recitation 2</th>
                  <th>Recitation 3</th>
                  <th>Recitation 4</th>
                  <th>Recitation 5</th>
                  <th>Total Recitation</th>
                  <th>10%</th>
                  <th>CS GRADE 30%</th>
                  <th>PBA 1</th>
                  <th>PBA 2</th>
                  <th>PBA 3</th>
                  <th>PBA 4</th>
                  <th>TOTAL</th>
                  <th>PBA GRADE 30%</th>
                  <th>No of Items</th> 
                  <th>Score</th> 
                  <th colSpan="2">40%</th>
                  <th>TOTAL</th> 
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
              
                <tr>
                  <td>123456</td>
                  <td>John Doe</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td><input type="text" placeholder="Status" /></td>
                  <td></td> 
                  <td></td>
                  <td></td> 
                  <td></td> 
                  <td></td> 
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td> 
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td> 
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td> 
                  <td></td> 
                  <td><input type="number" placeholder="Enter PBA 1" /></td>
                  <td><input type="number" placeholder="Enter PBA 2" /></td>
                  <td><input type="number" placeholder="Enter PBA 3" /></td>
                  <td><input type="number" placeholder="Enter PBA 4" /></td>
                  <td></td>
                  <td></td> 
                  <td><input type="number" placeholder="Enter No of Items" /></td>
                  <td><input type="number" placeholder="Enter Extra Items" /></td> 
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td> 
                  <td></td> 
                  <td></td> 
                  <td></td> 
                </tr>
  
                <tr>
                  <td>234567</td>
                  <td>Jane Smith</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td><input type="text" placeholder="Status" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter PBA 1" /></td>
                  <td><input type="number" placeholder="Enter PBA 2" /></td>
                  <td><input type="number" placeholder="Enter PBA 3" /></td>
                  <td><input type="number" placeholder="Enter PBA 4" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter No of Items" /></td>
                  <td><input type="number" placeholder="Enter Extra Items" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
 
                <tr>
                  <td>345678</td>
                  <td>Michael Brown</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td><input type="text" placeholder="Status" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter PBA 1" /></td>
                  <td><input type="number" placeholder="Enter PBA 2" /></td>
                  <td><input type="number" placeholder="Enter PBA 3" /></td>
                  <td><input type="number" placeholder="Enter PBA 4" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter No of Items" /></td>
                  <td><input type="number" placeholder="Enter Extra Items" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>

                <tr>
                  <td>456789</td>
                  <td>Alice Johnson</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td><input type="text" placeholder="Status" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter PBA 1" /></td>
                  <td><input type="number" placeholder="Enter PBA 2" /></td>
                  <td><input type="number" placeholder="Enter PBA 3" /></td>
                  <td><input type="number" placeholder="Enter PBA 4" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter No of Items" /></td>
                  <td><input type="number" placeholder="Enter Extra Items" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>

                <tr>
                  <td>567890</td>
                  <td>David Wilson</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td><input type="text" placeholder="Status" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter PBA 1" /></td>
                  <td><input type="number" placeholder="Enter PBA 2" /></td>
                  <td><input type="number" placeholder="Enter PBA 3" /></td>
                  <td><input type="number" placeholder="Enter PBA 4" /></td>
                  <td></td>
                  <td></td>
                  <td><input type="number" placeholder="Enter No of Items" /></td>
                  <td><input type="number" placeholder="Enter Extra Items" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td><input type="number" placeholder="Enter" /></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
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
    <div className="dashboard-container d-flex">
      <div className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}>
        <img src="/pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">Hello, John Doe!</div>
        <nav className="menu mb-3">
          <Link to="/faculty-dashboard" className="menu-item active d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            CLASSES
          </Link>
          <Link to="/faculty-schedule" className="menu-item d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            SCHEDULE
          </Link>
          <Link to="/hris" className="menu-item d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            HRIS
          </Link>
        </nav>
        <div className="container mt-5 pt-5">
          <button className="btn bg-transparent custom-color-font mb-auto" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            LOGOUT
          </button>
        </div>
      </div>

      <div className="main-content flex-grow-1">
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">
            PARAÑAQUE CITY COLLEGE
          </h1>
          <button className="btn btn-link text-dark d-md-none" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>

          <div className="user-info d-flex align-items-center position-relative" ref={dropdownRef}>
            <span className="me-2">JOHN DOE (Faculty ID: 2020-00123)</span>
            <FontAwesomeIcon
              icon={faUser}
              className="user-icon"
              onClick={toggleDropdown}
              aria-label="User Menu"
              style={{ cursor: 'pointer' }}
            />
            {showDropdown && (
              <div className="dropdown-menu position-absolute end-0 mt-2 show">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={handleChangePasswordClick}>
                  Change Password
                </button>
              </div>
            )}
          </div>
        </header>
        
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
          ADD COLUMN
        </button>
      </div>
      </div>
        </div>
      </div>
  );
};

export default ClassDetails;
