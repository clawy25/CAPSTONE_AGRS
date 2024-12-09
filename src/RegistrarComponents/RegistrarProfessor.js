import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import ProgramModel from '../ReactModels/ProgramModel'; 
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import CourseModel from '../ReactModels/CourseModel';
import SectionModel from '../ReactModels/SectionModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import SubmissionModel from '../ReactModels/SubmissionModel';
import { UserContext } from '../Context/UserContext';
import '../App.css';

export default function RegistrarProfessor() {
  const { user } = useContext(UserContext);
  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState({
    courseCode: '',
    courseDescription: '',
    personnelNumber: '',
    personnelName: '',
    date: '',
    time: '',
    status: '',
    submittedOn: '',
  });

  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('First');
  const [selectedSection, setSelectedSection] = useState('A'); // Default to Section A
  

  const [currentAcademicYear, setCurrentAcadYear] = useState([]);
  const [courses, setCourses] = useState([]);
  const [mappedData, setMappedData] = useState([]);

  const [sections, setSections] = useState(['A']);

  const [schedules, setSchedules] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [status, setStatus] = useState("Pending");  
  const [date, setDate] = useState([]);
  const [time, setTime] = useState([]);


  const handleCloseModal = () => {
    setShowModal(false)};
    

  const handleEdit = (rowData) => {
      setEditableData(rowData);
      setShowModal(true);
    };
    
  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
      setAcademicYears(fetchedAcademicYears);

      const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);
      setCurrentAcadYear(current);
  
      const fetchedProgram = await ProgramModel.fetchAllPrograms(user.programNumber);

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

  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, [user.programNumber]);


  
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

  const fetchSchedules = async () => {
    try {
        // Ensure all necessary filters are selected
        if (!selectedAcademicYear || !selectedProgram || !selectedYearLevel || !selectedSemester || !selectedSection) {
            console.warn("All filters must be selected before fetching schedules.");
            return;
        }

        // Log the selected filters for debugging
        console.log("Filters:", {
            selectedAcademicYear,
            selectedProgram,
            selectedYearLevel,
            selectedSemester,
            selectedSection,
        });

        const personnelData = await PersonnelModel.getProfessorByPersonnelNumber();
        console.log("Fetched personnel:", personnelData);
        // Fetch all schedules
        const scheduleData = await ScheduleModel.fetchExistingschedule(selectedSection);
        console.log("Fetched schedules:", scheduleData);

        // If schedules are available, check for matching submissions
        if (scheduleData.length > 0) {
            // Use Promise.all to fetch submissions for each schedule
            const formattedSchedules = await Promise.all(
                scheduleData.map(async (schedule) => {
                    try {

                        // Fetch submission data for the current schedule using scheduleNumber
                        const submissionData = await SubmissionModel.fetchSubmissionBySchedule(schedule.scheduleNumber);   

                        // If no submission data found, use null for matching submission
                        const matchingSubmission = submissionData && submissionData.length > 0 ? submissionData[0] : null;

                        // Format the created_at field (if found) into a human-readable date and time
                        let formattedDate = null;
                        let formattedTime = null;
                        if (matchingSubmission && matchingSubmission.created_at) {
                            const timestamp = matchingSubmission.created_at;
                            const dateObj = new Date(timestamp.replace(" ", "T")); // Convert to Date object
                            formattedDate = dateObj.toISOString().split('T')[0];  // YYYY-MM-DD
                            formattedTime = dateObj.toISOString().split('T')[1].slice(0, 8); // HH:MM:SS
                        }

                        // Return the schedule data, including matching submission details if found
                        return {
                            courseCode: schedule.courseCode,
                            personnelNumber: schedule.personnelNumber,
                            scheduleNumber: schedule.scheduleNumber,
                            created_at: formattedDate,  // Display formatted date
                            submissionStatus: matchingSubmission ? matchingSubmission.submissionStatus : null, // Include submissionStatus if match found
                            time: formattedTime, // Display formatted time
                        };
                    } catch (error) {
                        console.error(`Error fetching submission for schedule ${schedule.scheduleNumber}:`, error);
                        // Return the schedule data with null values for submission fields in case of error
                        return {
                            courseCode: schedule.courseCode,
                            personnelNumber: schedule.personnelNumber,
                            scheduleNumber: schedule.scheduleNumber,
                            created_at: null,
                            submissionStatus: null,
                            time: null,
                        };
                    }
                })
            );

            // Set the formatted schedules to the state
            setSchedules(formattedSchedules);
        } else {
            console.warn("No schedules found for the selected filters.");
            setSchedules([]); // Clear schedules if no data matches
        }
    } catch (error) {
        console.error("Error fetching schedules:", error);
        setSchedules([]); // Set an empty array if an error occurs in the main try block
    }
};

