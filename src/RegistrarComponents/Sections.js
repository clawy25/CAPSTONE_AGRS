import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal, Spinner, Container,Card,  CardHeader, CardBody } from 'react-bootstrap';

import AcademicYearModel from '../ReactModels/AcademicYearModel';
import ProgramModel from '../ReactModels/ProgramModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import StudentModel from '../ReactModels/StudentModel'
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../App.css'

const Sections = () => {
  const [loading, setLoading] = useState(false); 
  const [loadingSection, setLoadingSection] = useState(false); 
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
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
  const [showModalAlertView, setShowModalAlertView] =useState(false);
  const [showModalAlert, setShowModalAlert] =useState(false);

  //On loading the page
  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if user is not present
    }
  }, [user, navigate]);

  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();


      const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);

      //console.log(current);
      setCurrentAcadYear(current);
      setAcademicYears(fetchedAcademicYears);
  
      const allPrograms = await ProgramModel.fetchAllPrograms();

     // console.log(allPrograms);
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
      
            programsForYear.forEach(row => {
              // Find if the program already exists in the mapped data
              let existingProgram = programs.find(
                p => p.programName === row.programName && 
                     p.yearLevels.some(yl => yl.yearLevel === row.programYrLvlSummer)
              );
      
              if (!existingProgram) {
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
              } else {
                // Update existing yearLevels for duplicate program
                const yearLevelIndex = existingProgram.yearLevels.findIndex(
                  yl => yl.yearLevel === row.programYrLvlSummer
                );
                if (yearLevelIndex >= 0) {
                  existingProgram.yearLevels[yearLevelIndex].semesters = [1, 2, 3];
                }
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
      
       // console.log(data);
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

          //console.log(courseData);
          
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
    //  console.log(allSchedules);
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


  useEffect(() => {
    const handleView = () => {
      if (selectedAcademicYear && selectedYearLevel && selectedSemester && selectedSection) {
        setLoading(true);
        setShowTable(true); 
        fetchAndCombineData().finally(() => setLoading(false));
      }
    };
  
    handleView();
  }, [selectedAcademicYear, selectedYearLevel, selectedSemester, selectedSection]);  // Dependencies to re-run when any of these values change
  

  const closeShowModalAlertView = () => {
    setShowModalAlertView(false);
  }

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
    setLoadingSection(true); // Set loading to true before starting the process

    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester) {
        let nextSection;

        if (sections.length === 0) {
            // Start with "A" if there are no sections
            nextSection = `${generateNextSectionNumber()}A`;
        } else {
            const lastSection = sections[sections.length - 1];

            const lastCharacter = lastSection?.sectionNumber.charAt(lastSection.sectionNumber.length - 1);
            const lastCharacterCode = lastCharacter?.charCodeAt(0);

            // Check if the last character is 'Z' (ASCII 90) to avoid overflow
            const nextCharacterCode = lastCharacterCode === 90 ? 65 : lastCharacterCode + 1; // Wrap around after 'Z'
            const nextLetter = String.fromCharCode(nextCharacterCode);

            nextSection = `${generateNextSectionNumber()}${nextLetter}`;
        }

        setNewSection(nextSection); // Automatically fill the next section
        setShowModal(true); // Show the modal for adding the section       
    } else {
        setShowModalAlert(true);
    }

    setLoadingSection(false); // Set loading to false after the process is complete
};


  const closeShowModalAlert = () => {
    setShowModalAlert(false);
  }



  const handleAddSection = async () => {
    // Set loading state to true
    setLoadingSection(true);
  
    try {
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
  
      await SectionModel.createAndInsertSection(section); // Ensure this is an async function if necessary
  
      // Update sections and reset states
      setSections((prevSections) => [...prevSections, section]);
      setSelectedSection('');
      setShowModal(false);
      setFunctionCalled(true);
      setSectionStatus('Pending'); // Reset status to Pending
    } catch (error) {
      console.error("Error adding section:", error);
    } finally {
      // Set loading state to false
      setLoadingSection(false);
    }
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
      <h2 className="custom-font custom-color-green-font mb-3 mt-2">Sections</h2>

      {/* Second Row for Program, Year Level, Semester, Section, and Add Section */}
      <Form className="p-3 mb-4 bg-white border border-success rounded">
        <Row className="align-items-center">
        <Col  sm={12} md={6} lg={2} className='mb-3'>
            <Form.Group className='w-100' controlId="academicYear">
              <Form.Label className="custom-color-green-font text-nowrap">Academic Year</Form.Label>
              <Form.Select value={selectedAcademicYear} onChange={handleAcademicYearChange} className="border-success">
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
          <Col sm={12} md={6} lg={2} className='mb-3'>
            <Form.Group className='w-100' controlId="program">
              <Form.Label className="custom-color-green-font text-nowrap">Program</Form.Label>
              <Form.Select value={selectedProgram} onChange={handleProgramChange} className="border-success"
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
          <Col sm={12} md={6} lg={2} className='mb-3'>
            <Form.Group className='w-100' controlId="yearLevel">
              <Form.Label className="custom-color-green-font text-nowrap">Year Level</Form.Label>
              <Form.Select value={selectedYearLevel} onChange={handleYearLevelChange} className="border-success"
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
          <Col sm={12} md={6} lg={2} className='mb-3'>
            <Form.Group className='w-100' controlId="semester">
              <Form.Label className="custom-color-green-font text-nowrap">Semester</Form.Label>
              <Form.Select value={selectedSemester} onChange={handleSemesterChange} className="border-success"
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
          
          {/* Section Selection */}
          <Col sm={12} md={6} lg={2} className='mb-3'>
            <Form.Group className='w-100' controlId="section">
              <Form.Label className="custom-color-green-font text-nowrap">Section</Form.Label>
              <Form.Select value={selectedSection} onChange={handleSectionChange} className="border-success"
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
          <Col sm={12} md={6} lg={2} className='mb-3'>
          <Form.Group className='w-100' controlId="viewButton">
            <Form.Label className="custom-color-green-font text-nowrap">Action</Form.Label>
              <div className='d-flex'>
              <Button className="btn-success w-100" onClick={addSection}>{loadingSection ? 'Adding Section...' : 'Add Section'}</Button>        
              
            </div>
            </Form.Group>
          </Col>
          
        </Row>
      </Form>

      <Card className='card bg-white rounded px-3 pb-3 '>
          
        {loading ? (
           <div className="text-center py-5 bg-white">
           <Spinner animation="border" variant="success" />
           <p className="mt-3">Loading data, please wait...</p>
         </div>
        ): showTable ? (
          selectedSection && schedules.length > 0 ? (
            <Row>
            <CardHeader className="card-header bg-white pt-4">
              <h5>Section {selectedSection} <span className="text-muted">[Status: {sectionStatus}]</span></h5>
            </CardHeader>
         
                <CardBody className="card-body mt-2 mb-1">
                  {/* Schedules Table */}
                  <Container fluid className='table-responsive shadow-sm hide-scrollbar rounded'>
                    <Table bordered hover className="text-center mt-4 mb-3 shadow-sm">
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
                          const courseDetails = courses?.find(course => course.courseCode === schedule.courseCode);
                          return (
                            <tr key={index}>
                              <td>{schedule.courseCode}</td>
                              <td>{courseDetails?.courseDescriptiveTitle || 'N/A'}</td>
                              <td>{courseDetails?.courseLecture || 'N/A'}</td>
                              <td>{courseDetails?.courseLaboratory || 'N/A'}</td>
                              <td>
                                <div className="d-flex justify-content-start align-items-center">
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
                  </Container>

                  {/* Students Table */}
                  <Container fluid className='mt-4 table-responsive shadow-sm hide-scrollbar rounded'>
                    {students.length > 0 ? (
                      <Table bordered hover className="text-center mt-4 mb-3 shadow-sm">
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
                  </Container>

                </CardBody>

            </Row>
            
            
          
          ) : (
            <div className="text-center py-5 bg-white rounded pt-5 px-4 pb-5">
            <h5 className="custom-color-green-font mt-5 fs-5 pt-5">No Data Available</h5>
            <p className="fs-6 mb-2">
            Please ensure that all filters are applied or data is available to display.
            </p>
          </div>
          )
        ) : (
          <div className="text-center py-5 bg-white rounded pt-5 px-4 pb-5">
            <h5 className='custom-color-green-font fs-5 pt-5'>No Data Available</h5>
            <p className='fs-6'>Please ensure that all filters are applied or data is available to display.</p>
          </div>
        )}
      </Card>

      

      {/* Add Section Modal */}
      <Modal show={showModal} onHide={closeModal} animation={false}>
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
          <Button variant="primary" onClick={handleAddSection}>{loadingSection ? 'Adding New Section...' : 'Add Section'}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalAlertView} onHide={closeShowModalAlertView} centered animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please complete all filters (Academic Year, Program, Year Level, Semester, Sections) to view Sections.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeShowModalAlertView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalAlert} onHide={closeShowModalAlert} centered>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         Please complete all filters (Academic Year, Program, Year Level, Semester) to add new Sections.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeShowModalAlert}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
  
    </div>
  );
};

export default Sections;