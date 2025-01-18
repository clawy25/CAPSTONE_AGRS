import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { Tabs, Tab } from 'react-bootstrap'; // Import Tabs and Table from react-bootstrap

export default function ProgramHeadGradesValidation() {
  const [activeTab, setActiveTab] = useState('MOG'); // State to keep track of the main tab (MOG or SOG)
  const [activeYearTabMOG, setActiveYearTabMOG] = useState('First Year'); // State for year tabs in MOG
  const [activeYearTabSOG, setActiveYearTabSOG] = useState('First Year'); // State for year tabs in SOG
  const navigate = useNavigate(); // Use navigate for file viewing

  // Sample data for MOG with sections per year
  const mogData = {
    'First Year': [
      { year: '2010-2011', section: 'A', programCode: 'ENTR', fileUrl: '/files/mog-entr-2010-2011.pdf' },
      { year: '2010-2011', section: 'B', programCode: 'REM', fileUrl: '/files/mog-rem-2010-2011.pdf' },
      { year: '2010-2011', section: 'C', programCode: 'TOUR', fileUrl: '/files/mog-tour-2010-2011.pdf' },
      { year: '2010-2011', section: 'D', programCode: 'HOSP', fileUrl: '/files/mog-hosp-2010-2011.pdf' },
      { year: '2010-2011', section: 'E', programCode: 'BKNC3', fileUrl: '/files/mog-bknc3-2010-2011.pdf' },
      { year: '2010-2011', section: 'F', programCode: 'CS', fileUrl: '/files/mog-cs-2010-2011.pdf' },
      { year: '2010-2011', section: 'G', programCode: 'IT', fileUrl: '/files/mog-it-2010-2011.pdf' },
      { year: '2010-2011', section: 'H', programCode: 'BSIT', fileUrl: '/files/mog-bsit-2010-2011.pdf' },
    ],
    'Second Year': [
      { year: '2011-2012', section: 'A', programCode: 'ENTR', fileUrl: '/files/mog-entr-2011-2012.pdf' },
      { year: '2011-2012', section: 'B', programCode: 'REM', fileUrl: '/files/mog-rem-2011-2012.pdf' },
      { year: '2011-2012', section: 'C', programCode: 'TOUR', fileUrl: '/files/mog-tour-2011-2012.pdf' },
      { year: '2011-2012', section: 'D', programCode: 'HOSP', fileUrl: '/files/mog-hosp-2011-2012.pdf' },
      { year: '2011-2012', section: 'E', programCode: 'BKNC3', fileUrl: '/files/mog-bknc3-2011-2012.pdf' },
      { year: '2011-2012', section: 'F', programCode: 'CS', fileUrl: '/files/mog-cs-2011-2012.pdf' },
      { year: '2011-2012', section: 'G', programCode: 'IT', fileUrl: '/files/mog-it-2011-2012.pdf' },
      { year: '2011-2012', section: 'H', programCode: 'BSIT', fileUrl: '/files/mog-bsit-2011-2012.pdf' },
    ],
  };

  // Sample data for SOG with 8 sections per year
  const sogData = {
    'First Year': [
      { year: '2015-2016', section: 'A', programCode: 'FBSNC2', fileUrl: '/files/sog-fbsnc2-2015-2016.pdf' },
      { year: '2015-2016', section: 'B', programCode: 'HSKNC2', fileUrl: '/files/sog-hsknc2-2015-2016.pdf' },
      { year: '2015-2016', section: 'C', programCode: 'BA', fileUrl: '/files/sog-ba-2015-2016.pdf' },
      { year: '2015-2016', section: 'D', programCode: 'CS', fileUrl: '/files/sog-cs-2015-2016.pdf' },
      { year: '2015-2016', section: 'E', programCode: 'IT', fileUrl: '/files/sog-it-2015-2016.pdf' },
      { year: '2015-2016', section: 'F', programCode: 'BSIT', fileUrl: '/files/sog-bsit-2015-2016.pdf' },
    ],
    'Second Year': [
      { year: '2016-2017', section: 'A', programCode: 'FBSNC2', fileUrl: '/files/sog-fbsnc2-2016-2017.pdf' },
      { year: '2016-2017', section: 'B', programCode: 'HSKNC2', fileUrl: '/files/sog-hsknc2-2016-2017.pdf' },
      { year: '2016-2017', section: 'C', programCode: 'BA', fileUrl: '/files/sog-ba-2016-2017.pdf' },
      { year: '2016-2017', section: 'D', programCode: 'CS', fileUrl: '/files/sog-cs-2016-2017.pdf' },
      { year: '2016-2017', section: 'E', programCode: 'IT', fileUrl: '/files/sog-it-2016-2017.pdf' },
    ],
  };

  // Get current data for MOG and SOG based on the active year tab
  const currentDataMOG = mogData[activeYearTabMOG] || [];
  const currentDataSOG = sogData[activeYearTabSOG] || [];

  // Function to handle row click and navigate to the file
  const handleButtonClick = (fileUrl) => {
    navigate(fileUrl); // Navigate to the file URL
  };

  return (
    <div className="container-fluid bg-white pt-3 px-4 rounded">
      {/* Tabs for MOG and SOG */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        id="main-tabs"
        className="mb-3 custom-color-green-font custom-font"
      >
        {/* Masterlist of Grades (MOG) Tab */}
        <Tab eventKey="MOG" title="Masterlist of Grades">
          <Tabs
            activeKey={activeYearTabMOG}
            onSelect={(k) => setActiveYearTabMOG(k)}
            id="mog-year-tabs"
            className="mt-3"
          >
            {['First Year', 'Second Year'].map((yearTab) => (
              <Tab eventKey={yearTab} title={yearTab} key={yearTab}>
                <div className="row">
                  {currentDataMOG.length > 0 ? (
                    currentDataMOG.map((data, index) => (
                      <div className="col-md-3 col-lg-3 my-4" key={index}>
                        <button
                          className="btn btn-outline-success w-100 h-100 d-flex flex-column justify-content-center align-items-center"
                          style={{ height: '150px', cursor: 'pointer' }}
                          onClick={() => handleButtonClick(data.fileUrl)}
                        >
                          <span className="fs-5">{`${yearTab} - Section ${data.section}`}</span>
                          <span className="fs-6">Batch Year: {data.year}</span>
                          <span className="fs-6">Program Code: {data.programCode}</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <p className="text-center">No data available for this year.</p>
                    </div>
                  )}
                </div>
              </Tab>
            ))}
          </Tabs>
        </Tab>

        {/* Summary of Grades (SOG) Tab */}
        <Tab eventKey="SOG" title="Summary of Grades">
          <Tabs
            activeKey={activeYearTabSOG}
            onSelect={(k) => setActiveYearTabSOG(k)}
            id="sog-year-tabs"
            className="mt-3"
          >
            {['First Year', 'Second Year'].map((yearTab) => (
              <Tab eventKey={yearTab} title={yearTab} key={yearTab}>
                <div className="row">
                  {currentDataSOG.length > 0 ? (
                    currentDataSOG.map((data, index) => (
                      <div className="col-md-3 col-lg-3 my-4" key={index}>
                        <button
                          className="btn btn-outline-success w-100 h-100 d-flex flex-column justify-content-center align-items-center"
                          style={{ height: '150px', cursor: 'pointer' }}
                          onClick={() => handleButtonClick(data.fileUrl)}
                        >
                          <span className="fs-5">{`${yearTab} - Section ${data.section}`}</span>
                          <span className="fs-6">Batch Year: {data.year}</span>
                          <span className="fs-6">Program Code: {data.programCode}</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <p className="text-center">No data available for this year.</p>
                    </div>
                  )}
                </div>
              </Tab>
            ))}
          </Tabs>
        </Tab>
      </Tabs>
    </div>
  );
}
