import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { Tabs, Tab, Table } from 'react-bootstrap'; // Import Tabs and Table from react-bootstrap
import YearLevelModel from '../ReactModels/YearLevelModel';


export default function RegistrarBatchYear({ selectedProgram }) {
  const [activeTab, setActiveTab] = useState('MOG'); // State to keep track of the main tab (MOG or SOG)
  const [activeYearTabMOG, setActiveYearTabMOG] = useState(''); // State for year tabs in MOG
  const [activeYearTabSOG, setActiveYearTabSOG] = useState(''); // State for year tabs in SOG
  const [yearLevels, setYearLevels] = useState([]); // State for fetched year levels
  const [sections, setSections] = useState([]); // State for fetched sections
 
  const navigate = useNavigate(); // Use navigate for file viewing

  // Dummy sections from A to H
  const dummySections = [
    { id: 1, sectionNumber: '1A', sectionName: 'Section A' },
    { id: 2, sectionNumber: '1B', sectionName: 'Section B' },
    { id: 3, sectionNumber: '1C', sectionName: 'Section C' },
    { id: 4, sectionNumber: '1D', sectionName: 'Section D' },
    { id: 5, sectionNumber: '1E', sectionName: 'Section E' },
    { id: 6, sectionNumber: '1F', sectionName: 'Section F' },
    { id: 7, sectionNumber: '1G', sectionName: 'Section G' },
    { id: 8, sectionNumber: '1H', sectionName: 'Section H' }
  ];

  // Fetch Year Levels and Sections when component loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming YearLevelModel.fetchExistingYearLevels() works as expected
        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();

        //console.log('Fetched year levels:', fetchedYearLevels); // Debug fetched year levels

        setYearLevels(fetchedYearLevels);
        setSections(dummySections); // Use dummy sections for now

        // Set the first year tab as active by default (if year levels are available)
        if (fetchedYearLevels.length > 0) {
          setActiveYearTabMOG(fetchedYearLevels[0].yearName); // Set first year as default tab for MOG
          setActiveYearTabSOG(fetchedYearLevels[0].yearName); // Set first year as default tab for SOG
        }
      } catch (error) {
        console.error('Error fetching year levels or sections:', error);
      }
    };

    fetchData();
  }, []);

  // Filter sections based on the active year level tab
  const getSectionsForYearLevel = (yearName) => {
    // Return all dummy sections as they don't have year levels in this case
    return sections;
  };

// Function to handle the button click and open MOG.pdf
const handleShowMOG = () => {
  const pdfUrl = "/MOG.pdf"; // Path to the PDF in the public folder
  window.open(pdfUrl, "_blank"); // Opens the PDF in a new tab
};
// Function to handle the button click and open the SOG for the specified semester
const handleShowSOG = (semester) => {
  const pdfUrl = "/SOG.pdf"; // Path to the PDF in the public folder
  window.open(pdfUrl, "_blank"); // Opens the PDF in a new tab
};


  return (
    <div className="container-fluid bg-white pt-3 px-4 rounded">
     
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => {
           // console.log('Main tab selected:', k); // Debug main tab switch
            setActiveTab(k);
          }}
          id="main-tabs"
          className="mb-3 custom-color-green-font custom-font"
        >
          {/* Masterlist of Grades (MOG) Tab */}
          <Tab eventKey="MOG" title={<span className="custom-color-green-font custom-font">Masterlist of Grades</span>}>
            <Tabs
              activeKey={activeYearTabMOG}
              onSelect={(k) => {
               // console.log('Year tab selected in MOG:', k); // Debug year tab switch for MOG
                setActiveYearTabMOG(k);
              }}
              id="mog-year-tabs"
              className="mt-3 custom-color-green-font custom-font"
            >
              {yearLevels.map((yearLevel) => (
                <Tab eventKey={yearLevel.yearName} title={<span className="custom-color-green-font custom-font">{yearLevel.yearName}</span>} key={yearLevel.id}>
                  <div className="table-responsive my-4">
                    <Table hover className="table table-hover success-border">
                      <thead className="table-success">
                        <tr>
                          <th className="custom-color-green-font custom-font">Section ID</th>
                          <th className="custom-color-green-font custom-font">Section Name</th>
                          <th className="custom-color-green-font custom-font">Year Level</th>
                          <th className="custom-color-green-font custom-font">Masterlist of Grades</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {getSectionsForYearLevel(activeYearTabMOG).map((section, index) => (
                          <tr key={index}>
                            <td>{section.sectionNumber}</td>
                            <td>{section.sectionName}</td>
                            <td>{activeYearTabMOG}</td>
                            <td>
                              <button
                                className="btn btn-success custom-font btn-sm"
                                onClick={handleShowMOG} // Display RegistrarMOG when clicked
                              >
                                View File
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>
              ))}
            </Tabs>
          </Tab>

          {/* Summary of Grades (SOG) Tab */}
          <Tab eventKey="SOG" title={<span className="custom-color-green-font custom-font">Summary of Grades</span>}>
            <Tabs
              activeKey={activeYearTabSOG}
              onSelect={(k) => {
               // console.log('Year tab selected in SOG:', k); // Debug year tab switch for SOG
                setActiveYearTabSOG(k);
              }}
              id="sog-year-tabs"
              className="mt-3 custom-color-green-font custom-font"
            >
              {yearLevels.map((yearLevel) => (
                <Tab eventKey={yearLevel.yearName} title={<span className="custom-color-green-font custom-font">{yearLevel.yearName}</span>} key={yearLevel.id}>
                  <div className="table-responsive my-4">
                    <Table hover className="table table-hover success-border">
                      <thead className="table-success">
                        <tr>
                          <th className="custom-color-green-font custom-font">Section ID</th>
                          <th className="custom-color-green-font custom-font">Section Name</th>
                          <th className="custom-color-green-font custom-font">Year Level</th>
                          <th className="custom-color-green-font custom-font">Summary of Grades</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {getSectionsForYearLevel(activeYearTabSOG).map((section, index) => (
                          <tr key={index}>
                            <td>{section.sectionNumber}</td>
                            <td>{section.sectionName}</td>
                            <td>{activeYearTabSOG}</td>
                            <td>
                              <button
                                className="btn btn-success custom-font btn-sm"
                                onClick={handleShowSOG} // Display RegistrarMOG when clicked
                              >
                                First Semester
                              </button>
                              <button
                                className="btn btn-success custom-font btn-sm ms-2"
                                onClick={handleShowSOG} // Display RegistrarMOG when clicked
                              >
                                Second Semester
                              </button>
                            </td>
                          </tr>
                        ))}
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
