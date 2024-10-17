import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Tab, Tabs } from 'react-bootstrap';
import YearLevelModel from '../ReactModels/YearLevelModel'; 
import SectionModel from '../ReactModels/SectionModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import CourseModel from '../ReactModels/CourseModel';
import ScheduleModel from '../ReactModels/ScheduleModel';

export default function ProgramHeadClassDesigTable() {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchYearLevelsSectionsCourses = async () => {
      try {
        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        setYearLevels(fetchedYearLevels);

        const fetchedSections = await SectionModel.fetchExistingSections();
        setSections(fetchedSections);

        const fetchedProfessors = await PersonnelModel.getProfessors();
        setProfessors(fetchedProfessors);

        const fetchedCourses = await CourseModel.fetchExistingCourses();
        setCourses(fetchedCourses);

        const initialData = {};
        for (const yearLevel of fetchedYearLevels) {
          initialData[yearLevel.yearName] = {};
          fetchedSections.forEach(section => {
            initialData[yearLevel.yearName][section.sectionName] = fetchedCourses.map(course => ({
              courseCode: course.courseCode,
              courseDescriptiveTitle: course.courseDescriptiveTitle,
              courseLecture: course.courseLecture,
              courseLaboratory: course.courseLaboratory,
              professorNumber: '', // New field for personnel number
              professor: '', // Default to empty or some initial value
              scheduleDay: daysOfWeek[0],
              startTime: '',
              endTime: '',
              numberOfHours: '',
              units: course.courseUnits,
            }));
          });
        }
        setData(initialData);
        setIsEditing(initialData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchYearLevelsSectionsCourses();
  }, []);

  const handleCourseChange = (year, section, index, selectedCourseTitle) => {
    const updatedRows = [...data[year][section]];
    const selectedCourse = courses.find(course => course.courseDescriptiveTitle === selectedCourseTitle);
    if (selectedCourse) {
      updatedRows[index].courseCode = selectedCourse.courseCode;
      updatedRows[index].courseDescriptiveTitle = selectedCourse.courseDescriptiveTitle;
      updatedRows[index].courseLecture = selectedCourse.courseLecture;
      updatedRows[index].courseLaboratory = selectedCourse.courseLaboratory;
      updatedRows[index].units = selectedCourse.courseUnits;
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
    const selectedPerson = professors.find(prof => prof.personnelName === selectedProfessor);
    updatedRows[index].professorNumber = selectedPerson ? selectedPerson.personnelNumber : '';
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

  const handleSave = async (year, section) => {
    setIsEditing(prevState => ({
      ...prevState,
      [year]: {
        ...prevState[year],
        [section]: false,
      }
    }));
  
    // Prepare the schedule data
    const scheduleData = data[year][section].map((row, index) => ({
      scheduleNumber: index + 1,
      courseCode: row.courseCode,
      courseDescriptiveTitle: row.courseDescriptiveTitle,
      courseLecture: row.courseLecture,
      courseLaboratory: row.courseLaboratory,
      personnelNumber: row.professorNumber,
      personnelName: row.professor,
      scheduleDay: row.scheduleDay,
      startTime: row.startTime,
      endTime: row.endTime,
      courseUnits: row.units,
      //yearNumber: year,
      //sectionNumber: section,
    }));
  
    // Log the data to check its structure
    console.log('Schedule Data to be sent:', scheduleData);
  
    // Send the schedule data to the backend via the API
    try {
      const response = await ScheduleModel.createAndInsertSchedules(scheduleData);
  
      console.log('API Response:', response);
  
      if (response.success) {
        console.log('Schedules saved successfully:', response.data);
      } else {
        console.error('Failed to save schedules:', response);
      }
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  };
  
  

  const addRow = (year, section) => {
    const newRow = {
      courseCode: '',
      courseDescriptiveTitle: '',
      courseLecture: '',
      courseLaboratory: '',
      professorNumber: '',
      professor: '',
      scheduleDay: daysOfWeek[0],
      startTime: '',
      endTime: '',
      numberOfHours: '',
      units: '',
    };

    setData(prevData => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [section]: [...prevData[year][section], newRow],
      }
    }));
  };

  const deleteRow = (year, section, index) => {
    const updatedRows = [...data[year][section]];
    updatedRows.splice(index, 1); // Remove the row at the specified index

    setData(prevData => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [section]: updatedRows,
      }
    }));
  };

  const renderTable = (year, section) => {
    const sectionData = data[year]?.[section] || [];
    return (
      <>
        <h5>{section}</h5>
        <Table hover className="table table-hover success-border">
          <thead className="table-success">
            <tr>
              <th className='custom-color-green-font custom-font'>Course Code</th>
              <th className='custom-color-green-font custom-font'>Course Descriptive Title</th>
              <th className='custom-color-green-font custom-font'>Course Lecture</th>
              <th className='custom-color-green-font custom-font'>Course Laboratory</th>
              <th className='custom-color-green-font custom-font'>Units</th>
              <th className='custom-color-green-font custom-font'>Personnel Number</th>
              <th className='custom-color-green-font custom-font'>Professor</th>
              <th className='custom-color-green-font custom-font'>Schedule Day</th>
              <th className='custom-color-green-font custom-font'>Start Time</th>
              <th className='custom-color-green-font custom-font'>End Time</th>
              <th className='custom-color-green-font custom-font'>Number of Hours</th>
              <th className='custom-color-green-font custom-font'>Actions</th>
            </tr>
          </thead>
          <tbody className='bg-white'>
            {sectionData.map((row, index) => (
              <tr key={index}>
                <td>{row.courseCode}</td>
                <td>
                  {isEditing[year]?.[section] ? (
                    <Form.Select
                      value={row.courseDescriptiveTitle || ''} // Handle empty value
                      onChange={(e) => handleCourseChange(year, section, index, e.target.value)}
                    >
                      <option value="" disabled>Select a course</option> {/* Default option */}
                      {courses.map((course) => (
                        <option key={course.courseCode} value={course.courseDescriptiveTitle}>
                          {course.courseDescriptiveTitle}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <span>{row.courseDescriptiveTitle}</span>
                  )}
                </td>
                <td>{row.courseLecture}</td>
                <td>{row.courseLaboratory}</td>
                <td>{row.units}</td>
                <td>{row.professorNumber}</td>
                <td>
                  {isEditing[year]?.[section] ? (
                    <Form.Select
                      value={row.professor || ''} // Handle empty value
                      onChange={(e) => handleProfessorChange(year, section, index, e.target.value)}
                    >
                      <option value="" disabled>Select a professor</option>
                      {professors.map((prof) => (
                        <option key={prof.personnelNumber} value={prof.personnelName}>
                          {prof.personnelName}
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
                      value={row.scheduleDay || ''} // Handle empty value
                      onChange={(e) => handleInputChange(year, section, index, 'scheduleDay', e.target.value)}
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>
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
                      value={row.startTime || ''} // Handle empty value
                      onChange={(e) => handleInputChange(year, section, index, 'startTime', e.target.value)}
                    >
                      <option value="" disabled>Select start time</option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
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
                      value={row.endTime || ''} // Handle empty value
                      onChange={(e) => handleInputChange(year, section, index, 'endTime', e.target.value)}
                    >
                      <option value="" disabled>Select end time</option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <span>{row.endTime}</span>
                  )}
                </td>
                <td>{row.numberOfHours}</td>
                
                <td>
                  <Button variant="danger" onClick={() => deleteRow(year, section, index)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="primary" onClick={() => addRow(year, section)}>Add Row</Button>
        <Button variant="success" onClick={() => handleSave(year, section)}>Save</Button>
      </>
    );
  };

  return (
    <div>
      <h3>Class Scheduling</h3>
      <Tabs defaultActiveKey={yearLevels[0]?.yearName} id="program-head-tabs" className="mb-3">
        {yearLevels.map((year) => (
          <Tab eventKey={year.yearName} title={year.yearName} key={year.yearName}>
            {sections.map((section) => (
              <div key={section.sectionName}>
                {renderTable(year.yearName, section.sectionName)}
              </div>
            ))}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
