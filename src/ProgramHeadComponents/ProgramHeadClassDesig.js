import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Container, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import { UserContext } from '../Context/UserContext';

const ProgramHeadClassDesig = () => {
  const [loading, setLoading] = useState(false);
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
      setLoading(true); // Start loading when fetching data
      setSchedules([]); // Clear previous schedules
      setCourses([]); // Clear previous courses
      
      // Fetch schedules and courses
      Promise.all([fetchSchedules(), fetchCourses()])
        .then(() => {
          setShowTable(true); // Show the table after data is fetched
        })
        .catch((error) => {
          console.error('Error fetching schedules or courses:', error);
        })
        .finally(() => {
          setLoading(false); // Stop loading when the data is fetched or error occurred
        });
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
      <h2 className="custom-font custom-color-green-font mb-3 mt-2">Class Scheduling</h2>
      <Form className="p-3 mb-4 bg-white border border-success rounded">
      <Row className="align-items-center justify-content-between gx-3 gy-2">
      <Col xs={12} sm={12} md={2} className="mb-3">
          <Form.Group controlId="academicYear">
            <Form.Label className="custom-color-green-font custom-font text-nowrap">Academic Year</Form.Label>
            <Form.Select className='border-success' value={selectedAcademicYear} onChange={handleAcademicYearChange}>
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
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} sm={12} md={2} className="mb-3">
          <Form.Group controlId="program">
            <Form.Label className="custom-color-green-font custom-font text-nowrap">Program</Form.Label>
            <Form.Select className='border-success' value={selectedProgram} onChange={handleProgramChange}
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
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} sm={12} md={2} className="mb-3">
          <Form.Group controlId="yearLevel">
            <Form.Label className="custom-color-green-font custom-font text-nowrap">Year Level</Form.Label>
            <Form.Select className='border-success' value={selectedYearLevel} onChange={handleYearLevelChange}
              disabled={!selectedAcademicYear || !selectedProgram}>
              <option value="">Select Year Level</option>
              {selectedProgramData // Get year levels for selected academic year
                ?.map(level => (
                  <option key={level.yearLevel} value={level.yearLevel}>
                    Year {level.yearLevel}
                  </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} sm={12} md={2} className="mb-3">
          <Form.Group controlId="semester">
            <Form.Label className="custom-color-green-font custom-font text-nowrap">Semester</Form.Label>
            <Form.Select className='border-success' value={selectedSemester} onChange={handleSemesterChange}
              disabled={!selectedYearLevel || !selectedAcademicYear || !selectedProgram}>
            <option value="">Select Semester</option>
              {selectedYearData
                ?.map((sem, index) => (
                  <option key={index} value={sem}>
                    {getSemesterText(sem)}
                  </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} sm={12} md={2} className="mb-3">
          <Form.Group controlId="section">
          <Form.Label className="custom-color-green-font custom-font text-nowrap">Section</Form.Label>
            <Form.Select className='border-success' value={selectedSection} onChange={handleSectionChange}
              disabled={!selectedYearLevel || !selectedAcademicYear || !selectedSemester || !selectedProgram}>
                <option value="">Select Section</option>
                {sections
                  ?.map((section, index) => (
                    <option key={index} value={section.sectionNumber}>
                      {section.sectionNumber}
                    </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      </Form>
      {/* Table for Subjects */}
      {loading ? (
  <div className="text-center py-5 bg-white mt-4">
    <Spinner animation="border" variant="success" />
    <p className="mt-3">Loading data, please wait...</p>
  </div>
) : showTable ? (
  <Container fluid className="bg-white mt-3 pt-4 pb-2 rounded">
    <Row className="mb-3 mx-2 mt-4 table-responsive overflow-auto hide-scrollbar">
      <Table bordered hover className="text-center">
        <thead className="table-success">
          <tr>
            <th className='custom-color-green-font'>Subject Code</th>
            <th className='custom-color-green-font'>Subject Description</th>
            <th className='custom-color-green-font'>Lecture Units</th>
            <th className='custom-color-green-font'>Lab Units</th>
            <th className='custom-color-green-font'>Schedule</th>
            <th className='custom-color-green-font'>Professor</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length === 0 ? (
            <tr>
              <td colSpan="6">
                <Button className="btn-success w-100" onClick={createSchedules}>
                  Generate List
                </Button>
              </td>
            </tr>
          ) : (
            schedules.map((schedule, index) => {
              const courseDetails = courses?.find(
                (course) => course.courseCode === schedule.courseCode
              );
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
                        onChange={(e) =>
                          handleScheduleChange(index, 'scheduleDay', e.target.value)
                        }
                        className="mr-2"
                      >
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
                        onChange={(e) =>
                          handleScheduleChange(index, 'startTime', e.target.value)
                        }
                        className="mr-2"
                      />
                      <Form.Control
                        type="time"
                        value={schedule.endTime || ''}
                        onChange={(e) =>
                          handleScheduleChange(index, 'endTime', e.target.value)
                        }
                        className="mr-2"
                      />
                    </div>
                  </td>
                  <td>
                    <Form.Control
                      as="select"
                      value={schedule.personnelNumber || ''}
                      onChange={(e) => handleProfessorChange(index, e.target.value)}
                      className="mr-2"
                    >
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
            })
          )}
        </tbody>
      </Table>
      
    </Row>

    {schedules.length > 0 && (
        <Container fluid className='mb-3'>
          <Button className="btn-success" onClick={updateSchedules}>
            Save Schedule
          </Button>
        </Container>
      )}
  </Container>
) : (
  <div className="text-center py-5 bg-white rounded pt-5 px-4 pb-5">
    <h5 className="custom-color-green-font mt-5 fs-5">No Data Available</h5>
    <p className="fs-6 mb-4">
      Please ensure that all filters are applied then click "View" to display the data.
    </p>
  </div>
)}

      
    </div>
  );
};

export default ProgramHeadClassDesig;
