import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faGraduationCap, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import './Grades.css';
import '../App.css';


const Grades = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('grades');
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

  const handleSaveProfile = () => {
    alert('Profile information saved!');
  };

  const handleSavePassword = () => {
    alert('Password changed successfully!');
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="grades-container d-flex">
      <div className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}>
        <img src="pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">Hello, Abigail!</div>
        <nav className="menu mb-3">
          <Link to="/dashboard" className="menu-item d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            ENROLLMENT
          </Link>
          <Link to="/schedule" className="menu-item d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            SCHEDULE
          </Link>
          <Link to="/grades" className="menu-item active d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            GRADES
          </Link>
        </nav>
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
            <span className="me-2">CRUZ, ABIGAIL (2020-00202-PQ-O)</span>
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
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {selectedSection === 'grades' && (
          <section className="m-3">
          <h2 className='custom-font custom-color-green-font'>Grades AY 2024-2025</h2>
          <div className='card card-success border-success rounded'>
            <table className="table">
              <thead className='table-success'>
                <tr>
                  <th className='text-success custom-font'>Code</th>
                  <th className='text-success custom-font'>Subject</th>
                  <th className='text-success custom-font'>Total Units</th>
                  <th className='text-success custom-font'>Grade</th>
                  <th className='text-success custom-font'>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='custom-font'>IT101</td>
                  <td className='custom-font'>Introduction to Information Technology</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.5</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>CS102</td>
                  <td className='custom-font'>Computer Programming</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.2</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>DM103</td>
                  <td className='custom-font'>Discrete Mathematics</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.0</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>DB104</td>
                  <td className='custom-font'>Database Systems</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.7</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>OS105</td>
                  <td className='custom-font'>Operating Systems</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>2.0</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>WN106</td>
                  <td className='custom-font'>Web Development</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.3</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>SE107</td>
                  <td className='custom-font'>Software Engineering</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.4</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>AE108</td>
                  <td className='custom-font'>Advanced Algorithms</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.6</td>
                  <td className='custom-font'>P</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        )}

        {selectedSection === 'profile' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Profile</h2>
            <div className="custome-font custom-color-green-font fs-6 mb-2">Student Number: 2020-00202-PQ-O</div>
            <input type="text" placeholder="First Name" className="form-control custom-color-green-font mb-2" required />
            <input type="text" placeholder="Last Name" className="form-control custom-color-green-font mb-2" required />
            <input type="email" placeholder="Email" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={handleSaveProfile}>
              Save
            </button>
          </section>
        )}

        {selectedSection === 'change-password' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Change Password</h2>
            <input type="password" placeholder="New Password" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={handleSavePassword}>
              Save
            </button>
          </section>
        )}

        <div className="row">
          <div className="col-12 col-md-4">
            <button className="btn custom-color-font bg-custom-color-green mt-2 ms-md-3 mt-md-0 w-100 w-md-auto p-2 custom-font" onClick={handlePrintCertificate}>
              Print Certificate of Grades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grades;
