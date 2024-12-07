import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import StudentModel from '../ReactModels/StudentModel';
import SectionModel from '../ReactModels/SectionModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import { UserContext } from '../Context/UserContext';

const Sections = () => {
  const { user } = useContext(UserContext);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [academicYears, setAcademicYears] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [classList, setClassList] = useState([]);
  
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
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection) {
      handleClassList();
      setShowTable(true);
    }
  };

  const handleClassList = async () => {
    try {
      // Fetch data from all models in parallel
      const [enrollments, schedules, students] = await Promise.all([
        EnrollmentModel.fetchAllEnrollment(),
        ScheduleModel.fetchSchedules(),
        StudentModel.fetchExistingStudents(),
      ]);

      // Create Maps for faster lookups
      const studentMap = new Map(students.map(student => [student.studentNumber, student]));
      const scheduleMap = new Map(schedules.map(schedule => [schedule.scheduleNumber, schedule]));
      //const courseMap = new Map(courses.map(course => [course.courseCode, course]));

      // Map over enrollments to create class list
      const mappedData = enrollments.map((enrollment) => {
        const matchedStudent = studentMap.get(enrollment.studentNumber) || {};
        const matchedSchedule = scheduleMap.get(enrollment.scheduleNumber) || {};
        //const matchedCourse = courseMap.get(enrollment.courseCode) || {};

        return {
          studentNumber: matchedStudent.studentNumber || "N/A",
          studentLastName: matchedStudent.studentNameLast || "N/A",
          studentFirstName: matchedStudent.studentNameFirst || "N/A",
          studentMiddleName: matchedStudent.studentNameMiddle || "N/A",
          contactNumber: matchedStudent.studentContact || "N/A",
          pccEmail: matchedStudent.studentPccEmail ? `${matchedStudent.studentPccEmail.split('@')[0]}@` : "N/A",
          studentAddress: matchedStudent.studentAddress || "N/A",
          //scheduleNumber: matchedSchedule.scheduleNumber || "N/A",
          academicYear: matchedSchedule.academicYear || "N/A",
          yearLevel: matchedSchedule.yearLevel || "N/A",
          semester: matchedSchedule.semester || "N/A",
          sectionNumber: matchedSchedule.sectionNumber || "N/A",
          //courseCode: matchedCourse.courseCode || "N/A",
          //programNumber: matchedCourse.programNumber || "N/A",
        };
      });

      const classList = removeDuplicates(mappedData);

      console.log(classList);

      // Apply filtering
      const filteredResults = classList.filter((student) => {

        return (
          (!selectedSection || String(student.sectionNumber).trim() === String(selectedSection).trim())
        );
      });

      console.log(filteredResults);

      // Update states with the results
      setClassList(filteredResults);
      //setFinalData(filteredResults);

      console.log("Mapped Data:", mappedData);
      console.log("Filtered Results:", filteredResults);
    } catch (error) {
      console.error("Error fetching class list data:", error);
      alert("An error occurred while fetching class list data. Please try again.");
    }
  };

  function removeDuplicates(data) {
    // Use a Map to store unique entries
    const uniqueEntries = new Map();

    data.forEach((entry) => {
        // Create a unique key based on studentNumber and scheduleNumber
        const uniqueKey = `${entry.studentNumber}-${entry.sectionNumber}`;

        // Add to the map if the key doesn't exist yet
        if (!uniqueEntries.has(uniqueKey)) {
            uniqueEntries.set(uniqueKey, entry);
        }
    });

    // Convert the Map back to an array
    return Array.from(uniqueEntries.values());
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
      <Row className="mb-2 bg-white rounded p-3 m-1">
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
      </Row>

      {/* Second Row for Program, Year Level, Semester, Section, and Add Section */}
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

      {/* Section Status Display */}
      <Row className="mb-3">
        <Col>
          <h5>Section {selectedSection} <span className="text-muted">[Status: {sectionStatus}]</span></h5>
        </Col>
      </Row>

      {showTable && (
        <>
      {/* Table for Courses */}
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
    </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Table for Students */}
      <Row>
        <Col>
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
              {classList.map((student, index) => (
                <tr key={index}>
                  <td>{student.studentNumber}</td>
                  <td>{student.studentLastName}, {student.studentFirstName} {student.studentMiddleName}</td>
                  <td>{student.contactNumber}</td>
                  <td>{student.pccEmail}</td>
                  <td>{student.studentAddress}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
        </>
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