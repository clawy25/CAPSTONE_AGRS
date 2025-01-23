import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import ProgramModel from '../ReactModels/ProgramModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import TimelineModel from '../ReactModels/TimelineModel';
import CourseModel from '../ReactModels/CourseModel';
import StudentModel from '../ReactModels/StudentModel';
import SemGradeModel from '../ReactModels/SemGradeModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import '../App.css';
export default function HeadRegistrarAcademicYear() {
 
  const [loadingTransition, setLoadingTransition] = useState(false);
  const navigate = useNavigate();
  const [academicYears, setAcademicYears] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState([]);
  const [newAcademicYear, setNewAcademicYear] = useState({
    academicYear: '',
    isCurrent: false,
    finalizedPrograms: false
  });
  const [verify, setVerify] = useState({
    personnelNumber: '',
    password: '',
  });
  const [program, setPrograms] = useState([]);
  const [currentSemester, setCurrentSemester] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgramAddModal, setShowProgramAddModal] = useState(false);
  const [showProgramEditModal, setShowProgramEditModal] = useState(false);
  const [showAcademicYearConfirmationModal, setAcademicYearConfirmationModal] = useState(false);
  const [showNextSemesterConfirmationModal, setShowNextSemesterConfirmationModal] = useState(false);
  const [showFinalizeProgramConfirmationModal, setShowFinalizeProgramConfirmationModal] = useState(false);
  const [showProgramConfirmationModal, setProgramConfirmationModal] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  
  const [editAcademicYear, setEditAcademicYear] = useState({
    academicYear: '',
    isCurrent: false,
  });

  // State for new and edit program
  const [newProgram, setNewProgram] = useState({ name: '', years: '', levels: [] });
  const [editProgram, setEditProgram] = useState({ name: '', years: '', levels: [], programNumber: '' });

  // Fetch Academic Years
  const fetchAcademicYears = async () => {
    setLoading(true);
    try {
      const years = await AcademicYearModel.fetchExistingAcademicYears();
      const isCurrent = years.find(year => year.isCurrent === true);

      setCurrentAcademicYear(isCurrent);
      setAcademicYears(years);

      const check = await TimelineModel.fetchTimelineByAcademicYear(isCurrent.academicYear);

      // Find the highest semester value in the rows
      const highestSemester = check.reduce((max, row) => Math.max(max, row.semester), 0);
      // Set the current semester based on the highest value found
      setCurrentSemester(highestSemester || 1); // Default to 1 if no rows are present

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch All Programs
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const programs = await ProgramModel.fetchAllPrograms();
      setPrograms(programs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
    fetchPrograms();
  }, []);

  const getYearPrefix = (academicYear) => {
    const [startYear] = academicYear.split('-');
    return startYear.slice(-2) + (parseInt(startYear.slice(-2)) + 1).toString().padStart(2, '0');
  };

  const generateNewAcadYear = (academicYear) => {
    const yearParts = academicYear.split('-');
      
    const startYear = yearParts[0];
    const endYear = yearParts[1];

    return `${(parseInt(startYear) + 1).toString()}-${(parseInt(endYear) + 1).toString()}`;
  };

  const generateProgramNumber = (academicYear) => {
    const yearPrefix = getYearPrefix(academicYear); // e.g., "2425" for "2024-2025"

    const matchingProgramNumbers = program
        .map(p => p.programNumber.toString()) // Ensure programNumber is a string
        .filter(number => number.startsWith(yearPrefix)); // Filter based on the year prefix

    // Determine the next sequential number based on existing ones
    let nextNumber = 1;
    if (matchingProgramNumbers.length > 0) {
        // Extract the last two digits of the program number to get the sequential part
        const maxNumber = Math.max(...matchingProgramNumbers.map(number => parseInt(number.slice(-2))));
        nextNumber = maxNumber + 1;
    }

    // Construct the new program number, ensuring two digits for the sequential part
    return `${yearPrefix}${nextNumber.toString().padStart(2, '0')}`;
  };
  // Handlers for modals
  const handleShowAdd = () => setShowAddModal(true);

  const handleCloseAddAcadYear = () => {
    setAcademicYearConfirmationModal(false);
    setVerify({ personnelNumber: '', password: ''});
    setNewAcademicYear({ academicYear: '', isCurrent: false });
  };

  const handleCloseNextSem = () => {
    setShowNextSemesterConfirmationModal(false);
    setVerify({ personnelNumber: '', password: ''});
  };

  const handleShowEdit = (year) => {
    setEditAcademicYear(year);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditAcademicYear({ academicYear: '', isCurrent: false });
  };
  const handleShowProgramAdd = () => setShowProgramAddModal(true);
  const handleCloseProgramAdd = () => {
    fetchPrograms();
    setShowProgramAddModal(false);
    setVerify({ personnelNumber: '', password: ''});
    setNewProgram({ name: '', years: '', levels: [] });
  };

  const handleShowProgramEdit = (programName, programNumOfYear, summerlevels, programNumber) => {
    setEditProgram({
      name: programName,
      years: programNumOfYear,
      levels: summerlevels,
      programNumber: programNumber
    });
    setShowProgramEditModal(true);
  };

  const handleCloseProgramEdit = () => {
    fetchPrograms();
    setShowProgramEditModal(false);
    setVerify({ personnelNumber: '', password: ''});
    setEditProgram({ name: '', years: '', levels: [] , programNumber: ''});
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;

    if (showProgramAddModal) {
      setNewProgram((prevState) => ({ ...prevState, [name]: updatedValue }));
    } else if (showProgramEditModal) {
      setEditProgram((prevState) => {
        // If the "years" field is changed, reset the checkboxes
        if (name === "years") {
          return {
            ...prevState,
            [name]: updatedValue,
            levels: [] // Reset levels array to uncheck all checkboxes
          };
        }
        return { ...prevState, [name]: updatedValue };
      });
    }
  };

  const handleVerify = (e) => {
    const { name, value } = e.target;
    setVerify((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle year level checkboxes for program modals
  const handleYearLevelsChange = (e, programType) => {
    const { value, checked } = e.target;
    const programState = programType === 'new' ? newProgram : editProgram;
    
    // Parse the value to an integer since the checkboxes are using number values
    const level = parseInt(value, 10);
  
    // Update the levels array by either adding or removing the level
    const updatedLevels = checked
      ? [...programState.levels, level]
      : programState.levels.filter((levelItem) => levelItem !== level);
  
    // Update the state based on programType
    if (programType === 'new') {
      setNewProgram((prevState) => ({ ...prevState, levels: updatedLevels }));
    } else {
      setEditProgram((prevState) => ({ ...prevState, levels: updatedLevels }));
    }
  };
  

  // Add a new academic year
  const handleAddAcademicYear = async (action) => {
    try {
      const admin = await PersonnelModel.LoginPersonnelData(verify.personnelNumber, verify.password);

      if (admin && admin.personnelType === 'Admin'){

        const updateCurrent = {//Set the current to false as new acad year is inserted
          id: currentAcademicYear.id,
          academicYear: currentAcademicYear.academicYear,
          isCurrent: false,
          finalizedPrograms: currentAcademicYear.finalizedPrograms
        };

      //  console.log(updateCurrent.academicYear); //Old row
       // console.log(newAcademicYear); //New row

        //Fetch all movable rows of the old academicYear
        const [timelines, personnels, courses, programs, students, semGrades, enrollments] = await Promise.all([
          TimelineModel.fetchTimelineByAcademicYear(updateCurrent.academicYear),
          PersonnelModel.fetchAllPersonnel(updateCurrent.academicYear),
          CourseModel.fetchAllCourses().then(data => data.filter(row => row.academicYear === updateCurrent.academicYear)),
          ProgramModel.fetchAllPrograms().then(data => data.filter(row => row.academicYear === updateCurrent.academicYear)),
          StudentModel.fetchExistingStudents(),
          SemGradeModel.fetchAllSemGrades(updateCurrent.academicYear),
          EnrollmentModel.fetchAllEnrollment()
        ]);

        if(action ==='newAcad' && currentSemester === 3){

          //Get the list of enrolled students FETCH BOTH 2nd and 3rd sem
          const filteredTimelines = timelines.filter((enrollment) => 
            (enrollment.semester === 2 || 
             (enrollment.semester === 3 && enrollment.endEnroll === null)) &&
            enrollment.isLeaving === false
          );          

       //   console.log(filteredTimelines);

          const uniqueTimelines = Array.from(
            filteredTimelines.reduce((map, enrollment) => {
              const { studentNumber, semester } = enrollment;
          
              // If no entry for the student or the current semester is higher, update the map
              if (!map.has(studentNumber) || map.get(studentNumber).semester < semester) {
                map.set(studentNumber, enrollment);
              }
          
              return map;
            }, new Map()).values()
          );

         // console.log(uniqueTimelines);
          
                                                                  
          const studentNumbers = uniqueTimelines.map((enrollment) => enrollment.studentNumber);

          //Filter the object by the list
          const enrolledStudents = students.filter((student) =>
            studentNumbers.includes(student.studentNumber)
          );

          const filteredSemGrades = semGrades.filter((student) =>
            studentNumbers.includes(student.studentNumber)
          );

          const programRegex = /^([A-Za-z]+)(\d)(\d)(.)$/;

          const studentGrades = filteredSemGrades.reduce((student, record) => {
            const key = record.studentNumber; // Group by the `studentNumbers` column
            if (!student[key]) {
              student[key] = []; // Initialize an array for this student if it doesn't exist
            }

            const [course, , programData] = record.scheduleNumber.split('-');
            const match = programData.match(programRegex);

            student[key].push({
              class: record.scheduleNumber,
              course: course,
              grade: record.numEq,
              remarks: record.remarks,
              program: `${match[1]}`,
              yearLevel: parseInt(match[2]),
              semester: parseInt(match[3]),
              section: match[4]
            }); // Add the record to the appropriate student
            return student;
          }, {});

         // console.log("Student Grades: ",studentGrades);

          //FUNCTION FOR UPDATING RELATIVE ROWS IN RESPECT TO THEIR GRADE PERFORMANCE IN THE SEMESTER
          Object.entries(studentGrades).forEach(([studentNumber, student]) => {

            // 1. FOR UPDATING ROWS IN ENROLLMENT TABLE
            student.map((student) => {
              //Find the student in the enrollments for the selective update
              const studentEnrollment = enrollments.filter(record => record.studentNumber === studentNumber
                && record.scheduleNumber === student.class
                && record.courseCode === student.course);

              //console.log("Student's course details:", studentEnrollment);

              if (studentEnrollment && studentEnrollment.length > 0) {
                studentEnrollment.forEach(record => {
                  if (student.remarks === 'PASSED') {
                    record.status = 'Passed';
                  } else if (student.remarks === 'FAILED') {
                    record.status = 'Failed';
                  } else if (student.remarks === 'INC') {
                    record.status = 'Incomplete';
                  }
                });
              }

              //
            });


            // 2. FOR UPDATING ROWS IN STUDENT TABLE

            //Find the student in the enrolledStudents for the selective update
            const studentStatus = enrolledStudents.filter(student => student.studentNumber === studentNumber);
            //Finding a failed, incomplete, withdrawn course
            const failed = student.find(student => student.remarks !== 'PASSED');
            if (failed){
              studentStatus.forEach(record => {
                record.studentType = 'Irregular';
              });
            }

            //Calculating the GWA
            const totalGrades = student.reduce((total, record) => total + record.grade, 0);
            const averageGrade = totalGrades / student.length;
            
            if (averageGrade > 3) {
              if (studentStatus) {
                studentStatus.forEach(record => {
                  record.studentType = 'Irregular';
                });
              }
            }
          });

          // 3. FOR UPDATING OLD ROWS IN TIMELINE TABLE
          uniqueTimelines.forEach(item => {
            if(item.endEnroll === null){
              item.endEnroll = new Date();
            }
          });

          // 4. FOR CREATING NEW ROWS IN TIMELINE TABLE
          const newTimelines = uniqueTimelines.map(item => {
            // Create a new object to avoid mutating the original
            const duplicatedItem = { ...item };
          
            // Remove the id
            delete duplicatedItem.id;

            // Check if the row has semester 2 or 3
            if (duplicatedItem.semester === 2 || duplicatedItem.semester === 3) {
              duplicatedItem.semester = 1; // Start new academic year

              //Confirm if student is repeating or not
              if(duplicatedItem.isRepeating === false){
                duplicatedItem.yearLevel += 1;
              }
              const [startYear, endYear] = duplicatedItem.academicYear.split('-').map(Number);
              duplicatedItem.academicYear = `${startYear + 1}-${endYear + 1}`;
              
              // Reset dates for the new timeline
              duplicatedItem.startEnroll = new Date();
              duplicatedItem.endEnroll = null;
            }
            
            return duplicatedItem; // Return the new timeline
          });

          //5. FOR UPDATING ROWS ON THE PERSONNEL TABLE
          personnels.forEach(item => { //personnel table (yearly)
            delete item.programName
            delete item.id;
            const [startYear, endYear] = item.academicYear.split('-').map(Number);
            item.academicYear = `${startYear + 1}-${endYear + 1}`;
          });

          //6. FOR UPDATING ROWS IN PROGRAM TABLE
          programs.forEach(item => {
            delete item.id;
          
            // Increment academic year
            const [startYear, endYear] = item.academicYear.split('-').map(Number);
            item.academicYear = `${startYear + 1}-${endYear + 1}`;
          
            // Update programNumber based on startYear and endYear
            const start = `${startYear + 1}`.slice(-2);
            const end = `${endYear + 1}`.slice(-2);

            const prefix = `${String(startYear).slice(-2)}${String(endYear).slice(-2)}`;
            const newPrefix = `${start}${end}`;
          
            if (String(item.programNumber).startsWith(prefix)) {
              item.programNumber = parseInt(
                String(item.programNumber).replace(prefix, newPrefix),
                10
              );
            }
          });

          const updatedPrograms = programs.map(program => {
            return {
              programName: program.programName,
              programNumber: program.programNumber,
              noOfYears: program.programNumOfYear,
              yearLevelwithSummer: program.programYrLvlSummer,
              academicYear: program.academicYear
            };
          });
          

          // 7. FOR UPDATING ROWS IN COURSE TABLE
          courses.forEach(item => { //course table (yearly)
            delete item.id;
            const [startYear, endYear] = item.academicYear.split('-').map(Number);
            item.academicYear = `${startYear + 1}-${endYear + 1}`;
          });

          //UPDATED ROWS
         // console.log("Students: ",enrolledStudents);// student
        //  console.log("Old Timelines: ",uniqueTimelines);// timeline
        //  console.log("New Timelines:", newTimelines); //timeline
        //  console.log("Personnels: ",personnels);// personnel
        //  console.log("Courses: ",courses);// course 
         // console.log("Programs: ",updatedPrograms);// program 
        //  console.log("Enrollments: ",enrollments);// enrollment
        //  console.log("Old Acad Year", updateCurrent); //old acadYear
          //console.log("New Acad Year", newAcademicYear); //new acadYear

          //UPDATING THE RELEVANT ROWS FOR THIS SEM AND PROCEED TO THE NEXT
          try {
            const nextAcademicYear = await Promise.all([
              ...updatedPrograms.map(async (programData) => {
                return ProgramModel.createAndInsertProgram([programData]);
              }),
             // console.log('END OF DEBUGGING'),
              ...enrolledStudents.map(async (item) => {
                    const studentData = { ...item }; // Avoid mutating the original
                    delete studentData.id; // Removing ids without modifying the enrolledStudents
                    return StudentModel.updateStudent(studentData.studentNumber, studentData);
                }),
              TimelineModel.updateTimeline(uniqueTimelines),
              TimelineModel.createAndInsertTimeline(newTimelines),
              ...personnels.map(async (personnelData) => {
                return PersonnelModel.updatePersonnel(personnelData.personnelNumber, personnelData);
              }),
              ...courses.map(async (courseData) => {
                return CourseModel.createAndInsertCourse(courseData);
              }),
              EnrollmentModel.updateEnrollment(enrollments),
              AcademicYearModel.updateAcademicYear(updateCurrent.id, updateCurrent),
              AcademicYearModel.createAndInsertAcademicYear(newAcademicYear)
                

            ]);
        
            // If Promise.all resolves, this block will execute
           // console.log('All updates succeeded:', nextAcademicYear);
        
            if (nextAcademicYear.length > 0) {
              // Perform actions based on the resolved results
              fetchAcademicYears();
              //CLOSE MODAL
              handleCloseAddAcadYear();
              sessionStorage.clear();

              navigate('/'); // Redirect to login

            }
          } catch (error) {
            // If any Promise fails, this block will execute
            console.error('Error updating for the next semester:', error);
          }
        } else if (action === 'newSem' && currentSemester !== 3){
          //Get the list of enrolled students
          const filteredTimelines = timelines.filter((enrollment) => enrollment.semester === currentSemester
                                                                  && enrollment.endEnroll === null 
                                                                  && enrollment.isLeaving === false);
                                                                  
          const studentNumbers = filteredTimelines.map((enrollment) => enrollment.studentNumber);
          //console.log(studentNumbers);

          //Filter the object by the list
          const enrolledStudents = students.filter((student) =>
            studentNumbers.includes(student.studentNumber)
          );

          const filteredSemGrades = semGrades.filter((student) =>
            studentNumbers.includes(student.studentNumber)
          );

          const programRegex = /^([A-Za-z]+)(\d)(\d)(.)$/;

          const studentGrades = filteredSemGrades.reduce((student, record) => {
            const key = record.studentNumber; // Group by the `studentNumbers` column
            if (!student[key]) {
              student[key] = []; // Initialize an array for this student if it doesn't exist
            }

            const [course, , programData] = record.scheduleNumber.split('-');
            const match = programData.match(programRegex);

            student[key].push({
              class: record.scheduleNumber,
              course: course,
              grade: record.numEq,
              remarks: record.remarks,
              program: `${match[1]}`,
              yearLevel: parseInt(match[2]),
              semester: parseInt(match[3]),
              section: match[4]
            }); // Add the record to the appropriate student
            return student;
          }, {});

         // console.log("Student Grades: ",studentGrades);

          //FUNCTION FOR UPDATING RELATIVE ROWS IN RESPECT TO THEIR GRADE PERFORMANCE IN THE SEMESTER
          Object.entries(studentGrades).forEach(([studentNumber, student]) => {

            // 1. FOR UPDATING ROWS IN ENROLLMENT TABLE
            student.map((student) => {
              //Find the student in the enrollments for the selective update
              const studentEnrollment = enrollments.filter(record => record.studentNumber === studentNumber
                && record.scheduleNumber === student.class
                && record.courseCode === student.course);

             // console.log("Student's course details:", studentEnrollment);

              if (studentEnrollment && studentEnrollment.length > 0) {
                studentEnrollment.forEach(record => {
                  if (student.remarks === 'PASSED') {
                    record.status = 'Passed';
                  } else if (student.remarks === 'FAILED') {
                    record.status = 'Failed';
                  } else if (student.remarks === 'INC') {
                    record.status = 'Incomplete';
                  }
                });
              }

              //
            });


            // 2. FOR UPDATING ROWS IN STUDENT TABLE

            //Find the student in the enrolledStudents for the selective update
            const studentStatus = enrolledStudents.filter(student => student.studentNumber === studentNumber);
            //Finding a failed, incomplete, withdrawn course
            const failed = student.find(student => student.remarks !== 'PASSED');
            if (failed){
              studentStatus.forEach(record => {
                record.studentType = 'Irregular';
              });
            }

            //Calculating the GWA
            const totalGrades = student.reduce((total, record) => total + record.grade, 0);
            const averageGrade = totalGrades / student.length;
            
            if (averageGrade > 3) {
              if (studentStatus) {
                studentStatus.forEach(record => {
                  record.studentType = 'Irregular';
                });
              }
            }
          });

          //Setting all old timeline rows' endEnroll to now
          filteredTimelines.forEach(item => {
            item.endEnroll = new Date();
          });

          //Creating a duplicate for each timeline row and remove id
          const newTimelines = filteredTimelines.map(item => {
            // Create a new object to avoid mutating the original
            const duplicatedItem = { ...item };
          
            // Remove the id
            delete duplicatedItem.id;
          
            // Reset dates for the new timeline
            duplicatedItem.startEnroll = new Date();
            duplicatedItem.endEnroll = null;

            
            duplicatedItem.semester += 1; // Increment semester

            //RESERVE FOR THE NEXT ACADYEAR
            // // Increment the semester; reset if it exceeds the max semester
            // if (duplicatedItem.semester === 2) {
            //     duplicatedItem.semester = 1; // Start new academic year
            //     const [startYear, endYear] = duplicatedItem.academicYear.split('-').map(Number);
            //     duplicatedItem.academicYear = `${startYear + 1}-${endYear + 1}`;
            // } else {

            // }
          
            return duplicatedItem; // Return the new timeline
          });

          //UPDATED ROWS
          //console.log(newTimelines); //insert New timelines
          //console.log(filteredTimelines); //update Old timelines
          //console.log(enrollments); //Update Old enrollments
          //console.log(enrolledStudents);// Update students

          //UPDATING THE RELEVANT ROWS FOR THIS SEM AND PROCEED TO THE NEXT
          /*try {
            const nextSemester = await Promise.all([
                ...enrolledStudents.map(async (item) => {
                    const studentData = { ...item }; // Avoid mutating the original
                    delete studentData.id; // Removing ids without modifying the enrolledStudents
                    return StudentModel.updateStudent(studentData.studentNumber, studentData);
                }),
                EnrollmentModel.updateEnrollment(enrollments),
                TimelineModel.updateTimeline(filteredTimelines),
                TimelineModel.createAndInsertTimeline(newTimelines)
            ]);
        
            // If Promise.all resolves, this block will execute
            console.log('All updates succeeded:', nextSemester);
        
            if (nextSemester.length > 0) {
              // Perform actions based on the resolved results
              console.log('Next semester updates completed.');

              //Fetch the newest timeline to up date the currentSemester
              fetchAcademicYears();
              
              //CLOSE MODAL
              handleCloseNextSem();

            }
          } catch (error) {
            // If any Promise fails, this block will execute
            console.error('Error updating for the next semester:', error);
          }*/
        }
      }
    } catch (error) {
      console.error('Error adding academic year:', error);
    }
  };

  // Adding program closes the modal
  const handleAddProgram = async (name, years, summerlevels) => {
    
    const admin = await PersonnelModel.LoginPersonnelData(verify.personnelNumber, verify.password);

    if (admin && admin.personnelType === 'Admin'){
      const programNumber = generateProgramNumber(selectedAcademicYear);
    
      const lastProgram = program.reduce((max, p) => (p.id > max ? p.id : max), 0);
      let newId = lastProgram + 1;  // Increment the highest id found

      const newProgramsData = (summerlevels.length > 0 ? summerlevels : [null]).map((level) => ({
        id: newId++,
        programName: name,
        programNumber: programNumber,
        noOfYears: years,
        yearLevelwithSummer: level,
        academicYear: selectedAcademicYear
      }));

      //console.log(newProgramsData);

      try {

        const response = await ProgramModel.createAndInsertProgram(newProgramsData);
    
        if (!response) {
          throw new Error('No response from server');
        }
    
      } catch (error) {
        console.error(error);
      }
    }
    handleCloseProgramAdd();
  };
  

  // Editing program closes the modal
  const handleEditProgram = async (name, years, summerlevels, programNumber) => {

    const admin = await PersonnelModel.LoginPersonnelData(verify.personnelNumber, verify.password);

    if (admin && admin.personnelType === 'Admin'){
      if (summerlevels.some(level => level !== null)) {
        summerlevels = summerlevels.filter(level => level !== null);
      } else if (summerlevels.length === 0) {
        summerlevels = [null];
      }
  
      const academicYear = selectedAcademicYear;
      
      if(programNumber){
        try {
          const response = await ProgramModel.deletePrograms(programNumber, academicYear);
      
          if (!response) {
            throw new Error('No response from server');
          }
      
        } catch (error) {
          console.error(error);
        }
  
        const lastProgram = program.reduce((max, p) => (p.id > max ? p.id : max), 0);
        let newId = lastProgram + 1;  // Increment the highest id found
        const newProgramsData = (summerlevels.length > 0 ? summerlevels : [null]).map((level) => ({
          id: newId++,
          programName: name,
          programNumber: programNumber,
          noOfYears: years,
          yearLevelwithSummer: level,
          academicYear: selectedAcademicYear
        }));
  
       // console.log(newProgramsData);
        try {
          const response = await ProgramModel.createAndInsertProgram(newProgramsData);
      
          if (!response) {
            throw new Error('No response from server');
          }
        } catch (error) {
          console.error(error);
        }
      };
    }
    handleCloseProgramEdit();
  };

  const handleAcademicYearChange = (e) => {
    const value = e.target.value;
    if (value === 'addNew') {
      setAcademicYearConfirmationModal(true);
      setNewAcademicYear({ academicYear: generateNewAcadYear(currentAcademicYear.academicYear), isCurrent: true });
    } else if (value === 'nextSem') {
      setShowNextSemesterConfirmationModal(true);
    } else {
      setSelectedAcademicYear(value);
    }
  };

  const handleShowFinalize = () => setShowFinalizeProgramConfirmationModal(true);
  const handleCloseFinalize = () => {
    setShowFinalizeProgramConfirmationModal(false);
    setVerify({ personnelNumber: '', password: ''});
  };

  const handleFinalizePrograms = async () => {
    
    const updateCurrent = {//Set the current to false as new acad year is inserted
      id: currentAcademicYear.id,
      academicYear: currentAcademicYear.academicYear,
      isCurrent: currentAcademicYear.isCurrent,
      finalizedPrograms: true
    };
    const update = await AcademicYearModel.updateAcademicYear(updateCurrent.id, updateCurrent);
    if(update){
      fetchAcademicYears();
      handleCloseFinalize();
    }

  };

  // Render loading and error messages
  if (loading) return (    <div className="text-center py-5 bg-white">
    <Spinner animation="border" variant="success" role='status' />
    <p className="mt-3">Loading data, please wait...</p>
</div>);
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  const renderYearLevelCheckboxes = (programType) => {
    const program = programType === 'new' ? newProgram : editProgram;
    const years = parseInt(program.years, 10) || 0;
  
    return (
      <Form.Group className="mb-3">
        <Form.Label>Select Year Levels with Summer</Form.Label>
        {Array.from({ length: years }, (_, i) => (
          <Form.Check
            key={i}
            type="checkbox"
            label={`Year ${i + 1}`}
            value={i + 1}
            checked={program.levels.includes(i + 1)} // Check if the current year level is in program.levels
            onChange={(e) => handleYearLevelsChange(e, programType)} // Call the function on change
          />
        ))}
      </Form.Group>
    );
  };
  
  const renderProgramsTable = () => (
    <Table bordered hover className="mt-2">
      <thead className='table-success'>
        <tr>
          <th className="custom-font custom-color-green-font mb-3 mt-2">Programs</th>
          <th className='custom-color-green-font custom-font'>Number of Years</th>
          <th className='custom-color-green-font custom-font'>Year Levels with Summer</th>
          <th className='custom-color-green-font custom-font'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {program
          .filter((program) => program.academicYear === selectedAcademicYear) // Filter by selected academic year
          .reduce((acc, currProgram) => {
          // Find an existing entry for the same programName, programNumber, and academicYear
          const existingProgram = acc.find(
            (entry) =>
              entry.programName === currProgram.programName &&
              entry.programNumber === currProgram.programNumber &&
              entry.programNumOfYear === currProgram.programNumOfYear
          );

        if (existingProgram) { 
          // If found, add the summerlevel (if it's not already in the list)
          if (!existingProgram.summerlevels.includes(currProgram.programYrLvlSummer)) {
            existingProgram.summerlevels.push(currProgram.programYrLvlSummer);
          }
        } else {
          // If not found, create a new entry
          acc.push({
            programName: currProgram.programName,
            programNumber: currProgram.programNumber,
            programNumOfYear: currProgram.programNumOfYear,
            summerlevels: [currProgram.programYrLvlSummer],
          });
      }

      return acc;
    }, []) // Initialize the accumulator as an empty array
    .map((program) => (
      <tr key={program.programNumber}>
        <td>{program.programName}</td>
        <td>{program.programNumOfYear}</td>
        <td>
            {program.summerlevels.length > 0
              ? program.summerlevels
            .sort((a, b) => a - b) // Sort the summer levels numerically (if they're numbers)
            .join(', ') // Join the sorted summer levels with commas
            : 'No summer levels available'}
        </td>
        <td>
        {selectedAcademicYear === academicYears.find(year => year.isCurrent)?.academicYear && (
          <>
          <Button variant="success" onClick={() => handleShowProgramEdit(program.programName, program.programNumOfYear, program.summerlevels, program.programNumber)} disabled={currentAcademicYear.finalizedPrograms === true}>Edit</Button>
          </>
        )}
        </td>
      </tr>
    ))}
      </tbody>

    </Table>
  );

  const getSemesterText = (sem) => {
    switch (sem) {
      case 1:
        return "First Semester";
      case 2:
        return "Second Semester";
      case 3:
        return "Summer Semester";
      default:
        return `${sem}`;
    }
  };

  return (
<>
<div class="mt-4 mx-auto alert alert-warning text-center px-auto" role="alert">
    <span className='fw-bold fs-6'>Note: </span> The academic year page allows users to create a new academic year and transition to the next semester or academic year. This functionality ensures accurate tracking of academic periods and facilitates efficient planning and organization.
</div>

<div className='container-fluid bg-white p-4 rounded mt-3'>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <h3 className="custom-color-green-font custom-font">Programs</h3>
          <h4 className="custom-color-green-font custom-font">{getSemesterText(currentSemester)}</h4>
        </div>
        <Row className="g-3 align-items-center">
  <Col xs={12} md={6}>
    <Form.Group className="align-items-center w-100">
      {/*<Form.Label className='custom-color-green-font custom-font'>Select Academic Year</Form.Label>*/}
      <Form.Select 
        className="p-2 mt-2" 
        value={selectedAcademicYear} 
        onChange={handleAcademicYearChange}
      >
        <option value="">Select Academic Year</option>
        {academicYears
          .sort((a, b) => {
            let yearA = parseInt(a.academicYear.split('-')[0]);
            let yearB = parseInt(b.academicYear.split('-')[0]);
            return yearB - yearA; // Switch for ASC to DESC order
          })
          .map((year) => (
            <option key={year.id} value={year.academicYear}>
              {year.academicYear}
            </option>
          ))
        }
      </Form.Select>
    </Form.Group>
  </Col>
  
  <Col xs={12} md={6}>
    <div className='w-100 d-flex justify-content-md-end justify-content-center'>
    <Button 
      variant="success" 
      className="mt-2 mb-1 me-md-3 me-2 w-50" 
      value="nextSem" 
      onClick={handleAcademicYearChange} 
      disabled={currentSemester === 3}
    >
      Proceed to Next Semester
    </Button>
    <Button 
      variant="success" 
      className="mt-2 me-md-3 mb-1 w-50" 
      value="addNew" 
      onClick={handleAcademicYearChange} 
      disabled={currentSemester !== 3}
    >
      Proceed to Next Academic Year
    </Button>
    </div>
  </Col>
</Row>

    {renderProgramsTable()}
    {selectedAcademicYear === academicYears.find(year => year.isCurrent)?.academicYear && (
      <>
      <Button variant="success" className="mt-3" onClick={handleShowProgramAdd} disabled={currentAcademicYear.finalizedPrograms === true}>
        Add Program
      </Button>

      <Button variant="success" className="mt-3 ms-3" onClick={handleShowFinalize} disabled={currentAcademicYear.finalizedPrograms === true}>
        Finalize
      </Button>
      </>
    )}

      {/* Modals for Academic Year */}
      {/*<Modal show={showAddModal} onHide={handleCloseAddAcadYear}>
        <Modal.Header closeButton>
          <Modal.Title>Add Academic Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Academic Year</Form.Label>
              <Form.Control
                type="text"
                name="academicYear"
                value={newAcademicYear.academicYear}
                onChange={handleInputChange}
                placeholder="Enter Academic Year"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isCurrent"
                label="Is Current Year"
                checked={newAcademicYear.isCurrent}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddAcadYear}>Close</Button>
          <Button variant="primary" onClick={handleAddAcademicYear}>Add Academic Year</Button>
        </Modal.Footer>
      </Modal>*/}

      {/*<Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Academic Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Academic Year</Form.Label>
              <Form.Control
                type="text"
                name="academicYear"
                value={editAcademicYear.academicYear}
                onChange={handleInputChange}
                placeholder="Enter Academic Year"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isCurrent"
                label="Is Current Year"
                checked={editAcademicYear.isCurrent}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>Close</Button>
          <Button variant="primary" onClick={handleEditAcademicYear}>Save Changes</Button>
        </Modal.Footer>
      </Modal>*/}

      {/* Modals for Program */}
      <Modal show={showProgramAddModal} onHide={handleCloseProgramAdd} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add Program</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <p className="fs-6 fw-semibold text-justify">
          Are you sure you want to add a new program?
        </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Program Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newProgram.name}
                onChange={handleInputChange}
                placeholder="Enter Program Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Number of Years</Form.Label>
              <Form.Control
                type="text"
                name="years"
                value={newProgram.years}
                onChange={handleInputChange}
                placeholder="(0-9)"
                maxLength={1}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                    e.preventDefault(); // Prevent any non-numeric character
                  }
                }}
              />
            </Form.Group>
            {renderYearLevelCheckboxes('new', null)}

            <i><p>This action requires verification. To proceed, please provide your details to authorize this action.</p></i>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control
                type="text"
                name="personnelNumber"
                placeholder="Personnel Number"
                value={verify.personnelNumber}
                onChange={handleVerify}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={verify.password}
                onChange={handleVerify}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='border-success bg-white custom-color-green-font' onClick={handleCloseProgramAdd}>Close</Button>
          <Button variant="success" onClick={() => handleAddProgram(newProgram.name, newProgram.years, newProgram.levels)}>Add Program</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProgramEditModal} onHide={handleCloseProgramEdit} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Program</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Program Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editProgram.name}
                onChange={handleInputChange}
                placeholder="Enter Program Name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Number of Years</Form.Label>
              <Form.Control
                type="text"
                name="years"
                value={editProgram.years}
                onChange={handleInputChange}
                placeholder="(0-9)"
                maxLength={1}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                    e.preventDefault(); // Prevent any non-numeric character
                  }
                }}
              />
            </Form.Group>
            {renderYearLevelCheckboxes('edit', editProgram.levels)}

            <i><p>This action requires verification. To proceed, please provide your details to authorize this action.</p></i>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control
                type="text"
                name="personnelNumber"
                placeholder="Personnel Number"
                value={verify.personnelNumber}
                onChange={handleVerify}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={verify.password}
                onChange={handleVerify}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='border-success bg-white custom-color-green-font' onClick={handleCloseProgramEdit}>Close</Button>
          <Button variant="success" onClick={() => handleEditProgram (editProgram.name, editProgram.years, editProgram.levels, editProgram.programNumber)}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/*ADD ACADEMIC YEAR CONFIRMATION */}
      <Modal show={showAcademicYearConfirmationModal} size="lg" onHide={handleCloseAddAcadYear} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title className="custom-color-green-font">Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fs-6 fw-semibold text-justify">
            Are you sure you want to proceed the entire system to a new academic year?
          </p>
          <p>
            The system will proceed from <strong>{currentAcademicYear?.academicYear}</strong> to{' '}
          <strong>{newAcademicYear?.academicYear}</strong>. WARNING! THIS ACTION IS IRREVERSIBLE!
          </p>
          <p><i>This action requires verification. To proceed, please provide your details to authorize this action. <u>You will be
            forced to log out of the system upon confirmation</u></i></p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Personnel Number</Form.Label>
            <Form.Control
              type="text"
              name="personnelNumber"
              placeholder="Personnel Number"
              value={verify.personnelNumber}
              onChange={handleVerify}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Personnel Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={verify.password}
              onChange={handleVerify}
            />
          </Form.Group>
        </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="border-success bg-white custom-color-green-font" variant="secondary" onClick={handleCloseAddAcadYear}>
            Close
          </Button>
          <Button variant="success" onClick={() => handleAddAcademicYear('newAcad')}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* NEXT SEMESTER CONFIRMATION */}
      <Modal show={showNextSemesterConfirmationModal} size="lg" onHide={handleCloseNextSem} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title className="custom-color-green-font">Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fs-6 fw-semibold text-justify">
            Are you sure you want to proceed the entire system from <strong>{getSemesterText(currentSemester)}</strong> to <strong>{getSemesterText(currentSemester + 1)}</strong>?
          </p>
          <p>
            The academic year <strong>{currentAcademicYear?.academicYear}</strong> will{' '}
          proceed to the next semester. WARNING! THIS ACTION IS IRREVERSIBLE!
          </p>
          <p><i>This action requires verification. To proceed, please provide your details to authorize this action.</i></p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Personnel Number</Form.Label>
            <Form.Control
              type="text"
              name="personnelNumber"
              placeholder="Personnel Number"
              value={verify.personnelNumber}
              onChange={handleVerify}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Personnel Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={verify.password}
              onChange={handleVerify}
            />
          </Form.Group>
        </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="border-success bg-white custom-color-green-font" variant="secondary" onClick={handleCloseNextSem}>
            Close
          </Button>
          <Button variant="success" onClick={() => handleAddAcademicYear('newSem')}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* FINALIZE PROGRAM CONFIRMATION */}
      <Modal show={showFinalizeProgramConfirmationModal} size="lg" onHide={handleCloseFinalize} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title className="custom-color-green-font">Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fs-6 fw-semibold text-justify">
            Are you sure you want to finalize the list of programs for <strong>{currentAcademicYear?.academicYear}</strong>?
          </p>
          <p>
            WARNING! THIS ACTION IS IRREVERSIBLE! Upon confirmation, you are <strong>not allowed to make changes</strong> of it until the next academic year
          </p>
          <p><i>This action requires verification. To proceed, please provide your details to authorize this action.</i></p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Personnel Number</Form.Label>
            <Form.Control
              type="text"
              name="personnelNumber"
              placeholder="Personnel Number"
              value={verify.personnelNumber}
              onChange={handleVerify}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Personnel Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={verify.password}
              onChange={handleVerify}
            />
          </Form.Group>
        </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="border-success bg-white custom-color-green-font" variant="secondary" onClick={handleCloseFinalize}>
            Close
          </Button>
          <Button variant="success" onClick={handleFinalizePrograms}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>


       {/*ADD PROGRAM CONFIRMATION */}
      {/*<Modal show={showProgramConfirmationModal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title className='custom-color-green-font'>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
      
           <p className='fs-6 fw-semibold text-justify'>Personnel details have been verified. To proceed with adding a program in the academic year, please provide your password to confirm your authorization for this action.</p>
       
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Personnel Number"
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name of the personnel"
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Personnel Password</Form.Label>
              <Form.Control
                type="password"
                 placeholder="Password"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='border-success bg-white custom-color-green-font'>Close</Button>
          <Button variant="success">Confirm</Button>
        </Modal.Footer>
      </Modal>*/}
    </div>
</>

  );
}
