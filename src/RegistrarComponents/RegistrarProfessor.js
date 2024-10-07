import React, { useState, useEffect } from 'react';
import RegistrarYearSectionTab from './RegistrarBatchYear';
import ProgramModel from '../ReactModels/ProgramModel'; // Import the ProgramModel
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import the back icon

export default function RegistrarProfessor() {
  // State to manage the active view
  const [activeView, setActiveView] = useState('professor'); // Start with professor view
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programs, setPrograms] = useState([]); // State to hold programs
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to manage errors

  // Fetch programs on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programData = await ProgramModel.fetchAllPrograms();
        console.log('Program data:', programData); // Log the fetched data
        setPrograms(programData);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError('Failed to fetch programs');
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchPrograms();
  }, []);

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
      {loading && <p>Loading programs...</p>} {/* Loading state */}
      {error && <p className="text-danger">{error}</p>} {/* Error state */}
      {!loading && !error && activeView === 'professor' && (
        // Professor buttons section
        <div className="row g-4">
          <h2 className="custom-font custom-color-green-font">Programs</h2>
          {programs.length === 0 ? (
            <p>No programs available.</p> // Display message if no programs
          ) : (
            programs.map((program) => (
              <div key={program.id} className="col-6 col-md-3 mb-3">
                <button
                  className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
                  style={{ height: '200px', width: '100%' }}
                  onClick={() => goToYearSectionTab(program.programName)} // Switch to Year Section Tab with program
                >
                  <span className="ms-2">{program.programName}</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
      {activeView === 'yearSectionTab' && (
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
