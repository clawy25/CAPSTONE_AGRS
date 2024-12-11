import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import StudentModel from '../ReactModels/StudentModel'
import { UserContext } from '../Context/UserContext';
import '../App.css'

const Sections = () => {
  const { user } = useContext(UserContext);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState('');

  const [academicYears, setAcademicYears] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  
  const [newSection, setNewSection] = useState(null);
  
  const [currentAcademicYear, setCurrentAcadYear] = useState([]);
  
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [sectionStatus, setSectionStatus] = useState('Pending');

  const [functionCalled, setFunctionCalled] = useState(false); // Trigger state

  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [modalYearLevel, setModalYearLevel] = useState('');
  const [modalSemester, setModalSemester] = useState(''); // Default to "First" semester

  const [selectedProfessor, setSelectedProfessor] = useState('Prof. John Doe');


  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();


      const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);

      console.log(current);
      setCurrentAcadYear(current);
      setAcademicYears(fetchedAcademicYears);
  
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

  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, []);

  // Supposedly Fetch Schedules
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
      const program = programs.find(
        (p) => p.academicYear === selectedAcademicYear && p.programName === selectedProgram
      );

      const selectedProgramNumber = program ? program.programNumber : null;

      const personnelData = await PersonnelModel.getProfessorsbyProgram(selectedProgramNumber, selectedAcademicYear);
      console.log(personnelData);
      setProfessors(personnelData);
    } catch (error) {
      console.error('Error fetching personnel list:', error);
    }
  };

  // CHANGE FETCHCOURSES TO FETCHSCHEDULES
  useEffect(() => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection) {
      setSchedules([]);
      setCourses([]);
      setProfessors([]);
      fetchSchedules();
      fetchCourses();
      fetchPersonnelList();
    }
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester, selectedSection]);

  useEffect(() => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester || functionCalled) {
      setSections([]);
      fetchSections();
    }
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester, functionCalled]);

  const handleView = () => {
    if (selectedAcademicYear && selectedYearLevel && selectedSemester && selectedSection) {
      setShowTable(true); 
      fetchAndCombineData()
    }
  };

  //students
  const fetchAndCombineData = async () => {
    try {
      // Fetch data from models
      const allEnrollments = await EnrollmentModel.fetchAllEnrollment();
      const allStudents = await StudentModel.fetchExistingStudents();
      const allSchedules = await ScheduleModel.fetchSchedules();
    
    
      // Combine data using explicit relationships
      const combinedData = allEnrollments
        .map((enrollment) => {
          // Find the corresponding schedule using scheduleNumber
          const schedule = allSchedules.find(
            (sched) => sched.scheduleNumber === enrollment.scheduleNumber
          );
    
          // Find the corresponding student using studentNumber
          const student = allStudents.find(
            (stu) => stu.studentNumber === enrollment.studentNumber
          );
       
          // Combine the data if both schedule and student exist
          if (schedule && student) {
            return {
              StudentNumber: student.studentNumber,
              StudentName: `${student.studentNameFirst} ${student.studentNameMiddle} ${student.studentNameLast}`,
              ContactNumber: student.studentContact,
              PCCEmail: student.studentPccEmail,
              Address: student.studentAddress,
              AcademicYear: schedule.academicYear,
              YearLevel: schedule.yearLevel,
              Semester: schedule.semester || 'N/A', // Handle undefined semester
              Section: schedule.sectionNumber,
            };
          }
          return null; // Ignore if no match is found
        })
        .filter((entry) => entry !== null); // Filter out null values
    
      // Filter combined data based on selected section
      const filteredData = combinedData.filter(student => 
        !selectedSection || student.Section === selectedSection
      );
    
      // Make the filtered data distinct by StudentNumber (or any other field)
      const distinctData = filteredData.filter((value, index, self) => 
        index === self.findIndex((t) => t.StudentNumber === value.StudentNumber)
      );
  
      setStudents(distinctData);
    
      // Check if filtered data exists
      if (distinctData.length === 0) {
        console.log("No matching data found for the selected filters.");
      } else {
        // Log the filtered distinct data as a table
        console.table(distinctData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  
  
  

  const filteredCourses = courses.filter(
    (subject) =>
      subject.selectedAcademicYear === selectedAcademicYear &&
      subject.program === selectedProgram &&
      subject.yearLevel === selectedYearLevel &&
      subject.semester === selectedSemester /*&&
      subject.section === selectedSection*/
  );



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

  const addSection = () => {
    let nextSection;

    console.log(sections);
    if (sections.length === 0) {
        // Start with "A" if there are no sections
        nextSection = `${generateNextSectionNumber()}A`;
    } else {
        const lastSection = sections[sections.length - 1];

        console.log(lastSection);
        const lastCharacter = lastSection?.sectionNumber.charAt(lastSection.sectionNumber.length - 1);

        console.log(lastCharacter);
        const lastCharacterCode = lastCharacter?.charCodeAt(0);
        console.log(lastCharacterCode);

        // Check if the last character is 'Z' (ASCII 90) to avoid overflow
        const nextCharacterCode = lastCharacterCode === 90 ? 65 : lastCharacterCode + 1; // Wrap around after 'Z'
        const nextLetter = String.fromCharCode(nextCharacterCode);

        nextSection = `${generateNextSectionNumber()}${nextLetter}`;
    }
    setNewSection(nextSection); // Automatically fill the next section
    setShowModal(true); // Show the modal for adding the section
  };



  const handleAddSection = async () => {
    
    const program = programs.find(
      (p) => p.academicYear === selectedAcademicYear && p.programName === selectedProgram
    );

    const selectedProgramNumber = program ? program.programNumber : null;

    const section = {
      sectionNumber: String(newSection),
      programNumber: parseInt(selectedProgramNumber),
      yearLevel: parseInt(selectedYearLevel),
      sectionSemester: parseInt(selectedSemester),
      academicYear: selectedAcademicYear
    };

    SectionModel.createAndInsertSection(section);

    
    setSections((prevSections) => [...prevSections, section]);
    setSelectedSection('');
    setShowModal(false);
    setFunctionCalled(true);
    setSectionStatus('Pending'); // Reset status to Pending
  };

  const printCSOG = () => {
    window.open('/SOG.pdf', '_blank');
  };

  const openModal = () => {// UNUSED
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewSection(''); // Track the new section to be added
  };
  // Example function for generating a section number (this can vary based on your business logic)
  const generateNextSectionNumber = () => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester){
      
      const yearParts = selectedAcademicYear.split('-');
      
      const startYear = yearParts[0].slice(-2);
      const endYear = yearParts[1].slice(-2);
      const sectionPrefix = `${startYear}${endYear}-${selectedProgram.slice(2,6).toUpperCase()}`;
      const sectionSuffix = `${selectedYearLevel}${selectedSemester}`;
      return `${sectionPrefix}${sectionSuffix}`;
    }
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
 

      {/* Second Row for Program, Year Level, Semester, Section, and Add Section */}
      <Row className="mb-3 bg-white rounded p-3 m-1">
      <Col>
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
        
        {/* Section Selection */}
        <Col>
          <Form.Group controlId="section">
            <Form.Label>Section</Form.Label>
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
        <Col className="d-flex flex-column align-items-end">
        
          <Button className="btn-success w-100 mb-2" onClick={handleView}>View</Button>
          { selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && 
            (selectedAcademicYear === currentAcademicYear[0].academicYear) && (
            <>
              <Button className="btn-success w-100" onClick={addSection}>Add Section</Button>
            </>
          )}
        </Col>
        
      </Row>

      {showTable && (
        <Row className="mb-3 m-1">
          <div className='card bg-white rounded'>
              <div className="card-header bg-white pt-4">
                <h5>Section {selectedSection} <span className="text-muted">[Status: {sectionStatus}]</span></h5>
              </div>
              <div className="card-body mt-2 mx-1 mb-1">
                  <div className='mb-3 table-responsive'>
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
                            {/* Schedule Inputs aligned in a single line */}
                            <div className="d-flex justify-content-start align-items-center">
                              {/* Example schedule inputs */}
                              <Form.Control
                                as="text"
                                readOnly
                                className="mr-2">
                                  {schedule.scheduleDay || 'N/A'}
                              </Form.Control>
                              <Form.Control
                                type="time"
                                value={schedule.startTime || ''}
                                readOnly
                                className="mr-2"/>
                              <Form.Control
                                type="time"
                                value={schedule.endTime || ''}
                                readOnly
                                className="mr-2"/>
                            </div>
                          </td>
                          <td>
                            <Form.Control
                              as="input"
                              type="text"
                              value={
                                schedule.personnelNumber
                                ? `${professors.find((prof) => prof.personnelNumber === schedule.personnelNumber)?.personnelNameFirst || ''} ${
                                    professors.find((prof) => prof.personnelNumber === schedule.personnelNumber)?.personnelNameLast || ''}` : 'No Professor'}
                              readOnly
                              className="mr-2"
                            />
                          </td>
                        </tr>);
                        })}
                      </tbody>
                    </Table>
                  </div>
                  <div className='mt-2 table-responsive'>
                  {students.length > 0 ? (
                    <Table bordered hover className="text-center">
                      <thead className="table-info">
                        <tr>
                          <th>Student Number</th>
                          <th>Student Name</th>
                          <th>Contact Number</th>
                          <th>PCC Email</th>
                          <th>Address</th>
                        </tr>
                      </thead>
                      <tbody>
                      {students.map((studentData, index) => (
                      <tr key={index}>
                        <td>{studentData.StudentNumber}</td>
                        <td>{studentData.StudentName}</td>
                        <td>{studentData.ContactNumber}</td>
                        <td>{studentData.PCCEmail}</td>
                        <td>{studentData.Address}</td>
                      </tr>
                    ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div>No students found for the selected criteria.</div>
                  )}
              </div>
              
              </div>
          </div>
        </Row>
      )}

      {/* Add Section Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Dropdown for Program */}
          <Form.Group controlId="modalProgram">
            <Form.Label>Program</Form.Label>
            <Form.Control type="text" value={selectedProgram} readOnly/>
          </Form.Group>

          {/* Dropdown for Year Level */}
          <Form.Group controlId="modalYearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Control type="text" value={selectedYearLevel} readOnly/>
          </Form.Group>

          {/* Dropdown for Semester */}
          <Form.Group controlId="modalSemester">
            <Form.Label>Semester</Form.Label>
            <Form.Control type="text" value={selectedSemester} readOnly/>
          </Form.Group>


          {/* New Section Text Field */}
          <Form.Group controlId="newSection">
            <Form.Label>New Section</Form.Label>
            <Form.Control
              type="text"
              enabled
              readOnly
              value= {newSection}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          <Button variant="primary" onClick={handleAddSection}>Add Section</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sections;