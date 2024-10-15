import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Tab, Tabs } from 'react-bootstrap';
import YearLevelModel from '../ReactModels/YearLevelModel'; 
import SectionModel from '../ReactModels/SectionModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import SubjectModel from '../ReactModels/SubjectModel';

export default function ProgramHeadClassDesigTable() {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const hours = Array.from({ length: 24 }, (_, index) => {
    const hour = index % 12 === 0 ? 12 : index % 12;
    const period = index < 12 ? 'AM' : 'PM';
    return `${hour} ${period}`;
  });

  const [data, setData] = useState({});
  const [yearLevels, setYearLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [isEditing, setIsEditing] = useState({});
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchYearLevelsSectionsSubjects = async () => {
      try {
        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        setYearLevels(fetchedYearLevels);

        const fetchedSections = await SectionModel.fetchExistingSections();
        setSections(fetchedSections);

        const fetchedProfessors = await PersonnelModel.getProfessors();
        setProfessors(fetchedProfessors);

        const fetchedSubjects = await SubjectModel.fetchExistingSubjects();
        setSubjects(fetchedSubjects);

        const initialData = {};
        for (const yearLevel of fetchedYearLevels) {
          initialData[yearLevel.yearName] = {};
          fetchedSections.forEach(section => {
            initialData[yearLevel.yearName][section.sectionName] = fetchedSubjects.map(subject => ({
              subjectCode: subject.subjectCode,
              subjectName: subject.subjectName,
              professor: '', // Default to empty or some initial value
              scheduleDay: daysOfWeek[0],
              startTime: '',
              endTime: '',
              numberOfHours: '',
              units: subject.subjectUnits,
            }));
          });
        }
        setData(initialData);
        setIsEditing(initialData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchYearLevelsSectionsSubjects();
  }, []);

  const handleSubjectChange = (year, section, index, selectedSubjectName) => {
    const updatedRows = [...data[year][section]];
    const selectedSubject = subjects.find(subject => subject.subjectName === selectedSubjectName);
    if (selectedSubject) {
      updatedRows[index].subjectCode = selectedSubject.subjectCode;
      updatedRows[index].subjectName = selectedSubject.subjectName;
      updatedRows[index].units = selectedSubject.subjectUnits;
    }
    setData(prevData => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [section]: updatedRows,
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
        [section]: updatedRows,
      }
    }));
  };

  const handleInputChange = (year, section, index, field, value) => {
    const updatedRows = [...data[year][section]];
    updatedRows[index][field] = value;

    // If endTime or startTime changes, compute number of hours
    if (field === 'startTime' || field === 'endTime') {
      const startTime = updatedRows[index].startTime;
      const endTime = updatedRows[index].endTime;
      const numberOfHours = calculateHours(startTime, endTime);
      updatedRows[index].numberOfHours = numberOfHours;
    }

    setData(prevData => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [section]: updatedRows,
      }
    }));
  };

  const calculateHours = (start, end) => {
    if (!start || !end) return '';

    const parseTime = (time) => {
      const [hour, period] = time.split(' ');
      let hour24 = parseInt(hour);
      if (period === 'PM' && hour24 < 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;
      return hour24;
    };

    const startHour = parseTime(start);
    const endHour = parseTime(end);
    
    // Calculate the difference in hours
    let hours = endHour - startHour;
    if (hours < 0) hours += 24; // Correct for overnight shifts
    return hours.toString();
  };

  const handleEdit = (year, section) => {
    setIsEditing(prevState => ({
      ...prevState,
      [year]: {
        ...prevState[year],
        [section]: true,
      }
    }));
  };

  const handleSave = (year, section) => {
    setIsEditing(prevState => ({
      ...prevState,
      [year]: {
        ...prevState[year],
        [section]: false,
      }
    }));
    // Handle saving to the backend if needed
  };

  const renderTable = (year, section) => {
    const sectionData = data[year]?.[section] || [];
    return (
      <>
        <h5>{section}</h5>
        <Table hover className="table table-hover success-border">
          <thead className="table-success">
            <tr>
              <th className='custom-color-green-font custom-font'>Subject Code</th>
              <th className='custom-color-green-font custom-font'>Subject Name</th>
              <th className='custom-color-green-font custom-font'>Units</th>
              <th className='custom-color-green-font custom-font'>Professor</th>
              <th className='custom-color-green-font custom-font'>Schedule Day</th>
              <th className='custom-color-green-font custom-font'>Start Time</th>
              <th className='custom-color-green-font custom-font'>End Time</th>
              <th className='custom-color-green-font custom-font'>Number of Hours</th>
            </tr>
          </thead>
          <tbody className='bg-white'>
            {sectionData.map((row, index) => (
              <tr key={index}>
                <td>{row.subjectCode}</td>
                <td>
                  {isEditing[year]?.[section] ? (
                    <Form.Select
                      value={row.subjectName}
                      onChange={(e) => handleSubjectChange(year, section, index, e.target.value)}
                    >
                      {subjects.map((subject) => (
                        <option key={subject.subjectCode} value={subject.subjectName}>
                          {subject.subjectName}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <span>{row.subjectName}</span>
                  )}
                </td>
                <td>
                  {isEditing[year]?.[section] ? (
                    <Form.Control
                      type="text"
                      value={row.units}
                      onChange={(e) => handleInputChange(year, section, index, 'units', e.target.value)}
                      readOnly
                    />
                  ) : (
                    <span>{row.units}</span>
                  )}
                </td>
                <td>
                  {isEditing[year]?.[section] ? (
                    <Form.Select
                      value={row.professor}
                      onChange={(e) => handleProfessorChange(year, section, index, e.target.value)}
                    >
                      {professors.map((professor) => (
                        <option key={professor.personnelId} value={professor.personnelName}>
                          {professor.personnelName}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <span>{row.professor}</span>
                  )}
                </td>
                <td>
                  {isEditing[year]?.[section] ? (
                    <Form.Select
                      value={row.scheduleDay}
                      onChange={(e) => handleInputChange(year, section, index, 'scheduleDay', e.target.value)}
                    >
                      {daysOfWeek.map((day, i) => (
                        <option key={i} value={day}>
                          {day}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <span>{row.scheduleDay}</span>
                  )}
                </td>
                <td>
                  {isEditing[year]?.[section] ? (
                    <Form.Select
                      value={row.startTime}
                      onChange={(e) => handleInputChange(year, section, index, 'startTime', e.target.value)}
                    >
                      {hours.map((time, i) => (
                        <option key={i} value={time}>
                          {time}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <span>{row.startTime}</span>
                  )}
                </td>
                <td>
                  {isEditing[year]?.[section] ? (
                    <Form.Select
                      value={row.endTime}
                      onChange={(e) => handleInputChange(year, section, index, 'endTime', e.target.value)}
                    >
                      {hours.map((time, i) => (
                        <option key={i} value={time}>
                          {time}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <span>{row.endTime}</span>
                  )}
                </td>
                <td>{row.numberOfHours}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div>
          {isEditing[year]?.[section] ? (
            <Button onClick={() => handleSave(year, section)}>Save</Button>
          ) : (
            <Button onClick={() => handleEdit(year, section)}>Edit</Button>
          )}
        </div>
      </>
    );
  };

  return (
    <Tabs defaultActiveKey={yearLevels[0]?.yearName}>
      {yearLevels.map((year) => (
        <Tab eventKey={year.yearName} key={year.yearName} title={year.yearName}>
          {sections.map((section) => (
            <div key={section.sectionName}>
              {renderTable(year.yearName, section.sectionName)}
            </div>
          ))}
        </Tab>
      ))}
    </Tabs>
  );
}
