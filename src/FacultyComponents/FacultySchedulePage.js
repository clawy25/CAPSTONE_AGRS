import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars, faChalkboardTeacher, faCalendar } from '@fortawesome/free-solid-svg-icons';
import '../StudentComponents/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacultySchedulePage = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('schedule');
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

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
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
        <img src="pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">Hello, John Doe!</div>
        <nav className="menu mb-3">
          <Link to="/faculty-dashboard" className="menu-item d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            CLASSES
          </Link>
          <Link to="/faculty-schedule" className="menu-item active d-flex align-items-center mb-2">
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

        {selectedSection === 'schedule' && (
          <section className="m-3">
            <h2 className='custom-font custom-color-green-font'>Schedule</h2>
            <div className='card card-success border-success rounded'>
              <table className="table">
                <thead className='table-success'>
                  <tr>
                    <th className='text-success custom-font'>Subject</th>
                    <th className='text-success custom-font'>Class</th>
                    <th className='text-success custom-font'>Time</th>
                    <th className='text-success custom-font'>Hours</th>
                  </tr>
                </thead>
                <tbody>
                <tr>
                  <td className='custom-font'>Introduction to Information Technology</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>08:00 AM - 09:30 AM (Mon, Wed)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Computer Programming</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>09:40 AM - 11:10 AM (Mon, Wed)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Discrete Mathematics</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>02:00 PM - 03:00 PM (Mon, Wed)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Data Structures and Algorithm</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>08:00 AM - 09:30 AM (Tue, Thu)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Web Development</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>01:00 PM - 02:30 PM (Tue)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Object Oriented Programming</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>08:00 AM - 11:00 AM (Fri)</td>
                  <td className='custom-font'>3</td>
                </tr>
                <tr>
                  <td className='custom-font'>Human Computer Interaction</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>07:00 AM - 09:30 AM (Sat)</td>
                  <td className='custom-font'>2</td>
                </tr>
                <tr>
                  <td className='custom-font'>Network Administration</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>01:00 PM - 02:30 PM (Wed, Fri)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>People and the Earth's Ecosystem</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>11:20 AM - 12:50 PM (Mon, Thu)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Database Administration</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>02:40 PM - 04:10 PM (Tue, Thu)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Multimedia</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>08:00 AM - 11:00 AM (Fri)</td>
                  <td className='custom-font'>3</td>
                </tr>

                </tbody>
              </table>
            </div>
          </section>
        )}

        {selectedSection === 'profile' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Profile</h2>
            <div className="custome-font custom-color-green-font fs-6 mb-2">Faculty ID: 2020-00202-PQ-O</div>
            <input type="text" placeholder="First Name" className="form-control custom-color-green-font mb-2" required />
            <input type="text" placeholder="Last Name" className="form-control custom-color-green-font mb-2" required />
            <input type="email" placeholder="Email" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Profile information saved!')}>
              Save
            </button>
          </section>
        )}

        {selectedSection === 'change-password' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Change Password</h2>
            <input type="password" placeholder="New Password" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Password changed successfully!')}>
              Save
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default FacultySchedulePage;
