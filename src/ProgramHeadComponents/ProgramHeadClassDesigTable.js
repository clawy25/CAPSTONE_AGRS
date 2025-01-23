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
  const [editMode, setEditMode] = useState({}); // New state for edit mode

  useEffect(() => {
    const fetchYearLevelsSectionsCoursesSchedules = async () => {
      try {
        console.log("Fetching year levels, sections, professors, courses, and schedules...");
  
        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        //console.log("Fetched Year Levels:", fetchedYearLevels);
        setYearLevels(fetchedYearLevels);
  
        const fetchedSections = await SectionModel.fetchExistingSections();
       // console.log("Fetched Sections:", fetchedSections);
        setSections(fetchedSections);
  
        const fetchedProfessors = await PersonnelModel.getProfessors();
        //console.log("Fetched Professors:", fetchedProfessors);
        setProfessors(fetchedProfessors);
  
        const fetchedCourses = await CourseModel.getCoursesbyProgram();
        //console.log("Fetched Courses:", fetchedCourses);
        setCourses(fetchedCourses);
  
        // Fetch schedules
        const fetchedSchedules = await ScheduleModel.fetchExistingschedule();
        //("Fetched Schedules:", fetchedSchedules);
  
        // Initialize data structure with year and section data
        const initialData = {};
        for (const yearLevel of fetchedYearLevels) {
          initialData[yearLevel.yearNumber] = {};
          fetchedSections.forEach(section => {
            // Filter schedules by year and section
            const schedulesForYearAndSection = fetchedSchedules.filter(
              schedule => schedule.yearNumber === yearLevel.yearNumber && schedule.sectionNumber === section.sectionNumber
            ).map(schedule => ({
              courseCode: schedule.courseCode,
              courseDescriptiveTitle: schedule.courseDescriptiveTitle,
              courseLecture: schedule.courseLecture,
              courseLaboratory: schedule.courseLaboratory,
              units: schedule.units,
              professorNumber: schedule.personnelNumber,
              professor: schedule.professorName,
              scheduleDay: schedule.scheduleDay,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              numberOfHours: schedule.numberOfHours,
              
            }));
  
            initialData[yearLevel.yearNumber][section.sectionNumber] = schedulesForYearAndSection;
          });
        }
        setData(initialData);
        setIsEditing(initialData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
  
    fetchYearLevelsSectionsCoursesSchedules();
  }, []);

  

  const handleCourseChange = (year, section, index, selectedCourseTitle) => {
    const updatedRows = [...data[year][section]];
    const selectedCourse = courses.find(course => course.courseDescriptiveTitle === selectedCourseTitle);
    if (selectedCourse) {
      updatedRows[index].courseCode = selectedCourse.courseCode;
      updatedRows[index].courseDescriptiveTitle = selectedCourse.courseDescriptiveTitle;
      updatedRows[index].courseLecture = selectedCourse.courseLecture;
      updatedRows[index].courseLaboratory = selectedCourse.courseLaboratory; // Ensure units are updated
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
    const selectedPerson = professors.find(prof => prof.personnelNumber === selectedProfessor);
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
    setEditMode(prevState => ({
      ...prevState,
      [year]: {
        ...prevState[year],
        [section]: true,
      }
    }));
    setIsEditing(prevState => ({
      ...prevState,
      [year]: {
        ...prevState[year],
        [section]: true,
      }
    }));
  };

  const handleSave = async (year, section) => {
    setEditMode(prevState => ({
      ...prevState,
      [year]: {
        ...prevState[year],
        [section]: false,
      }
    }));
    
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
      personnelNameFirst: row.professor,
      scheduleDay: row.scheduleDay,
      startTime: row.startTime,
      endTime: row.endTime,
    }));
  
    // Log the data to check its structure
    //console.log('Schedule Data to be sent:', scheduleData);
  
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

  const deleteRow = async (year, section, index) => {
    const rowToDelete = data[year]?.[section]?.[index];
    if (!rowToDelete) return; // Ensure the row exists
  
    // Get the ID to delete
    const scheduleId = rowToDelete?.id;
    if (!scheduleId) {
      console.error('No valid ID for this schedule');
      return;
    }
  
    try {
      const result = await ScheduleModel.deleteSchedule(scheduleId);
  
      if (result.success) {
        console.log('Deleted schedule successfully:', result);
  
        // Update local state
        const updatedData = { ...data };
        updatedData[year][section].splice(index, 1);
        setData(updatedData);
        setIsEditing(updatedData); // If editing state is used
      } else {
        console.error('Failed to delete schedule on the server');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
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

  const renderTable = (year, section) => {
    const sectionData = data[year]?.[section] || [];
    return (
      <>
        <h5>Year: {year}, Section: {section}</h5> 
        <Table hover className="table table-hover success-border">
          <thead className="table-success">
            <tr>
              <th className='custom-color-green-font custom-font'>Course Code</th>
              <th className='custom-color-green-font custom-font'>Course Title</th>
              <th className='custom-color-green-font custom-font'>Lecture</th>
              <th className='custom-color-green-font custom-font'>Laboratory</th>
              <th className='custom-color-green-font custom-font'>Units</th>
              <th className='custom-color-green-font custom-font'>Professor Number</th>
              <th className='custom-color-green-font custom-font'>Professor</th>
              <th className='custom-color-green-font custom-font'>Day</th>
              <th className='custom-color-green-font custom-font'>Start Time</th>
              <th className='custom-color-green-font custom-font'>End Time</th>
              <th className='custom-color-green-font custom-font'>Number of Hours</th>
              <th className='custom-color-green-font custom-font'>Action</th>
            </tr>
          </thead>
          <tbody>
            {sectionData.map((row, index) => (
              <tr key={index}>
                
                <td>{row.courseCode}</td>
                <td>
                  {editMode[year]?.[section] ? (
                    <Form.Select
                      value={row.courseDescriptiveTitle}
                      onChange={(e) => handleCourseChange(year, section, index, e.target.value)}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.courseCode} value={course.courseDescriptiveTitle}>
                          {course.courseDescriptiveTitle}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    row.courseDescriptiveTitle
                  )}
                </td>
                <td>{editMode[year]?.[section] ? (
                  <Form.Control
                    type="text"
                    value={row.courseLecture}
                    onChange={(e) => handleInputChange(year, section, index, 'courseLecture', e.target.value)}
                  />
                ) : row.courseLecture}</td>
                <td>{editMode[year]?.[section] ? (
                  <Form.Control
                    type="text"
                    value={row.courseLaboratory}
                    onChange={(e) => handleInputChange(year, section, index, 'courseLaboratory', e.target.value)}
                  />
                ) : row.courseLaboratory}</td>
                <td>{row.units}</td> {/* Displaying Units */}
                <td>{row.professorNumber}</td> {/* Displaying Professor Number */}
                <td>
                  {editMode[year]?.[section] ? (
                    <Form.Select
                      value={row.professor}
                      onChange={(e) => handleProfessorChange(year, section, index, e.target.value)}
                    >
                      <option value="">Select Professor</option>
                      {professors.map(professor => (
                        <option key={professor.personnelNumber}
                                value={`${professor.personnelNameFirst}
                                        ${professor.personnelNameMiddle}
                                        ${professor.personnelNameLast}`}>
                          {`${professor.personnelNameFirst} ${professor.personnelNameMiddle} ${professor.personnelNameLast}`}
                        </option>
                      ))}
                    </Form.Select>
                  ) : row.professor}
                </td>
                
                <td>
                  {editMode[year]?.[section] ? (
                    <Form.Select
                      value={row.scheduleDay}
                      onChange={(e) => handleInputChange(year, section, index, 'scheduleDay', e.target.value)}
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </Form.Select>
                  ) : row.scheduleDay}
                </td>
                <td>
                  {editMode[year]?.[section] ? (
                    <Form.Select
                      value={row.startTime}
                      onChange={(e) => handleInputChange(year, section, index, 'startTime', e.target.value)}
                    >
                      {hours.map(hour => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </Form.Select>
                  ) : row.startTime}
                </td>
                <td>
                  {editMode[year]?.[section] ? (
                    <Form.Select
                      value={row.endTime}
                      onChange={(e) => handleInputChange(year, section, index, 'endTime', e.target.value)}
                    >
                      {hours.map(hour => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </Form.Select>
                  ) : row.endTime}
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
        {editMode[year]?.[section] ? (
          <Button variant="success" onClick={() => handleSave(year, section)}>Save</Button>
        ) : (
          <Button variant="warning" onClick={() => handleEdit(year, section)}>Edit</Button>
        )}
      </>
    );
};


  return (
    <div className="p-4">
      
      <Tabs defaultActiveKey={yearLevels[0]?.yearNumber} className="mb-3">
  {yearLevels.map(year => (
    <Tab key={year.yearNumber} eventKey={year.yearNumber} title={year.yearNumber}>
      {sections.map(section => renderTable(year.yearNumber, section.sectionNumber))}
    </Tab>
  ))}
</Tabs>

    </div>
  );
}
