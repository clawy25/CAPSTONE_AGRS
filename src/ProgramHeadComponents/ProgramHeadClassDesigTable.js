import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Tab, Tabs } from 'react-bootstrap';

export default function ProgramHeadClassDesigTable() {
  // Hardcoded data for subjects and professors
  const subjectsData = [
    { subjectCode: 'MATH101', subjectName: 'Mathematics 101', professors: ['Prof. Smith', 'Prof. Johnson'] },
    { subjectCode: 'ENG101', subjectName: 'English 101', professors: ['Prof. Brown', 'Prof. Williams'] },
    { subjectCode: 'CS101', subjectName: 'Computer Science 101', professors: ['Prof. Garcia', 'Prof. Martinez'] },
    { subjectCode: 'PHY101', subjectName: 'Physics 101', professors: ['Prof. Davis'] },
    { subjectCode: 'CHEM101', subjectName: 'Chemistry 101', professors: ['Prof. Wilson'] },
  ];

  // Create an array for hours of the day
  const hours = Array.from({ length: 24 }, (_, index) => {
    const hour = index % 12 === 0 ? 12 : index % 12;
    const period = index < 12 ? 'AM' : 'PM';
    return `${hour} ${period}`;
  });

  // State for form inputs for each year and each section
  const [data, setData] = useState({
    '1st': { A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [] },
    '2nd': { A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [] },
    '3rd': { A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [] },
    '4th': { A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [] },
  });

  // State for edit mode for each year and section
  const [isEditing, setIsEditing] = useState({
    '1st': { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true },
    '2nd': { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true },
    '3rd': { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true },
    '4th': { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true },
  });

  useEffect(() => {
    // Initialize table rows for all years and sections with default subject and professor selections
    const initialData = {};
    for (const year of Object.keys(data)) {
      initialData[year] = {};
      for (const section of Object.keys(data[year])) {
        initialData[year][section] = subjectsData.map(subject => ({
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          professor: subject.professors[0], // Default to first professor in the list
          startTime: '', // New field for start time
          endTime: '',   // New field for end time
          numberOfHours: '',
          units: ''
        }));
      }
    }
    setData(initialData);
  }, []);

  const handleSubjectChange = (year, section, index, selectedSubjectName) => {
    const updatedRows = [...data[year][section]];
    const selectedSubject = subjectsData.find(subject => subject.subjectName === selectedSubjectName);
    if (selectedSubject) {
      updatedRows[index].subjectCode = selectedSubject.subjectCode;
      updatedRows[index].subjectName = selectedSubjectName;
      updatedRows[index].professor = selectedSubject.professors[0]; // Reset professor to first available
    }
    setData(prevData => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [section]: updatedRows
      }
    }));
  };

  const handleProfessorChange = (year, section, index, selectedProfessor) => {
    const updatedRows = [...data[year][section]];
    updatedRows[index].professor = selectedProfessor;
    setData(prevData => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [section]: updatedRows
      }
    }));
  };

  const handleInputChange = (year, section, index, field, value) => {
    const updatedRows = [...data[year][section]];
    updatedRows[index][field] = value;

    // Calculate the number of hours if startTime and endTime are both selected
    if (field === 'startTime' || field === 'endTime') {
      const startTime = updatedRows[index].startTime;
      const endTime = updatedRows[index].endTime;

      if (startTime && endTime) {
        const startHour = hours.indexOf(startTime);
        const endHour = hours.indexOf(endTime);

        // Calculate the number of hours based on AM/PM
        const totalHours = endHour >= startHour ? endHour - startHour : 24 - startHour + endHour;
        updatedRows[index].numberOfHours = totalHours;
      } else {
        updatedRows[index].numberOfHours = ''; // Reset if either is empty
      }
    }

    setData(prevData => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [section]: updatedRows
      }
    }));
  };

  const handleSave = (year, section) => {
    setIsEditing(prevState => ({
      ...prevState,
      [year]: {
        ...prevState[year],
        [section]: false // Switch to view mode for this section after saving
      }
    }));
  };

  const handleEdit = (year, section) => {
    setIsEditing(prevState => ({
      ...prevState,
      [year]: {
        ...prevState[year],
        [section]: true // Switch back to edit mode for this section
      }
    }));
  };

  // Function to render the table for a specific section
  const renderTable = (year, section) => (
    <>
      <h5>Section {section}</h5>
      <Table hover className="table table-hover success-border">
        <thead className="table-success">
          <tr>
            <th className='custom-color-green-font custom-font'>Subject Code</th>
            <th className='custom-color-green-font custom-font'>Subject Name</th>
            <th className='custom-color-green-font custom-font'>Professor</th>
            <th className='custom-color-green-font custom-font'>Start Time</th>
            <th className='custom-color-green-font custom-font'>End Time</th>
            <th className='custom-color-green-font custom-font'>Number of Hours</th>
            <th className='custom-color-green-font custom-font'>Units</th>
          </tr>
        </thead>
        <tbody className='bg-white'>
          {data[year][section].map((row, index) => (
            <tr key={index}>
              <td>{row.subjectCode}</td>
              <td>
                {isEditing[year][section] ? (
                  <Form.Select
                    value={row.subjectName}
                    onChange={(e) => handleSubjectChange(year, section, index, e.target.value)}
                  >
                    {subjectsData.map((subject, i) => (
                      <option key={i} value={subject.subjectName}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <span>{row.subjectName}</span>
                )}
              </td>
              <td>
                {isEditing[year][section] ? (
                  <Form.Select
                    value={row.professor}
                    onChange={(e) => handleProfessorChange(year, section, index, e.target.value)}
                  >
                    {subjectsData
                      .find(subject => subject.subjectName === row.subjectName)
                      ?.professors.map((professor, i) => (
                        <option key={i} value={professor}>
                          {professor}
                        </option>
                      ))}
                  </Form.Select>
                ) : (
                  <span>{row.professor}</span>
                )}
              </td>
              <td>
                {isEditing[year][section] ? (
                  <Form.Select
                    value={row.startTime}
                    onChange={(e) => handleInputChange(year, section, index, 'startTime', e.target.value)}
                  >
                    <option value="">Select Start Time</option>
                    {hours.map((hour, i) => (
                      <option key={i} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <span>{row.startTime}</span>
                )}
              </td>
              <td>
                {isEditing[year][section] ? (
                  <Form.Select
                    value={row.endTime}
                    onChange={(e) => handleInputChange(year, section, index, 'endTime', e.target.value)}
                  >
                    <option value="">Select End Time</option>
                    {hours.map((hour, i) => (
                      <option key={i} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <span>{row.endTime}</span>
                )}
              </td>
              <td>
                <span>{row.numberOfHours}</span>
              </td>
              <td>
                {isEditing[year][section] ? (
                  <Form.Control
                    type="number"
                    value={row.units}
                    onChange={(e) => handleInputChange(year, section, index, 'units', e.target.value)}
                  />
                ) : (
                  <span>{row.units}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button
        variant="primary"
        onClick={isEditing[year][section] ? () => handleSave(year, section) : () => handleEdit(year, section)}
        style={{ float: 'right', marginTop: '10px' }}
      >
        {isEditing[year][section] ? 'Save' : 'Edit'}
      </Button>
    </>
  );

  return (
    <Tabs defaultActiveKey="first" id="uncontrolled-tab-example" className="mb-3">
      <Tab eventKey="first" title="1st Year">
        {Object.keys(data['1st']).map(section => renderTable('1st', section))}
      </Tab>
      <Tab eventKey="second" title="2nd Year">
        {Object.keys(data['2nd']).map(section => renderTable('2nd', section))}
      </Tab>
      <Tab eventKey="third" title="3rd Year">
        {Object.keys(data['3rd']).map(section => renderTable('3rd', section))}
      </Tab>
      <Tab eventKey="fourth" title="4th Year">
        {Object.keys(data['4th']).map(section => renderTable('4th', section))}
      </Tab>
    </Tabs>
  );
}
