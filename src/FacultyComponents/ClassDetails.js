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
  const [showClassesSubmenu, setShowClassesSubmenu] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('midterm'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleProfileClick = () => {
    setSelectedSection('profile');
    setShowDropdown(false);
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

          <h2>{selectedClass} {selectedPeriod === 'midterm' ? 'Midterm' : 'Finals'}</h2>

          <div className="table-container">
            <div className="table-actions">
              <button className="add-button">Add New Student</button>
              <button className="add-button">Add New Column</button>
              <button className="add-button">Export</button>
              <button className="add-button">Print</button>
            </div>
            <div className="new-buttons">
              <button className="new-action-button">SUMMARY OF GRADES</button>
            </div>

            <table className="details-table">
              <thead>
                <tr>
                  <th colSpan="2">Student Info</th>
                  <th colSpan="2">Attendance</th>
                  <th colSpan="6">Total Student Attendance</th>
                  <th colSpan="22">Class Standing</th>
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
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>123456</td>
                  <td>John Doe</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td>P</td>
                  <td>10</td>
                  <td>2</td>
                  <td>1</td>
                  <td>0</td>
                  <td>13</td>
                  <td>0.71</td>
                  <td>85</td>
                  <td>90</td>
                  <td>80</td>
                  <td>88</td>
                  <td>92</td>
                  <td>435</td>
                  <td>21.75</td>
                  <td>88</td>
                  <td>85</td>
                  <td>90</td>
                  <td>87</td>
                  <td>92</td>
                  <td>442</td>
                  <td>44.2</td>
                  <td>80</td>
                  <td>85</td>
                  <td>90</td>
                  <td>88</td>
                  <td>92</td>
                  <td>435</td>
                  <td>43.5</td>
                </tr>
                <tr>
                  <td>234567</td>
                  <td>Maria Santos</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td>P</td>
                  <td>8</td>
                  <td>3</td>
                  <td>0</td>
                  <td>1</td>
                  <td>12</td>
                  <td>0.6</td>
                  <td>80</td>
                  <td>85</td>
                  <td>78</td>
                  <td>84</td>
                  <td>87</td>
                  <td>414</td>
                  <td>20.7</td>
                  <td>82</td>
                  <td>78</td>
                  <td>85</td>
                  <td>80</td>
                  <td>88</td>
                  <td>413</td>
                  <td>41.3</td>
                  <td>75</td>
                  <td>80</td>
                  <td>85</td>
                  <td>77</td>
                  <td>82</td>
                  <td>399</td>
                  <td>39.9</td>
                </tr>
                <tr>
                  <td>345678</td>
                  <td>Juan dela Cruz</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td>P</td>
                  <td>9</td>
                  <td>2</td>
                  <td>1</td>
                  <td>0</td>
                  <td>12</td>
                  <td>0.6</td>
                  <td>82</td>
                  <td>88</td>
                  <td>80</td>
                  <td>86</td>
                  <td>90</td>
                  <td>426</td>
                  <td>21.3</td>
                  <td>84</td>
                  <td>80</td>
                  <td>88</td>
                  <td>85</td>
                  <td>90</td>
                  <td>427</td>
                  <td>42.7</td>
                  <td>78</td>
                  <td>82</td>
                  <td>87</td>
                  <td>80</td>
                  <td>85</td>
                  <td>412</td>
                  <td>41.2</td>
                </tr>
                <tr>
                  <td>456789</td>
                  <td>Anna Reyes</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td>P</td>
                  <td>11</td>
                  <td>1</td>
                  <td>1</td>
                  <td>0</td>
                  <td>13</td>
                  <td>0.7</td>
                  <td>90</td>
                  <td>92</td>
                  <td>85</td>
                  <td>88</td>
                  <td>90</td>
                  <td>445</td>
                  <td>22.3</td>
                  <td>86</td>
                  <td>90</td>
                  <td>88</td>
                  <td>84</td>
                  <td>92</td>
                  <td>440</td>
                  <td>44.0</td>
                  <td>83</td>
                  <td>87</td>
                  <td>82</td>
                  <td>90</td>
                  <td>88</td>
                  <td>430</td>
                  <td>43.0</td>
                </tr>
                <tr>
                  <td>567890</td>
                  <td>Pedro Gonzales</td>
                  <td>{selectedPeriod === 'midterm' ? '2024-09-01' : '2024-12-01'}</td>
                  <td>P</td>
                  <td>7</td>
                  <td>4</td>
                  <td>0</td>
                  <td>2</td>
                  <td>13</td>
                  <td>0.7</td>
                  <td>77</td>
                  <td>80</td>
                  <td>82</td>
                  <td>85</td>
                  <td>90</td>
                  <td>414</td>
                  <td>20.7</td>
                  <td>79</td>
                  <td>82</td>
                  <td>80</td>
                  <td>78</td>
                  <td>85</td>
                  <td>404</td>
                  <td>40.4</td>
                  <td>76</td>
                  <td>80</td>
                  <td>85</td>
                  <td>77</td>
                  <td>84</td>
                  <td>402</td>
                  <td>40.2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default ClassDetails;
