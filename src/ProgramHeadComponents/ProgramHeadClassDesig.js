import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal, FormControl } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import { UserContext } from '../Context/UserContext';

const ProgramHeadClassDesig = () => {
  const { user } = useContext(UserContext);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('First');
  const [selectedSection, setSelectedSection] = useState('A'); // Default to Section A
  
  const [academicYears, setAcademicYears] = useState([]);
  const [currentAcademicYear, setCurrentAcadYear] = useState([]);
  const [courses, setCourses] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [sections, setSections] = useState(['A']);

  const [schedules, setSchedules] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [professors, setProfessors] = useState([]);

  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
      setAcademicYears(fetchedAcademicYears);

      const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);
      setCurrentAcadYear(current);
  
      const fetchedProgram = await ProgramModel.fetchProgramData(user.programNumber);

      setPrograms(fetchedProgram);
  
      if (fetchedProgram.length > 0) {
        const data = [];
      
        fetchedProgram.forEach(row => {
          // Check if there is already an entry for the current academicYear
          let existingAcadYear = data.find(item => item.academicYear === row.academicYear);
      
          if (!existingAcadYear) {
            // Filter programs for the current academicYear
            const programsForYear = fetchedProgram.filter(item => item.academicYear === row.academicYear);
            
            // Collect unique programs for the academicYear
            const programs = [];
            const programNamesSet = new Set();
      
            programsForYear.forEach(row => {
              if (!programNamesSet.has(row.programName)) {
                programNamesSet.add(row.programName);
      
                // Create yearLevels with default semesters [1, 2], and add semester 3 if programYrLvlSummer matches
                const yearLevels = Array.from({ length: row.programNumOfYear }, (_, i) => {
                  const yearLevel = i + 1;
                  const semesters = yearLevel === row.programYrLvlSummer ? [1, 2, 3] : [1, 2];
                  return { yearLevel, semesters };
                });
      
                programs.push({
                  programName: row.programName,
                  yearLevels: yearLevels
                });
              }
            });
      
            // Create a new entry for the academicYear
            const entry = {
              academicYear: row.academicYear,
              programs
            };
            data.push(entry); // Push the new entry into the data array
          }
        });
      
        console.log(data);
        setMappedData(data);
      }      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const allSchedules = await ScheduleModel.fetchExistingschedule(selectedSection);
      console.log(allSchedules);
      setSchedules(allSchedules);
    } catch (error){
      console.error("Error fetching schedules:", error);
    }
  };

  const fetchPersonnelList = async () =>{
    try {
      const personnelData = await PersonnelModel.getProfessorsbyProgram(user.programNumber, selectedAcademicYear);
      console.log(personnelData);
      setProfessors(personnelData);
    } catch (error) {
      console.error('Error fetching personnel list:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const program = programs.find(
        (p) => p.academicYear === selectedAcademicYear && p.programName === selectedProgram
      );

      const selectedProgramNumber = program ? program.programNumber : null;
      

      if (selectedProgramNumber){
        
        const courseData = await CourseModel.getCoursesbyProgram(
          selectedAcademicYear,
          selectedYearLevel,
          selectedSemester,
          selectedProgramNumber);

          
        if(courseData){
          setCourses(courseData); // Update the courses state with fetched data
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchSections = async () => {
    try{
      const program = programs.find(
        (p) => p.academicYear === selectedAcademicYear && p.programName === selectedProgram
      );

      const selectedProgramNumber = program ? program.programNumber : null;
      const yearLevel = parseInt(selectedYearLevel);
      const semester = parseInt(selectedSemester);

      if (selectedProgramNumber) {
        // Await the data here
        const sectionData = await SectionModel.fetchExistingSections(
          selectedAcademicYear,
          yearLevel,
          semester,
          selectedProgramNumber
        );
  
        setSections(sectionData); // This should now receive the resolved data array
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const createSchedules = async () => {
    try {
      await fetchCourses();
      
      console.log(courses);
      console.log(selectedSection);

      const newSchedules = courses.map((course) => ({
        scheduleNumber: `${course.courseCode}-${selectedSection}`, 
        sectionNumber: selectedSection,
        courseCode: course.courseCode,
        yearLevel: course.courseYearLevel,
        semester: course.courseSemester,
        academicYear: course.academicYear,
      }));
      
      await ScheduleModel.createAndInsertSchedules(newSchedules);

      fetchSchedules();
    } catch (error){
      console.error("Error creating schedules:", error);
    }
  };

  const updateSchedules = async () => {
    try {
      // Validate schedules before proceeding
      const overlappingSchedules = await validateSchedules(schedules);
      if (overlappingSchedules.length > 0) {
        const overlappingInfo = overlappingSchedules
          .map(
            (schedule) =>
              `Section: ${schedule.sectionNumber}, Course Code: ${schedule.courseCode}, Day: ${schedule.scheduleDay}, Time: ${schedule.startTime} - ${schedule.endTime}, Personnel: ${schedule.personnelNumber}`
          )
          .join("\n");
  
        alert(
          `Failed to update: The following overlapping schedules were detected:\n${overlappingInfo}`
        );
        return;
      }
  
      // Call the update function with the modified schedules
      await ScheduleModel.updateSchedules(schedules);
  
      // Fetch schedules after update
      await fetchSchedules();
    } catch (error) {
      console.error("Error updating schedules:", error);
    }
  };
  
  async function validateSchedules(schedules) {
    // Fetch all schedules for the selected academic year
    const allSchedules = await ScheduleModel.fetchAllSchedules(selectedAcademicYear);
  
    // Exclude schedules from the current section
    const otherSectionSchedules = allSchedules.filter(
      (schedule) => schedule.sectionNumber !== selectedSection
    );
  
    // Combine the schedules being validated with other section schedules
    const combinedSchedules = [...schedules, ...otherSectionSchedules];
  
    // Filter out schedules with null startTime or endTime
    const validSchedules = combinedSchedules.filter(
      (schedule) => schedule.startTime && schedule.endTime && schedule.scheduleDay
    );
  
    // Group schedules by sectionNumber and scheduleDay
    const groupedBySectionAndDay = validSchedules.reduce((acc, schedule) => {
      const key = `${schedule.sectionNumber}-${schedule.scheduleDay}`;
      acc[key] = acc[key] || [];
      acc[key].push(schedule);
      return acc;
    }, {});
  
    // Group schedules by personnelNumber and scheduleDay
    const groupedByPersonnelAndDay = validSchedules.reduce((acc, schedule) => {
      if (schedule.personnelNumber) {
        const key = `${schedule.personnelNumber}-${schedule.scheduleDay}`;
        acc[key] = acc[key] || [];
        acc[key].push(schedule);
      }
      return acc;
    }, {});
  
    const overlappingSchedules = [];
  
    // Check for invalid start and end times
    for (const schedule of validSchedules) {
      if (!isValidTimeRange(schedule)) {
        console.error(`Invalid time range for schedule:`, schedule);
        overlappingSchedules.push(schedule);
      }
    }
  
    // Check for overlaps in section-day grouping
    for (const [key, schedules] of Object.entries(groupedBySectionAndDay)) {
      for (let i = 0; i < schedules.length; i++) {
        for (let j = i + 1; j < schedules.length; j++) {
          const schedule1 = schedules[i];
          const schedule2 = schedules[j];
  
          // Check if they overlap in time
          if (isTimeOverlap(schedule1, schedule2)) {
            console.error(
              `Overlap detected in section ${schedule1.sectionNumber} on ${schedule1.scheduleDay}:`,
              schedule1,
              schedule2
            );
  
            if (!overlappingSchedules.includes(schedule1)) overlappingSchedules.push(schedule1);
            if (!overlappingSchedules.includes(schedule2)) overlappingSchedules.push(schedule2);
          }
        }
      }
    }
  
    // Check for overlaps in personnel-day grouping
    for (const [key, schedules] of Object.entries(groupedByPersonnelAndDay)) {
      for (let i = 0; i < schedules.length; i++) {
        for (let j = i + 1; j < schedules.length; j++) {
          const schedule1 = schedules[i];
          const schedule2 = schedules[j];
  
          // Check if they overlap in time
          if (isTimeOverlap(schedule1, schedule2)) {
            console.error(
              `Overlap detected for personnel ${schedule1.personnelNumber} on ${schedule1.scheduleDay}:`,
              schedule1,
              schedule2
            );
  
            if (!overlappingSchedules.includes(schedule1)) overlappingSchedules.push(schedule1);
            if (!overlappingSchedules.includes(schedule2)) overlappingSchedules.push(schedule2);
          }
        }
      }
    }
  
    return overlappingSchedules; // Return all overlapping schedules
  }
  
  // Helper function to check time overlap
  function isTimeOverlap(schedule1, schedule2) {
    const start1 = new Date(`1970-01-01T${schedule1.startTime}`);
    const end1 = new Date(`1970-01-01T${schedule1.endTime}`);
    const start2 = new Date(`1970-01-01T${schedule2.startTime}`);
    const end2 = new Date(`1970-01-01T${schedule2.endTime}`);
  
    return start1 < end2 && end1 > start2;
  }
  
  // Helper function to check if the time range is valid
  function isValidTimeRange(schedule) {
    const start = new Date(`1970-01-01T${schedule.startTime}`);
    const end = new Date(`1970-01-01T${schedule.endTime}`);
  
    return start < end; // Ensures end time is after start time
  }
  
  
  
  
  
  
  
  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, [user.programNumber]);
  

  useEffect(() => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester) {
      setSections([]);
      setProfessors([]);
      fetchSections();
      fetchPersonnelList();
    }
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester]);
  
  useEffect(() => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection) {
      setSchedules([]);
      setCourses([]);
      fetchSchedules();
      fetchCourses();
      setShowTable(true);
    }
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester, selectedSection]);

  const handleScheduleChange = (index, field, value) => {
    // Update the schedules array
    setSchedules((prevSchedules) =>
      prevSchedules.map((schedule, i) =>
        i === index ? { ...schedule, [field]: value } : schedule
      )
    );
  };


  const handleProfessorChange = (index, newPersonnelNumber) => {
    // Update the schedules array
    setSchedules((prevSchedules) =>
      prevSchedules.map((schedule, i) =>
        i === index ? { ...schedule, personnelNumber: newPersonnelNumber } : schedule
      )
    );
  };

  useEffect(() => {
    console.log('Updated schedules:', schedules);
  }, [schedules]); // This will log whenever schedules is updated
  
  

  const handleAcademicYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedAcademicYear(selectedYear);
    setSelectedProgram('');
    setSelectedYearLevel('');  // Reset Year Level when Academic Year changes
    setSelectedSemester('');
    setSelectedSection('');
    setShowTable(false);
  };

  const handleProgramChange = (e) => {
    const selectedProgram = e.target.value;
    setSelectedProgram(selectedProgram);
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedSection('');
    setShowTable(false);
  };

  const handleYearLevelChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYearLevel(selectedYear);
    setSelectedSemester('');
    setSelectedSection('');
    setShowTable(false);
  };

  const handleSemesterChange = (e) => {
    const level = (e.target.value);
    setSelectedSemester(level);
    setSelectedSection('');
    setShowTable(false);
  };

  const handleSectionChange = (e) => {
    const selectedSection = e.target.value;
    setSelectedSection(selectedSection)
    setShowTable(false);
  };

  const printCSOG = () => {
    window.open('/SOG.pdf', '_blank');
  };

  const getSemesterText = (sem) => {
    switch (sem) {
      case 1:
        return "First";
      case 2:
        return "Second";
      case 3:
        return "Summer";
      default:
        return `${sem}`;
    }
  };
  
  const selectedProgramData = mappedData?.filter(p => p.academicYear === selectedAcademicYear)
                                        ?.flatMap(p => p.programs)
                                        ?.filter(p => p.programName === selectedProgram)
                                        ?.flatMap(p => p.yearLevels);

  const selectedYearData = mappedData?.filter(p => p.academicYear === selectedAcademicYear)
                                     ?.flatMap(p => p.programs)
                                     ?.filter(p => p.programName === selectedProgram)
                                     ?.flatMap(p => p.yearLevels)
                                     ?.filter(p => p.yearLevel === Number(selectedYearLevel))
                                     ?.flatMap(p => p.semesters);
  return (
    <div>
      {/* First Row for Academic Year */}
      <Row className="mb-2 bg-white rounded p-3 m-1">
        <Col xs={6} sm={4}>
          <Form.Group controlId="academicYear">
            <Form.Label>Academic Year</Form.Label>
            <Form.Control as="select" value={selectedAcademicYear} onChange={handleAcademicYearChange}>
              <option value="">Select Academic Year</option>
              {academicYears.sort((a, b) => {
                let yearA = parseInt(a.academicYear.split('-')[0]);
                let yearB = parseInt(b.academicYear.split('-')[0]);
                return yearB - yearA; // Sorting in descending order
              })
              .map((program) => (
                <option key={program.academicYear} value={program.academicYear}>
                  {program.academicYear}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Second Row for Program, Year Level, Semester */}
      <Row className="mb-4 bg-white rounded p-3 m-1">
        <Col>
          <Form.Group controlId="program">
            <Form.Label>Program</Form.Label>
            <Form.Control as="select" value={selectedProgram} onChange={handleProgramChange}
              disabled={!selectedAcademicYear}>
            <option value="">Select Program</option>
              {mappedData
                ?.filter(p => p.academicYear === selectedAcademicYear)
                ?.flatMap(p => p.programs)
                .map((program) => (
                  <option key={program.programNumber} value={program.programNumber}>
                    {program.programName}
                  </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="yearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Control as="select" value={selectedYearLevel} onChange={handleYearLevelChange}
              disabled={!selectedAcademicYear || !selectedProgram}>
              <option value="">Select Year Level</option>
              {selectedProgramData // Get year levels for selected academic year
                ?.map(level => (
                  <option key={level.yearLevel} value={level.yearLevel}>
                    Year {level.yearLevel}
                  </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="semester">
            <Form.Label>Semester</Form.Label>
            <Form.Control as="select" value={selectedSemester} onChange={handleSemesterChange}
              disabled={!selectedYearLevel || !selectedAcademicYear || !selectedProgram}>
            <option value="">Select Semester</option>
              {selectedYearData
                ?.map((sem, index) => (
                  <option key={index} value={sem}>
                    {getSemesterText(sem)}
                  </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Section Selection on a New Line */}
      <Row className="mb-4 bg-white rounded p-2 m-1">
        <Col xs={6} sm={4}>
          <Form.Group controlId="section">
            <Form.Control as="select" value={selectedSection} onChange={handleSectionChange}
              disabled={!selectedYearLevel || !selectedAcademicYear || !selectedSemester || !selectedProgram}>
                <option value="">Select Section</option>
                {sections
                  ?.map((section, index) => (
                    <option key={index} value={section.sectionNumber}>
                      {section.sectionNumber}
                    </option>
                ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Table for Subjects */}
      {showTable &&(
        <Row className="mb-3">
        <Col>
          <Table bordered hover className="text-center">
            <thead className="table-success">
              <tr>
                <th>Subject Code</th>
                <th>Subject Description</th>
                <th>Lecture Units</th>
                <th>Lab Units</th>
                <th>Schedule</th>
                <th>Professor</th>
              </tr>
            </thead>
            <tbody>
            { schedules.length === 0 && (
            <>
              <Button className="btn-success w-100" onClick={createSchedules}>Generate List</Button>
            </>
            )}
              {schedules.map((schedule, index) => {
                // Find the matching course based on courseCode
                const courseDetails = courses?.find(course => course.courseCode === schedule.courseCode);
                // If courseDetails exist, render the row
                return (
                  <tr key={index}>
                    <td>{schedule.courseCode}</td>
                    <td>{courseDetails?.courseDescriptiveTitle || 'N/A'}</td>
                    <td>{courseDetails?.courseLecture || 'N/A'}</td>
                    <td>{courseDetails?.courseLaboratory || 'N/A'}</td>
                    <td>
                      <div className="d-flex justify-content-start align-items-center">
                      <Form.Control
                        as="select"
                        value={schedule.scheduleDay}
                        onChange={(e) => handleScheduleChange(index, 'scheduleDay', e.target.value)}
                        className="mr-2">
                          <option value="">N/A</option>
                          <option value="Monday">Mon</option>
                          <option value="Tuesday">Tue</option>
                          <option value="Wednesday">Wed</option>
                          <option value="Thursday">Thu</option>
                          <option value="Friday">Fri</option>
                          <option value="Saturday">Sat</option>
                      </Form.Control>
                      <Form.Control
                        type="time"
                        value={schedule.startTime || ''}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="mr-2"/>
                      <Form.Control
                        type="time"
                        value={schedule.endTime || ''}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="mr-2"/>
                      </div>
                    </td>
                    <td>
                    {/* Professor Selection */}
                      <Form.Control
                        as="select"
                        value={schedule.personnelNumber || ''} // Ensure this reflects the correct professor for each schedule
                        onChange={(e) => handleProfessorChange(index, e.target.value)}
                        className="mr-2">
                          <option value="">Select Professor</option>
                          {professors.map((prof) => (
                            <option key={prof.id} value={prof.personnelNumber}>
                              {`${prof.personnelNameFirst} ${prof.personnelNameLast}`}
                            </option>
                          ))}
                      </Form.Control>
                    </td>
                  </tr>
                );
              })}
            { schedules.length > 0 && (
            <>
              <Button className="btn-success w-100" onClick={updateSchedules}>Save Schedule</Button>
            </>
            )}
            </tbody>
          </Table>
        </Col>
      </Row>
    )}
    </div>
  );
};

export default ProgramHeadClassDesig;
