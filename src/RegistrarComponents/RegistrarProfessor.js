import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import ProgramModel from '../ReactModels/ProgramModel'; 
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import SectionModel from '../ReactModels/SectionModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import SubmissionModel from '../ReactModels/SubmissionModel';
import { UserContext } from '../Context/UserContext';
import DeadlineModel from '../ReactModels/DeadlineModel';
import '../App.css';

export default function RegistrarProfessor() {
  const { user } = useContext(UserContext);
  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('First');
  const [selectedSection, setSelectedSection] = useState('A'); // Default to Section A
  const [showModalAlertView, setShowModalAlertView] =useState(false);
  const [currentAcademicYear, setCurrentAcadYear] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [sections, setSections] = useState(['A']);
  const [schedules, setSchedules] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editableData, setEditableData] = useState(null);



  const handleCloseModal = () => {
    setShowModal(false)};
    

  const handleEdit = (rowData) => {
      setEditableData(rowData);
      setShowModal(true);
    };

  
    const closeShowModalAlertView = () => {
      setShowModalAlertView(false);
    }
    
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

        // Fetch all schedules
        const scheduleData = await ScheduleModel.fetchExistingschedule(selectedSection);

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

                            // Format the date as YYYY-MM-DD
                            const year = dateObj.getFullYear();  // Get full year (YYYY)
                            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');  // Get month (1-12) and pad to 2 digits
                            const day = dateObj.getDate().toString().padStart(2, '0');  // Get day (1-31) and pad to 2 digits
                            formattedDate = `${year}-${month}-${day}`;  // Format as YYYY-MM-DD

                            // Format the time as HH:MM
                            formattedTime = dateObj.toTimeString().slice(0, 5); // Extract HH:MM
                        }

                        // Return the schedule data, including matching submission details if found
                        return {
                            courseCode: schedule.courseCode,
                            personnelNumber: schedule.personnelNumber,
                            scheduleNumber: schedule.scheduleNumber,
                            date: formattedDate,  // Display formatted date in YYYY-MM-DD
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
                            date: null,
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

const fetchDeadline = async () => {
  try {
      // Map over your schedules to extract scheduleNumber
      const scheduleNumberDeadline = schedules.map((sched) => sched.scheduleNumber);
        
      // Log the array of schedule numbers to verify
      console.log('scheduleNumberDeadline:', scheduleNumberDeadline);

      // Ensure you are sending an array, not a single schedule number
      const deadlineData = await DeadlineModel.fetchDeadlinesBySchedule(scheduleNumberDeadline);
      console.log("Deadlines fetched:", deadlineData);
  } catch (error) {
      console.error("Error fetching deadline:", error);
  }
};


    
useEffect(()=> {
  fetchDeadline();
})  

const handleDateChange = (index, newDate) => {
  setSchedules((prevSchedules) => {
    const updatedSchedules = prevSchedules.map((schedule, i) => {
      if (i === index) {
        const updatedSchedule = { ...schedule, date: newDate };

        // Combine date and time to create `created_at`
        if (updatedSchedule.date && updatedSchedule.time) {
          updatedSchedule.created_at = `${updatedSchedule.date}T${updatedSchedule.time}`;
        }

        return updatedSchedule;
      }
      return schedule;
    });



    return updatedSchedules;
  });
};

const handleTimeChange = (index, newTime) => {
  setSchedules((prevSchedules) => {
    const updatedSchedules = prevSchedules.map((schedule, i) => {
      if (i === index) {
        const updatedSchedule = { ...schedule, time: newTime };

        // Combine date and time to create `created_at`
        if (updatedSchedule.date && updatedSchedule.time) {
          updatedSchedule.created_at = `${updatedSchedule.date}T${updatedSchedule.time}`;
        }

        return updatedSchedule;
      }
      return schedule;
    });

    console.log("Updated schedules:", updatedSchedules);

    return updatedSchedules;
  });
};




const handleStatusChange = (index, newStatus) => {
  setSchedules((prevSchedules) =>
    prevSchedules.map((schedule, i) =>
      i === index ? { ...schedule, submissionStatus: newStatus } : schedule
    )
  );
};

useEffect(() => {
}, [schedules]);


useEffect(() => {
  // Ensure all schedules have required fields
  setSchedules((prevSchedules) =>
    prevSchedules.map((schedule) => ({
      ...schedule,
      date: schedule.date || "", // Default to an empty string
      time: schedule.time || "",
      submissionStatus: schedule.submissionStatus || "Pending", // Default to "Pending"
    }))
  );
}, []);



const handleAddSubmission = async (scheduleData) => {
  

  // Ensure scheduleData is an array
  const submissionArray = Array.isArray(scheduleData) ? scheduleData : [scheduleData];

  // Validate and sanitize data
  const validSubmissions = submissionArray
    .filter(schedule => {
      const { created_at, scheduleNumber, submissionStatus } = schedule;
      if (!created_at || !scheduleNumber || !submissionStatus) {
        console.error('Missing required fields:', schedule);
        return false; // Exclude invalid entries
      }
      return true;
    })
    .map(schedule => {
      // Return only the required fields for each valid submission
      const { created_at, scheduleNumber, submissionStatus } = schedule;
      return { created_at, scheduleNumber, submissionStatus };
    });

  if (validSubmissions.length === 0) {
    console.error('No valid submissions to process.');
    return;
  }

  // Define a batch size for bulk insertions
  const BATCH_SIZE = 10; // Adjust batch size based on database capabilities

  try {
    for (let i = 0; i < validSubmissions.length; i += BATCH_SIZE) {
      const batch = validSubmissions.slice(i, i + BATCH_SIZE); // Create batches


      // Insert the current batch
      const response = await SubmissionModel.createAndInsertSubmission(batch);

      // Handle the API response for the batch
      if (response.success) {
        console.log(`Batch ${Math.ceil(i / BATCH_SIZE) + 1} added successfully:`, response.data);
      } else {
        console.error(`Batch ${Math.ceil(i / BATCH_SIZE) + 1} failed:`, response.message);
      }
    }

    console.log('All batches processed successfully.');
  } catch (error) {
    console.error('Error during bulk submission:', error);
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
      setShowModalAlertView(true);
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
    <section>
      <h2 className="custom-font custom-color-green-font my-3">Grade Submission Status</h2>
      <Form className="p-3 mb-4 bg-white border border-success rounded">
        <Row className="align-items-center">
          <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
            <Form.Group controlId="academicYear">
              <Form.Label className="custom-color-green-font custom-font">Academic Year</Form.Label>
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
          <Col  xs={12} sm={6} md={4} lg={2} className='mb-3'>
            <Form.Group controlId="program">
              <Form.Label className="custom-color-green-font custom-font">Program</Form.Label>
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
          <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
            <Form.Group controlId="yearLevel">
              <Form.Label className="custom-color-green-font custom-font">Year Level</Form.Label>
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
          <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
            <Form.Group controlId="semester">
              <Form.Label className="custom-color-green-font custom-font">Semester</Form.Label>
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
          <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
            <Form.Group controlId="section">
              <Form.Label className="custom-color-green-font custom-font">Section</Form.Label>
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
          <Col xs={12} sm={6} md={4} lg={2} className='mb-3'>
            <Form.Group controlId="viewButton">
              <Form.Label className="custom-color-green-font custom-font">Action</Form.Label>
                <Button className='btn btn-success w-100' onClick={handleView}>View</Button>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Table */}
  
      <div className="card mb-4 bg-white rounded p-3">
        <div className="card-body table-responsive">
          <Table bordered hover>
            <thead className='table-success text-center'>
              <tr>
                <th className="custom-color-green-font">Schedule Number</th>
                <th className="custom-color-green-font">Course</th>
                <th className="custom-color-green-font">Faculty</th>
                <th className="custom-color-green-font">Date</th>
                <th className="custom-color-green-font">Time</th>
                <th className="custom-color-green-font">Status</th>
                <th className="custom-color-green-font">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((schedule, index) => (
                  <tr key={index}>
                    <td>{schedule.scheduleNumber}</td>
                    <td>{schedule.courseCode}</td>
                    <td>{schedule.personnelNumber}</td>

                    {/* Date Input */}
                    <td>
                      <Form.Group className="mb-3" controlId={`date-${index}`}>
                        <Form.Control
                          type="date"
                          value={schedule.date || ""}
                          onChange={(e) => handleDateChange(index, e.target.value)}
                          className="w-100"
                        />
                      </Form.Group>
                    </td>

                    {/* Time Input */}
                    <td>
                      <Form.Group className="mb-3" controlId={`time-${index}`}>
                        <Form.Control
                          type="time"
                          value={schedule.time || ""}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="w-100"
                        />
                      </Form.Group>
                    </td>

                    {/* Submission Status Dropdown */}
                    <td>
                      <Form.Group className="mb-3" controlId={`status-${index}`}>
                        <Form.Select
                          aria-label="Submission Status"
                          value={schedule.submissionStatus || "Pending"}
                          onChange={(e) => handleStatusChange(index, e.target.value)}
                          className="w-100"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </Form.Select>
                      </Form.Group>
                    </td>
                    {/* Edit Button */}
                    <td>
                      <Button className="btn-warning w-100" onClick={() => handleEdit(schedule)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Schedules Available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <Button className='btn-success' onClick={() => handleAddSubmission(schedules)}>
            Save
          </Button>
        </div>

        <div className="card-body table-responsive">
          <Table bordered hover>
            <thead className='table-success text-center'>
              <tr>
                <th className="custom-color-green-font">Schedule Number</th>
                <th className="custom-color-green-font">Course</th>
                <th className="custom-color-green-font">Faculty</th>
                <th className="custom-color-green-font">Date</th>
                <th className="custom-color-green-font">Time</th>
                <th className="custom-color-green-font">Status</th>
                <th className="custom-color-green-font">Submitted On</th>
                <th className="custom-color-green-font">Actions</th>
              </tr>
            </thead>
            <tbody>
                  <tr>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>

                    {/* Date Input */}
                    <td>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="date"
                        
                          className="w-100"
                        />
                      </Form.Group>
                    </td>

                    {/* Time Input */}
                    <td>
                      <Form.Group className="mb-3" >
                        <Form.Control
                          type="time"
                          
                         
                          className="w-100"
                        />
                      </Form.Group>
                    </td>

                    {/* Submission Status Dropdown */}
                    <td>
                      <Form.Group className="mb-3">
                        <Form.Select
                          aria-label="Submission Status"
                          className="w-100"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </Form.Select>
                      </Form.Group>
                    </td>

                    <td></td>
                    {/* Edit Button */}
                    <td>
                      <Button className="btn-warning w-100" >
                        Edit
                      </Button>
                    </td>
                  </tr>
          
            </tbody>
          </Table>

          <Button className='btn-success' onClick={() => handleAddSubmission(schedules)}>
            Save
          </Button>
        </div>
      </div>


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
                  value={editableData.date}
                  onChange={(e) => setEditableData({ ...editableData, date: e.target.value })}
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

      <Modal show={showModalAlertView} onHide={closeShowModalAlertView} centered>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Please complete all filters (Academic Year, Program, Year Level, Semester, Section) to view schedules.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeShowModalAlertView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>


    </section>
  );
}




