import React, { useState } from 'react';
import RegistrarBatchYear from './RegistrarBatchYear'; // Import the target component
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import the back icon

export default function RegistrarGrades() {
  // State to manage the active view and the selected program
  const [activeView, setActiveView] = useState('programs');
  const [selectedProgram, setSelectedProgram] = useState('');

  // Function to switch to the RegistrarBatchYear view
  const goToBatchYearView = (program) => {
    setSelectedProgram(program);
    setActiveView('batchYear');
  };

  // Function to go back to the Programs view
  const goBackToProgramsView = () => {
    setActiveView('programs');
  };

  return (
    <section className="container-fluid ms-0">
      {activeView === 'programs' ? (
        // Programs buttons section
        <div className="row g-4">
          <h2 className="custom-font custom-color-green-font">Programs</h2>
          {/* BS in Entrepreneurship */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('BS in Entrepreneurship')}
            >
              <span className="ms-2">BS in Entrepreneurship</span>
            </button>
          </div>

          {/* BS in Real Estate Management */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('BS in Real Estate Management')}
            >
              <span className="ms-2">BS in Real Estate Management</span>
            </button>
          </div>

          {/* BS in Tourism Management */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('BS in Tourism Management')}
            >
              <span className="ms-2">BS in Tourism Management</span>
            </button>
          </div>

          {/* 2-Year Hospitality Management Services */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('2-Year Hospitality Mgmt Services')}
            >
              <span className="ms-2">2-Year Hospitality Mgmt Services</span>
            </button>
          </div>

          {/* Bookkeeping NC III */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('Bookkeeping NC III')}
            >
              <span className="ms-2">Bookkeeping NC III</span>
            </button>
          </div>

          {/* Food and Beverage Services NC II */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('F&B Services NC II')}
            >
              <span className="ms-2">F&B Services NC II</span>
            </button>
          </div>

          {/* Housekeeping NC II */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('Housekeeping NC II')}
            >
              <span className="ms-2">Housekeeping NC II</span>
            </button>
          </div>

          
          <div>
            
          </div>

          <div className='row g-4'>
          <h2 className="custom-font custom-color-green-font">Others</h2>
            {/* Latin honors */}
          <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('Latin Honors')}
            >
              <span className="ms-2">Latin Honor</span>
            </button>
          </div>

            {/* Grades Archives */}
            <div className="col-6 col-md-3 mb-3">
            <button
              className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
              style={{ height: '200px', width: '100%' }}
              onClick={() => goToBatchYearView('Grades Archives')}
            >
              <span className="ms-2">Grades Archives</span>
            </button>
          </div>

          </div>
        </div>
      ) : (
        // Batch Year View
        <div>
          {/* Flex container for back button and title */}
          <div className="d-flex align-items-center mb-4">
            <button className="btn btn-link" onClick={goBackToProgramsView}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2 custom-color-green-font" /> {/* Back icon */}
            </button>
            <h2 className="mb-0 custom-color-green-font">{selectedProgram}</h2>
          </div>

          {/* RegistrarBatchYear Component */}
          <RegistrarBatchYear selectedProgram={selectedProgram} />
        </div>
      )}
    </section>
  );
}
