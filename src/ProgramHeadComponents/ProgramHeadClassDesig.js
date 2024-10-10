import React, { useState, useEffect } from 'react';
import ProgramHeadClassDesigTable from './ProgramHeadClassDesigTable'; 
import ProgramHeadEditSubjects from './ProgramHeadEditSubjects';
import ProgramHeadEditProfs from './ProgramHeadEditProfs';
import ProgramModel from '../ReactModels/ProgramModel'; 
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; 

export default function ProgramHeadClassDesig() {
  const [activeView, setActiveView] = useState('professor'); 
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programs, setPrograms] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programData = await ProgramModel.fetchAllPrograms();
        console.log('Program data:', programData);
        setPrograms(programData); 
        setLoading(false); 
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError('Failed to fetch programs');
        setLoading(false); 
      }
    };

    fetchPrograms();
  }, []);

  const goToYearSectionTab = (program) => {
    setSelectedProgram(program);
    setActiveView('yearSectionTab');
  };

  const goBackToProfessorView = () => {
    setActiveView('professor');
  };

  const goToEditSubjects = () => {
    setActiveView('editSubjects');
  };

  const goToEditProfessors = () => {
    setActiveView('editProfessors');
  };

  const handleGoBack = () => {
    setActiveView('professor');
  };

  return (
    <section className="container-fluid ms-0">
      {loading && <p>Loading programs...</p>} 
      {error && <p className="text-danger">{error}</p>} 

      {!loading && !error && activeView === 'professor' && (
        <div>
          <div className="row g-4">
            <h2 className="custom-font custom-color-green-font">Programs</h2>

            {programs.length === 0 ? (
              <p>No programs available.</p>
            ) : (
              programs.map((program) => (
                <div key={program.id} className="col-6 col-md-3 mb-3">
                  <button
                    className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
                    style={{ height: '200px', width: '100%' }}
                    onClick={() => goToYearSectionTab(program.programName)} 
                  >
                    <span className="ms-2">{program.programName}</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Others section */}
          <div className="row g-4 mt-5">
            <h2 className="custom-font custom-color-green-font">Others</h2>

            <div className="col-6 col-md-3 mb-3">
              <button
                className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
                style={{ height: '200px', width: '100%' }}
                onClick={goToEditSubjects} // Switch to Edit Subjects
              >
                <span className="ms-2">Edit Subjects</span>
              </button>
            </div>

            <div className="col-6 col-md-3 mb-3">
              <button
                className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
                style={{ height: '200px', width: '100%' }}
                onClick={goToEditProfessors} // Switch to Edit Professors
              >
                <span className="ms-2">Edit Professors</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'yearSectionTab' && (
        <div>
          <div className="d-flex align-items-center mb-4">
            <button className="btn btn-link" onClick={goBackToProfessorView}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2 custom-color-green-font" />
            </button>
            <h2 className="mb-0 custom-color-green-font">{selectedProgram}</h2>
          </div>

          <ProgramHeadClassDesigTable selectedProgram={selectedProgram} />
        </div>
      )}

      {activeView === 'editSubjects' && (
        <div>
          <div className="d-flex align-items-center mb-4">
            <button className="btn btn-link" onClick={handleGoBack}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2 custom-color-green-font" />
            </button>
            <h2 className="custom-color-green-font">Edit Subjects</h2>
          </div>
          <ProgramHeadEditSubjects onGoBack={handleGoBack} />
        </div>
      )}


      {activeView === 'editProfessors' && (
          <div>
              <div className="d-flex align-items-center mb-4">
                  <button className="btn btn-link" onClick={handleGoBack}>
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2 custom-color-green-font" />
                  </button>
                  <h2 className="custom-color-green-font">Edit Professors</h2>
              </div>
              <ProgramHeadEditProfs onGoBack={handleGoBack} />
          </div>
      )}
    </section>
  );
}
