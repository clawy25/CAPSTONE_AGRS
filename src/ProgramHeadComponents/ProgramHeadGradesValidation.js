import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap for styling
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { Tabs, Tab, Table } from 'react-bootstrap'; // Import Tabs and Table from react-bootstrap

export default function ProgramHeadGradesValidation({ selectedProgram }) {
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
    'Third Year': [
      { year: '2012-2013', section: 'A', programCode: 'ENTR', fileUrl: '/files/mog-entr-2012-2013.pdf' },
      { year: '2012-2013', section: 'B', programCode: 'REM', fileUrl: '/files/mog-rem-2012-2013.pdf' },
      { year: '2012-2013', section: 'C', programCode: 'TOUR', fileUrl: '/files/mog-tour-2012-2013.pdf' },
      { year: '2012-2013', section: 'D', programCode: 'HOSP', fileUrl: '/files/mog-hosp-2012-2013.pdf' },
      { year: '2012-2013', section: 'E', programCode: 'BKNC3', fileUrl: '/files/mog-bknc3-2012-2013.pdf' },
      { year: '2012-2013', section: 'F', programCode: 'CS', fileUrl: '/files/mog-cs-2012-2013.pdf' },
      { year: '2012-2013', section: 'G', programCode: 'IT', fileUrl: '/files/mog-it-2012-2013.pdf' },
      { year: '2012-2013', section: 'H', programCode: 'BSIT', fileUrl: '/files/mog-bsit-2012-2013.pdf' },
    ],
    'Fourth Year': [
      { year: '2013-2014', section: 'A', programCode: 'ENTR', fileUrl: '/files/mog-entr-2013-2014.pdf' },
      { year: '2013-2014', section: 'B', programCode: 'REM', fileUrl: '/files/mog-rem-2013-2014.pdf' },
      { year: '2013-2014', section: 'C', programCode: 'TOUR', fileUrl: '/files/mog-tour-2013-2014.pdf' },
      { year: '2013-2014', section: 'D', programCode: 'HOSP', fileUrl: '/files/mog-hosp-2013-2014.pdf' },
      { year: '2013-2014', section: 'E', programCode: 'BKNC3', fileUrl: '/files/mog-bknc3-2013-2014.pdf' },
      { year: '2013-2014', section: 'F', programCode: 'CS', fileUrl: '/files/mog-cs-2013-2014.pdf' },
      { year: '2013-2014', section: 'G', programCode: 'IT', fileUrl: '/files/mog-it-2013-2014.pdf' },
      { year: '2013-2014', section: 'H', programCode: 'BSIT', fileUrl: '/files/mog-bsit-2013-2014.pdf' },
    ],
  };

  // Sample data for SOG with 8 sections per year (A to H) for each year from First Year to Fourth Year
  const sogData = {
    'First Year': [
      { year: '2015-2016', section: 'A', programCode: 'FBSNC2', fileUrl: '/files/sog-fbsnc2-2015-2016.pdf' },
      { year: '2015-2016', section: 'B', programCode: 'HSKNC2', fileUrl: '/files/sog-hsknc2-2015-2016.pdf' },
      { year: '2015-2016', section: 'C', programCode: 'BA', fileUrl: '/files/sog-ba-2015-2016.pdf' },
      { year: '2015-2016', section: 'D', programCode: 'CS', fileUrl: '/files/sog-cs-2015-2016.pdf' },
      { year: '2015-2016', section: 'E', programCode: 'IT', fileUrl: '/files/sog-it-2015-2016.pdf' },
      { year: '2015-2016', section: 'F', programCode: 'BSIT', fileUrl: '/files/sog-bsit-2015-2016.pdf' },
      { year: '2015-2016', section: 'G', programCode: 'HRM', fileUrl: '/files/sog-hrm-2015-2016.pdf' },
      { year: '2015-2016', section: 'H', programCode: 'MGT', fileUrl: '/files/sog-mgt-2015-2016.pdf' },
    ],
    'Second Year': [
      { year: '2016-2017', section: 'A', programCode: 'FBSNC2', fileUrl: '/files/sog-fbsnc2-2016-2017.pdf' },
      { year: '2016-2017', section: 'B', programCode: 'HSKNC2', fileUrl: '/files/sog-hsknc2-2016-2017.pdf' },
      { year: '2016-2017', section: 'C', programCode: 'BA', fileUrl: '/files/sog-ba-2016-2017.pdf' },
      { year: '2016-2017', section: 'D', programCode: 'CS', fileUrl: '/files/sog-cs-2016-2017.pdf' },
      { year: '2016-2017', section: 'E', programCode: 'IT', fileUrl: '/files/sog-it-2016-2017.pdf' },
      { year: '2016-2017', section: 'F', programCode: 'BSIT', fileUrl: '/files/sog-bsit-2016-2017.pdf' },
      { year: '2016-2017', section: 'G', programCode: 'HRM', fileUrl: '/files/sog-hrm-2016-2017.pdf' },
      { year: '2016-2017', section: 'H', programCode: 'MGT', fileUrl: '/files/sog-mgt-2016-2017.pdf' },
    ],
    'Third Year': [
      { year: '2017-2018', section: 'A', programCode: 'FBSNC2', fileUrl: '/files/sog-fbsnc2-2017-2018.pdf' },
      { year: '2017-2018', section: 'B', programCode: 'HSKNC2', fileUrl: '/files/sog-hsknc2-2017-2018.pdf' },
      { year: '2017-2018', section: 'C', programCode: 'BA', fileUrl: '/files/sog-ba-2017-2018.pdf' },
      { year: '2017-2018', section: 'D', programCode: 'CS', fileUrl: '/files/sog-cs-2017-2018.pdf' },
      { year: '2017-2018', section: 'E', programCode: 'IT', fileUrl: '/files/sog-it-2017-2018.pdf' },
      { year: '2017-2018', section: 'F', programCode: 'BSIT', fileUrl: '/files/sog-bsit-2017-2018.pdf' },
      { year: '2017-2018', section: 'G', programCode: 'HRM', fileUrl: '/files/sog-hrm-2017-2018.pdf' },
      { year: '2017-2018', section: 'H', programCode: 'MGT', fileUrl: '/files/sog-mgt-2017-2018.pdf' },
    ],
    'Fourth Year': [
      { year: '2018-2019', section: 'A', programCode: 'FBSNC2', fileUrl: '/files/sog-fbsnc2-2018-2019.pdf' },
      { year: '2018-2019', section: 'B', programCode: 'HSKNC2', fileUrl: '/files/sog-hsknc2-2018-2019.pdf' },
      { year: '2018-2019', section: 'C', programCode: 'BA', fileUrl: '/files/sog-ba-2018-2019.pdf' },
      { year: '2018-2019', section: 'D', programCode: 'CS', fileUrl: '/files/sog-cs-2018-2019.pdf' },
      { year: '2018-2019', section: 'E', programCode: 'IT', fileUrl: '/files/sog-it-2018-2019.pdf' },
      { year: '2018-2019', section: 'F', programCode: 'BSIT', fileUrl: '/files/sog-bsit-2018-2019.pdf' },
      { year: '2018-2019', section: 'G', programCode: 'HRM', fileUrl: '/files/sog-hrm-2018-2019.pdf' },
      { year: '2018-2019', section: 'H', programCode: 'MGT', fileUrl: '/files/sog-mgt-2018-2019.pdf' },
    ],
  };

  // Determine which data to show based on the active tab and year
  const currentDataMOG = mogData[activeYearTabMOG]?.filter((data) => data.programCode === selectedProgram?.programCode) || [];
  const currentDataSOG = sogData[activeYearTabSOG]?.filter((data) => data.programCode === selectedProgram?.programCode) || [];

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
        <Tab eventKey="MOG" title={<span className="custom-color-green-font custom-font">Masterlist of Grades</span>}>
          <Tabs
            activeKey={activeYearTabMOG}
            onSelect={(k) => setActiveYearTabMOG(k)}
            id="mog-year-tabs"
            className="mt-3 custom-color-green-font custom-font"
          >
            {['First Year', 'Second Year', 'Third Year', 'Fourth Year'].map((yearTab) => (
              <Tab eventKey={yearTab} title={<span className="custom-color-green-font custom-font">{yearTab}</span>} key={yearTab}>
                <div className="row">
                  {currentDataMOG.length > 0 ? (
                    currentDataMOG.map((data, index) => (
                      <div className="col-md-3 col-lg-3 my-4" key={index}>
                        <button
                          className="btn btn-outline-success w-100 h-100 d-flex flex-column justify-content-center align-items-center"
                          style={{ height: '150px', cursor: 'pointer' }} // Ensuring square-shaped buttons
                          onClick={() => handleButtonClick(data.fileUrl)} // Button click handler
                        >
                          <span className="fs-5">{`${activeYearTabMOG} - Section ${data.section}`}</span>
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

        <Tab eventKey="SOG" title={<span className="custom-color-green-font custom-font">Summary of Grades</span>}>
          <Tabs
            activeKey={activeYearTabSOG}
            onSelect={(k) => setActiveYearTabSOG(k)}
            id="sog-year-tabs"
            className="mt-3 custom-color-green-font custom-font"
          >
            {['First Year', 'Second Year', 'Third Year', 'Fourth Year'].map((yearTab) => (
              <Tab eventKey={yearTab} title={<span className="custom-color-green-font custom-font">{yearTab}</span>} key={yearTab}>
                <div className="table-responsive my-4">
                  <Table hover className="table table-hover success-border">
                    <thead className="table-success">
                      <tr>
                        <th className="custom-color-green-font custom-font">Section ID</th>
                        <th className="custom-color-green-font custom-font">Section Name</th>
                        <th className="custom-color-green-font custom-font">Batch Year</th>
                        <th className="custom-color-green-font custom-font">Program Code</th>
                        <th className="custom-color-green-font custom-font">Summary of Grades</th>
                      </tr>
                    </thead>
                    <tbody className='bg-white'>
                      {currentDataSOG.length > 0 ? (
                        currentDataSOG.map((data, index) => (
                          <tr key={index}>
                            <td>{data.section}</td>
                            <td>{`${activeYearTabSOG} - Section ${data.section}`}</td>
                            <td>{data.year}</td>
                            <td>{data.programCode}</td>
                            <td>
                              <div className="d-block d-sm-flex justify-content-between">
                                <button
                                  className="btn btn-success custom-font btn-sm mb-2 mb-sm-0 w-100 w-sm-auto mx-1"
                                  onClick={() => handleButtonClick(data.fileUrl)}
                                >
                                  First Semester
                                </button>
                                <button
                                  className="btn btn-success custom-font btn-sm mb-2 mb-sm-0 w-100 w-sm-auto mx-1"
                                  onClick={() => handleButtonClick(data.fileUrl)} // Modify as needed for second semester
                                >
                                  Second Semester
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center">No data available for this year.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab>
            ))}
          </Tabs>
        </Tab>
      </Tabs>
    </div>
  );
}
