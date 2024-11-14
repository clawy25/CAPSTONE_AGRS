import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
import ScheduleModel from '../ReactModels/ScheduleModel';

const ProgramHeadClassDesig = () => {
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
  const [professors, setProfessors] = useState([
    'Prof. John Doe',
    'Prof. Jane Smith',
    'Prof. Michael Johnson',
    // Add more professors here
  ]);
  const [selectedProfessor, setSelectedProfessor] = useState('Prof. John Doe');

  const [subjects, setSubjects] = useState([
    {
      subjectCode: 'CS101',
      subjectDescription: 'Introduction to Computer Science',
      lectureUnits: 3,
      labUnits: 1,
      schedule: { day: 'Mon', startTime: '8:00 AM', endTime: '10:00 AM' },
      professor: 'Prof. John Doe',
    },
    {
      subjectCode: 'CS102',
      subjectDescription: 'Data Structures and Algorithms',
      lectureUnits: 3,
      labUnits: 2,
      schedule: { day: 'Tue', startTime: '9:00 AM', endTime: '12:00 PM' },
      professor: 'Prof. Jane Smith',
    },
    // Add more subjects as needed
  ]);


  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
      setAcademicYears(fetchedAcademicYears);

      const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);
      setCurrentAcadYear(current);
  
      const allPrograms = await ProgramModel.fetchAllPrograms();

      setPrograms(allPrograms);
  
      if (allPrograms.length > 0) {
        const data = [];
      
        allPrograms.forEach(row => {
          // Check if there is already an entry for the current academicYear
          let existingAcadYear = data.find(item => item.academicYear === row.academicYear);
      
          if (!existingAcadYear) {
            // Filter programs for the current academicYear
            const programsForYear = allPrograms.filter(item => item.academicYear === row.academicYear);
            
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
    try{
      const allSchedules = await ScheduleModel.fetchExistingschedule();

      console.log(allSchedules);

      setSchedules(allSchedules);
    } catch (error){
      console.error("Error fetching schedules:", error);
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

          console.log(courseData);
          
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

  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester) {
      setSections([]);
      fetchSections();
    }
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester]);
  
  useEffect(() => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection) {
      setCourses([]);
      fetchCourses();
      setSchedules([]);
      fetchSchedules();
      setShowTable(true);
    }
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester, selectedSection]);

  const handleScheduleChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index].schedule[field] = value;
    setSubjects(updatedSubjects);
  };

  const handleProfessorChange = (index, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index].professor = value;
    setSubjects(updatedSubjects);
  };

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
              {courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseDescriptiveTitle}</td>
                  <td>{course.courseLecture}</td>
                  <td>{course.courseLaboratory}</td>
                  <td>
                    {/* Schedule Inputs aligned in a single line */}
                    <div className="d-flex justify-content-start align-items-center">
                      {/*<Form.Control
                        as="select"
                        value={subject.schedule.day}
                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                        className="mr-2"
                      >
                        <option value="Mon">Mon</option>
                        <option value="Tue">Tue</option>
                        <option value="Wed">Wed</option>
                        <option value="Thu">Thu</option>
                        <option value="Fri">Fri</option>
                        <option value="Sat">Sat</option>
                      </Form.Control>*/}
                      {/*<Form.Control
                        type="time"
                        value={subject.schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="mr-2"
                      />*/}
                      {/*<Form.Control
                        type="time"
                        value={subject.schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="mr-2"
                      />*/}
                    </div>
                  </td>
                  <td>
                    {/* Professor Selection */}
                    {/*<Form.Control
                      as="select"
                      value={subject.professor}
                      onChange={(e) => handleProfessorChange(index, e.target.value)}
                    >
                      {professors.map((prof, idx) => (
                        <option key={idx} value={prof}>
                          {prof}
                        </option>
                      ))}
                    </Form.Control>*/}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    )}
    </div>
  );
};

export default ProgramHeadClassDesig;
