import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
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
  const [deadlines, setDeadlines] = useState([]);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [formData, setFormData] = useState({});
    
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

                            // Format the time as HH:MM AM/PM
                            let hours = dateObj.getHours();
                            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            hours = hours % 12 || 12; // Convert to 12-hour format, 0 becomes 12
                            formattedTime = `${hours}:${minutes} ${ampm}`;
                        }

                        // Return the schedule data, including matching submission details if found
                        return {
                            courseCode: schedule.courseCode,
                            personnelNumber: schedule.personnelNumber,
                            scheduleNumber: schedule.scheduleNumber,
                            date: formattedDate,  // Display formatted date in YYYY-MM-DD
                            submissionStatus: matchingSubmission ? matchingSubmission.submissionStatus : null, // Include submissionStatus if match found
                            time: formattedTime, // Display formatted time with AM/PM
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

const fetchDeadline = async () => {
  try {
    // Fetch schedule data based on the selected section
    const scheduleData = await ScheduleModel.fetchExistingschedule(selectedSection);
    console.log('scheduleData deadline:', scheduleData);

    // Extract schedule numbers from fetched schedule data
    const scheduleNumberDeadline = scheduleData.map((sched) => sched.scheduleNumber);
    console.log('scheduleNumberDeadline:', scheduleNumberDeadline);
    
    // Fetch deadlines from the API using the fetched schedule numbers
    const deadlinesData = await DeadlineModel.fetchDeadlinesBySchedule(scheduleNumberDeadline);
    console.log("Deadlines fetched:", deadlinesData);
    setDeadlines(deadlinesData);
  } catch (error) {
    console.error("Error fetching deadline:", error);
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
  
  const handleView = () => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester && selectedSection) {
      fetchSchedules();
      fetchDeadline();
    } else {
      setShowModalAlertView(true);
    }
  };

  const handleEditDeadline = (index) => {
    setSelectedDeadline(deadlines[index]);
    setShowModal(true);
  };
  
  const handleSaveChanges = async () => {
    if (selectedDeadline) {
      try {
        // Update the specific deadline via the DeadlineModel
        const updateSelectedDeadline = await DeadlineModel.updateDeadlines(selectedDeadline);
  
        // Check if the update was successful
        if (updateSelectedDeadline) {
          // Update the `deadlines` state with the modified selectedDeadline
          setDeadlines((prevDeadlines) =>
            prevDeadlines.map((deadline) =>
              deadline.scheduleNumber === selectedDeadline.scheduleNumber
                ? selectedDeadline // Replace the old deadline with the updated one
                : deadline
            )
          );
        }
      } catch (error) {
        console.error("Error updating deadline:", error);
        // Optionally handle the error here (e.g., show a notification or alert)
      }
    }
  
    // Close the modal after saving the changes
    setShowModal(false);
  };
  
  const handleInputChange = (scheduleNumber, field, value) => {
    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [scheduleNumber]: {
          ...prev[scheduleNumber],
          [field]: value,
        },
      };
      console.log('Updated FormData:', updatedFormData);
      return updatedFormData;
    });
  };
  
  const handleSaveDeadlines = async (deadlinesToSave) => {
    // Check if any required field is missing
    const missingFields = deadlinesToSave.some((schedule) => {
      const rowData = formData[schedule.scheduleNumber];
      return (
        !rowData ||
        !rowData.startDate ||
        !rowData.startTime ||
        !rowData.endDate ||
        !rowData.endTime
      );
    });
  
    if (missingFields) {
      alert("Some fields are missing inputs. Please complete all required fields.");
      return; // Stop execution if any field is missing
    }
  
    // Check for duplicate scheduleNumbers in formData
    const scheduleNumbersInFormData = Object.keys(formData).map(Number); // Convert keys to numbers
    const duplicateSchedules = deadlinesToSave.filter((schedule) =>
      scheduleNumbersInFormData.includes(schedule.scheduleNumber)
    );
  
    if (duplicateSchedules.length > 0) {
      const duplicateNumbers = duplicateSchedules.map((d) => d.scheduleNumber).join(", ");
      alert(`Cannot save. The following schedule numbers already exist: ${duplicateNumbers}`);
      return; // Stop execution if duplicates are found
    }
  
    // Map through the deadlines to format the date-time
    const formattedDeadlines = deadlinesToSave.map((schedule) => {
      const rowData = formData[schedule.scheduleNumber];
      const started_at = `${rowData.startDate}T${rowData.startTime}:00Z`;
      const ended_at = `${rowData.endDate}T${rowData.endTime}:00Z`;
  
      return {
        scheduleNumber: schedule.scheduleNumber,
        started_at,
        ended_at,
      };
    });
  
    try {
      // Batch add the deadlines (assuming API can handle an array of deadlines)
      const response = await DeadlineModel.createAndInsertDeadline(formattedDeadlines);
  
      // Handle the response
      if (response.success) {
        console.log("Deadlines added successfully:", response.data);
        fetchDeadline();
      } else {
        alert(`Failed to add deadlines: ${response.message}`);
      }
    } catch (error) {
      alert("An error occurred while adding deadlines. Please try again.");
      console.error("Error adding deadlines:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false)};

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
            <Button className="w-100" variant="success" onClick={handleView}>
              View
            </Button>
          </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Table */}
  
      

        {schedules.length > 0 || deadlines.length > 0 ? (
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
                      {schedule.date}
                    </td>

                    {/* Time Input */}
                    <td>
                      {schedule.time}
                    </td>

                    {/* Submission Status Dropdown */}
                    <td>
                      {schedule.submissionStatus}
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
        </div>

        <div className="card-body table-responsive">
          <Table bordered hover>
            <thead className="table-primary text-center">
              <tr>
                <th className="custom-color-green-font">Schedule Number</th>
                <th className="custom-color-green-font">Start Date</th>
                <th className="custom-color-green-font">Start Time</th>
                <th className="custom-color-green-font">End Date</th>
                <th className="custom-color-green-font">End Time</th>
                <th className="custom-color-green-font">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.length > 0 ? (
                deadlines.map((deadline, index) => {
                  const startedAtDate = deadline.started_at?.split('T')[0] || '';
                  const endedAtDate = deadline.ended_at?.split('T')[0] || '';

                  const formatTimeToAMPM = (time) => {
                    if (!time) return '';
                    const [hour, minute] = time.split(':');
                    const hourInt = parseInt(hour, 10);
                    const isPM = hourInt >= 12;
                    const formattedHour = isPM ? (hourInt === 12 ? 12 : hourInt - 12) : hourInt || 12;
                    const suffix = isPM ? 'PM' : 'AM';
                    return `${formattedHour}:${minute} ${suffix}`;
                  };

                  const startedAtTime = formatTimeToAMPM(deadline.started_at?.split('T')[1]?.split('.')[0]);
                  const endedAtTime = formatTimeToAMPM(deadline.ended_at?.split('T')[1]?.split('.')[0]);

                  return (
                    <tr key={index}>
                      <td>{deadline.scheduleNumber}</td>
                      <td>{startedAtDate}</td>
                      <td>{startedAtTime}</td>
                      <td>{endedAtDate}</td>
                      <td>{endedAtTime}</td>
                      <td>
                        <Button variant="warning" onClick={() => handleEditDeadline(index)}>
                        <FontAwesomeIcon icon={faEdit} className='text-white'/>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <>
                  { schedules.length > 0 ? (
                  schedules.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.scheduleNumber}</td>
                      
                      {/* Start Date */}
                      <td>
                        <Form.Control
                          type="date"
                          value={formData[schedule.scheduleNumber]?.startDate || ''}
                          onChange={(e) =>
                            handleInputChange(schedule.scheduleNumber, 'startDate', e.target.value)
                          }
                          required
                        />
                      </td>
                      
                      {/* Start Time */}
                      <td>
                        <Form.Control
                          type="time"
                          value={formData[schedule.scheduleNumber]?.startTime || ''}
                          onChange={(e) =>
                            handleInputChange(schedule.scheduleNumber, 'startTime', e.target.value)
                          }
                          required
                        />
                      </td>
                      
                      {/* End Date */}
                      <td>
                        <Form.Control
                          type="date"
                          value={formData[schedule.scheduleNumber]?.endDate || ''}
                          onChange={(e) =>
                            handleInputChange(schedule.scheduleNumber, 'endDate', e.target.value)
                          }
                          required
                        />
                      </td>
                      
                      {/* End Time */}
                      <td>
                        <Form.Control
                          type="time"
                          value={formData[schedule.scheduleNumber]?.endTime || ''}
                          onChange={(e) =>
                            handleInputChange(schedule.scheduleNumber, 'endTime', e.target.value)
                          }
                          required
                        />
                      </td>
                      
                      {/* Save Button */}
                      <td>
                        <Button variant="warning" onClick={() => handleEditDeadline(index)} disabled>
                        <FontAwesomeIcon icon={faEdit} className='text-white'/> 
                          </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No schedules available
                    </td>
                  </tr>
                )}

          <Button className="btn-success mt-3" onClick={() => handleSaveDeadlines(schedules)}>
            Save All Deadlines
          </Button>
                </>   
              )}
            </tbody>
          </Table>
          
        </div>
          </div>
        ) : (
          <div className="text-center py-5 bg-white rounded pt-5 px-4 pb-5">
          <h5 className="custom-color-green-font mt-5 fs-5">No Data Available</h5>
          <p className="fs-6 mb-4">
            Please ensure that all filters are applied then click "View" to display the data.
          </p>
        </div>
        )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Deadlines</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDeadline ? (
            <div>
              {/* Schedule Number */}
              <Form.Group controlId="scheduleNumber">
                <Form.Label>Schedule Number</Form.Label>
                <Form.Control
                  type="text"
                  disabled
                  value={selectedDeadline.scheduleNumber}
                  onChange={(e) =>
                    setSelectedDeadline({
                      ...selectedDeadline,
                      scheduleNumber: e.target.value,
                    })
                  }
                />
              </Form.Group>

              {/* Started At */}
              <Form.Group className="mt-2" controlId="startedAtDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDeadline.started_at?.split('T')[0] || ''}
                  onChange={(e) =>
                    setSelectedDeadline({
                      ...selectedDeadline,
                      started_at: `${e.target.value}T${selectedDeadline.started_at?.split('T')[1] || '00:00:00'}`,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mt-2" controlId="startedAtTime">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={selectedDeadline.started_at?.split('T')[1]?.split('.')[0] || ''}
                  onChange={(e) =>
                    setSelectedDeadline({
                      ...selectedDeadline,
                      started_at: `${selectedDeadline.started_at?.split('T')[0] || ''}T${e.target.value}`,
                    })
                  }
                />
              </Form.Group>

              {/* Ended At */}
              <Form.Group className="mt-2" controlId="endedAtDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDeadline.ended_at?.split('T')[0] || ''}
                  onChange={(e) =>
                    setSelectedDeadline({
                      ...selectedDeadline,
                      ended_at: `${e.target.value}T${selectedDeadline.ended_at?.split('T')[1] || '00:00:00'}`,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mt-2" controlId="endedAtTime">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={selectedDeadline.ended_at?.split('T')[1]?.split('.')[0] || ''}
                  onChange={(e) =>
                    setSelectedDeadline({
                      ...selectedDeadline,
                      ended_at: `${selectedDeadline.ended_at?.split('T')[0] || ''}T${e.target.value}`,
                    })
                  }
                />
              </Form.Group>
            </div>
          ) : (
            <p>No deadline selected</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>;


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




