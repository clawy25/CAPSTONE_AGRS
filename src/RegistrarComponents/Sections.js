import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
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
  
  const [newSection, setNewSection] = useState(null);
  
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionStatus, setSectionStatus] = useState('Pending');

  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [modalYearLevel, setModalYearLevel] = useState('');
  const [modalSemester, setModalSemester] = useState(''); // Default to "First" semester

  const [professors, setProfessors] = useState([
    'Prof. John Doe',
    'Prof. Jane Smith',
    'Prof. Michael Johnson',
    // Add more professors here
  ]);
  const [selectedProfessor, setSelectedProfessor] = useState('Prof. John Doe');


  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
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
    generateNextSectionNumber();
  }, []);

  // Fetch the courses based on selected academic year, year level, and semester
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

  // Trigger fetchCourses whenever academicYear, selectedYearLevel, or semester changes
  useEffect(() => {
    if (selectedAcademicYear && selectedYearLevel && selectedSemester && selectedSection) {
      setCourses([]);
      setSections([]);
      fetchCourses();
      fetchSections();
    }
  }, [selectedAcademicYear, selectedYearLevel, selectedSemester]);

  const handleView = () => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection) {
      setShowTable(true); 
    }
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSubjects = [...courses];
    updatedSubjects[index].schedule[field] = value;
    setCourses(updatedSubjects);
  };

  const handleProfessorChange = (index, value) => {
    const updatedSubjects = [...courses];
    updatedSubjects[index].professor = value;
    setCourses(updatedSubjects);
  };

  // Mock data for students
  const students = [
    {
      studentNumber: '20210101',
      studentName: 'Alice Johnson',
      program: 'BSREM',
      academicYear: '2023-2024',
      yearLevel: 'Freshman',
      semester: 'First',
      section: 'A',
      contactNumber: '09123456789',
      email: 'alice.johnson@pcc.edu',
      address: '1234 Main St, Parañaque',
    },
    {
      studentNumber: '20210102',
      studentName: 'Bob Smith',
      program: 'BSREM',
      academicYear: '2023-2024',
      yearLevel: 'Freshman',
      semester: 'First',
      section: 'B',
      contactNumber: '09123456780',
      email: 'bob.smith@pcc.edu',
      address: '5678 Elm St, Parañaque',
    },
    // Add more students as needed
  ];

  const filteredCourses = courses.filter(
    (subject) =>
      subject.selectedAcademicYear === selectedAcademicYear &&
      subject.program === selectedProgram &&
      subject.yearLevel === selectedYearLevel &&
      subject.semester === selectedSemester /*&&
      subject.section === selectedSection*/
  );

  const filteredStudents = students.filter(
    (student) =>
      student.selectedAcademicYear === selectedAcademicYear &&
      student.program === selectedProgram &&
      student.yearLevel === selectedYearLevel &&
      student.semester === selectedSemester /*&&
      student.section === selectedSection*/
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
    setSelectedYearLevel('');  // Reset Year Level when Academic Year changes
    setSelectedSemester('');
    setSelectedSection('');
    setShowTable(false);
  };

  const handleYearLevelChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYearLevel(selectedYear);
    setSelectedSemester(''); // Reset Semester when Year Level changes
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
    if (sections.length === 0 && !newSection) {
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
    
    //setSections((prevSections) => [...prevSections, newSection]);

    const section = {
      sectionNumber: String(newSection),
      programNumber: parseInt(selectedProgramNumber),
      yearLevel: parseInt(selectedYearLevel),
      sectionSemester: parseInt(selectedSemester),
      academicYear: selectedAcademicYear
    };

    SectionModel.createAndInsertSection(section);

    setSelectedSection('');
    fetchSections();
    setShowModal(false);
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
              ))
            }
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
          { selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && (
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
                        value={course.schedule.day}
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
                        value={course.schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="mr-2"
                      />*/}
                      {/*<Form.Control
                        type="time"
                        value={course.schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="mr-2"
                      />*/}
                    </div>
                  </td>
                  <td>
                    {/* Professor Selection */}
                    {/*<Form.Control
                      as="select"
                      value={course.professor}
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
              {filteredStudents.map((student, index) => (
                <tr key={index}>
                  <td>{student.studentNumber}</td>
                  <td>{student.studentName}</td>
                  <td>{student.contactNumber}</td>
                  <td>{student.email}</td>
                  <td>{student.address}</td>
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