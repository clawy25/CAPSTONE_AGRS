import React, { useState } from 'react';
import RegistrarYearSectionTab from './RegistrarYearSectionTab';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import the back icon

export default function RegistrarProfessor() {
  // State to manage the active view
  const [activeView, setActiveView] = useState('professor'); // Start with professor view
  const [selectedProgram, setSelectedProgram] = useState('');

  // Function to switch to the year/section tab
  const goToYearSectionTab = (program) => {
    setSelectedProgram(program);
    setActiveView('yearSectionTab');
  };

  // Function to go back to the professor view
  const goBackToProfessorView = () => {
    setActiveView('professor');
  };

  return (
    <section className="container-fluid ms-0">
      {activeView === 'professor' ? (
        // Professor buttons section
        <div className="row g-4">
            <h2 className="custom-font custom-color-green-font">Programs</h2>
          {/* BS in Entrepreneurship */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToYearSectionTab('BS in Entrepreneurship')} // Switch to Year Section Tab with program
            >
              <span className="ms-2">BS in Entrepreneurship</span>
            </button>
          </div>

          {/* BS in Real Estate Management */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToYearSectionTab('BS in Real Estate Management')}
            >
              <span className="ms-2">BS in Real Estate Management</span>
            </button>
          </div>

          {/* BS in Tourism Management */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToYearSectionTab('BS in Tourism Management')}
            >
              <span className="ms-2">BS in Tourism Management</span>
            </button>
          </div>

          {/* 2-Year Hospitality Management Services */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToYearSectionTab('2-Year Hospitality Management Services')}
            >
              <span className="ms-2">2-Year Hospitality Mgmt Services</span>
            </button>
          </div>

          {/* Bookkeeping NC III */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToYearSectionTab('Bookkeeping NC III')}
            >
              <span className="ms-2">Bookkeeping NC III</span>
            </button>
          </div>

          {/* Food and Beverage Services NC II */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToYearSectionTab('F&B Services NC II')}
            >
              <span className="ms-2">F&B Services NC II</span>
            </button>
          </div>

          {/* Housekeeping NC II */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToYearSectionTab('Housekeeping NC II')}
            >
              <span className="ms-2">Housekeeping NC II</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Flex container for back button and title */}
          <div className="d-flex align-items-center mb-4">
            <button className="btn btn-link" onClick={goBackToProfessorView}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2 custom-color-green-font" /> {/* Font Awesome back icon */}
            </button>
            <h2 className="mb-0 custom-color-green-font">{selectedProgram}</h2>
          </div>

          {/* Year and Section Tab Component, pass the selected program */}
          <RegistrarYearSectionTab selectedProgram={selectedProgram} />
        </div>
      )}
    </section>
  );
}