const handleAddSubmission = async (scheduleData) => {
  try {
    // Destructure the necessary values from scheduleData
    const { date, time, scheduleNumber, submissionStatus } = scheduleData;

    // Combine the date and time fields to form the created_at timestamp
    const combinedDateTime = new Date(`${date}T${time}`); // Assuming date and time are in string format

    // Check if the scheduleNumber already exists in the database
    const existingSubmission = await SubmissionModel.fetchSubmissionBySchedule(scheduleNumber);
    
    // If the scheduleNumber exists, don't insert the submission again
    if (existingSubmission && existingSubmission.length > 0) {
      console.log('Submission with this schedule number already exists.');
      return;
    }

    // Prepare the submission data
    const submission = {
      created_at: combinedDateTime.toISOString(), // Store the combined date and time as an ISO string
      scheduleNumber: scheduleNumber,
      submissionStatus: submissionStatus,
    };

    // Call the method to create and insert the submission
    const response = await SubmissionModel.createAndInsertSubmission(submission);

    if (response.success) {
      console.log('Submission added successfully:', response);
    } else {
      console.error('Failed to add submission:', response.message);
    }
  } catch (error) {
    console.error('Error adding submission:', error);
  }
};


  useEffect(() => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester) {
      setSections([]);
      setProfessors([]);
      fetchSections();
      fetchPersonnelList();
    }
  }, [selectedAcademicYear, selectedProgram, selectedYearLevel, selectedSemester]);
  

  
  const handleView = () => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection) {
      fetchSchedules();
    } else {
      alert("Please complete all filters (Academic Year, Program, Year Level, Semester, Section) to view schedules.");
    }
  };


  const handleAcademicYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedAcademicYear(selectedYear);
    setSelectedProgram('');  // Reset dependent fields
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleProgramChange = (e) => {
    const selectedProgram = e.target.value;
    setSelectedProgram(selectedProgram);
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleYearLevelChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYearLevel(selectedYear);
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleSemesterChange = (e) => {
    const level = (e.target.value);
    setSelectedSemester(level);
    setSelectedSection('');
    
  };

  const handleSectionChange = (e) => {
    const selectedSection = e.target.value;
    setSelectedSection(selectedSection)
    
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
    <section className="container-fluid ms-0">
      <h2 className="custom-font custom-color-green-font my-3">Grade Submission Status</h2>
      <Row className="bg-white rounded p-3 mb-3">
        <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
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
        <Col  xs={12} sm={6} md={4} lg={2} className='mb-3'>
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
        <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
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
        <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
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
        <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
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
        <Col xs={12} sm={6} md={4} lg={2} className='col-2 d-flex justify-align-items align-items-center mb-3'>
          <Button className='btn btn-success mt-4 w-100' onClick={handleView}>View</Button>
        </Col>
      </Row>

      {/* Table */}
      <Row>
        <div className="card mb-4 bg-white rounded p-3">
          <div className="card-body table-responsive">
            <Table bordered hover>
              <thead className='table-success text-center'>
                <tr>
                  <th>Course</th>
                  <th>Faculty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              { schedules.length > 0 ? (
    schedules.map((schedule, index) => (
        <tr key={index}>
            <td>{schedule.courseCode}</td>
            <td>{schedule.personnelNumber}</td>
            
            {/* Date Input */}
            <td>
                <Form.Group className="mb-3" controlId="date">
                    <Form.Control
                        type="date"
                        value={schedule.created_at ? schedule.created_at : ''}
                        onChange={(e) => setDate(e.target.value)} // Optional: handle date change if needed
                    />
                </Form.Group>
            </td>

            {/* Time Input */}
            <td>
                <Form.Group className="mb-3" controlId="time">
                    <Form.Control
                        type="time"
                        value={schedule.time ? schedule.time : ''}
                        onChange={(e) => setTime(e.target.value)} // Optional: handle time change if needed
                    />
                </Form.Group>
            </td>

            {/* Submission Status Dropdown */}
            <td>
                <Form.Group className="mb-3" controlId="status">
                    <Form.Select
                        aria-label="Default select example"
                        value={schedule.submissionStatus || status}  // Bind value to submission status or default state
                        onChange={(e) => setStatus(e.target.value)}  // Update state on change
                    >
                        <option className="text-success" value="Submitted">Submitted</option>
                        <option className="text-warning" value="Pending">Pending</option>
                        <option className="text-danger" value="Overdue">Overdue</option>
                    </Form.Select>
                </Form.Group>
            </td>

            {/* Empty Cell for Placeholder */}
            <td></td>

            {/* Edit Button */}
            <td>
                <Button className="btn-warning" onClick={() => handleEdit(schedule)}>Edit</Button>
            </td>
        </tr>
    ))
) : (
    <tr>
        <td colSpan="7" className="text-center">No Schedules Available</td>
    </tr>
)}

              </tbody>
            </Table>
       
          <Button className='btn-success' onClick={(() => handleAddSubmission(schedules))}>Save</Button>
          </div>
          
        </div>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Schedule</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {editableData ? (
      <>
        <Form.Group controlId="courseCode">
          <Form.Label>Course Code</Form.Label>
          <Form.Control
            type="text"
            disabled
            value={editableData.courseCode}
            onChange={(e) => setEditableData({ ...editableData, courseCode: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mt-2" controlId="personnelNumber">
          <Form.Label>Personnel Number</Form.Label>
          <Form.Control
            type="text"
            disabled
            value={editableData.personnelNumber}
            onChange={(e) => setEditableData({ ...editableData, personnelNumber: e.target.value })}
          />
        </Form.Group>
        {/*<Form.Group controlId="personnelName">
                  <Form.Label>Personnel Name</Form.Label>
                  <Form.Control
                    type="text"
                    disabled
                    value={editableData.personnelName}
                    onChange={(e) => setEditableData({ ...editableData, personnelName: e.target.value })}
                  /></Form.Group>*/}
        <Form.Group className="mt-2" controlId="time">
          <Form.Label>Time</Form.Label>
          <Form.Control
            type="text"
            value={editableData.time}
            onChange={(e) => setEditableData({ ...editableData, time: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mt-2" controlId="day">
          <Form.Label>Day</Form.Label>
          <Form.Control
            type="text"
            value={editableData.created_at}
            onChange={(e) => setEditableData({ ...editableData, created_at: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mt-2" controlId="status">
          <Form.Label>Status</Form.Label>
          <Form.Control
            type="text"
            disabled
            value={editableData.submissionStatus}
            onChange={(e) => setEditableData({ ...editableData, submissionStatus: e.target.value })}
          />
        </Form.Group>
      </>
    ) : (
      <p>No data available</p>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseModal}>
      Close
    </Button>
    <Button variant="primary">
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>


    </section>
  );
}




