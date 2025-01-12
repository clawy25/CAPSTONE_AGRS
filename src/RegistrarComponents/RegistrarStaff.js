import React from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import back icon
import RegistrarProgramHead from './RegistrarProgramHead';
import RegistrarStaffAssign from './RegistrarStaffAssign';
import '../App.css';

export default function RegistrarStaff() {
  const navigate = useNavigate(); // Use the useNavigate hook

  // Function to navigate to Program Head
  const handleProgramHeadClick = () => {
    navigate('/registrar-dashboard/staff/program-head');
  };

  // Function to navigate to Registrar Staff
  const handleRegistrarStaffClick = () => {
    navigate('/registrar-dashboard/staff/registrar-staff');
  };

  // Back function to navigate to the previous page
  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <Routes>
        {/* Main staff management page with buttons */}
        <Route
          path=""
          element={
            <div>
              <h2 className="custom-font custom-color-green-font mb-3 mt-2">Manage Staffs</h2>

              <div className="row w-100">
                <div className="col-12 col-md-4 mb-3">
                  {/* Program Head Button */}
                  <button
                    onClick={handleProgramHeadClick} // Use button with onClick
                    className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
                    style={{ height: '200px', width: '100%' }}
                  >
                    Program Head
                  </button>
                </div>

                <div className="col-12 col-md-4 mb-3">
                  {/* Registrar Staff Button */}
                  <button
                    onClick={handleRegistrarStaffClick} // Use button with onClick
                    className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
                    style={{ height: '200px', width: '100%' }}
                  >
                    Registrar Staff
                  </button>
                </div>
              </div>
            </div>
          }
        />

        {/* Program Head page with Back icon and title */}
        <Route
          path="program-head"
          element={
            <div>
              <button
                onClick={handleBackClick}
                className="btn d-flex align-items-center mb-3"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2 custom-color-green-font" />
                <h2 className='custom-color-green-font'>Program Head</h2>
                
              </button>
              
              <RegistrarProgramHead />
            </div>
          }
        />

        {/* Registrar Staff page with Back icon and title */}
        <Route
          path="registrar-staff"
          element={
            <div>
              <button
                onClick={handleBackClick}
                className="btn d-flex align-items-center mb-3"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2 custom-color-green-font" />
                <h2 className='custom-color-green-font'>Registrar Staff</h2>
              </button>
              
              <RegistrarStaffAssign />
            </div>
          }
        />
      </Routes>
    </div>
  );
}
