import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMinus, faMapMarkerAlt,  faEnvelope, faPhoneAlt } from '@fortawesome/free-solid-svg-icons'; // Import minus icon
import '../StudentComponents/Dashboard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // Import menu icon
import { Dropdown } from 'react-bootstrap';
import SubmissionModel from '../ReactModels/SubmissionModel.js';
import GradeModel from '../ReactModels/GradeModel.js';
import AttendanceModel from '../ReactModels/AttendanceModel.js';
import QuizModel from '../ReactModels/QuizModel.js';
import PBAModel from '../ReactModels/PBAModel.js';
import ExamModel from '../ReactModels/ExamModel.js';
import ComponentModel from '../ReactModels/ComponentModel.js';
import SemGradeModel from '../ReactModels/SemGradeModel.js';
import AcademicYearModel from '../ReactModels/AcademicYearModel.js';
import TimelineModel from '../ReactModels/TimelineModel.js';
import { Modal, Button, Container } from 'react-bootstrap';
import * as XLSX from 'xlsx';



const ClassDetails = ({classList , classDetails}) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(classList);

  console.log("List of Students:", students);
  const [classInfo, setClassInfo] = useState(classDetails[0]);
  console.log("Class Details:", classInfo);
  console.log(classInfo.semester);
  console.log(classInfo.academicYear);
  

  const [currentAcademicYear, setCurrentAcademicYear] = useState();
  const [currentSemester, setCurrentSemester] = useState();
  const [classGradeData, setClassGradeData] = useState([]);
  const [attendanceLabelData, setAttendanceLabelData] = useState([]);
  const [quizMaxData, setQuizMaxData] = useState([]);
  const [pbaLabelData, setPbaLabelData] = useState([]);
  const [examMaxData, setExamMaxData] = useState([]);
  const [componentWeightData, setComponentWeightData] = useState([]);

  const [pendingStatus, setPending] = useState(false);
  const [semestralGrades, setSemestralGrades] = useState([]);
  //console.log(semestralGrades);

  const [midtermComponentWeights , setMidtermComponentWeights] = useState([]);
  const [finalsComponentWeights , setFinalsComponentWeights] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const studentNumbers = students.map(student => student.studentNumber);
    
  // Initialize an empty array for grade that corresponds to the student numbers
  const gradeArray = new Array(studentNumbers.length).fill(null);

  studentNumbers.forEach((student, index) => {
    gradeArray[index] = {
        studentNumber: student,
        score: undefined
    };
  });

  /** 
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  let devtoolsOpen = false;

  const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 200;
      const heightThreshold = window.outerHeight - window.innerHeight > 200;
  
      if (widthThreshold || heightThreshold) {
          if (!devtoolsOpen) {
              devtoolsOpen = true;
              alert("DevTools is open! Please close it to continue.");
          }
      } else {
          devtoolsOpen = false;
      }
  };
  
  setInterval(checkDevTools, 500);
  document.addEventListener("keydown", (event) => {
    if (
        event.key === "F12" || 
        (event.ctrlKey && event.shiftKey && event.key === "I") || 
        (event.ctrlKey && event.key === "U")
    ) {
        event.preventDefault();
        alert("Developer tools access is disabled.");
    }
});
(function() {
  const originalConsoleLog = console.log;
  console.log = function(...args) {
      if (args.includes("DevTools")) {
          throw new Error("Access to console is restricted.");
      }
      originalConsoleLog(...args);
  };
})();

*/
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const fetchAcademicYears = async () => {
      try {
        const years = await AcademicYearModel.fetchExistingAcademicYears();
        const isCurrent = years.find(year => year.isCurrent === true);
        setCurrentAcademicYear(isCurrent);
        const check = await TimelineModel.fetchTimelineByAcademicYear(isCurrent.academicYear);
  
        const highestSemester = check.reduce((max, row) => Math.max(max, row.semester), 0);
        console.log(isCurrent);
        console.log(highestSemester);
        // Set the current semester based on the highest value found
        setCurrentSemester(highestSemester || 1); // Default to 1 if no rows are present
  
      } catch (err) {
        console.error(err);
      }
  };


  useEffect(() => {
    students.sort((a, b) => {
      const lastNameComparison = a.studentLastName.localeCompare(b.studentLastName);
      if (lastNameComparison !== 0) return lastNameComparison; // If last names are different, sort by last name
      return a.studentFirstName.localeCompare(b.studentFirstName); // If last names are the same, sort by first name
    });
    
    // 2️⃣ Add an incremental ID starting from 0
    const studentsWithIds = students.map((student, index) => ({
      id: index, // Add an ID starting from 0
      ...student // Spread the original student data
    }));
    //console.log("Class List: ",studentsWithIds);
    setStudents(studentsWithIds);

    if (students && classInfo){
      
      fetchAcademicYears();
      handleFetchGrades();
    }
  }, []);

  

  const handleModalShow = (action) => {
    setModalMessage(`Grades ${action} successfully!`);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleFetchGrades = async () => {
    try {
      const myClass = classInfo.scheduleNumber;
      const isSubmitted = await SubmissionModel.fetchSubmissionBySchedule(myClass);

      if (!isSubmitted || isSubmitted.length === 0){// Not yet saved or submitted (EDITABLE)
        setPending(false);
      } else if (isSubmitted && isSubmitted[0]?.submissionStatus === 'Pending'){ //Submitted but not verified (UNEDITABLE)
        setPending(true);
      } else if (isSubmitted && isSubmitted[0]?.submissionStatus === 'Verified'){ //Verified (UNEDITABLE)
        setPending(true);
      };

      const grade = await GradeModel.fetchGradeData(myClass);
      const attendanceDates = await AttendanceModel.fetchAttendanceData(myClass);
      const quizMax = await QuizModel.fetchQuizData(myClass);
      const pbaLabels = await PBAModel.fetchPBAData(myClass);
      const examMax = await ExamModel.fetchExamData(myClass);
      const componentWeights = await ComponentModel.fetchComponentData(myClass);

      const midtermAttendanceDates = attendanceDates.filter(item => item.period === 1); // Midterm (Period 1)
      const finalAttendanceDates = attendanceDates.filter(item => item.period === 2); // Finals (Period 2)

      const midtermQuizMax = quizMax.filter(item => item.period === 1);
      const finalQuizMax = quizMax.filter(item => item.period === 2);

      const midtermPbaLabels = pbaLabels.filter(item => item.period === 1);
      const finalPbaLabels = pbaLabels.filter(item => item.period === 2);

      const midtermExamMax = examMax.filter(item => item.period === 1);
      const finalExamMax = examMax.filter(item => item.period === 2);

      const midtermComponents = componentWeights.filter(item => item.period === 1);
      const finalComponents = componentWeights.filter(item => item.period === 2);

      //console.log(midtermComponents);
      //console.log(finalComponents);

      const studentNumbers = students.map(student => student.studentNumber);

      console.log(studentNumbers);
      // Component names corresponding to component numbers
      const componentNames = {
        1: 'Attendance',
        2: 'Assignment',
        3: 'QuizSeat',
        4: 'Recitation',
        5: 'PBA',
        6: 'Exam'
      };
  
      // Group the grades by period and component name
      const groupedGrades = grade.reduce((acc, item) => {
        const { period, componentNumber } = item;
  
        // Rename period 1 to 'midterm' and period 2 to 'finals'
        const periodName = period === 1 ? 'midterm' : 'finals';
  
        // Ensure the period key exists in the accumulator
        if (!acc[periodName]) {
          acc[periodName] = {
            Attendance: [],
            Assignment: [],
            QuizSeat: [],
            Recitation: [],
            PBA: [],
            Exam: []
          };
        }
  
        // Get the component name based on the componentNumber
        const componentName = componentNames[componentNumber];
  
        // Push the grade into the corresponding component for the period
        if (componentName) {
          acc[periodName][componentName].push(item);
        }
  
        return acc;
      }, {});
  
      //console.log('Grouped Grades:', groupedGrades);

      if(groupedGrades){
        //INITIALIZING THE FETCHED RECORDS FOR DATABASE RIGHT AWAY
        setmidtermAttendance(groupedGrades.midterm?.Attendance);
        setmidtermAttendanceLabels(midtermAttendanceDates);

        setfinalAttendance(groupedGrades.finals?.Attendance);
        setfinalAttendanceLabels(finalAttendanceDates);

        setmidtermAssignment(groupedGrades.midterm?.Assignment);
        setfinalAssignment(groupedGrades.finals?.Assignment);

        setmidtermQuiz(groupedGrades.midterm?.QuizSeat);
        setmidtermQuizMax(midtermQuizMax);

        setfinalQuiz(groupedGrades.finals?.QuizSeat);
        setfinalQuizMax(finalQuizMax);

        setmidtermRecitation(groupedGrades.midterm?.Recitation);
        setfinalRecitation(groupedGrades.finals?.Recitation);

        setmidtermPBA(groupedGrades.midterm?.PBA);
        setmidtermPBALabels(midtermPbaLabels);

        setfinalPBA(groupedGrades.finals?.PBA);
        setfinalPBALabels(finalPbaLabels);

        setmidtermExam(groupedGrades.midterm?.Exam);
        setmidtermExamMax(midtermExamMax);

        setfinalExam(groupedGrades.finals?.Exam);
        setfinalExamMax(finalExamMax);

        setMidtermComponentWeights(midtermComponents);
        setFinalsComponentWeights(finalComponents);

        setmidtermAttendancePercentage(midtermComponents?.find(row => row.componentNumber === 1)?.weight);
        setmidtermAssignmentPercentage(midtermComponents?.find(row => row.componentNumber === 2)?.weight);
        setmidtermQuizPercentage(midtermComponents?.find(row => row.componentNumber === 3)?.weight);
        setmidtermRecitationPercentage(midtermComponents?.find(row => row.componentNumber === 4)?.weight);
        setmidtermPBAGradePercentage(midtermComponents?.find(row => row.componentNumber === 5)?.weight);
        setMidtermExamPercentage(midtermComponents?.find(row => row.componentNumber === 6)?.weight);

        setfinalsAttendancePercentage(finalComponents?.find(row => row.componentNumber === 1)?.weight);
        setfinalsAssignmentPercentage(finalComponents?.find(row => row.componentNumber === 2)?.weight);
        setfinalsQuizPercentage(finalComponents?.find(row => row.componentNumber === 3)?.weight);
        setfinalsRecitationPercentage(finalComponents?.find(row => row.componentNumber === 4)?.weight);
        setfinalsPBAGradePercentage(finalComponents?.find(row => row.componentNumber === 5)?.weight);
        setfinalsExamPercentage(finalComponents?.find(row => row.componentNumber === 6)?.weight)

        //TRANSFORMING ATTENDANCE RECORDS FOR RENDERING IN TABLE
        const ToMidtermAttendanceColumns = transformAttendanceData(
          groupedGrades.midterm?.Attendance ? groupedGrades.midterm.Attendance : [],
          midtermAttendanceDates ? midtermAttendanceDates : []
        );

        const ToFinalAttendanceColumns = transformAttendanceData(
          groupedGrades.finals?.Attendance ? groupedGrades.finals.Attendance : [],
          finalAttendanceDates ? finalAttendanceDates : []
        );

        const ToMidtermAssignmentColumns = transfromComponentData(
          groupedGrades.midterm?.Assignment ? groupedGrades.midterm.Assignment : []
        );

        const ToFinalAssignmentColumns = transfromComponentData(
          groupedGrades.finals?.Assignment ? groupedGrades.finals.Assignment : []
        );

        const ToMidtermQuizColumns = transformQuizData(
          groupedGrades.midterm?.QuizSeat ? groupedGrades.midterm.QuizSeat : [],
          midtermQuizMax ? midtermQuizMax : []
        );

        const ToFinalQuizColumns = transformQuizData(
          groupedGrades.finals?.QuizSeat ? groupedGrades.finals.QuizSeat : [],
          finalQuizMax ? finalQuizMax : []
        );

        const ToMidtermRecitationColumns = transfromComponentData(
          groupedGrades.midterm?.Recitation ? groupedGrades.midterm.Recitation : []
        );

        const ToFinalRecitationColumns = transfromComponentData(
          groupedGrades.finals?.Recitation ? groupedGrades.finals.Recitation : []
        );

        const ToMidtermPBAColumns = transformPbaData(
          groupedGrades.midterm?.PBA ? groupedGrades.midterm.PBA : [],
          midtermPbaLabels ? midtermPbaLabels : []
        );

        const ToFinalPBAColumns = transformPbaData(
          groupedGrades.finals?.PBA ? groupedGrades.finals.PBA : [],
          finalPbaLabels ? finalPbaLabels : []
        );
        
        const ToMidtermExamColumns = transformQuizData(
          groupedGrades.midterm?.Exam ? groupedGrades.midterm.Exam : [],
          midtermExamMax ? midtermExamMax : []
        );

        const ToFinalExamColumns = transformQuizData(
          groupedGrades.finals?.Exam ? groupedGrades.finals.Exam : [],
          finalExamMax ? finalExamMax : []
        );

        if(ToMidtermAttendanceColumns[0]?.grade){// Initializing midtermAttendanceColumns and midtermAttendanceData
          
          ToMidtermAttendanceColumns.sort((a, b) => a.id - b.id);
          
          ToMidtermAttendanceColumns.forEach(column => { // Iterate over each row
            const attendanceArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              attendanceArray[index] = {
                studentNumber: student,
                status: "Select" // Default status
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                attendanceArray[index] = {
                  studentNumber: student.studentNumber,
                  status: student.status
                };
              }
            });
            
            column.grade = attendanceArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setmidtermAttendanceColumns(ToMidtermAttendanceColumns); //Initialize midtermAttendanceColumns
  
          const initialData = ToMidtermAttendanceColumns.reduce((acc, column, dateIndex) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex][dateIndex] = { 
                date: column.date, 
                status: entry.status 
              };
            });
            return acc;
          }, {});
          setmidtermAttendanceData(initialData);//Initialize midtermAttendanceData
        }
  
        if(ToFinalAttendanceColumns[0]?.grade){// Initializing finalsAttendanceColumns and finalsAttendanceData
          
          ToFinalAttendanceColumns.sort((a, b) => a.id - b.id);

          ToFinalAttendanceColumns.forEach(column => { // Iterate over each row
            const attendanceArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              attendanceArray[index] = {
                studentNumber: student,
                status: "Select" // Default status
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                attendanceArray[index] = {
                  studentNumber: student.studentNumber,
                  status: student.status
                };
              }
            });
            
            column.grade = attendanceArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setfinalsAttendanceColumns(ToFinalAttendanceColumns); //Initialize midtermAttendanceColumns
  
          const initialData = ToFinalAttendanceColumns.reduce((acc, column, dateIndex) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex][dateIndex] = { 
                date: column.date, 
                status: entry.status 
              };
            });
            return acc;
          }, {});
          setfinalsAttendanceData(initialData);//Initialize midtermAttendanceData
        }

        if(ToMidtermAssignmentColumns[0]?.grade){// Initializing midtermAssignmentColumns and midtermAssignmentScores
          
          ToMidtermAssignmentColumns.sort((a, b) => a.id - b.id);

          ToMidtermAssignmentColumns.forEach(column => { // Iterate over each row
            const assignmentArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              assignmentArray[index] = {
                studentNumber: student,
                score: undefined // Default
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                assignmentArray[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
                };
              }
            });
            
            column.grade = assignmentArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setmidtermAssignmentColumns(ToMidtermAssignmentColumns); //Initialize midtermAssignmentColumns
  
          const initialData = ToMidtermAssignmentColumns.reduce((acc, column, index) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex][index] = entry.score;
            });
            return acc;
          }, {});
          //console.log(initialData);
          setmidtermAssignmentScores(initialData);//Initialize midtermAssignmentScores
        }

        if(ToFinalAssignmentColumns[0]?.grade){// Initializing finalsAssignmentColumns and finalsAssignmentScores
          
          ToFinalAssignmentColumns.sort((a, b) => a.id - b.id);

          ToFinalAssignmentColumns.forEach(column => { // Iterate over each row
            const assignmentArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              assignmentArray[index] = {
                studentNumber: student,
                score: undefined // Default
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                assignmentArray[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
                };
              }
            });
            
            column.grade = assignmentArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setfinalsAssignmentColumns(ToFinalAssignmentColumns); //Initialize finalsAssignmentColumns
  
          const initialData = ToFinalAssignmentColumns.reduce((acc, column, index) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex][index] = entry.score;
            });
            return acc;
          }, {});
          //console.log(initialData);
          setfinalsAssignmentScores(initialData);//Initialize finalsAssignmentScores
        }

        if(ToMidtermQuizColumns[0]?.grade){// Initializing midtermQuizColumns, midtermQuizScores and midtermQuizMaxScores
          
          ToMidtermQuizColumns.sort((a, b) => a.id - b.id);

          ToMidtermQuizColumns.forEach(column => { // Iterate over each row
            const quizArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              quizArray[index] = {
                studentNumber: student,
                score: undefined // Default
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                quizArray[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
                };
              }
            });
            
            column.grade = quizArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });
          
          setmidtermQuizColumns(ToMidtermQuizColumns); //Initialize midtermQuizColumns
  
          const initialData = ToMidtermQuizColumns.reduce((acc, column) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex].push(entry.score); // Add the score for the current quiz
            });
            return acc;
          }, []);
          // Initialize midtermQuizScores with the transformed data
          setmidtermQuizScores(initialData);

          
          midtermQuizMax.sort((a, b) => a.instanceNumber - b.instanceNumber);
          const maxQuizScores = midtermQuizMax.map(quiz => quiz.maxScore);
          setmidtermQuizMaxScores(maxQuizScores);

        }

        if(ToFinalQuizColumns[0]?.grade){// Initializing finalsQuizColumns, finalsQuizScores and finalQuizMaxScores
          
          ToFinalQuizColumns.sort((a, b) => a.id - b.id);

          ToFinalQuizColumns.forEach(column => { // Iterate over each row
            const quizArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              quizArray[index] = {
                studentNumber: student,
                score: undefined // Default
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                quizArray[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
                };
              }
            });
            
            column.grade = quizArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setfinalsQuizColumns(ToFinalQuizColumns); //Initialize finalsQuizColumns
  
          const initialData = ToFinalQuizColumns.reduce((acc, column) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex].push(entry.score); // Add the score for the current quiz
            });
            return acc;
          }, []);
          // Initialize midtermQuizScores with the transformed data
          setfinalsQuizScores(initialData);

          finalQuizMax.sort((a, b) => a.instanceNumber - b.instanceNumber);
          const maxQuizScores = finalQuizMax.map(quiz => quiz.maxScore);
          setfinalsQuizMaxScores(maxQuizScores);

        }

        if(ToMidtermRecitationColumns[0]?.grade){// Initializing midtermRecitationColumns and midtermRecitationScores
          
          ToMidtermRecitationColumns.sort((a, b) => a.id - b.id);

          ToMidtermRecitationColumns.forEach(column => { // Iterate over each row
            const recitationArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              recitationArray[index] = {
                studentNumber: student,
                score: undefined // Default
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                recitationArray[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
                };
              }
            });
            
            column.grade = recitationArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setmidtermRecitationColumns(ToMidtermRecitationColumns); //Initialize midtermRecitationColumns
  
          const initialData = ToMidtermRecitationColumns.reduce((acc, column, index) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex][index] = entry.score;
            });
            return acc;
          }, {});
          //console.log(initialData);
          setmidtermRecitationScores(initialData);//Initialize midtermRecitationScores
        }

        if(ToFinalRecitationColumns[0]?.grade){// Initializing finalsRecitationColumns and finalsRecitationScores
          
          ToFinalRecitationColumns.sort((a, b) => a.id - b.id);

          ToFinalRecitationColumns.forEach(column => { // Iterate over each row
            const recitationArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              recitationArray[index] = {
                studentNumber: student,
                score: undefined // Default
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                recitationArray[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
                };
              }
            });
            
            column.grade = recitationArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setfinalsRecitationColumns(ToFinalRecitationColumns); //Initialize finalsRecitationColumns
  
          const initialData = ToFinalRecitationColumns.reduce((acc, column, index) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex][index] = entry.score;
            });
            return acc;
          }, {});
          //console.log(initialData);
          setfinalsRecitationScores(initialData);//Initialize finalsRecitationScores
        }

        if(ToMidtermPBAColumns[0]?.grade){// Initializing midtermPBAColumns and midtermPBAGradeScores
          
          ToMidtermPBAColumns.sort((a, b) => a.id - b.id); //Sorting by instanceNumber (id)

          ToMidtermPBAColumns.forEach(column => { // Iterate over each row
            const pbaArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              pbaArray[index] = {
                studentNumber: student,
                score: undefined // Default
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                pbaArray[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
                };
              }
            });
            
            column.grade = pbaArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setmidtermPBAColumns(ToMidtermPBAColumns); //Initialize midtermPBAColumns
  
          const initialData = ToMidtermPBAColumns.reduce((acc, column, pbaIndex) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex][pbaIndex] = entry.score;
            });
            return acc;
          }, {});
          setmidtermPBAGradeScores(initialData);//Initialize midtermPBAGradeScores
        }

        if(ToFinalPBAColumns[0]?.grade){// Initializing finalsPBAColumns and finalsPBAGradeScores

          ToFinalPBAColumns.sort((a, b) => a.id - b.id); //Sorting by instanceNumber (id)
          
          ToFinalPBAColumns.forEach(column => { // Iterate over each row
            const pbaArray = new Array(studentNumbers.length).fill(null);
          
            studentNumbers.forEach((student, index) => {
              pbaArray[index] = {
                studentNumber: student,
                score: undefined // Default
              };
            });
          
            column.grade.forEach(student => {
              const index = studentNumbers.indexOf(student.studentNumber);
              if (index !== -1) {
                pbaArray[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
                };
              }
            });
            
            column.grade = pbaArray; // updating the entire column
          
            // Sorting them to match the indexes from student ClassList
            column.grade.sort((a, b) => {
              return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
            });
          });

          setfinalsPBAColumns(ToFinalPBAColumns); //Initialize finalsPBAColumns
  
          const initialData = ToFinalPBAColumns.reduce((acc, column, pbaIndex) => {
            column.grade.forEach((entry, studentIndex) => {
              if (!acc[studentIndex]) acc[studentIndex] = []; // Ensure each student has their own array
              acc[studentIndex][pbaIndex] = entry.score;
            });
            return acc;
          }, {});
          setfinalsPBAGradeScores(initialData);//Initialize finalsPBAGradeScores
        }

        if(ToMidtermExamColumns[0]?.grade){// Initializing midtermExamScores and midtermTotalItems
          
          ToMidtermExamColumns.sort((a, b) => a.id - b.id);

          //Sorting them to match the indexes from student ClassList
          ToMidtermExamColumns[0].grade.sort((a, b) => {
            return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
          });
          
          const initialData = {};

          studentNumbers.forEach((student, index) => {
            initialData[index] = {
                studentNumber: student,
                score: undefined // Default score
            };
          });

          ToMidtermExamColumns[0].grade.forEach(student => {
            const index = studentNumbers.indexOf(student.studentNumber);
            if (index !== -1) {
              initialData[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
              };
            }
          });
          
          setMidtermExamScores(initialData);
          
          const maxExamScore = midtermExamMax[0].maxScore;
          setmidtermTotalItems(maxExamScore);

        }

        if(ToFinalExamColumns[0]?.grade){// Initializing finalsExamScores and finalsTotalItems
          
          ToFinalExamColumns.sort((a, b) => a.id - b.id);

          //Sorting them to match the indexes from student ClassList
          ToFinalExamColumns[0].grade.sort((a, b) => {
            return studentNumbers.indexOf(a.studentNumber) - studentNumbers.indexOf(b.studentNumber);
          });

          const initialData = {};

          studentNumbers.forEach((student, index) => {
            initialData[index] = {
                studentNumber: student,
                score: undefined // Default score
            };
          });

          ToFinalExamColumns[0].grade.forEach(student => {
            const index = studentNumbers.indexOf(student.studentNumber);
            if (index !== -1) {
              initialData[index] = {
                  studentNumber: student.studentNumber,
                  score: student.score
              };
            }
          });
          
          setfinalsExamScores(initialData);
          
          const maxExamScore = finalExamMax[0].maxScore;
          setfinalsTotalItems(maxExamScore);

        }
      }
    } catch (error) {
      console.error("Error fetching class records:", error);
    }
  };
  const transformAttendanceData = (groupedAttendance, attendanceDates) => {
    // Step 1: Group attendance by instanceNumber
    const attendanceByInstance = groupedAttendance.reduce((acc, item) => {
      const { instanceNumber, studentNumber, value } = item;
      if (!acc[instanceNumber]) acc[instanceNumber] = [];
      acc[instanceNumber].push({ studentNumber, status: value });
      return acc;
    }, {});
  
    // Step 2: Match with attendanceDates and structure the final output
    const result = attendanceDates.map((date) => {
      const { id, attendanceLabel, instanceNumber } = date;
  
      // Get the student attendance for this instanceNumber
      const studentGrades = attendanceByInstance[instanceNumber] || [];
  
      return {
        id: instanceNumber,
        date: new Date(attendanceLabel).toLocaleDateString('en-CA'), // convert date to ISO format
        grade: studentGrades
      };
    });
  
    return result;
  };

  const transfromComponentData = (componentData) => { //FOR ASSIGNMENT & RECITATION
    const groupedData = componentData.reduce((acc, item) => {
      const instanceId = item.instanceNumber; // Use instanceNumber as the group id
      if (!acc[instanceId]) {
          acc[instanceId] = {
              id: instanceId, // Use instanceNumber as the id
              grade: []
          };
      }
      acc[instanceId].grade.push({
          studentNumber: item.studentNumber,
          score: parseInt(item.value) // Convert value to a number
      });
      return acc;
  }, {});
  
  // Convert the grouped object into an array and sort each grade list by studentNumber
  const transformedData = Object.values(groupedData).map(group => ({
      id: group.id,
      grade: group.grade.sort((a, b) => a.studentNumber.localeCompare(b.studentNumber))
  }));

  return transformedData;
  };

  const transformQuizData = (groupedQuiz, quizMax) => {
    // Step 1: Group quiz by instanceNumber
    const quizByInstance = groupedQuiz.reduce((acc, item) => {
      const { instanceNumber, studentNumber, value } = item;
      if (!acc[instanceNumber]) acc[instanceNumber] = [];
      acc[instanceNumber].push({ studentNumber, score: parseInt(value) });
      return acc;
    }, {});
  
    // Step 2: Structure the final output
    const result = quizMax.map((quiz) => {
      const { instanceNumber, maxScore } = quiz;

      // Get the student grades for this instanceNumber
      const studentGrades = quizByInstance[instanceNumber] || [];

      return {
        id: instanceNumber, // Use the id from quizMax
        max: maxScore, // Use the maxScore from quizMax
        grade: studentGrades
      };
  });

  return result;
  };

  const transformPbaData = (groupedPba, pbaLabels) => {//ISSUE, NOT SORTED BY INSTANCE NUMBER
    // Step 1: Group attendance by instanceNumber
    const pbaByInstance = groupedPba.reduce((acc, item) => {

      const instanceId = item.instanceNumber
      const { instanceNumber, studentNumber, value } = item;
      if (!acc[instanceNumber]) acc[instanceNumber] = [];
      acc[instanceNumber].push({ studentNumber, score: parseInt(value) });
      return acc;
    }, {});
  
    // Step 2: Match with pbaLabels and structure the final output
    const result = pbaLabels.map((date) => {
      const { pbaLabel, instanceNumber } = date;
  
      // Get the student attendance for this instanceNumber
      const studentGrades = pbaByInstance[instanceNumber] || [];
  
      return {
        id: instanceNumber, //Set to instanceNumber frome PBAbyInstance
        label: String(pbaLabel), // convert date to ISO format
        grade: studentGrades
      };
    });
  
    return result;
  };
  
  const handleSubmit = async () => {
    try{
      //For bulk inserting grades in db
      const semesterGradeData = [];
      const allGrades = students.map((student, studentIndex) => {
        const midtermCSGrade = calculateTotalMidtermCSGrade(studentIndex);
        const midtermPBAGrade = calculateTotalsAndPBA(midtermPBAGradeScores[studentIndex], midtermPBAGradePercentage).pbaGrade;
        const midtermExamGrade = calculateMidtermWeightedScore(calculateMidtermPercentage(midtermExamScores[student.id]?.score));
        const midtermGrade = calculateMidtermGrade(studentIndex);

        const finalCSGrade = calculateTotalFinalsCSGrade(studentIndex);
        const finalPBAGrade = calculateTotalsAndPBA(finalsPBAGradeScores[studentIndex], finalsPBAGradePercentage).pbaGrade;
        const finalExamGrade = calculateFinalWeightedScore(calculateFinalPercentage(finalsExamScores[student.id]?.score));
        const finalGrade = calculateFinalsGrade(studentIndex);

        const semestralGrade = calculateSemestralGrade( //Semestral Grade
          calculateMidtermGrade(studentIndex), 
          calculateFinalsGrade(studentIndex)
        );
    
        const { numEq , remarks } = getSemestralNumericalEquivalentAndRemarks(
          student.id,
          semestralGrade,
          MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
        );
    
        return { 
          student: student.studentNumber,
          midtermCS: midtermCSGrade,
          midtermPBA: midtermPBAGrade,
          midtermExam: midtermExamGrade,
          midtermGrade: midtermGrade,
          finalCS: finalCSGrade,
          finalPBA: finalPBAGrade,
          finalExam: finalExamGrade,
          finalGrade: finalGrade,
          semGrade: semestralGrade,
          numEq,
          remarks
        };
      });
      console.log(allGrades);

      allGrades.forEach((student) => {
        semesterGradeData.push({
          scheduleNumber: classInfo.scheduleNumber,
          studentNumber: student.student,
          midtermCS: parseFloat(student.midtermCS) || null,
          midtermPBA: parseFloat(student.midtermPBA) || null,
          midtermExam: parseFloat(student.midtermExam) || null,
          midtermGrade: parseFloat(student.midtermGrade) || null,
          finalCS: parseFloat(student.finalCS) || null,
          finalPBA: parseFloat(student.finalPBA) || null,
          finalExam: parseFloat(student.finalExam) || null,
          finalGrade: parseFloat(student.finalGrade) || null,
          semGrade: parseFloat(student.semGrade) || null,
          numEq: parseFloat(student.numEq) || null,
          remarks: student.remarks || null,
          academicYear: classInfo.academicYear || null
        });
      });

      
      console.log(semesterGradeData);

      const verifyAll = semesterGradeData.find(row => 
        row.midtermCS === null || 
        row.midtermPBA === null || 
        row.midtermExam === null || 
        row.midtermGrade === null || 
        row.finalCS === null || 
        row.finalPBA === null || 
        row.finalExam === null || 
        row.finalGrade === null || 
        row.semGrade === null || 
        row.numEq === null || 
        row.remarks === null ||
        row.academicYear === null
      );
      

      if (verifyAll) {
        toast.error("Cannot submit as there is at least one student with no grade!");
        console.log(verifyAll);
        return;
      } else {
        //Save the changes first
        const saveState = await handleSave('submit');
        console.log(semesterGradeData);

        const semgrades = await SemGradeModel.updateSemGradeData(semesterGradeData);

        // For Submission Status
        const submissionData = {
          scheduleNumber: classInfo.scheduleNumber,
          submissionStatus: 'Pending'
        };
        const submission = await SubmissionModel.createAndInsertSubmission(submissionData);

        if (submission && saveState && semgrades){
          handleModalShow('submitted');
          const isSubmitted = await SubmissionModel.fetchSubmissionBySchedule(classInfo.scheduleNumber);
          if (isSubmitted && isSubmitted[0]?.submissionStatus === 'Pending'){
            setPending(true);
          };
        }
      }
    } catch (error){
      console.error("Error submitting class record:", error);
    }
  };

  const handleSave = async (action) => {
    try{
      const [grade, attendance, quiz, pba, exam, weight] = await Promise.all([
        GradeModel.updateGradeData(classGradeData),
        AttendanceModel.updateAttendanceData(attendanceLabelData),
        QuizModel.updateQuizData(quizMaxData),
        PBAModel.updatePBAData(pbaLabelData),
        ExamModel.updateExamData(examMaxData),
        ComponentModel.updateComponentData(componentWeightData)
      ]);

      if (grade && attendance && quiz && pba && exam && weight){
        if (action === 'save'){
          handleModalShow('saved');
        }
        return true;
      } else {
        return false;
      }
    } catch (error){
      console.error("Error submitting class record:", error);
    }
  };

  const handlePost = () => {
    // Your post logic here
    handleModalShow('posted');
  };

  // Import function
const handleImport = () => {
  // Logic for importing files
  console.log('Import action triggered');
  // Example: Show a file upload dialog
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv, .xlsx'; // Adjust formats as needed
  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      //console.log('File selected:', file.name);
      // Add your file processing logic here
    }
  };
  fileInput.click();
};

const handleExport = () => {
  //console.log('Export action triggered');
  
  // Find the current table based on `selectedPeriod`
  const table = document.querySelector('.details-table'); // Ensure this matches your table's class

  if (table) {
    // Convert the table to a worksheet
    const worksheet = XLSX.utils.table_to_sheet(table);

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Export the workbook to Excel
    XLSX.writeFile(workbook, `${selectedPeriod}_data.xlsx`);
  } else {
    console.error('Table not found');
  }
};

const handlePrint = () => {
  //console.log('Print action triggered');

  // Find the current table based on `selectedPeriod`
  const table = document.querySelector('.details-table'); // Ensure this matches your table's class

  if (table) {
    // Clone the table to avoid manipulation of the DOM
    const clonedTable = table.cloneNode(true);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Write the content with styles and header
    printWindow.document.write('<html><head><title>Print Table</title>');
    printWindow.document.write(`
      <style>
        @media print {
          @page { size: landscape; margin: 0.5in; }
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; table-layout: auto; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: center; }
          td { background-color: white; }
          th { background-color: #4CAF50; color: white; }
          thead { display: table-header-group; }
          tbody { display: table-row-group; }
          tr { page-break-inside: avoid; }
          .header-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          .logo {
            height: 80px;
            margin-right: 20px;
          }
          .text {
            text-align: left;
          }
          .city, .college {
            color: green;
          }
          .college {
            font-size: 29px;
            font-weight: bold;
          }
          .vertical-line {
            border-left: 2px solid green;
            height: 80px;
            margin-left: 20px;
            margin-right: 20px;
          }
          .additional-text {
            margin-left: 20px;
          }
          .additional-line {
            color: green;
          }
          .separator {
            border: 0;
            border-top: 2px solid green;
            width: 80%;
            margin: 20px auto;
          }
          .centered-text {
            text-align: center;
          }
        }
      </style>
    `);
    printWindow.document.write('</head><body>');

    // Add the header content
    printWindow.document.write(`
    <div class="header-container">
      <img src="/pcc.png" alt="PCC Logo" class="logo">
      <div class="text">
        <div class="city">PARANAQUE CITY</div>
        <div class="college">COLLEGE</div>
      </div>
      <div class="vertical-line"></div> <!-- Vertical Line -->
      <div class="additional-text">
        <!-- Address with single icon -->
        <div class="additional-line address-container">
          <span class="icon"><i class="fas fa-map-marker-alt"></i></span> <!-- Font Awesome location icon -->
          <div class="address-text">
            <div>Coastal Rd., cor. Victor Medina Street,</div>
            <div>San Dionisio, Paranaque City, Philippines</div>
          </div>
        </div>
        <!-- Email with mail icon -->
        <div class="additional-line">
          <span class="icon"><i class="fas fa-envelope"></i></span>info@paranaquecitycollege.edu.ph <!-- Font Awesome mail icon -->
        </div>
        <!-- Phone with phone icon -->
        <div class="additional-line">
          <span class="icon"><i class="fas fa-phone-alt"></i></span>(02)85343321 <!-- Font Awesome phone icon -->
        </div>
      </div>
      <img src="/pcc.png" alt="PCC Logo" class="second-logo"> <!-- Second PCC logo with added margin -->
    </div>
    <hr class="separator"> <!-- Horizontal Line -->
    
      <div class="centered-text">
        <h2>ACADEMIC AFFAIRS</h2>
        <h3>Institue</h3>
        <h3>${selectedPeriod === 'summary' ? 'SUMMARY OF GRADES' : 'GRADE SHEET'}</h3>
      </div>
    `);

    // Add the table content
    printWindow.document.write(clonedTable.outerHTML);

    // Close the document to ensure styles are applied
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();

    // Trigger the print dialog
    printWindow.print();

    // Close the print window after printing
    printWindow.close();
  } else {
    console.error('Table not found');
  }
};


  {/* SEARCH BAR DECLARATION */}
  const [selectedPeriod, setSelectedPeriod] = useState('midterm');
  const [searchTerm, setSearchTerm] = useState('');


  {/* FOR MIDTERMS */}

  {/* ATTENDANCE DECLARATION */}
  const [midtermAttendanceColumns, setmidtermAttendanceColumns] = useState([{ id: 1, grade: gradeArray }]); //Storing raw values (PLEA) for table rendering
  console.log("Midterm Attendance Columns: ",midtermAttendanceColumns);
  const [midtermTotalAttendanceDays, setmidtermTotalAttendanceDays] = useState(0);
  const [midtermAttendanceData, setmidtermAttendanceData] = useState([]); //Storing raw values (PLEA) for calculations
  console.log("Midterm Attendance Data: ", midtermAttendanceData);
  const [midtermAttendancePercentage, setmidtermAttendancePercentage] = useState();
  //console.log(midtermAttendancePercentage);
  const [midtermAttendance, setmidtermAttendance] = useState([]); //Storing raw values (PLEA) for db upsertion
  const [midtermAttendanceLabels, setmidtermAttendanceLabels] = useState([]); //Storing attendance column dates for db upsertion

  {/* ASSIGNMENT DECLARATION */}
  const [midtermAssignmentColumns, setmidtermAssignmentColumns] = useState([{ id: 1 , grade: gradeArray }]); //Storing raw values (50-100) for table rendering
  //console.log("Midterm Assignment Columns:",midtermAssignmentColumns);
  const [midtermAssignmentScores, setmidtermAssignmentScores] = useState([]); //Storing raw values (50-100) for calculations
  console.log("Midterm Assignment Scores:", midtermAssignmentScores);
  const [midtermAssignmentPercentage, setmidtermAssignmentPercentage] = useState();
  const [invalidAssignmentScores, setInvalidAssignmentScores] = useState([]);
  const [midtermAssignment, setmidtermAssignment] = useState([]); //Storing raw values (50-100) for db upsertion
  
  // QUIZZES DECLARATION
  const [midtermQuizColumns, setmidtermQuizColumns] = useState([{ id: 1, grade: gradeArray }]); // Initialize quiz columns
  //console.log("Midterm Quiz Columns:",midtermQuizColumns);
  const [midtermQuizScores, setmidtermQuizScores] = useState([]); // Scores for each quiz
  console.log("Midterm Quiz Scores:",midtermQuizScores);
  const [midtermQuizMaxScores, setmidtermQuizMaxScores] = useState([]); // Maximum scores for each quiz
  //console.log("Midterm Quiz Max:",midtermQuizMaxScores);
  const [midtermQuizPercentage, setmidtermQuizPercentage] = useState();
  const [midtermQuiz, setmidtermQuiz] = useState([]); //Storing raw values (int) for db upsertion
  const [midtermQuizMax, setmidtermQuizMax] = useState([]); //Storing attendance column dates for db upsertion


  {/* RECITATION DECLARATION */}
  const [midtermRecitationColumns, setmidtermRecitationColumns] = useState([{ id: 1, grade: gradeArray}]);
  //console.log("Midterm Recitation Columns:",midtermRecitationColumns);
  const [midtermRecitationScores, setmidtermRecitationScores] = useState([]);
  console.log("Midterm Recitation Scores:",midtermRecitationScores);
  const [midtermRecitationPercentage, setmidtermRecitationPercentage] = useState();
  const [invalidRecitationScores, setInvalidRecitationScores] = useState([]);
  const [midtermRecitation, setmidtermRecitation] = useState([]); //Storing raw values (50-100) for db upsertion
  

   // PBA Declaration
   const [midtermPBAColumns, setmidtermPBAColumns] = useState([{ id: 1, grade: gradeArray }]);
   //console.log("Midterm PBA Columns: ", midtermPBAColumns);
   const [midtermPBAGradeScores, setmidtermPBAGradeScores] = useState([]);  // Store scores for each PBA column per student
   console.log("Midterm PBA Scores: ", midtermPBAGradeScores);
   const [midtermPBAGradePercentage, setmidtermPBAGradePercentage] = useState();
   const [invalidPBAScores, setInvalidPBAScores] = useState([]);
   const [midtermPBA, setmidtermPBA] = useState([]);
   const [midtermPBALabels, setmidtermPBALabels] = useState([]);
   

   // MIDTERM EXAM DECLARATION
  const [midtermExamScores, setMidtermExamScores] = useState({});
  console.log("Midterm Exam Scores: ",midtermExamScores);
  const [midtermExamPercentage, setMidtermExamPercentage] = useState();
  const [midtermTotalItems, setmidtermTotalItems] = useState(); // Default total number of items is 100
  //console.log("Midterm Total Items: ",midtermTotalItems);
  const [midtermExam, setmidtermExam] = useState([]);
  const [midtermExamMax, setmidtermExamMax] = useState([]);
  //REMARKS
  const [remarks, setRemarks] = useState({});

  {/*FOR FINALS*/}

  {/* ATTENDANCE DECLARATION */}
  const [finalsAttendanceColumns, setfinalsAttendanceColumns] = useState([{ id: 1, grade: gradeArray}]);
  //console.log(finalsAttendanceColumns);
  const [finalsTotalAttendanceDays, setfinalsTotalAttendanceDays] = useState(0);
  const [finalsAttendanceData, setfinalsAttendanceData] = useState([]);
  const [finalsAttendancePercentage, setfinalsAttendancePercentage] = useState(); // Default value of 0
  const [finalAttendance, setfinalAttendance] = useState([]); //Storing raw values (PLEA) for db upsertion
  const [finalAttendanceLabels, setfinalAttendanceLabels] = useState([]); //Storing attendance column dates for db upsertion

  {/* ASSIGNMENT DECLARATION */}
  const [finalsAssignmentColumns, setfinalsAssignmentColumns] = useState([{ id: 1, grade: gradeArray }]);
  const [finalsAssignmentScores, setfinalsAssignmentScores] = useState([]);
  const [finalsAssignmentPercentage, setfinalsAssignmentPercentage] = useState(); // Default to 5%
  const [finalsinvalidAssignmentScores, setfinalsInvalidAssignmentScores] = useState([]);
  const [finalAssignment, setfinalAssignment] = useState([]); //Storing raw values (50-100) for db upsertion
  
  {/* QUIZZES DECLARATION */}
  const [finalsQuizColumns, setfinalsQuizColumns] = useState([{ id: 1, grade: gradeArray }]); // Initialize quiz columns
  //console.log("Final Quiz Columns:", finalsQuizColumns);
  const [finalsQuizScores, setfinalsQuizScores] = useState([]);
  //console.log("Final Quiz Scores:", finalsQuizScores);
  const [finalsQuizMaxScores, setfinalsQuizMaxScores] = useState([]);
  //console.log("Final Quiz Max Scores:", finalsQuizMaxScores);
  const [finalsQuizPercentage, setfinalsQuizPercentage] = useState();
  const [finalQuiz, setfinalQuiz] = useState([]); //Storing raw values (int) for db upsertion
  const [finalQuizMax, setfinalQuizMax] = useState([]); //Storing attendance column dates for db upsertion

  {/* RECITATION DECLARATION */}
  const [finalsRecitationColumns, setfinalsRecitationColumns] = useState([{ id: 1, grade: gradeArray }]);
  const [finalsRecitationScores, setfinalsRecitationScores] = useState([]);
  const [finalsRecitationPercentage, setfinalsRecitationPercentage] = useState();
  const [finalsinvalidRecitationScores, setfinalsInvalidRecitationScores] = useState([]);
  const [finalRecitation, setfinalRecitation] = useState([]); //Storing raw values (50-100) for db upsertion
  
  {/* PBA DECLARATION */}
  const [finalsPBAColumns, setfinalsPBAColumns] = useState([{ id: 1, grade: gradeArray }]);
  //console.log(finalsPBAColumns);
  const [finalsPBAGradeScores, setfinalsPBAGradeScores] = useState([]);
  const [finalsPBAGradePercentage, setfinalsPBAGradePercentage] = useState();
  const [finalsinvalidPBAScores, setfinalsInvalidPBAScores] = useState([]);
  const [finalPBA, setfinalPBA] = useState([]);
  const [finalPBALabels, setfinalPBALabels] = useState([]);

  {/* FINAL EXAM DECLARATION */}
  const [finalsExamScores, setfinalsExamScores] = useState([]);
  //console.log("Final Exam Scores: ",finalsExamScores);
  const [finalsExamPercentage, setfinalsExamPercentage] = useState();
  const [finalsTotalItems, setfinalsTotalItems] = useState();
  //console.log("Final Exam Max Score: ",finalsTotalItems);
  const [finalExam, setfinalExam] = useState([]);
  const [finalExamMax, setfinalExamMax] = useState([]);


  // // Fetch existing students from StudentModel
  // const fetchExistingStudents = async () => {
  //   try {
  //       const existingStudents = await StudentModel.fetchExistingStudents();
        
  //       // Modify student.id to start from 0, 1, 2, etc.
  //       const studentsWithModifiedIds = existingStudents.map((student, index) => ({
  //           ...student, // Keep the existing student data
  //           id: index   // Overwrite the id with the new index
  //       }));

  //       setStudents(studentsWithModifiedIds);
  //   } catch (error) {
  //       console.error('Error fetching existing students:', error);
  //   }
  // };
  
  // // Fetch existing students onload
  // useEffect(() => {fetchExistingStudents();}, []);

  {/*ATTENDANCE FOR MIDTERM AND FINALS (COMPLETE)*/}
  useEffect(() => {
    const count = midtermAttendanceColumns.filter(col => col.date).length;
    const finalscount = finalsAttendanceColumns.filter(col => col.date).length;
    setmidtermTotalAttendanceDays(count); // Update the total attendance days
    setfinalsTotalAttendanceDays(finalscount);
  }, [midtermAttendanceColumns, finalsAttendanceColumns]);

  {/*ADD AND REMOVE COLUMN FOR MIDTERM AND FINALS (COMPLETE)*/}
  const addColumn = (setColumns) => {
    setColumns((prevColumns) => [...prevColumns, { id: prevColumns.length + 1, grade: gradeArray }]);
  };
  const removeColumn = (index, setColumns) => {
    setColumns((prevColumns) => prevColumns.filter((_, i) => i !== index));
  };
  // Dedicated removeColumn function for attendance data only
const removeAttendanceColumn = (index, setColumns, setAttendanceData) => {
  setColumns((prevColumns) => {
    const updatedColumns = prevColumns.filter((_, i) => i !== index);

    // Update attendance data by removing the corresponding column (index)
    setAttendanceData((prevData) => {
      const updatedData = { ...prevData };
      Object.keys(updatedData).forEach(studentId => {
        const studentAttendance = updatedData[studentId] || [];
        studentAttendance.splice(index, 1); // Remove the corresponding column data for this student
      });
      return updatedData;
    });

    return updatedColumns;
  });
};

const removeAssignmentColumn = (index, setColumns, setAssignmentScores) => {
  setColumns((prevColumns) => {
    const updatedColumns = prevColumns.filter((_, i) => i !== index);

    setAssignmentScores((prevData) => {
      const updatedData = { ...prevData };
      Object.keys(updatedData).forEach(studentId => {
        const studentAttendance = updatedData[studentId] || [];
        studentAttendance.splice(index, 1); // Remove the corresponding column data for this student
      });
      return updatedData;
    });

    return updatedColumns;
  });
};


  {/*SELECT FOR PERIOD (SWITCH CASES)*/}
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => { //Combine the records for bulk insert in database
    const combinedClassGradeData = [
      ...(midtermAttendance?.length ? midtermAttendance : []), 
      ...(finalAttendance?.length ? finalAttendance : []),
      ...(midtermAssignment?.length ? midtermAssignment : []),
      ...(finalAssignment?.length ? finalAssignment : []),
      ...(midtermQuiz?.length ? midtermQuiz : []),
      ...(finalQuiz?.length ? finalQuiz : []),
      ...(midtermRecitation?.length ? midtermRecitation : []),
      ...(finalRecitation?.length ? finalRecitation : []),
      ...(midtermPBA?.length ? midtermPBA : []),
      ...(finalPBA?.length ? finalPBA : []),
      ...(midtermExam?.length ? midtermExam : []),
      ...(finalExam?.length ? finalExam : [])
    ];
    const combinedAttendanceLabelData = [
      ...(midtermAttendanceLabels?.length ? midtermAttendanceLabels : []),
      ...(finalAttendanceLabels?.length ? finalAttendanceLabels : [])
    ];
    const combinedQuizMaxData = [
      ...(midtermQuizMax?.length ? midtermQuizMax : []),
      ...(finalQuizMax?.length ? finalQuizMax : [])
    ];

    const combinedPBALabelData = [
      ...(midtermPBALabels?.length ? midtermPBALabels : []),
      ...(finalPBALabels?.length ? finalPBALabels : [])
    ];

    const combinedExamMaxData = [
      ...(midtermExamMax?.length ? midtermExamMax : []),
      ...(finalExamMax?.length ? finalExamMax : [])
    ];

    const combinedComponentWeightData = [
      ...(midtermComponentWeights?.length ? midtermComponentWeights : []),
      ...(finalsComponentWeights?.length ? finalsComponentWeights : [])
    ];

    setClassGradeData(combinedClassGradeData);
    setAttendanceLabelData(combinedAttendanceLabelData);
    setQuizMaxData(combinedQuizMaxData);
    setPbaLabelData(combinedPBALabelData);
    setExamMaxData(combinedExamMaxData);
    setComponentWeightData(combinedComponentWeightData);
  }, [midtermAttendance, finalAttendance,
      midtermAttendanceLabels, finalAttendanceLabels,
      midtermAssignment, finalAssignment,
      midtermQuiz, finalQuiz,
      midtermQuizMax, finalQuizMax,
      midtermRecitation, finalRecitation,
      midtermPBA, finalPBA,
      midtermPBALabels, finalPBALabels,
      midtermExam, finalExam,
      midtermExamMax, finalExamMax,
      midtermComponentWeights, finalsComponentWeights
    ]);

  useEffect(() => { //Combine the percentages for validation and prep for bulk insert in database
    if(midtermAttendancePercentage && midtermAssignmentPercentage && midtermQuizPercentage && midtermRecitationPercentage && midtermPBAGradePercentage && midtermExamPercentage){
      const totalMidtermPercentage = parseInt(midtermAttendancePercentage ? midtermAttendancePercentage : 0)
                                 + parseInt(midtermAssignmentPercentage ? midtermAssignmentPercentage : 0)
                                 + parseInt(midtermQuizPercentage ? midtermQuizPercentage : 0)
                                 + parseInt(midtermRecitationPercentage ? midtermRecitationPercentage : 0)
                                 + parseInt(midtermPBAGradePercentage ? midtermPBAGradePercentage : 0)
                                 + parseInt(midtermExamPercentage ? midtermExamPercentage : 0);

      console.log(totalMidtermPercentage);
      if(totalMidtermPercentage !== 100){
        toast.error('Total percentage of the components for Midterm is not 100%');
      } else {
        const componentWeights = [midtermAttendancePercentage, midtermAssignmentPercentage, midtermQuizPercentage, midtermRecitationPercentage, midtermPBAGradePercentage, midtermExamPercentage];
        const weightData = [];

        componentWeights.forEach((weight, index) => {
          weightData.push({
            scheduleNumber: classInfo.scheduleNumber,
            period: 1,
            componentNumber: index + 1,
            weight: parseInt(weight)
          });
        });

        console.log(weightData);
        setMidtermComponentWeights(weightData);
      };
    };
    if(finalsAttendancePercentage && finalsAssignmentPercentage && finalsQuizPercentage && finalsRecitationPercentage && finalsPBAGradePercentage && finalsExamPercentage){
      const totalMidtermPercentage = parseInt(finalsAttendancePercentage ? finalsAttendancePercentage : 0)
                                 + parseInt(finalsAssignmentPercentage ? finalsAssignmentPercentage : 0)
                                 + parseInt(finalsQuizPercentage ? finalsQuizPercentage : 0)
                                 + parseInt(finalsRecitationPercentage ? finalsRecitationPercentage : 0)
                                 + parseInt(finalsPBAGradePercentage ? finalsPBAGradePercentage : 0)
                                 + parseInt(finalsExamPercentage ? finalsExamPercentage : 0);

      console.log(totalMidtermPercentage);
      if(totalMidtermPercentage !== 100){
        toast.error('Total percentage of the components for Finals is not 100%');
      } else {
        const componentWeights = [finalsAttendancePercentage, finalsAssignmentPercentage, finalsQuizPercentage, finalsRecitationPercentage, finalsPBAGradePercentage, finalsExamPercentage];
        const weightData = [];

        componentWeights.forEach((weight, index) => {
          weightData.push({
            scheduleNumber: classInfo.scheduleNumber,
            period: 2,
            componentNumber: index + 1,
            weight: parseInt(weight)
          });
        });

        console.log(weightData);
        setFinalsComponentWeights(weightData);
      };
    };
  },[ midtermAttendancePercentage, finalsAttendancePercentage,
      midtermAssignmentPercentage, finalsAssignmentPercentage,
      midtermQuizPercentage, finalsQuizPercentage,
      midtermRecitationPercentage, finalsRecitationPercentage,
      midtermPBAGradePercentage, finalsPBAGradePercentage,
      midtermExamPercentage, finalsExamPercentage
  ]);

  {/*ATTENDANCE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermAttendanceChange = (studentId, studentNumber, dateIndex, status) => {
    setmidtermAttendanceData((prevData) => {
      const studentAttendance = prevData[studentId] || [];
      const updatedAttendance = [...studentAttendance];

      updatedAttendance[dateIndex] = { date: new Date().toLocaleDateString('en-CA'), status };

      return {
        ...prevData,
        [studentId]: updatedAttendance,
      };
    });
    setmidtermAttendanceColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== dateIndex) return column;//Check if this is the correct date (based on dateIndex)
        
        if (index === dateIndex) {// Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
  
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              status 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              status
            });
          }
  
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );
  };

  useEffect(() => {//Automatic Generation of objects for database storage (Attendance: Midterm)
    const AttendanceData = []; //For Database: gradeData
    const AttendanceColumns = []; //For Database: attendanceData

    console.log(midtermAttendanceColumns);
    midtermAttendanceColumns?.forEach((column, index) => {
      AttendanceColumns.push({
          scheduleNumber: classInfo.scheduleNumber,
          period: 1,
          instanceNumber: index + 1,
          attendanceLabel: column.date
      });
      column.grade?.forEach((student) => {
        
        AttendanceData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 1, 
          instanceNumber: index + 1, 
          period: 1, 
          value: student.status 
        });
      });
    });
    
    console.log("Rows for Database:",AttendanceData);
    //console.log("List of Dates:", AttendanceColumns);
    setmidtermAttendance(AttendanceData); //Storing raw values
    setmidtermAttendanceLabels(AttendanceColumns);
  }, [midtermAttendanceColumns, classInfo]);

  const handleFinalsAttendanceChange = (studentId, studentNumber, dateIndex, status) => {
    setfinalsAttendanceData((prevData) => {
      const studentAttendance = prevData[studentId] || [];
      const updatedAttendance = [...studentAttendance];

      updatedAttendance[dateIndex] = { date: new Date().toLocaleDateString('en-CA'), status };

      return {
        ...prevData,
        [studentId]: updatedAttendance,
      };
    });
    setfinalsAttendanceColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== dateIndex) return column;//Check if this is the correct date (based on dateIndex)
        
        if (index === dateIndex) {// Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
  
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              status 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              status
            });
          }
  
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );
  };
  useEffect(() => {//Automatic Generation of objects for database storage (Attendance: Finals)
    const AttendanceData = []; //For Database: gradeData
    const AttendanceColumns = []; //For Database: attendanceData

    finalsAttendanceColumns?.forEach((column, index) => {
      AttendanceColumns.push({
          scheduleNumber: classInfo.scheduleNumber,
          period: 2,
          instanceNumber: index + 1,
          attendanceLabel: column.date
      });
      column.grade?.forEach((student) => {
        
        AttendanceData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 1, 
          instanceNumber: index + 1, 
          period: 2, 
          value: student.status 
        });
      });
    });
    
    console.log("Rows for Database:",AttendanceData);
    console.log("List of Dates:", AttendanceColumns);
    setfinalAttendance(AttendanceData); //Storing raw values
    setfinalAttendanceLabels(AttendanceColumns);
  }, [finalsAttendanceColumns, classInfo]);
  

  {/*ATTENDANCE TOTALS FOR BOTH PERIOD (COMPLETE)*/}
  const getMidtermAttendanceTotals = (studentId) => {
    const studentAttendance = midtermAttendanceData[studentId] || [];
    const Atotals = { P: 0, L: 0, E: 0, A: 0 };
    let points = 100;

    studentAttendance.forEach(({ status }) => {
      if (status === 'P') Atotals.P++;
      else if (status === 'L') Atotals.L++;
      else if (status === 'E') Atotals.E++;
      else if (status === 'A') Atotals.A++;
    });


    const convertedAbsents = Math.floor(Atotals.L / 3); // 3 Lates = 1 Absent
    Atotals.A += convertedAbsents; // Add converted absents to total absents
    Atotals.L = Atotals.L % 3; // Remaining lates after conversion

    points -= Atotals.A * 3; // Deduct points for each Absent
    points -= Atotals.E * 3; // Deduct points for each Excused

    return { Atotals, points };
  };
  const getFinalsAttendanceTotals = (studentId) => {
    const studentAttendance = finalsAttendanceData[studentId] || [];
    const Atotals = { P: 0, L: 0, E: 0, A: 0 };
    let points = 100;

    studentAttendance.forEach(({ status }) => {
      if (status === 'P') Atotals.P++;
      else if (status === 'L') Atotals.L++;
      else if (status === 'E') Atotals.E++;
      else if (status === 'A') Atotals.A++;
    });


    const convertedAbsents = Math.floor(Atotals.L / 3); // 3 Lates = 1 Absent
    Atotals.A += convertedAbsents; // Add converted absents to total absents
    Atotals.L = Atotals.L % 3; // Remaining lates after conversion

    points -= Atotals.A * 3; // Deduct points for each Absent
    points -= Atotals.E * 3; // Deduct points for each Excused

    return { Atotals, points };
  };

  {/*ATTENDANCE SCORES FOR BOTH PERIOD (COMPLETE)*/}
  const getMidtermAttendanceScorePercentage = (points) => {
    const totalComputations = 100; // Assuming this is the maximum point you are working with
    const attendanceInputPercentage = midtermAttendancePercentage / 100; // Convert percentage to decimal
    const calculatedPoints = Math.max(0, (points / totalComputations) * attendanceInputPercentage * totalComputations);
    return calculatedPoints.toFixed(2); // Return the value with 2 decimal points
  };
  const getFinalsAttendanceScorePercentage = (points) => {
    const totalComputations = 100; // Assuming this is the maximum point you are working with
    const attendanceInputPercentage = finalsAttendancePercentage / 100; // Convert percentage to decimal
    const calculatedPoints = Math.max(0, (points / totalComputations) * attendanceInputPercentage * totalComputations);
    return calculatedPoints.toFixed(2); // Return the value with 2 decimal points
  };

  const handleMidtermAssignmentScoreChange = (studentId, studentNumber, assignmentIndex, score) => {
    setmidtermAssignmentScores((prevData) => {
      const studentScores = prevData[studentId] || [];
      const updatedScores = [...studentScores];
      updatedScores[assignmentIndex] = score;
      return {
        ...prevData,
        [studentId]: updatedScores,
      };
    });
    setInvalidAssignmentScores((prevInvalid) => {
      const studentInvalid = prevInvalid[studentId] || {};
      const updatedInvalid = { ...studentInvalid, [assignmentIndex]: score < 50 || score > 100 };
      return {
        ...prevInvalid,
        [studentId]: updatedInvalid,
      };
    });
    setmidtermAssignmentColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== assignmentIndex) return column;
        
        if (index === assignmentIndex) { 
          // Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
      
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              score 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              score
            });
          }
      
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );    
  };
  useEffect(() => {//Automatic Generation of objects for database storage (Assignment: Midterm)
    const AssignmentData = []; //For Database: gradeData

    midtermAssignmentColumns?.forEach((column, index) => {
      column.grade?.forEach((student) => {
        
        AssignmentData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 2, 
          instanceNumber: index + 1, 
          period: 1, 
          value: student.score
        });
      });
    });

    const filteredAssignment = AssignmentData.filter(assignment => (assignment.value <= 100 && assignment.value >= 50) || assignment.value === null);
    
    console.log("Rows for Database:",filteredAssignment);
    setmidtermAssignment(filteredAssignment); //Storing raw values
  }, [midtermAssignmentColumns, classInfo]);
  
  

  // ASSIGNMENT SCORES FOR FINALS PERIOD
  const handleFinalAssignmentScoreChange = (studentId, studentNumber, assignmentIndex, score) => {
    setfinalsAssignmentScores((prevData) => {
      const studentScores = prevData[studentId] || [];
      const updatedScores = [...studentScores];
      updatedScores[assignmentIndex] = score;
      return {
        ...prevData,
        [studentId]: updatedScores,
      };
    });
    setfinalsInvalidAssignmentScores((prevInvalid) => {
      const studentInvalid = prevInvalid[studentId] || {};
      const updatedInvalid = { ...studentInvalid, [assignmentIndex]: score < 50 || score > 100 };
      return {
        ...prevInvalid,
        [studentId]: updatedInvalid,
      };
    });
    setfinalsAssignmentColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== assignmentIndex) return column;
        
        if (index === assignmentIndex) { 
          // Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
      
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              score 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              score
            });
          }
      
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );
  };
  
  useEffect(() => {//Automatic Generation of objects for database storage (Assignment: Finals)
    const AssignmentData = []; //For Database: gradeData

    finalsAssignmentColumns?.forEach((column, index) => {
      column.grade?.forEach((student) => {
        
        AssignmentData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 2, 
          instanceNumber: index + 1, 
          period: 2, 
          value: student.score
        });
      });
    });

    const filteredAssignment = AssignmentData.filter(assignment => (assignment.value <= 100 && assignment.value >= 50) || assignment.value === null);
    
    console.log("Rows for Database:",filteredAssignment);
    setfinalAssignment(filteredAssignment); //Storing raw values
  }, [finalsAssignmentColumns, classInfo]);


  {/* ASSIGNMENTS AVERAGE FOR MIDTERM */}
  const calculateMidtermAssignmentColumnAverage = (studentIndex) => {
    const scores = midtermAssignmentScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Optional: format to 2 decimal places
  };
  {/* ASSIGNMENTS AVERAGE FOR FINALS */}
  const calculateFinalsAssignmentColumnAverage = (studentIndex) => {
    const scores = finalsAssignmentScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Optional: format to 2 decimal places
  };

  {/* ASSIGNMENTS COMPONENT FOR MIDTERM */}
  const calculateMidtermAssignmentComponentScore = (studentIndex, percentage) => {
    const scores = midtermAssignmentScores[studentIndex] || [];
    const validScores = scores.map(score => parseFloat(score) || 0);
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2);
  };
  {/* ASSIGNMENTS COMPONENT FOR FINALS */}
  const calculateFinalsAssignmentComponentScore = (studentIndex, percentage) => {
    const scores = finalsAssignmentScores[studentIndex] || [];
    const validScores = scores.map(score => parseFloat(score) || 0);
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2);
  };

  //QUIZ COLUMNS FOR BOTH PERIODS (COMPLETE)
  useEffect(() => {
    setmidtermQuizScores(prevScores =>
      students.map((_, index) => prevScores[index] || Array(midtermQuizColumns.length).fill(0)) // Retain previous scores
    );
    setmidtermQuizMaxScores(prevMaxScores => 
      prevMaxScores.length < midtermQuizColumns.length 
        ? [...prevMaxScores, ...Array(midtermQuizColumns.length - prevMaxScores.length).fill(0)] 
        : prevMaxScores
    );
  }, [students]);

  useEffect(() => {
    setfinalsQuizScores(prevScores =>
      students.map((_, index) => prevScores[index] || Array(finalsQuizColumns.length).fill(0)) // Retain previous scores
    );
    setfinalsQuizMaxScores(prevMaxScores => 
      prevMaxScores.length < finalsQuizColumns.length 
        ? [...prevMaxScores, ...Array(finalsQuizColumns.length - prevMaxScores.length).fill(0)] 
        : prevMaxScores
    );
  }, [students]);
  
  
  {/*ADD QUIZ COLUMNS FOR BOTH PERIODS (COMPLETE)*/}
  // ADD MIDTERM QUIZ COLUMN
  const addMidtermQuizColumn = () => {
    setmidtermQuizColumns((prevColumns) => [...prevColumns, { id: prevColumns.length + 1, grade: [] }]);
    setmidtermQuizScores((prevScores) =>
      prevScores.map((studentScores) => [...studentScores, 0]) // Add a 0 for each student for the new column
    );
    setmidtermQuizMaxScores((prevMaxScores) => [...prevMaxScores, 0]);
  };

  // ADD FINALS QUIZ COLUMN
  const addFinalQuizColumn = () => {
    setfinalsQuizColumns((prevColumns) => [...prevColumns, { id: prevColumns.length + 1, grade: [] }]);
    setfinalsQuizScores((prevScores) =>
      prevScores.map((studentScores) => [...studentScores, 0]) // Append a new score (0) for the new column
    );
    setfinalsQuizMaxScores((prevMaxScores) => [...prevMaxScores, 0]);
  };

  
  {/*REMOVE QUIZ COLUMNS FOR BOTH PERIODS (COMPLETE)*/}
  const removeQuizColumn = (index, setColumns, setQuizData, setQuizMax) => {
    setColumns((prevColumns) => {
      const updatedColumns = prevColumns.filter((_, i) => i !== index);
      return updatedColumns;
    });
    setQuizData(prevScores =>
      prevScores.map(studentScores =>
        studentScores?.filter((_, i) => i !== index)
      )
    );
    setQuizMax((prevColumns) => {
      const updatedColumns = prevColumns.filter((_, i) => i !== index);
      return updatedColumns;
    });
  };

  
  {/*QUIZ SCORE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermQuizScoreChange = (studentId, studentNumber, quizIndex, score) => {
    // Validate that the score does not exceed the max score
    const maxScore = midtermQuizMaxScores[quizIndex];
    
    if (score > maxScore) {
      toast.error(`Score cannot exceed ${maxScore} for Quiz ${quizIndex + 1}`);
      return; // Do not update if validation fails
    }

    if(score < 0){
      toast.error(`Score cannot have negative values for Quiz ${quizIndex + 1}`);
      return; // Do not update if validation fails
    }
  
    setmidtermQuizScores((prevScores) =>
      prevScores.map((scores, index) => {
        if (index === studentId) {
          const updatedScores = [...scores];
          updatedScores[quizIndex] = score; // Set the new score for the quiz
          return updatedScores;
        }
        return scores;
      })
    );
    setmidtermQuizColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== quizIndex) return column;//Check if this is the correct date (based on dateIndex)
        
        if (index === quizIndex) {// Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
  
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              score 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              score
            });
          }
  
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );
  };
  
  useEffect(() => {//Automatic Generation of objects for database storage (Quiz: Midterm)
    const QuizData = []; //For Database: gradeData
    const QuizColumns = []; //For Database: attendanceData

    midtermQuizColumns?.forEach((column, index) => {
      QuizColumns.push({
          scheduleNumber: classInfo.scheduleNumber,
          period: 1,
          instanceNumber: index + 1,
          maxScore: column.max
      });
      column.grade?.forEach((student) => {
        
        QuizData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 3, 
          instanceNumber: index + 1, 
          period: 1,
          value: student.score
        });
      });
    });
  
    const filteredQuiz = QuizData.filter(quiz => quiz.value > 0);
    
    console.log("Rows for Database:",filteredQuiz);
    console.log("List of Max Scores:", QuizColumns);
    setmidtermQuiz(filteredQuiz); //Storing raw values
    setmidtermQuizMax(QuizColumns);
  }, [midtermQuizColumns, classInfo]);

  const handleFinalsQuizScoreChange = (studentId, studentNumber, quizIndex, score) => {
    // Validate that the score does not exceed the max score
    const maxScore = finalsQuizMaxScores[quizIndex];
    
    if (score > maxScore) {
      toast.error(`Score cannot exceed ${maxScore} for Quiz ${quizIndex + 1}`);
      return; // Do not update if validation fails
    }

    if(score < 0){
      toast.error(`Score cannot have negative values for Quiz ${quizIndex + 1}`);
      return; // Do not update if validation fails
    }

    setfinalsQuizScores((prevScores) =>
      prevScores.map((scores, index) => {
        if (index === studentId) {
          const updatedScores = [...scores];
          updatedScores[quizIndex] = score; // Set the new score for the quiz
          return updatedScores;
        }
        return scores;
      })
    );
    setfinalsQuizColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== quizIndex) return column;//Check if this is the correct date (based on dateIndex)
        
        if (index === quizIndex) {// Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
  
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              score 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              score
            });
          }
  
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );
  };

  useEffect(() => {//Automatic Generation of objects for database storage (Quiz: Finals)
    const QuizData = []; //For Database: gradeData
    const QuizColumns = []; //For Database: attendanceData

    finalsQuizColumns?.forEach((column, index) => {
      QuizColumns.push({
          scheduleNumber: classInfo.scheduleNumber,
          period: 2,
          instanceNumber: index + 1,
          maxScore: column.max
      });
      column.grade?.forEach((student) => {
        
        QuizData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 3, 
          instanceNumber: index + 1, 
          period: 2,
          value: student.score
        });
      });
    });
  
    const filteredQuiz = QuizData.filter(quiz => quiz.value > 0);
    
    console.log("Rows for Database:",filteredQuiz);
    console.log("List of Max Scores:", QuizColumns);
    setfinalQuiz(filteredQuiz); //Storing raw values
    setfinalQuizMax(QuizColumns);
  }, [finalsQuizColumns, classInfo]);

  {/*QUIZ MAX SCORE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermMaxScoreChange = (quizIndex, value) => {
    setmidtermQuizMaxScores(prev => {
      const updatedMaxScores = [...prev];
      updatedMaxScores[quizIndex] = value;
      return updatedMaxScores;
    });
  };
  const handleFinalsMaxScoreChange = (quizIndex, value) => {
    setfinalsQuizMaxScores(prev => {
      const updatedMaxScores = [...prev];
      updatedMaxScores[quizIndex] = value;
      return updatedMaxScores;
    });
  };
  
  
  {/*EQUIVALENT RATE FOR BOTH PERIOD*/}
  const calculateEquivalentRate = (score, maxScore) => {
    if (maxScore === 0) return 0; // Prevent division by zero
    return ((score / maxScore) * 50) + 50;
  };

  {/* QUIZ COMPONENT FOR MIDTERM */}
  const calculateMidtermQuizComponentScore = (studentIndex, percentage) => {
    const scores = midtermQuizScores[studentIndex] || [];
    const maxScores = midtermQuizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    const averageEquivalentRate = equivalentRates.length > 0 ? totalEquivalentRate / equivalentRates.length : 0;

    const componentScore = averageEquivalentRate * (percentage / 100);
    return componentScore.toFixed(2);
  };
  {/* QUIZ COMPONENT FOR FINALS */}
  const calculateFinalsQuizComponentScore = (studentIndex, percentage) => {
    const scores = finalsQuizScores[studentIndex] || [];
    const maxScores = finalsQuizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    const averageEquivalentRate = equivalentRates.length > 0 ? totalEquivalentRate / equivalentRates.length : 0;

    const componentScore = averageEquivalentRate * (percentage / 100);
    return componentScore.toFixed(2);
  };

  {/* QUIZ MAX FOR MIDTERM */}
  const calculateMidtermQuizTotalScore = (studentIndex) => {
    const scores = midtermQuizScores[studentIndex] || [];
    const maxScores = midtermQuizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    return (totalEquivalentRate / equivalentRates.length).toFixed(2); // Return the total equivalent rate
  };
  {/* QUIZ MAX FOR FINALS */}
  const calculateFinalsQuizTotalScore = (studentIndex) => {
    const scores = finalsQuizScores[studentIndex] || [];
    const maxScores = finalsQuizMaxScores; // Use the max scores
    const equivalentRates = scores.map((score, index) => calculateEquivalentRate(score, maxScores[index]));
    const totalEquivalentRate = equivalentRates.reduce((acc, rate) => acc + rate, 0);
    return (totalEquivalentRate / equivalentRates.length).toFixed(2); // Return the total equivalent rate
  };
  
  {/* RECITATION/PARTICIPATION */}

  {/* RECITATION CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermRecitationScoreChange = (studentId, studentNumber, recitationIndex, score) => {
    setmidtermRecitationScores((prevData) => {
      const studentScores = prevData[studentId] || [];
      const updatedScores = [...studentScores];
      updatedScores[recitationIndex] = score;
      return {
        ...prevData,
        [studentId]: updatedScores,
      };
    });
    // Real-time validation for red border
    setInvalidRecitationScores((prevInvalid) => {
      const studentInvalid = prevInvalid[studentId] || {};
      const updatedInvalid = { ...studentInvalid, [recitationIndex]: score < 50 || score > 100 };
      return {
        ...prevInvalid,
        [studentId]: updatedInvalid,
      };
    });
    setmidtermRecitationColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== recitationIndex) return column;
        
        if (index === recitationIndex) { 
          // Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
      
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              score 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              score
            });
          }
      
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );
  };

  useEffect(() => {//Automatic Generation of objects for database storage (Recitation: Midterm)
    const RecitationData = []; //For Database: gradeData

    midtermRecitationColumns?.forEach((column, index) => {
      column.grade?.forEach((student) => {
        
        RecitationData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 4, 
          instanceNumber: index + 1, 
          period: 1, 
          value: student.score
        });
      });
    });

    const filteredRecitation = RecitationData.filter(assignment => (assignment.value <= 100 && assignment.value >= 50) || assignment.value === null);
    
    console.log("Rows for Database:",filteredRecitation);
    setmidtermRecitation(filteredRecitation); //Storing raw values
  }, [midtermRecitationColumns, classInfo]);
  

  const handleFinalsRecitationScoreChange = (studentId, studentNumber, recitationIndex, score) => {
    setfinalsRecitationScores((prevData) => {
      const studentScores = prevData[studentId] || [];
      const updatedScores = [...studentScores];
      updatedScores[recitationIndex] = score;
      return {
        ...prevData,
        [studentId]: updatedScores,
      };
    });
    // Real-time validation for red border
    setfinalsInvalidRecitationScores((prevInvalid) => {
      const studentInvalid = prevInvalid[studentId] || {};
      const updatedInvalid = { ...studentInvalid, [recitationIndex]: score < 50 || score > 100 };
      return {
        ...prevInvalid,
        [studentId]: updatedInvalid,
      };
    });
    setfinalsRecitationColumns((prevColumns) => 
      prevColumns.map((column, index) => {
        if (index !== recitationIndex) return column;
        
        if (index === recitationIndex) { 
          // Create a new grade array (don't mutate the original array)
          const updatedGrade = [...column.grade];
          
          // Find the student in the grade array
          const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
      
          if (studentIndex !== -1) {
            // Update existing student's status
            updatedGrade[studentIndex] = { 
              ...updatedGrade[studentIndex], 
              score 
            };
          } else {
            // Add new student entry to grade array
            updatedGrade.push({
              studentNumber: studentNumber,
              score
            });
          }
      
          // Return the updated column with the updated grade array
          return {
            ...column,
            grade: updatedGrade
          };
        } 
        return column; // If this is not the correct column, return it unchanged
      })
    );
  };

  useEffect(() => {//Automatic Generation of objects for database storage (Recitation: Finals)
    const RecitationData = []; //For Database: gradeData

    finalsRecitationColumns?.forEach((column, index) => {
      column.grade?.forEach((student) => {
        
        RecitationData.push({
          scheduleNumber: classInfo.scheduleNumber, 
          studentNumber: student.studentNumber, 
          componentNumber: 4, 
          instanceNumber: index + 1, 
          period: 2, 
          value: student.score
        });
      });
    });

    const filteredRecitation = RecitationData.filter(assignment => (assignment.value <= 100 && assignment.value >= 50) || assignment.value === null);
    
    console.log("Rows for Database:",filteredRecitation);
    setfinalRecitation(filteredRecitation); //Storing raw values
  }, [finalsRecitationColumns, classInfo]);
  

  {/*RECITATION AVERAGE FOR MIDTERM*/}
  const calculateMidtermRecitationColumnAverage = (studentIndex) => {
    const scores = midtermRecitationScores[studentIndex] || [];
  
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
  
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
  
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Format to 2 decimal places
  };
  {/*RECITATION AVERAGE FOR FINALS*/}
  const calculateFinalsRecitationColumnAverage = (studentIndex) => {
    const scores = finalsRecitationScores[studentIndex] || [];
  
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
  
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
  
    // Calculate the average (check for divide by zero)
    const average = validScores.length > 0 ? sum / validScores.length : 0;
  
    return average.toFixed(2); // Format to 2 decimal places
  };
  
  {/*RECITATION COMPONENT FOR MIDTERM*/}
  const calculateMidtermRecitationComponentScore = (studentIndex, percentage) => {
    const scores = midtermRecitationScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    
    // Multiply by the percentage and return the score
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2); // Format to 2 decimal places
  };
  {/*RECITATION COMPONENT FOR FINALS*/}
  const calculateFinalsRecitationComponentScore = (studentIndex, percentage) => {
    const scores = finalsRecitationScores[studentIndex] || [];
    
    // Filter out non-numeric values and ensure scores are numbers
    const validScores = scores.map(score => parseFloat(score) || 0);
    
    // Calculate the sum of the scores
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    
    // Calculate the average
    const average = validScores.length > 0 ? sum / validScores.length : 0;
    
    // Multiply by the percentage and return the score
    const componentScore = average * (percentage / 100);
    return componentScore.toFixed(2); // Format to 2 decimal places
  };

  //CLASS STANDING FOR MIDTERMS
   // Function to calculate total CS Grade based on user-defined percentages
// Function to calculate total CS Grade based on user-defined percentages
const calculateTotalMidtermCSGrade = (studentIndex) => {
  // Retrieve scores for the components
  const attendanceScore = getMidtermAttendanceTotals(studentIndex).points || 0; // Raw attendance score
  const assignmentScore = calculateMidtermAssignmentComponentScore(studentIndex, midtermAssignmentPercentage) || 0;
  const quizScore = calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage) || 0;
  const recitationScore = calculateMidtermRecitationComponentScore(studentIndex, midtermRecitationPercentage) || 0;

  // Retrieve component percentages
  const attendancePercentage = midtermAttendancePercentage || 0;
  const assignmentPercentage = midtermAssignmentPercentage || 0;
  const quizPercentage = midtermQuizPercentage || 0;
  const recitationPercentage = midtermRecitationPercentage || 0;

  // If all components are zero, return 0 for CS Grade
  if (attendanceScore === 0 && assignmentScore === 0 && quizScore === 0 && recitationScore === 0) {
    return 0; // No computation
  }

  // Scale scores based on their percentages
  const attendanceComponent = attendanceScore > 0 
    ? parseFloat(attendanceScore) * (attendancePercentage / 100) 
    : 0;

  const assignmentComponent = assignmentScore > 0 
    ? parseFloat(assignmentScore) 
    : 0;

  const quizComponent = quizScore > 0 
    ? parseFloat(quizScore) 
    : 0;

  const recitationComponent = recitationScore > 0 
    ? parseFloat(recitationScore) 
    : 0;

  // Total CS Grade
  const totalCSGrade = attendanceComponent + assignmentComponent + quizComponent + recitationComponent;

  return totalCSGrade.toFixed(2); // Return grade rounded to 2 decimal places
};








  
const calculateTotalMidtermCSPercentage = () => {
  // Sum only the valid input percentages (those greater than 0)
  const totalCSPercentage = 
    (parseFloat(midtermAttendancePercentage) > 0 ? parseFloat(midtermAttendancePercentage) : 0) + 
    (parseFloat(midtermAssignmentPercentage) > 0 ? parseFloat(midtermAssignmentPercentage) : 0) + 
    (parseFloat(midtermQuizPercentage) > 0 ? parseFloat(midtermQuizPercentage) : 0) + 
    (parseFloat(midtermRecitationPercentage) > 0 ? parseFloat(midtermRecitationPercentage) : 0);

  return totalCSPercentage; // Format the total percentage to 2 decimal places
};


  
  //CLASS STANDING FOR FINALS
   // Function to calculate total CS Grade based on user-defined percentages
   const calculateTotalFinalsCSGrade = (studentIndex) => {
    // Calculate attendance score percentage (out of 100 based on Attendance score)
    const attendanceScore = getFinalsAttendanceTotals(studentIndex).points || 0; // Default to 0 if no score
    const attendanceComponent = (attendanceScore > 0) ? (attendanceScore / 100) * finalsAttendancePercentage : 0;
  
    // Calculate assignment score percentage
    const assignmentScore = calculateFinalsAssignmentComponentScore(studentIndex, finalsAssignmentPercentage) || 0;
    
    // Calculate quiz score percentage
    const quizScore = calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage) || 0;
    
    // Calculate recitation score percentage
    const recitationScore = calculateFinalsRecitationComponentScore(studentIndex, finalsRecitationPercentage) || 0;
  
    // Debug: Log the individual scores
    //console.log('Attendance:', attendanceScore, 'Assignment:', assignmentScore, 'Quiz:', quizScore, 'Recitation:', recitationScore);
  
    // Total CS Grade: Only add components that are greater than 0
    let totalCSGrade = 0;
  
    if (attendanceComponent > 0) {
      totalCSGrade += attendanceComponent;
    }
    if (assignmentScore > 0) {
      totalCSGrade += parseFloat(assignmentScore);
    }
    if (quizScore > 0) {
      totalCSGrade += parseFloat(quizScore);
    }
    if (recitationScore > 0) {
      totalCSGrade += parseFloat(recitationScore);
    }
  
    // Debug: Log the totalCSGrade before returning
    //console.log('Total CS Grade:', totalCSGrade);
  
    // Return formatted total CS grade or 0.00% if no components are valid
    return totalCSGrade > 0 ? totalCSGrade.toFixed(2) : '0.00'; // Ensure the grade is formatted
  };
  
  
  
    
  const calculateTotalFinalsCSPercentage = () => {
    // Sum only the valid input percentages (those greater than 0)
    const totalCSPercentage = 
      (parseFloat(finalsAttendancePercentage) > 0 ? parseFloat(finalsAttendancePercentage) : 0) + 
      (parseFloat(finalsAssignmentPercentage) > 0 ? parseFloat(finalsAssignmentPercentage) : 0) + 
      (parseFloat(finalsQuizPercentage) > 0 ? parseFloat(finalsQuizPercentage) : 0) + 
      (parseFloat(finalsRecitationPercentage) > 0 ? parseFloat(finalsRecitationPercentage) : 0);
  
    return totalCSPercentage; // Format the total percentage to 2 decimal places
  };
  
  
    {/* PBA */}
      // Handle PBA score change with validation for scores between 50-100
      const handleMidtermPBAScoreChange = (studentId, studentNumber, pbaIndex, score) => {
        setmidtermPBAGradeScores((prevData) => {
          const studentScores = prevData[studentId] || [];
          const updatedScores = [...studentScores];
          updatedScores[pbaIndex] = score;
          return {
            ...prevData,
            [studentId]: updatedScores,
          };
        });
        setInvalidPBAScores((prevInvalid) => {
          const studentInvalid = prevInvalid[studentId] || {};
          const updatedInvalid = { ...studentInvalid, [pbaIndex]: score < 50 || score > 100 };
          return {
            ...prevInvalid,
            [studentId]: updatedInvalid,
          };
        });
        setmidtermPBAColumns((prevColumns) => 
          prevColumns.map((column, index) => {
            if (index !== pbaIndex) return column;
            
            if (index === pbaIndex) { 
              // Create a new grade array (don't mutate the original array)
              const updatedGrade = [...column.grade];
              
              // Find the student in the grade array
              const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
          
              if (studentIndex !== -1) {
                // Update existing student's status
                updatedGrade[studentIndex] = { 
                  ...updatedGrade[studentIndex], 
                  score 
                };
              } else {
                // Add new student entry to grade array
                updatedGrade.push({
                  studentNumber: studentNumber,
                  score
                });
              }
          
              // Return the updated column with the updated grade array
              return {
                ...column,
                grade: updatedGrade
              };
            } 
            return column; // If this is not the correct column, return it unchanged
          })
        );
      };

      useEffect(() => {//Automatic Generation of objects for database storage (PBA: Midterm)
        const PBAData = []; //For Database: gradeData
        const PBAColumns = []; //For Database: attendanceData
    
        midtermPBAColumns?.forEach((column, index) => {
          PBAColumns.push({
              scheduleNumber: classInfo.scheduleNumber,
              period: 1,
              instanceNumber: index + 1,
              pbaLabel: column.label
          });
          column.grade?.forEach((student) => {
            
            PBAData.push({
              scheduleNumber: classInfo.scheduleNumber, 
              studentNumber: student.studentNumber, 
              componentNumber: 5, 
              instanceNumber: index + 1, 
              period: 1, 
              value: student.score
            });
          });
        });
        
        console.log("Rows for Database:",PBAData);
        console.log("List of PBA Labels:", PBAColumns);
        setmidtermPBA(PBAData); //Storing raw values
        setmidtermPBALabels(PBAColumns);
      }, [midtermPBAColumns, classInfo]);
      
      // Handle PBA score change with validation for scores between 50-100
      const handleFinalsPBAScoreChange = (studentId, studentNumber, pbaIndex, score) => {
        setfinalsPBAGradeScores((prevData) => {
          const studentScores = prevData[studentId] || [];
          const updatedScores = [...studentScores];
          updatedScores[pbaIndex] = score;
          return {
            ...prevData,
            [studentId]: updatedScores,
          };
        });
        setfinalsInvalidPBAScores((prevInvalid) => {
          const studentInvalid = prevInvalid[studentId] || {};
          const updatedInvalid = { ...studentInvalid, [pbaIndex]: score < 50 || score > 100 };
          return {
            ...prevInvalid,
            [studentId]: updatedInvalid,
          };
        });
        setfinalsPBAColumns((prevColumns) => 
          prevColumns.map((column, index) => {
            if (index !== pbaIndex) return column;
            
            if (index === pbaIndex) { 
              // Create a new grade array (don't mutate the original array)
              const updatedGrade = [...column.grade];
              
              // Find the student in the grade array
              const studentIndex = updatedGrade.findIndex((entry) => entry.studentNumber === studentNumber);
          
              if (studentIndex !== -1) {
                // Update existing student's status
                updatedGrade[studentIndex] = { 
                  ...updatedGrade[studentIndex], 
                  score 
                };
              } else {
                // Add new student entry to grade array
                updatedGrade.push({
                  studentNumber: studentNumber,
                  score
                });
              }
          
              // Return the updated column with the updated grade array
              return {
                ...column,
                grade: updatedGrade
              };
            } 
            return column; // If this is not the correct column, return it unchanged
          })
        );
      };
  
      useEffect(() => {//Automatic Generation of objects for database storage (PBA: Finals)
        const PBAData = []; //For Database: gradeData
        const PBAColumns = []; //For Database: attendanceData
    
        finalsPBAColumns?.forEach((column, index) => {
          PBAColumns.push({
              scheduleNumber: classInfo.scheduleNumber,
              period: 2,
              instanceNumber: index + 1,
              pbaLabel: column.label
          });
          column.grade?.forEach((student) => {
            
            PBAData.push({
              scheduleNumber: classInfo.scheduleNumber, 
              studentNumber: student.studentNumber, 
              componentNumber: 5, 
              instanceNumber: index + 1, 
              period: 2, 
              value: student.score
            });
          });
        });
        
        console.log("Rows for Database:",PBAData);
        console.log("List of PBA Labels:", PBAColumns);
        setfinalPBA(PBAData); //Storing raw values
        setfinalPBALabels(PBAColumns);
      }, [finalsPBAColumns, classInfo]);

  {/* PBA CALCULATION FOR BOTH PERIOD (COMPLETE)*/}
  const calculateTotalsAndPBA = (studentScores = [], PBAGradePercentage) => {
    // Check if studentScores is an array with elements
    if (!Array.isArray(studentScores) || studentScores.length === 0) {
      return { total: 0, pbaGrade: 0 }; // Default values when scores are unavailable
    }
    const total = studentScores.reduce((sum, score) => sum + score, 0);
  
    // Calculate the average score (total divided by number of quizzes)
    const average = total / studentScores.length;
  
    // Calculate the PBA grade (using the percentage provided)
    const pbaGrade = average * (PBAGradePercentage / 100);
  
    return { total: average, pbaGrade };
  };

   {/* SEMESTRAL EXAM */}
   
   {/* EXAM SCORE CHANGE HANDLER FOR BOTH PERIOD (COMPLETE)*/}
  const handleMidtermExamScoreChange = (studentId, studentNumber, score) => {
    // Validate that the score does not exceed the maximum items
    if (score > midtermTotalItems) {
      toast.error(`Score cannot exceed the total items (${midtermTotalItems}) for the Midterm Exam.`);
      return; // Do not update if validation fails
    }
    // Update the score if valid
    setMidtermExamScores((prevScores) => ({
      ...prevScores,
      [studentId]: {score: score, studentNumber: studentNumber}
    }));
  };

  useEffect(() => {//Automatic Generation of objects for database storage (Exam: Midterm)
    const examData = []; //For Database: gradeData
    //For Database: examMaxScore

    Object.entries(midtermExamScores).forEach?.(([ , { score, studentNumber }]) => {
      examData.push({
        scheduleNumber: classInfo.scheduleNumber, 
        studentNumber: studentNumber, 
        componentNumber: 6, 
        instanceNumber: 1,
        period: 1,
        value: score
      });
    });

    const examColumns = {
      scheduleNumber: classInfo.scheduleNumber,
      period: 1,
      instanceNumber: 1,
      maxScore: midtermTotalItems ? midtermTotalItems : 0
    };
  
    const filteredExam = examData.filter(exam => exam.value > 0);
    
    console.log("Rows for Database:",filteredExam);
    console.log("Midterm Exam Max Score:", examColumns);
    setmidtermExam(filteredExam); //Storing raw values
    setmidtermExamMax([examColumns]);
  }, [midtermExamScores, midtermTotalItems, classInfo]);





  
  const handleFinalsExamScoreChange = (studentId, studentNumber, score) => {
    if (score > finalsTotalItems) {
      toast.error(`Score cannot exceed the total items ${finalsTotalItems} for the Finals Exam.`
        // , {
        // position: "top-right",
        // autoClose: 3000,
        // hideProgressBar: false,
        // closeOnClick: true,
        // pauseOnHover: true,
        // draggable: true,
        // progress: undefined,
        // }
      );
      return;
    }
    setfinalsExamScores((prevScores) => ({
      ...prevScores,
      [studentId]: {score: score, studentNumber: studentNumber}
    }));
  };

  
  useEffect(() => {//Automatic Generation of objects for database storage (Exam: Finals)
    const examData = []; //For Database: gradeData
    
    Object.entries(finalsExamScores).forEach?.(([ , { score, studentNumber }]) => {
      examData.push({
        scheduleNumber: classInfo.scheduleNumber, 
        studentNumber: studentNumber, 
        componentNumber: 6, 
        instanceNumber: 1,
        period: 2,
        value: score
      });
    });

    const examColumns = {
      scheduleNumber: classInfo.scheduleNumber,
      period: 2,
      instanceNumber: 1,
      maxScore: finalsTotalItems ? finalsTotalItems : 0
    };
  
    const filteredExam = examData.filter(exam => exam.value > 0);
    
    console.log("Rows for Database:",filteredExam);
    console.log("Final Exam Max Score:", examColumns);
    setfinalExam(filteredExam); //Storing raw values
    setfinalExamMax([examColumns]);
  }, [finalsExamScores, finalsTotalItems, classInfo]);
  

  // Computation functions
  const calculateMidtermPercentage = (score) => {
    return ((score / midtermTotalItems) * 50) + 50;
  };
  const calculateFinalPercentage = (score) => {
    return ((score / finalsTotalItems) * 50) + 50;
  };

  const calculateMidtermWeightedScore = (percentage) => {
    return (percentage * midtermExamPercentage) / 100;
  };
  const calculateFinalWeightedScore = (percentage) => {
    return (percentage * finalsExamPercentage) / 100;
  };

  //MIDTERM GRADE
  const calculateMidtermGrade = (studentIndex) => {
    // Check if there is at least one score inputted in any component
    const hasScores =
      (midtermAssignmentScores[studentIndex] || []).some(score => score) ||
      (midtermQuizScores[studentIndex] || []).some(score => score) ||
      (midtermRecitationScores[studentIndex] || []).some(score => score) ||
      midtermExamScores[students[studentIndex].id]?.score !== undefined;
  
    if (!hasScores) {
      return "Select"; // If no scores inputted, default to "Select"
    }
  
    // Retrieve CS Grade
    const csGrade = parseFloat(calculateTotalMidtermCSGrade(studentIndex)) || 0;
  
    // Retrieve PBA Grade
    const pbaScores = midtermPBAGradeScores[studentIndex] || [];
    const { pbaGrade } = calculateTotalsAndPBA(pbaScores, midtermPBAGradePercentage);
  
    // Retrieve Midterm Exam Score
    const midtermExamScore = midtermExamScores[students[studentIndex].id]?.score;
  
    // Check for incomplete components
    const isMidtermExamIncomplete = midtermExamScore === undefined;
    if (csGrade === 0 || pbaGrade === 0 || isMidtermExamIncomplete) {
      return "INC"; // Mark as incomplete
    }
  
    // Calculate Weighted Midterm Exam Score
    const midtermExamPercentageScore = calculateMidtermPercentage(midtermExamScore);
    const weightedMidtermExamScore = (midtermExamPercentageScore * midtermExamPercentage) / 100;
  
    // Calculate the Total Midterm Grade
    const totalMidtermGrade = csGrade + parseFloat(pbaGrade) + parseFloat(weightedMidtermExamScore);
  
    // Cap the grade at 100 and return the formatted value
    return Math.min(100, totalMidtermGrade).toFixed(2);
  };
  
  
  //FINAL GRADE
  const calculateFinalsGrade = (studentIndex) => {
    // Check if there is at least one score inputted in any component
    const hasScores =
      (finalsAssignmentScores[studentIndex] || []).some(score => score) ||
      (finalsQuizScores[studentIndex] || []).some(score => score) ||
      (finalsRecitationScores[studentIndex] || []).some(score => score) ||
      finalsExamScores[students[studentIndex].id]?.score !== undefined;
  
    if (!hasScores) {
      return "Select"; // If no scores inputted, default to "Select"
    }
  
    // Retrieve CS Grade
    const csGrade = parseFloat(calculateTotalFinalsCSGrade(studentIndex)) || 0;
  
    // Retrieve PBA Grade
    const pbaScores = finalsPBAGradeScores[studentIndex] || [];
    const { pbaGrade } = calculateTotalsAndPBA(pbaScores, finalsPBAGradePercentage);
  
    // Retrieve Midterm Exam Score
    const finalsExamScore = finalsExamScores[students[studentIndex].id]?.score;
  
    // Check for incomplete components
    const isFinalsExamIncomplete = finalsExamScore === undefined;
    if (csGrade === 0 || pbaGrade === 0 || isFinalsExamIncomplete) {
      return "INC"; // Mark as incomplete
    }
  
    // Calculate Weighted Midterm Exam Score
    const finalsExamPercentageScore = calculateFinalPercentage(finalsExamScore);
    const weightedFinalsExamScore = (finalsExamPercentageScore * finalsExamPercentage) / 100;
  
    // Calculate the Total Midterm Grade
    const totalFinalsGrade = csGrade + parseFloat(pbaGrade) + parseFloat(weightedFinalsExamScore);
  
    // Cap the grade at 100 and return the formatted value
    return Math.min(100, totalFinalsGrade).toFixed(2);
  };
  

  //NUMERICAL EQUIVALENT AND REMARKS FOR MIDTERM
  const getMidtermNumericalEquivalentAndRemarks = (studentId, grade, studentIndex) => {
    // If grade is "INC" (incomplete), return as is
    if (grade === "INC") {
      return { numEq: "-", remarks: "INC" };
    }
  
    // Grading logic
    if (grade >= 99 && grade <= 100) return { numEq: "1.00", remarks: "PASSED" };
    if (grade >= 96 && grade < 99) return { numEq: "1.25", remarks: "PASSED" };
    if (grade >= 93 && grade < 96) return { numEq: "1.50", remarks: "PASSED" };
    if (grade >= 90 && grade < 93) return { numEq: "1.75", remarks: "PASSED" };
    if (grade >= 87 && grade < 90) return { numEq: "2.00", remarks: "PASSED" };
    if (grade >= 84 && grade < 87) return { numEq: "2.25", remarks: "PASSED" };
    if (grade >= 81 && grade < 84) return { numEq: "2.50", remarks: "PASSED" };
    if (grade >= 78 && grade < 81) return { numEq: "2.75", remarks: "PASSED" };
    if (grade >= 75 && grade < 78) return { numEq: "3.00", remarks: "PASSED" };
    if (grade < 75) return { numEq: "5.00", remarks: "FAILED" };
  
    // Default case for unexpected input
    return { numEq: "-", remarks: "-" };
  };
  
  //NUMERICAL EQUIVALENT AND REMARKS FOR FINALS
  const getFinalsNumericalEquivalentAndRemarks = (studentId, grade, studentIndex) => {
    // If grade is "INC" (incomplete), return as is
    if (grade === "INC") {
      return { numEq: "-", remarks: "INC" };
    }
  
    // Grading logic
    if (grade >= 99 && grade <= 100) return { numEq: "1.00", remarks: "PASSED" };
    if (grade >= 96 && grade < 99) return { numEq: "1.25", remarks: "PASSED" };
    if (grade >= 93 && grade < 96) return { numEq: "1.50", remarks: "PASSED" };
    if (grade >= 90 && grade < 93) return { numEq: "1.75", remarks: "PASSED" };
    if (grade >= 87 && grade < 90) return { numEq: "2.00", remarks: "PASSED" };
    if (grade >= 84 && grade < 87) return { numEq: "2.25", remarks: "PASSED" };
    if (grade >= 81 && grade < 84) return { numEq: "2.50", remarks: "PASSED" };
    if (grade >= 78 && grade < 81) return { numEq: "2.75", remarks: "PASSED" };
    if (grade >= 75 && grade < 78) return { numEq: "3.00", remarks: "PASSED" };
    if (grade < 75) return { numEq: "5.00", remarks: "FAILED" };
  
    // Default case for unexpected input
    return { numEq: "-", remarks: "-" };
  };
  
  const handleRemarksChange = (studentId, selectedRemark) => {
    setRemarks(prevRemarks => ({
      ...prevRemarks,
      [studentId]: selectedRemark
    }));
  };

  // REMARKS FOR MIDTERM
  const MidtermhasBlankScores = (studentIndex) => {
    // Check for blank attendance scores
    const attendanceScores = midtermAttendanceData[students[studentIndex].id] || [];
    const isAttendanceIncomplete = attendanceScores.some(score => score.status === "Select" || !score.status);
  
    // Check for blank assignment scores
    const isAssignmentIncomplete = midtermAssignmentScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank quiz scores
    const isQuizIncomplete = midtermQuizScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank recitation scores
    const isRecitationIncomplete = midtermRecitationScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank exam scores
    const isMidtermExamIncomplete = midtermExamScores[students[studentIndex].id]?.score === "" || midtermExamScores[students[studentIndex].id]?.score === null || midtermExamScores[students[studentIndex].id]?.score === undefined;
  
    // If any component has blank scores, return true
    return isAttendanceIncomplete || isAssignmentIncomplete || isQuizIncomplete || isRecitationIncomplete || isMidtermExamIncomplete;
  };
  // REMARKS FOR FINALS
  const FinalshasBlankScores = (studentIndex) => {
    // Check for blank attendance scores
    const attendanceScores = finalsAttendanceData[students[studentIndex].id] || [];
    const isAttendanceIncomplete = attendanceScores.some(score => score.status === "Select" || !score.status);
  
    // Check for blank assignment scores
    const isAssignmentIncomplete = finalsAssignmentScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank quiz scores
    const isQuizIncomplete = finalsQuizScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank recitation scores
    const isRecitationIncomplete = finalsRecitationScores[studentIndex]?.some(score => score === "" || score === null || score === undefined);
  
    // Check for blank exam scores
    const isFinalExamIncomplete = finalsExamScores[students[studentIndex].id]?.score === "" || finalsExamScores[students[studentIndex].id]?.score === null || finalsExamScores[students[studentIndex].id]?.score === undefined;
  
    // If any component has blank scores, return true
    return isAttendanceIncomplete || isAssignmentIncomplete || isQuizIncomplete || isRecitationIncomplete || isFinalExamIncomplete;
  };
  


  // Constants for midterm and finals weight
const MIDTERM_WEIGHT = 0.4; // 40%
const FINALS_WEIGHT = 0.6;  // 60%

// Function to calculate the Semestral Grade based on Midterm and Finals Grades
const calculateSemestralGrade = (midtermGrade, finalsGrade) => {
  // Applying weights to midterm and finals grades
  const weightedMidterm = midtermGrade * MIDTERM_WEIGHT;
  const weightedFinals = finalsGrade * FINALS_WEIGHT;

  // Calculating the semestral grade and ensuring it does not exceed 100
  const semestralGrade = Math.min(100, weightedMidterm + weightedFinals);
  return semestralGrade.toFixed(2); // Format to 2 decimal places
};

// Semestral Grade Numerical Equivalent and Remarks Constant
const getSemestralNumericalEquivalentAndRemarks = (studentId, grade, hasBlankScores) => {
  // If there's a manual selection for the student, return the selected remark
  if (remarks[studentId]) {
    return { numEq: "-", remarks: remarks[studentId] };
  }

  // If any component has blank scores, return INC for remarks
  if (hasBlankScores) {
    return { numEq: "-", remarks: "INC" };
  }

  // Otherwise, calculate based on the grade
  if (grade >= 99 && grade <= 100) return { numEq: "1.00", remarks: "PASSED" };
  if (grade >= 96 && grade < 99) return { numEq: "1.25", remarks: "PASSED" };
  if (grade >= 93 && grade < 96) return { numEq: "1.50", remarks: "PASSED" };
  if (grade >= 90 && grade < 93) return { numEq: "1.75", remarks: "PASSED" };
  if (grade >= 87 && grade < 90) return { numEq: "2.00", remarks: "PASSED" };
  if (grade >= 84 && grade < 87) return { numEq: "2.25", remarks: "PASSED" };
  if (grade >= 81 && grade < 84) return { numEq: "2.50", remarks: "PASSED" };
  if (grade >= 78 && grade < 81) return { numEq: "2.75", remarks: "PASSED" };
  if (grade >= 75 && grade < 78) return { numEq: "3.00", remarks: "PASSED" };
  if (grade < 75) return { numEq: "5.00", remarks: "FAILED" };

  return { numEq: "-", remarks: "-" };
};

// Add this function to validate total percentage
const validateTotalPercentage = () => {
  const totalPercentage =
    parseFloat(midtermAttendancePercentage || 0) +
    parseFloat(midtermAssignmentPercentage || 0) +
    parseFloat(midtermQuizPercentage || 0) +
    parseFloat(midtermRecitationPercentage || 0) +
    parseFloat(midtermPBAGradePercentage || 0) +
    parseFloat(midtermExamPercentage || 0);

  if (totalPercentage > 100) {
    toast.error("Total percentage exceeds 100%. Please adjust the inputs.");
    return false;
  }
  return true;
};

// Call this function wherever relevant
const handlePercentageChange = (setter, value) => {
  setter(value);
  validateTotalPercentage();
};
  // useEffect(() => {

    
  // }, [students, classInfo, midtermAttendanceData, finalsAttendanceData, midtermAssignmentScores, finalsAssignmentScores,
  //     midtermQuizScores, finalsQuizScores, midtermRecitationScores, finalsRecitationScores, midtermPBAGradeScores, finalsPBAGradeScores,
  //     midtermExamScores, finalsExamScores
  // ]);
  
  {/* MIDTERMS TAB */}
  const renderTableContent = () => {
    switch (selectedPeriod) {
      case 'midterm':
        return (
          <div>
          <ToastContainer />
          {/* Other components */}
          
          <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
          <table className="details-table" >
            <thead>
              <tr>
              <th colSpan="2" style={{ backgroundColor: '#F6F7C4' }}  className='sticky-style'>Student Info</th>
                <th colSpan={midtermAttendanceColumns.length + 7} className='sticky-header'>Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                <th colSpan={midtermAssignmentColumns.length + 3} rowSpan={3} className='sticky-header'>Assignments</th>
                <th colSpan={midtermQuizColumns.length + 3} rowSpan={2} className='sticky-header'>Quizzes/Seatwork</th> 
                <th colSpan={midtermRecitationColumns.length + 3} rowSpan={3} className='sticky-header'>Recitation/Participation</th>
                <th colSpan="1" rowSpan="3"className='sticky-header'>CS Grade</th>
                <th colSpan={midtermPBAColumns.length + 3} rowSpan={2} className='sticky-header' >Performance Based Assessment</th>
                <th colSpan="3" rowSpan="3" className='sticky-header'>Midterm Exam</th>
                <th colSpan="1" rowSpan="3" className='sticky-header'>Midterm Grade</th>
                <th colSpan="1" rowSpan="4" className='sticky-header'>Numerical Equivalent</th>
                <th colSpan="1" rowSpan="4" className='sticky-header'>Remarks</th>
              </tr>
              
              <tr>
              <th rowSpan={3} style={{ backgroundColor: '#F6F7C4' }} className="sticky-student-no">
                Student No
              </th>
              <th rowSpan={3} style={{ backgroundColor: '#F6F7C4' }}  className="sticky-name">
                Name
              </th>


              {midtermAttendanceColumns.map((column, index) => ( //STATUS: OK
                <th key={index} rowSpan="3" className='sticky-top-left-up'>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                  {index === midtermAttendanceColumns.length - 1 && ( // Show button only for the last column
                    <button
                      disabled = {midtermAttendanceColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                      onClick={() => removeAttendanceColumn(index, setmidtermAttendanceColumns, setmidtermAttendanceData)}
                      style={{ background: 'none', border: 'none', marginRight: '10px' }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  )}
                  <DatePicker
                    selected={column.date}
                    disabled={pendingStatus || currentSemester !== classInfo.semester}
                    onChange={(date) => {
                      const formattedDate = date.toLocaleDateString('en-CA');
                      setmidtermAttendanceColumns((prevColumns) =>
                      prevColumns.map((col, i) => (i === index ? { ...col, date:formattedDate } : col)))}}
                    dateFormat="yyyy-MM-dd"
                    className="custom-datepicker"
                  />
                  </div>
                </th>
              ))}


              <th rowSpan="3" style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 42,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                <button 
                  disabled={midtermAttendanceColumns[midtermAttendanceColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                  onClick={() => addColumn(setmidtermAttendanceColumns)} style={{background: 'none', border: 'none'}}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </th>

              <th colSpan="2" className='sticky-top-left'>No of Days</th>
              <th colSpan="2" className='sticky-top-left'>
                <input
                  disabled={pendingStatus || currentSemester !== classInfo.semester}
                  type="text"
                  style={{ width: '60px', marginLeft: '10px' }}
                  value={midtermTotalAttendanceDays}
                  readOnly
                />
              </th>
              <th colSpan="2" rowSpan="2" className='sticky-top-left'>Attendance</th>
            </tr>
            <tr>
              <th colSpan="4" className='sticky-top-left-offset'>Total Student Attendance</th>
                
                {/* Quiz Columns WITH REMOVE BUTTON */}
                {midtermQuizColumns.map((column, index) => (
                  <th key={index} rowSpan={2} className='sticky-top-left-offset'>
                  <div style={{ display: 'flex', alignItems: 'center' }}> 
                    {index === midtermQuizColumns.length - 1 && ( // Show button only for the last column
                      <button
                        disabled = {midtermQuizColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                        onClick={() => removeQuizColumn(index, setmidtermQuizColumns, setmidtermQuizScores, setmidtermQuizMaxScores)} 
                        style={{ background: 'none', border: 'none', marginRight: '5px' }} // Add margin-right for spacing
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    )}
                  <span>Quiz No. {index + 1}</span> 
                  </div>
                  <input
                    type="number"
                    value={column.max || ""}
                    disabled={pendingStatus || currentSemester !== classInfo.semester}
                    onChange={(e) => {
                      const maxScore = parseFloat(e.target.value) || 0;
                      // Update midtermQuizColumns
                      setmidtermQuizColumns((prevColumns) =>
                        prevColumns.map((col, i) => (i === index ? { ...col, max: maxScore } : col))
                      );
                      // Update midtermQuizMaxScores
                      handleMidtermMaxScoreChange(index, maxScore);
                      // setmidtermQuizScores((prevScores) =>
                      //   prevScores.map((studentScores) =>
                      //     studentScores.map((score, i) => i === index ? 0 : score) // Set only the score at index to 0
                      //   )
                      // );
                    }}
                    style={{ width: '60px' }} // Adjust width as needed
                    placeholder="Items"
                  />
                  </th>
                ))}

              <th rowSpan={2} style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 105,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                          <button
                            disabled={midtermQuizColumns[midtermQuizColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                            onClick={addMidtermQuizColumn} style={{ background: 'none', border: 'none' }}>
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </th>
                    <th rowSpan={2} className='sticky-top-left-offset'>Total</th>
                    <th rowSpan={2} className='sticky-top-left-offset'>
                    <input
                    type="number"
                    disabled={pendingStatus || currentSemester !== classInfo.semester}
                    value={midtermQuizPercentage || ""}
                    onChange={(e) => setmidtermQuizPercentage(e.target.value)}
                    style={{ width: '60px' }}
                  />
                    %</th>
    
                  {/* PBA Columns */}
                  {midtermPBAColumns.map((column, index) => (
                    <th key={index} rowSpan={2} className='sticky-top-left-offset'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {index === midtermPBAColumns.length - 1 && (
                        <button 
                          disabled = {midtermPBAColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                          onClick={() => removeColumn(index, setmidtermPBAColumns)} 
                          style={{ background: 'none', border: 'none', marginRight: '8px' }} // Adjust margin as needed
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                      )}
                      <span>Performance {index + 1}</span> 
                    </div>
                  
                    <select
                      style={{ marginTop: '20px' }}
                      value={column.label || "Select"}
                      disabled={pendingStatus || currentSemester !== classInfo.semester}
                      onChange={(e) => { 
                        const PBA = e.target.value; 
                        setmidtermPBAColumns((prevColumns) =>
                          prevColumns.map((col, i) => (i === index ? { ...col, label: PBA } : col))
                        )
                      }}
                    >
                      <option value="Select">Select</option>
                      <option value="Project">Project</option>
                      <option value="Reports">Reports</option>
                      <option value="Reflection">Reflection</option>
                      <option value="Portfolio">Portfolio</option>
                      <option value="Research">Research</option>
                      <option value="Laboratory">Laboratory</option>
                    </select>
                  </th>
                  ))}
                  <th rowSpan={2} style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 105,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                    <button 
                      disabled={midtermPBAColumns[midtermPBAColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                      onClick={() => addColumn(setmidtermPBAColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th rowSpan={2} className='sticky-top-left-offset'>Total</th>
                  <th className='sticky-top-left-offset'>PBA Grade</th>
                </tr>
                <tr>
              <th colSpan="1" className='sticky-top-left-offset-168'>P</th>
              <th colSpan="1" className='sticky-top-left-offset-168'>L</th>
              <th colSpan="1" className='sticky-top-left-offset-168'>E</th>
              <th colSpan="1" className='sticky-top-left-offset-168'>A</th>
              <th colSpan="2" className='sticky-top-left-offset-168'>
                <input
                  disabled={pendingStatus || currentSemester !== classInfo.semester}
                  type="number"
                  value={midtermAttendancePercentage || ""}
                  onChange={(e) => setmidtermAttendancePercentage(e.target.value)}
                  style={{ width: '60px' }}
                />
                %</th>
    
                {/* Assignment Column Header */}
                {midtermAssignmentColumns.map((_, index) => (
                  <th key={index} className='sticky-top-left-offset-168'>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                  {index === midtermAssignmentColumns.length - 1 && (
                    <button
                      disabled = {midtermAssignmentColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                      onClick={() => removeAssignmentColumn(index, setmidtermAssignmentColumns, setmidtermAssignmentScores)} 
                      style={{ background: 'none', border: 'none', marginRight: '8px' }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  )}
                    Assignment {index + 1}
                  </div>
                </th>
                ))}

                <th style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 168,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                  <button
                    disabled={midtermAssignmentColumns[midtermAssignmentColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                    onClick={() => addColumn(setmidtermAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th className='sticky-top-left-offset-168'> Total</th>
                {/* Use a `td` for the input field */}
                <th className='sticky-top-left-offset-168'>
            <input
              type="number"
              disabled={pendingStatus || currentSemester !== classInfo.semester}
              value={midtermAssignmentPercentage || ""}
              onChange={(e) => setmidtermAssignmentPercentage(e.target.value)}
              style={{ width: '60px' }}
            />%
          </th>
                {/* Recitation Columns */}
                {midtermRecitationColumns.map((_, index) => (
                  <th key={index} className='sticky-top-left-offset-168'>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                  {index === midtermRecitationColumns.length - 1 && (
                    <button
                      disabled = {midtermRecitationColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                      onClick={() => removeAssignmentColumn(index, setmidtermRecitationColumns, setmidtermRecitationScores)} 
                      style={{ background: 'none', border: 'none', marginRight: '8px' }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  )}
                    Recitation {index + 1}
                  </div>
                </th>
                ))}

                <th style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 168,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                  <button
                    disabled={midtermRecitationColumns[midtermRecitationColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                    onClick={() => addColumn(setmidtermRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
                <th className='sticky-top-left-offset-168'>Total</th>
                <th className='sticky-top-left-offset-168'>
                <input
                type="number"
                disabled={pendingStatus || currentSemester !== classInfo.semester}
                value={midtermRecitationPercentage || ""}
                onChange={(e) => setmidtermRecitationPercentage(e.target.value)}
                style={{ width: '60px' }}
              />
                %</th>
                <th className='sticky-top-left-offset-168'>{calculateTotalMidtermCSPercentage()}%</th>


                
    
                <th className='sticky-top-left-offset-168'>
                  <input
                    type="number"
                    disabled={pendingStatus || currentSemester !== classInfo.semester}
                    value={midtermPBAGradePercentage || ""}
                    onChange={(e) => setmidtermPBAGradePercentage(e.target.value)}
                    style={{ width: '60px' }}
                    min="0"
                    max="100"
                  />
                  %
                </th>
                <th className='sticky-top-left-offset-168'>
                <input
                  type="number"
                  disabled={pendingStatus || currentSemester !== classInfo.semester}
                  value={midtermTotalItems || ''}
                  onChange={(e) => setmidtermTotalItems(parseInt(e.target.value) || 0)} // Update total items
                  style={{ width: '60px' }}
                  placeholder="Items"
                />                       
                </th>
                  <th colSpan="2" className='sticky-top-left-offset-168'>
                    <input
                      type="number"
                      disabled={pendingStatus || currentSemester !== classInfo.semester}
                      value={midtermExamPercentage || ""}
                      onChange={(e) => setMidtermExamPercentage(e.target.value)}
                      style={{ width: '60px' }}
                      placeholder="%"
                    />
                    %</th>
              <th className='sticky-top-left-offset-168'>Total</th>
    
              </tr>
            </thead>
            <tbody>
              {students.map((student, studentIndex) => {
                const studentScores = midtermPBAGradeScores[studentIndex] || [];
       
                const { total, pbaGrade } = calculateTotalsAndPBA(studentScores, midtermPBAGradePercentage);
                const score = midtermExamScores[student.id]?.score || 0;
                const percentage = calculateMidtermPercentage(score);
                const weightedScore = calculateMidtermWeightedScore(percentage).toFixed(2);
                const { Atotals, points } = getMidtermAttendanceTotals(student.id);
                const midtermAttendancePercentageScore = getMidtermAttendanceScorePercentage(points);
                const midtermAssignmentComponentScore = calculateMidtermAssignmentComponentScore(student.id, midtermAssignmentPercentage);
                        


                const midtermGrade = calculateMidtermGrade(studentIndex); // Calculate the midterm grade
                const { numEq, remarks: autoRemarks } = getMidtermNumericalEquivalentAndRemarks(student.id, midtermGrade, studentIndex); // Pass studentIndex to check for blank scores

                // Determine row background color based on remarks
                const getRowClass = (remark) => {
                  if (remark === "FAILED") return "row-failed";
                  if (remark === "PASSED") return "row-passed";
                  if (remark === "INC") return "row-inc";
                  if (remark === "Select") return "row-select"; // Highlight with a white color
                  return "";
                };
                
                return (
                  <tr key={student.id} className={getRowClass(autoRemarks)}>
                    <td style={{position: 'sticky',left: 0,backgroundColor: '#F6F7C4',padding: '10px',zIndex: 3,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)',}}className="sticky-student-no">{student.studentNumber || 'Guest'}</td>
                    <td style={{position: 'sticky',left: 73,backgroundColor: '#F6F7C4',padding: '10px', zIndex: 3,whiteSpace: 'nowrap', overflow: 'hidden',   textOverflow: 'ellipsis', }}className="sticky-name">
                      {student.studentLastName || ''}, {student.studentFirstName || ''} {student.studentMiddleName || ''}
                    </td>



                    {midtermAttendanceColumns.map((dateColumn, dateIndex) => (
                      <td key={dateColumn.id}>
                        <select
                          disabled={!dateColumn?.date || pendingStatus || currentSemester !== classInfo.semester}
                          value={dateColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.status || "Select"}
                          onChange={(e) => {handleMidtermAttendanceChange(student.id, student.studentNumber, dateIndex, e.target.value);}}>
                          <option value="Select">Select</option>
                          <option value="P">P</option>
                          <option value="L">L</option>
                          <option value="E">E</option>
                          <option value="A">A</option>
                        </select>
                      </td>
                    ))}

                    <td></td>

                    <td>{Atotals.P}</td> {/* Present count */}
                    <td>{Atotals.L}</td> {/* Late count */}
                    <td>{Atotals.E}</td> {/* Excused count */}
                    <td>{Atotals.A}</td> {/* Absent count */}

                    {/* Check if any attendance status is 'Select' for all dates */}
                    <td>
                      {Object.values(midtermAttendanceData[student.id] || {}).every(
                        (attendance) => attendance.status === 'Select'
                      )
                        ? 0  // Set points to 0 if all statuses are 'Select'
                        : points.toFixed(2)}%
                    </td>

                    <td>
                      {Object.values(midtermAttendanceData[student.id] || {}).every(
                        (attendance) => attendance.status === 'Select'
                      )
                        ? '0.00 %'  // If all are 'Select', attendance is 0%
                        : isNaN(Number(midtermAttendancePercentageScore)) || midtermAttendancePercentageScore === null
                        ? '0.00 %'
                        : `${Number(midtermAttendancePercentageScore).toFixed(2)} %`}
                    </td>


                    {/* ASSIGNMENT COMPONENT: DEFINE midtermAssignmentScores IN INPUT */}
                    {midtermAssignmentColumns.map((assignmentColumn, assignmentIndex) => (
                      <td key={assignmentColumn.id}>
                        <input
                          type="number"
                          disabled={pendingStatus || currentSemester !== classInfo.semester}
                          style={{
                            width: '70px',
                            borderColor: invalidAssignmentScores[student.id]?.[assignmentIndex] ? 'red' : 'initial',
                            borderWidth: invalidAssignmentScores[student.id]?.[assignmentIndex] ? '2px' : '1px',
                          }}
                          placeholder="Score"
                          value={assignmentColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.score || ''}
                          onChange={(e) => {
                            const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); 
                            handleMidtermAssignmentScoreChange(student.id, student.studentNumber, assignmentIndex, inputScore);
                          }}
                          onBlur={(e) => {
                            const inputScore = parseFloat(e.target.value);
                            if (!isNaN(inputScore) && (inputScore < 50 || inputScore > 100)) {
                              toast.error(`Score must be between 50 and 100 for ${student.studentLastName} at Assignment No.${assignmentIndex + 1}`);
                            }
                          }}
                        />
                      </td>
                    ))}

                    <td></td>
                    <td>{calculateMidtermAssignmentColumnAverage(student.id)}%</td> {/* Display average directly */}
                    <td>
                      {isNaN(Number(midtermAssignmentComponentScore)) || midtermAssignmentComponentScore === null
                          ? '0.00%'
                          : `${Number(midtermAssignmentComponentScore).toFixed(2)}%`}
                    </td>



                    {/*QUIZ COMPONENT: DEFINE midtermQuizScores IN INPUT*/}
                    {midtermQuizColumns.map((quizColumn, quizIndex) => (
                      <td key={quizColumn.id}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          disabled={!quizColumn?.max || pendingStatus || currentSemester !== classInfo.semester}
                          value={quizColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.score || ""}
                          onChange={(e) => {
                            const inputScore = parseFloat(e.target.value) || 0;
                            handleMidtermQuizScoreChange(student.id, student.studentNumber, quizIndex, inputScore);
                          }}
                        />
                      </td>
                    ))}

                    <td></td>
                    <td>
                      {/* Check if there are no quiz scores for this student */}
                      {midtermQuizScores[studentIndex]?.every(score => score === 0 || score === undefined) 
                        ? '0.00%'  // If no scores are inputted, show 0%
                        : isNaN(Number(calculateMidtermQuizTotalScore(studentIndex))) || calculateMidtermQuizTotalScore(studentIndex) === null
                        ? '0.00%'  // If the total score is invalid or null, show 0%
                        : `${Number(calculateMidtermQuizTotalScore(studentIndex)).toFixed(2)}%`}   {/* Display total score */}
                    </td>
                    <td>
                      {/* Check if there are no quiz scores for this student */}
                      {midtermQuizScores[studentIndex]?.every(score => score === 0 || score === undefined) 
                        ? '0.00%'  // If no scores are inputted, show 0%
                        : isNaN(Number(calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage))) || 
                          calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage) === null
                        ? '0.00%'  // If the component score is invalid or null, show 0%
                        : `${Number(calculateMidtermQuizComponentScore(studentIndex, midtermQuizPercentage)).toFixed(2)}%`}  {/* Display component score */}
                    </td>


                    
                  {/* RECITATION COMPONENT: DEFINE midtermRecitationScores IN INPUT */}
                  {midtermRecitationColumns.map((recitationColumn, recitationIndex) => (
                      <td key={recitationColumn.id}>
                        <input
                          disabled={pendingStatus || currentSemester !== classInfo.semester}
                          type="number"
                          style={{
                            width: '70px',
                            borderColor: invalidRecitationScores[student.id]?.[recitationIndex] ? 'red' : 'initial',
                            borderWidth: invalidRecitationScores[student.id]?.[recitationIndex] ? '2px' : '1px',
                          }}
                          placeholder="Score"
                          value={recitationColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.score || ''}
                          onChange={(e) => {
                            const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); 
                            handleMidtermRecitationScoreChange(student.id, student.studentNumber, recitationIndex, inputScore);
                          }}
                          onBlur={(e) => {
                            const inputScore = parseFloat(e.target.value);
                            if (!isNaN(inputScore) && (inputScore < 50 || inputScore > 100)) {
                              toast.error(`Score must be between 50 and 100 for ${student.studentLastName} at Recitation No.${recitationIndex + 1}`);
                            }
                          }}
                        />
                      </td>
                  ))}

                  <td></td>
                  <td>{calculateMidtermRecitationColumnAverage(student.id)}%</td>
                  <td>
                    {(() => {
                      const recitationScore = calculateMidtermRecitationComponentScore(student.id, midtermRecitationPercentage);
                      return isNaN(Number(recitationScore)) || recitationScore === null
                        ? '0.00%'
                        : `${Number(recitationScore).toFixed(2)}%`;
                    })()}
                  </td>



                  {/* CLASS STANDING TOTAL: ATTENDANCE + ASSIGN + QUIZSEAT + RECITATION */}
                  <td>
                    {(() => {
                      // Get all the relevant values for the class standing components (attendance, assignments, quizzes, recitation)
                      const totalAttendance = Atotals.P + Atotals.L + Atotals.E + Atotals.A; // Example for attendance
                      const totalAssignment = midtermAssignmentScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for assignments
                      const totalQuiz = midtermQuizScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for quizzes
                      const totalRecitation = midtermRecitationScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for recitation

                      // Check if all fields are 0 or missing
                      const isAllZero = totalAttendance === 0 && totalAssignment === 0 && totalQuiz === 0 && totalRecitation === 0;

                      // If all fields are 0 or missing, don't compute and show '0.00%'
                      if (isAllZero) {
                        return '0.00%';
                      }

                      // Otherwise, compute the total class standing grade
                      const totalCSGrade = calculateTotalMidtermCSGrade(studentIndex);

                      // Return the computed grade, or '0.00%' if invalid
                      return totalCSGrade || '0.00%';
                    })()}%
                  </td>

                  {midtermPBAColumns.map((PBAColumn, PBAIndex) => (
                      <td key={PBAColumn.id}>
                        <input
                          disabled ={!PBAColumn.label || pendingStatus || currentSemester !== classInfo.semester}
                          type="number"
                          style={{
                            width: '70px',
                            borderColor: invalidPBAScores[student.id]?.[PBAIndex] ? 'red' : 'initial',
                            borderWidth: invalidPBAScores[student.id]?.[PBAIndex] ? '2px' : '1px',
                          }}
                          placeholder="Score"
                          value={PBAColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.score || ''}
                          onChange={(e) => {
                            const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); 
                            handleMidtermPBAScoreChange(student.id, student.studentNumber, PBAIndex, inputScore);
                          }}
                          onBlur={(e) => {
                            const inputScore = parseFloat(e.target.value);
                            if (!isNaN(inputScore) && (inputScore < 50 || inputScore > 100)) {
                              toast.error(`Score must be between 50 and 100 for ${student.studentLastName} at Performance No.${PBAIndex + 1}`);
                            }
                          }}
                        />
                      </td>
                  ))}

                  <td></td>
                  <td>{total.toFixed(2)}%</td> {/* This should display the correct average */}
                  <td>
                    {(() => {
                      const formattedPbaGrade = isNaN(Number(pbaGrade)) || pbaGrade === null
                        ? '0.00'
                        : Number(pbaGrade).toFixed(2);
                      return formattedPbaGrade;
                    })()}%
                  </td>




                    {/*MIDTERMS EXAM COMPONENT*/}
                    <td>
                    <input
                      disabled={pendingStatus || currentSemester !== classInfo.semester}
                      type="number"
                      style={{ width: '70px' }}
                      placeholder="Score"
                      value={midtermExamScores[student.id]?.score || ''} // Display the current score or empty
                      onChange={(e) => {
                        const inputScore = parseFloat(e.target.value) || 0;
                        handleMidtermExamScoreChange(student.id, student.studentNumber, inputScore);
                      }}
                    />


                  </td>
                  <td>{isNaN(percentage) ? '0.00' : percentage.toFixed(2)}%</td>
                  <td>
                    {isNaN(Number(weightedScore)) || weightedScore === null
                      ? '0.00'
                      : `${Number(weightedScore).toFixed(2)}`}%
                  </td>


                    {/*MIDTERM GRADE: CLASS STANDING + PBA + MIDTERM EXAM*/}
                    <td>
                      {isNaN(Number(calculateMidtermGrade(studentIndex))) || calculateMidtermGrade(studentIndex) === null
                        ? '0.00'
                        : Number(calculateMidtermGrade(studentIndex)).toFixed(2)}%
                    </td>
                    <td><center>{numEq}</center></td>

                    {/*REMARKS DROP-DOWN*/}
                    <td>
                      <select
                        disabled={pendingStatus || currentSemester !== classInfo.semester}
                        value={remarks[student.id] || autoRemarks} // Use manual selection or default to auto-calculated remarks
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      >
                        <option value="Select">Select</option>
                        <option value="PASSED">PASSED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="OD">OD</option>
                        <option value="UD">UD</option>
                        <option value="INC">INC</option>
                        <option value="NC">NC</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          </div>
      );

      case 'finals':
        return (
          <div>
            <ToastContainer />
            <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
            <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                <th colSpan="2" style={{ backgroundColor: '#F6F7C4' }}  className='sticky-style'>Student Info</th>
                  <th colSpan={finalsAttendanceColumns.length + 7} className='sticky-header'>Attendance (P-Present; L-Late; E-Excuse; A-Absent)</th>
                  <th colSpan={finalsAssignmentColumns.length + 3} rowSpan={3} style={{ padding: '60px' }} className='sticky-header' >Assignments</th>
                  <th colSpan={finalsQuizColumns.length + 3} rowSpan={2} className='sticky-header'>Quizzes/Seatwork</th> {/* New column header */}
                  <th colSpan={finalsRecitationColumns.length + 3} rowSpan={3} className='sticky-header'>Recitation/Participation</th>
                  <th colSpan="1" rowSpan="3"className='sticky-header'>CS Grade</th>
                  <th colSpan={finalsPBAColumns.length + 3} rowSpan={2} className='sticky-header'>Performance Based Assessment</th>
                  <th colSpan="3" rowSpan="3" className='sticky-header'>Final Exam</th>
                  <th colSpan="1" rowSpan="3" className='sticky-header'>Final Grade</th>
                  <th colSpan="1" rowSpan="4" className='sticky-header'>Numerical Equivalent</th>
                  <th colSpan="1" rowSpan="4" className='sticky-header'>Remarks</th>
                </tr>
                
                <tr>
                <th rowSpan={3} style={{ backgroundColor: '#F6F7C4' }}  className="sticky-student-no">
                  Student No
                </th>
                <th rowSpan={3} style={{ backgroundColor: '#F6F7C4' }} className="sticky-name">
                  Name
                </th>
                {finalsAttendanceColumns.map((column, index) => (
                  <th key={index} rowSpan="3" className='sticky-top-left-up'>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                  {index === finalsAttendanceColumns.length - 1 && ( // Show button only for the last column
                    <button
                      disabled = {finalsAttendanceColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                      onClick={() => removeAttendanceColumn(index, setfinalsAttendanceColumns, setfinalsAttendanceData)}
                      style={{ background: 'none', border: 'none', marginRight: '10px' }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  )}
                  <DatePicker
                    disabled={pendingStatus || currentSemester !== classInfo.semester}
                    selected={column.date}
                    onChange={(date) => {
                      const formattedDate = date.toLocaleDateString('en-CA');
                      setfinalsAttendanceColumns((prevColumns) =>
                      prevColumns.map((col, i) => (i === index ? { ...col, date:formattedDate } : col)))}}
                    dateFormat="yyyy-MM-dd"
                    className="custom-datepicker"
                  />
                  </div>
                  </th>
                ))}
  
                <th rowSpan="3" style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 42,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                  <button
                    disabled={finalsAttendanceColumns[finalsAttendanceColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                    onClick={() => addColumn(setfinalsAttendanceColumns)} style={{ background: 'none', border: 'none' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </th>
  
                <th colSpan="2" className='sticky-top-left'>No of Days</th>
                <th colSpan="2" className='sticky-top-left'>
                  <input
                    disabled={pendingStatus || currentSemester !== classInfo.semester}
                    type="text"
                    style={{ width: '60px', marginLeft: '10px' }}
                    value={finalsTotalAttendanceDays}
                    readOnly
                  />
                </th>
                <th colSpan="2" rowSpan="2" className='sticky-top-left'>Attendance</th>
              </tr>
              <tr>
                <th colSpan="4" className='sticky-top-left-offset'>Total Student Attendance</th>
                  
                  {/* Quiz Columns WITH REMOVE BUTTON */}
                  {finalsQuizColumns.map((column, index) => (
                    <th key={index} rowSpan={2} className='sticky-top-left-offset'>
                    <div style={{ display: 'flex', alignItems: 'center' }}> 
                      {index === finalsQuizColumns.length - 1 && ( // Show button only for the last column
                        <button
                          disabled = {finalsQuizColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                          onClick={() => removeQuizColumn(index, setfinalsQuizColumns, setfinalsQuizScores, setfinalsQuizMaxScores)} 
                          style={{ background: 'none', border: 'none', marginRight: '5px' }} // Add margin-right for spacing
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                      )}
                    <span>Quiz No. {index + 1}</span> 
                    </div>
                    <input
                      disabled={pendingStatus || currentSemester !== classInfo.semester}
                      type="number"
                      value={column.max || ""}
                      onChange={(e) => {
                        const maxScore = parseFloat(e.target.value) || 0;
                        // Update finalsQuizColumns
                        setfinalsQuizColumns((prevColumns) =>
                          prevColumns.map((col, i) => (i === index ? { ...col, max: maxScore } : col))
                        );
                        // Update finalsQuizMaxScores
                        handleFinalsMaxScoreChange(index, maxScore);
                      }}
                      style={{ width: '60px' }} // Adjust width as needed
                      placeholder="Items"
                    />
                    </th>
                  ))}
                <th rowSpan={2} style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 105,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                            <button
                              disabled={finalsQuizColumns[finalsQuizColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                              onClick={addFinalQuizColumn} style={{ background: 'none', border: 'none' }}>
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </th>
                      <th rowSpan={2} className='sticky-top-left-offset'>Total</th>
                      <th rowSpan={2} className='sticky-top-left-offset'>
                      <input
                        disabled={pendingStatus || currentSemester !== classInfo.semester}
                      type="number"
                      value={finalsQuizPercentage || ""}
                    onChange={(e) => setfinalsQuizPercentage(e.target.value)}
                      style={{ width: '60px' }}
                    />
                      %</th>
      
                    {/* PBA Columns */}
                    {finalsPBAColumns.map((column, index) => (
                    <th key={index} rowSpan={2} className='sticky-top-left-offset'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {index === finalsPBAColumns.length - 1 && (
                        <button
                          disabled = {finalsPBAColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                          onClick={() => removeColumn(index, setfinalsPBAColumns)} 
                          style={{ background: 'none', border: 'none', marginRight: '8px' }} // Adjust margin as needed
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                      )}
                      <span>Performance {index + 1}</span> 
                    </div>
                  
                    <select
                      disabled={pendingStatus || currentSemester !== classInfo.semester}
                      style={{ marginTop: '20px' }}
                      value={column.label || "Select"}
                      onChange={(e) => { 
                        const PBA = e.target.value; 
                        setfinalsPBAColumns((prevColumns) =>
                          prevColumns.map((col, i) => (i === index ? { ...col, label: PBA } : col))
                        )
                      }}
                    >
                      <option value="Select">Select</option>
                      <option value="Project">Project</option>
                      <option value="Reports">Reports</option>
                      <option value="Reflection">Reflection</option>
                      <option value="Portfolio">Portfolio</option>
                      <option value="Research">Research</option>
                      <option value="Laboratory">Laboratory</option>
                    </select>
                  </th>
                    ))}
                    <th rowSpan={2} style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 105,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                      <button 
                        disabled={finalsPBAColumns[finalsPBAColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                        onClick={() => addColumn(setfinalsPBAColumns)} style={{ background: 'none', border: 'none' }}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </th>
                    <th rowSpan={2} className='sticky-top-left-offset'>Total</th>
                    <th className='sticky-top-left-offset'>PBA Grade</th>
                  </tr>
                  <tr>
                <th colSpan="1" className='sticky-top-left-offset-168'>P</th>
                <th colSpan="1" className='sticky-top-left-offset-168'>L</th>
                <th colSpan="1" className='sticky-top-left-offset-168'>E</th>
                <th colSpan="1" className='sticky-top-left-offset-168'>A</th>
                <th colSpan="2" className='sticky-top-left-offset-168'>
                  <input
                    disabled={pendingStatus || currentSemester !== classInfo.semester}
                    type="number"
                    value={finalsAttendancePercentage || ""}
                    onChange={(e) => setfinalsAttendancePercentage(e.target.value)}
                    style={{ width: '60px' }}
                  />
                  %</th>
      
                  {/* Assignment Column Header */}
                  {finalsAssignmentColumns.map((_, index) => (
                    <th key={index} className='sticky-top-left-offset-168'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    {index === finalsAssignmentColumns.length - 1 && (
                      <button
                        disabled = {finalsAssignmentColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                        onClick={() => removeAssignmentColumn(index, setfinalsAssignmentColumns, setfinalsAssignmentScores)} 
                        style={{ background: 'none', border: 'none', marginRight: '8px' }}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    )}
                      Assignment {index + 1}
                    </div>
                    </th>
                  ))}

                  <th style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 168,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                    <button
                      disabled={finalsAssignmentColumns[finalsAssignmentColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                      onClick={() => addColumn(setfinalsAssignmentColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th className='sticky-top-left-offset-168'>Total</th>
                  {/* Use a `td` for the input field */}
                  <th className='sticky-top-left-offset-168'>
              <input
                disabled={pendingStatus || currentSemester !== classInfo.semester}
                type="number"
                value={finalsAssignmentPercentage || ""}
                onChange={(e) => setfinalsAssignmentPercentage(e.target.value)}
                style={{ width: '60px' }}
              />%
            </th>
                  {/* Recitation Columns */}
                  {finalsRecitationColumns.map((_, index) => (
                  <th key={index} className='sticky-top-left-offset-168'>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                  {index === finalsRecitationColumns.length - 1 && (
                    <button
                      disabled = {finalsRecitationColumns.length === 1 || pendingStatus || currentSemester !== classInfo.semester}
                      onClick={() => removeAssignmentColumn(index, setfinalsRecitationColumns, setfinalsRecitationScores)} 
                      style={{ background: 'none', border: 'none', marginRight: '8px' }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  )}
                    Recitation {index + 1}
                  </div>
                </th>
                ))}
                  <th style={{ background: '#d1e7dd', position: 'sticky',left: 0,top: 168,padding: '0px',zIndex: 1,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)', }}>
                    <button
                      disabled={finalsRecitationColumns[finalsRecitationColumns.length - 1]?.grade.length === 0 || pendingStatus || currentSemester !== classInfo.semester}
                      onClick={() => addColumn(setfinalsRecitationColumns)} style={{ background: 'none', border: 'none' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </th>
                  <th className='sticky-top-left-offset-168'>Total</th>
                  <th className='sticky-top-left-offset-168'>
                  <input
                    disabled={pendingStatus || currentSemester !== classInfo.semester}
                  type="number"
                  value={finalsRecitationPercentage || ""}
                  onChange={(e) => setfinalsRecitationPercentage(e.target.value)}
                  style={{ width: '60px' }}
                />
                  %</th>
                  <th className='sticky-top-left-offset-168'>{calculateTotalFinalsCSPercentage()}%</th>
      
                  
      
                  <th className='sticky-top-left-offset-168'>
                    <input
                      disabled={pendingStatus || currentSemester !== classInfo.semester}
                      type="number"
                      value={finalsPBAGradePercentage || ""}
                      onChange={(e) => setfinalsPBAGradePercentage(parseFloat(e.target.value) || 0)}
                      style={{ width: '60px' }}
                      min="0"
                      max="100"
                    />
                    %
                  </th>
                  <th className='sticky-top-left-offset-168'>
                      <input
                        type="number"
                        disabled={pendingStatus || currentSemester !== classInfo.semester}
                        value={finalsTotalItems || ''}
                        onChange={(e) => setfinalsTotalItems(parseInt(e.target.value) || 0)}
                        style={{ width: '70px' }}
                        placeholder="Items"
                      />
                  </th>
                    <th colSpan="2" className='sticky-top-left-offset-168'>
                      <input
                        disabled={pendingStatus || currentSemester !== classInfo.semester}
                        type="number"
                        value={finalsExamPercentage || ""}
                        onChange={(e) => setfinalsExamPercentage(e.target.value)}
                        style={{ width: '60px' }}
                        placeholder="%"
                      />
                      %</th>
                <th className='sticky-top-left-offset-168'>Total</th>
      
                </tr>
              </thead>
  
  
              <tbody>
                {students.map((student, studentIndex) => {
                  const studentScores = finalsPBAGradeScores[studentIndex] || [];
         
                  const { total, pbaGrade } = calculateTotalsAndPBA(studentScores, finalsPBAGradePercentage);
                  const score = finalsExamScores[student.id]?.score || 0;
                  const percentage = calculateFinalPercentage(score);
                  const weightedScore = calculateFinalWeightedScore(percentage).toFixed(2);
                  const { Atotals, points } = getFinalsAttendanceTotals(student.id);
                  const finalsAttendancePercentageScore = getFinalsAttendanceScorePercentage(points); 
                  const midtermGrade = calculateFinalsGrade(studentIndex); // Calculate the midterm grade
                  const { numEq, remarks: autoRemarks } = getFinalsNumericalEquivalentAndRemarks(student.id, midtermGrade, studentIndex); // Pass studentIndex to check for blank scores


                    // Determine row background color based on remarks
                    const getRowClass = (remark) => {
                      if (remark === "FAILED") return "row-failed";
                      if (remark === "PASSED") return "row-passed";
                      if (remark === "INC") return "row-inc";
                      if (remark === "Select") return "row-select"; // Highlight with a white color
                      return "";
                    };
                              

                return (
                  <tr key={student.id} className={getRowClass(autoRemarks)}>
                    <td style={{position: 'sticky',left: 0,backgroundColor: '#F6F7C4',padding: '10px',zIndex: 3,boxShadow: '1px 0 0 rgba(0, 0, 0, 0.1)',}}className="sticky-student-no">{student.studentNumber || 'Guest'}</td>
                    <td style={{position: 'sticky',left: 73,backgroundColor: '#F6F7C4',padding: '10px', zIndex: 3,whiteSpace: 'nowrap', overflow: 'hidden',  textOverflow: 'ellipsis', }}className="sticky-name">
                      {student.studentNameLast || ''}, {student.studentNameFirst || ''} {student.studentNameMiddle || ''}
                    </td>

                    {finalsAttendanceColumns.map((dateColumn, dateIndex) => (
                      <td key={dateColumn.id}>
                        <select
                          disabled={!dateColumn?.date || pendingStatus || currentSemester !== classInfo.semester}
                          value={dateColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.status || "Select"}
                          onChange={(e) => {handleFinalsAttendanceChange(student.id, student.studentNumber, dateIndex, e.target.value);}}>
                          <option value="Select">Select</option>
                          <option value="P">P</option>
                          <option value="L">L</option>
                          <option value="E">E</option>
                          <option value="A">A</option>
                        </select>
                      </td>
                    ))}
  
                    <td></td>
  
                    <td>{Atotals.P}</td> {/* Present count */}
                    <td>{Atotals.L}</td> {/* Late count */}
                    <td>{Atotals.E}</td> {/* Excused count */}
                    <td>{Atotals.A}</td> {/* Absent count */}
  
                    {/* Check if any attendance status is 'Select' for all dates */}
                    <td>
                      {Object.values(finalsAttendanceData[student.id] || {}).every(
                        (attendance) => attendance.status === 'Select'
                      )
                        ? 0  // Set points to 0 if all statuses are 'Select'
                        : points.toFixed(2)}%  {/* Otherwise, display the points */}
                    </td>

                    <td>
                      {Object.values(finalsAttendanceData[student.id] || {}).every(
                        (attendance) => attendance.status === 'Select'
                      )
                        ? '0.00 %'  // If all are 'Select', attendance is 0%
                        : isNaN(Number(finalsAttendancePercentageScore)) || finalsAttendancePercentageScore === null
                        ? '0.00 %'
                        : `${Number(finalsAttendancePercentageScore).toFixed(2)} %`}
                    </td>

                      
  

                    {/* ASSIGNMENT COMPONENT: DEFINE finalsAssignmentScores IN INPUT */}
                    {finalsAssignmentColumns.map((assignmentColumn, assignmentIndex) => (//UNRESOLVED
                      <td key={assignmentColumn.id}>
                        <input
                          disabled={pendingStatus || currentSemester !== classInfo.semester}
                          type="number"
                          style={{
                            width: '70px',
                            borderColor: finalsinvalidAssignmentScores[student.id]?.[assignmentIndex] ? 'red' : 'initial',
                            borderWidth: finalsinvalidAssignmentScores[student.id]?.[assignmentIndex] ? '2px' : '1px',
                          }}
                          placeholder="Score"
                          value={assignmentColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.score || ''}
                          onChange={(e) => {
                            const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); 
                            handleFinalAssignmentScoreChange(student.id, student.studentNumber, assignmentIndex, inputScore);
                          }}
                          onBlur={(e) => {
                            const inputScore = parseFloat(e.target.value);
                            if (!isNaN(inputScore) && (inputScore < 50 || inputScore > 100)) {
                              toast.error(`Score must be between 50 and 100 for ${student.studentLastName} at Assignment No.${assignmentIndex + 1}`);
                            }
                          }}
                        />
                      </td>
                    ))}

                    <td></td>
                    <td>{calculateFinalsAssignmentColumnAverage(student.id)}%</td> 
                    <td>
                      {(() => {
                        const assignmentScore = calculateFinalsAssignmentComponentScore(student.id, finalsAssignmentPercentage);
                        return isNaN(Number(assignmentScore)) || assignmentScore === null
                          ? '0.00%'
                          : `${Number(assignmentScore).toFixed(2)}%`;
                      })()}
                    </td>

    
                    {finalsQuizColumns.map((quizColumn, quizIndex) => (
                      <td key={quizColumn.id}>
                        <input
                          type="number"
                          style={{ width: '70px' }}
                          placeholder="Score"
                          disabled={!quizColumn?.max || pendingStatus || currentSemester !== classInfo.semester}
                          value={quizColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.score || ""}
                          onChange={(e) => {
                            const inputScore = parseFloat(e.target.value) || 0;
                            handleFinalsQuizScoreChange(student.id, student.studentNumber, quizIndex, inputScore);
                          }}
                        />
                      </td>
                    ))}

                    <td></td>
                    <td>
                      
                      {finalsQuizScores[studentIndex]?.every(score => score === 0 || score === undefined) 
                        ? '0.00%'  // If no scores are inputted, show 0%
                        : isNaN(Number(calculateFinalsQuizTotalScore(studentIndex))) || calculateFinalsQuizTotalScore(studentIndex) === null
                        ? '0.00%'  // If the total score is invalid or null, show 0%
                        : `${Number(calculateFinalsQuizTotalScore(studentIndex)).toFixed(2)}%`}  {/* Display total score */}
                    </td>
                    <td>
                      {/* Check if there are no quiz scores for this student */}
                      {finalsQuizScores[studentIndex]?.every(score => score === 0 || score === undefined) 
                        ? '0.00%'  // If no scores are inputted, show 0%
                        : isNaN(Number(calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage))) || 
                          calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage) === null
                        ? '0.00%'  // If the component score is invalid or null, show 0%
                        : `${Number(calculateFinalsQuizComponentScore(studentIndex, finalsQuizPercentage)).toFixed(2)}%`}  {/* Display component score */}
                    </td>

                    {/* RECITATION COMPONENT: DEFINE midtermRecitationScores IN INPUT */}
                    {finalsRecitationColumns.map((recitationColumn, recitationIndex) => (
                      <td key={recitationColumn.id}>
                        <input
                          disabled={pendingStatus || currentSemester !== classInfo.semester}
                          type="number"
                          style={{
                            width: '70px',
                            borderColor: finalsinvalidRecitationScores[student.id]?.[recitationIndex] ? 'red' : 'initial',
                            borderWidth: finalsinvalidRecitationScores[student.id]?.[recitationIndex] ? '2px' : '1px',
                          }}
                          placeholder="Score"
                          value={recitationColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.score || ''}
                          onChange={(e) => {
                            const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); 
                            handleFinalsRecitationScoreChange(student.id, student.studentNumber, recitationIndex, inputScore);
                          }}
                          onBlur={(e) => {
                            const inputScore = parseFloat(e.target.value);
                            if (!isNaN(inputScore) && (inputScore < 50 || inputScore > 100)) {
                              toast.error(`Score must be between 50 and 100 for ${student.studentLastName} at Recitation No.${recitationIndex + 1}`);
                            }
                          }}
                        />
                      </td>
                    ))}
                  <td></td>
                  <td>{calculateFinalsRecitationColumnAverage(student.id)}%</td>
                  <td>
                    {(() => {
                      const recitationScore = calculateFinalsRecitationComponentScore(student.id, finalsRecitationPercentage);
                      return isNaN(Number(recitationScore)) || recitationScore === null
                        ? '0.00%'
                        : `${Number(recitationScore).toFixed(2)}%`;
                    })()}
                  </td>

                    {/* CLASS STANDING TOTAL: ATTENDANCE + ASSIGN + QUIZSEAT + RECITATION */}
                    <td>
                    {(() => {
                      // Get all the relevant values for the class standing components (attendance, assignments, quizzes, recitation)
                      const totalAttendance = Atotals.P + Atotals.L + Atotals.E + Atotals.A; // Example for attendance
                      const totalAssignment = finalsAssignmentScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for assignments
                      const totalQuiz = finalsQuizScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for quizzes
                      const totalRecitation = finalsRecitationScores[studentIndex]?.reduce((sum, score) => sum + score, 0) || 0; // Example for recitation

                      // Check if all fields are 0 or missing
                      const isAllZero = totalAttendance === 0 && totalAssignment === 0 && totalQuiz === 0 && totalRecitation === 0;

                      // If all fields are 0 or missing, don't compute and show '0.00%'
                      if (isAllZero) {
                        return '0.00%';
                      }

                      // Otherwise, compute the total class standing grade
                      const totalCSGrade = calculateTotalFinalsCSGrade(studentIndex);

                      // Return the computed grade, or '0.00%' if invalid
                      return totalCSGrade || '0.00%';
                    })()}%
                  </td>      

                  {finalsPBAColumns.map((PBAColumn, PBAIndex) => (
                      <td key={PBAColumn.id}>
                        <input
                          disabled ={!PBAColumn.label || pendingStatus || currentSemester !== classInfo.semester}
                          type="number"
                          style={{
                            width: '70px',
                            borderColor: finalsinvalidPBAScores[student.id]?.[PBAIndex] ? 'red' : 'initial',
                            borderWidth: finalsinvalidPBAScores[student.id]?.[PBAIndex] ? '2px' : '1px',
                          }}
                          placeholder="Score"
                          value={PBAColumn?.grade?.find((entry) => entry.studentNumber === student.studentNumber)?.score || ''}
                          onChange={(e) => {
                            const inputScore = e.target.value === '' ? null : parseFloat(e.target.value); 
                            handleFinalsPBAScoreChange(student.id, student.studentNumber, PBAIndex, inputScore);
                          }}
                          onBlur={(e) => {
                            const inputScore = parseFloat(e.target.value);
                            if (!isNaN(inputScore) && (inputScore < 50 || inputScore > 100)) {
                              toast.error(`Score must be between 50 and 100 for ${student.studentLastName} at Performance No.${PBAIndex + 1}`);
                            }
                          }}
                        />
                      </td>
                  ))}

                  <td></td>
                  <td>{total.toFixed(2)}%</td> {/* This should display the correct average */}
                  <td>
                    {(() => {
                      const formattedPbaGrade = isNaN(Number(pbaGrade)) || pbaGrade === null
                        ? '0.00'
                        : Number(pbaGrade).toFixed(2);
                      return formattedPbaGrade;
                    })()}%
                  </td>

                    {/*FINALS EXAM COMPONENT*/}
                  <td>
                    <input
                      disabled={pendingStatus || currentSemester !== classInfo.semester}
                      type="number"
                      value={finalsExamScores[student.id]?.score || ''}  // Ensure score is either the current value or an empty string
                      style={{ width: '70px' }}
                      placeholder="Score"
                      onChange={(e) => {
                        const inputScore = parseFloat(e.target.value) || 0;
                        handleFinalsExamScoreChange(student.id, student.studentNumber, inputScore)}}  // Avoid defaulting to 0
                    />

                  </td>
                  <td>{isNaN(percentage) ? '0.00' : percentage.toFixed(2)}%</td>
                  <td>
                    {isNaN(Number(weightedScore)) || weightedScore === null
                      ? '0.00%'
                      : `${Number(weightedScore).toFixed(2)}`}%
                  </td>
  
                    {/*MIDTERM GRADE: CLASS STANDING + PBA + MIDTERM EXAM*/}
                    <td>
                      {isNaN(Number(calculateFinalsGrade(studentIndex))) || calculateFinalsGrade(studentIndex) === null
                        ? '0.00'
                        : Number(calculateFinalsGrade(studentIndex)).toFixed(2)}%
                    </td>
                    <td><center>{numEq}</center></td>
  
                      {/*REMARKS DROP-DOWN*/}
                      <td>
                        <select
                          disabled={pendingStatus || currentSemester !== classInfo.semester}
                          value={remarks[student.id] || autoRemarks} // Use manual selection or default to auto-calculated remarks
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        >
                          <option value="Select">Select</option>
                          <option value="PASSED">PASSED</option>
                          <option value="FAILED">FAILED</option>
                          <option value="OD">OD</option>
                          <option value="UD">UD</option>
                          <option value="INC">INC</option>
                          <option value="NC">NC</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
          );
  
      

          case 'summary':
            return (
              <table className="details-table">
                <thead>
                  <tr>
                    <th rowSpan="2">Student No</th>
                    <th rowSpan="2">Student Name</th>
                    <th colSpan="4">Midterm 40%</th>
                    <th colSpan="4">Finals 60%</th>
                    <th rowSpan="2">Semestral Grade</th>
                    <th rowSpan="2">Numerical Equivalent</th>
                    <th rowSpan="2">Remarks</th>
                  </tr>
                  <tr>
                    <th>Class Standing {calculateTotalMidtermCSPercentage()}%</th> {/* working */}
                    <th>Performance Based Assessment {midtermPBAGradePercentage}%</th> {/* working */}
                    <th>Midterm Exam {midtermExamPercentage}%</th>
                    <th>Midterm Grade</th>
                    <th>Class Standing {calculateTotalFinalsCSPercentage()}%</th> {/* working */}
                    <th>Performance Based Assessment {finalsPBAGradePercentage}%</th>
                    <th>Final Exam {finalsExamPercentage}%</th>
                    <th>Final Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, studentIndex) => (
                    <tr key={student.id} >
                      <td>{student.studentNumber || 'Guest'}</td>
                      <td>
                        {`${student.studentLastName || ''}, ${student.studentFirstName || ''} ${student.studentMiddleName || ''}`}
                      </td>

                      <td>
                        {isNaN(Number(calculateTotalMidtermCSGrade(studentIndex))) || calculateTotalMidtermCSGrade(studentIndex) === null || calculateTotalMidtermCSGrade(studentIndex) === 0
                          ? ''
                          : `${Number(calculateTotalMidtermCSGrade(studentIndex)).toFixed(2)}%`}
                      </td>
                      <td>
                        {(() => {
                          const pbaGrade = calculateTotalsAndPBA(midtermPBAGradeScores[studentIndex], midtermPBAGradePercentage).pbaGrade;
                          return isNaN(Number(pbaGrade)) || pbaGrade === null || pbaGrade === 0 ? '' : `${Number(pbaGrade).toFixed(2)}%`;
                        })()}
                      </td>
                      <td>
                        {isNaN(Number(calculateMidtermWeightedScore(calculateMidtermPercentage(midtermExamScores[student.id]?.score)))) || 
                        calculateMidtermWeightedScore(calculateMidtermPercentage(midtermExamScores[student.id]?.score)) === null
                          ? ''
                          : `${Number(calculateMidtermWeightedScore(calculateMidtermPercentage(midtermExamScores[student.id]?.score))).toFixed(2)}%`}
                      </td>
                      <td>
                        <strong>
                        {isNaN(Number(calculateMidtermGrade(studentIndex))) || calculateMidtermGrade(studentIndex) === null || calculateMidtermGrade(studentIndex) === 0
                          ? ''
                          : `${Number(calculateMidtermGrade(studentIndex)).toFixed(2)}%`}
                        </strong>
                      </td>
                      <td>
                        {isNaN(Number(calculateTotalFinalsCSGrade(studentIndex))) || calculateTotalFinalsCSGrade(studentIndex) === null || calculateTotalFinalsCSGrade(studentIndex) === 0
                          ? ''
                          : `${Number(calculateTotalFinalsCSGrade(studentIndex)).toFixed(2)}%`}
                      </td>
                      <td>
                        {(() => {
                          const pbaGrade = calculateTotalsAndPBA(finalsPBAGradeScores[studentIndex], finalsPBAGradePercentage).pbaGrade;
                          return isNaN(Number(pbaGrade)) || pbaGrade === null || pbaGrade === 0 ? '' : `${Number(pbaGrade).toFixed(2)}%`;
                        })()}
                      </td>
                      <td>
                        {isNaN(Number(calculateFinalWeightedScore(calculateFinalPercentage(finalsExamScores[student.id]?.score)))) || 
                        calculateFinalWeightedScore(calculateFinalPercentage(finalsExamScores[student.id]?.score)) === null
                          ? ''
                          : `${Number(calculateFinalWeightedScore(calculateFinalPercentage(finalsExamScores[student.id]?.score))).toFixed(2)}%`}
                      </td>
                      <td>
                        <strong>
                        {isNaN(Number(calculateFinalsGrade(studentIndex))) || calculateFinalsGrade(studentIndex) === null || calculateFinalsGrade(studentIndex) === 0
                          ? ''
                          : `${Number(calculateFinalsGrade(studentIndex)).toFixed(2)}%`}
                        </strong>
                      </td>
                      <td>
                        {isNaN(Number(calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)))) || 
                        calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)) === null || 
                        calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)) === 0
                          ? ''
                          : `${Number(calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex))).toFixed(2)}%`}
                      </td>
                      <td>
                        <strong>
                          {(() => {
                          const { numEq } = getSemestralNumericalEquivalentAndRemarks(
                            student.id,
                            calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                            MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                          );
                          return isNaN(Number(numEq)) || numEq === null || numEq === 0 ? '' : numEq;
                        })()}
                        </strong>
                      </td>
                      <td>
                        <strong>
                        {(() => {
                          const { remarks } = getSemestralNumericalEquivalentAndRemarks(
                            student.id,
                            calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                            MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                          );
                          return remarks || '';
                        })()}
                        </strong>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            );

        
            case 'gradeSheet':
              return (
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Student No</th>
                      <th>Student Name</th>
                      <th>Midterm Grade 40%</th>
                      <th>Final Grade 60%</th>
                      <th>Semestral Grade</th>
                      <th>Numerical Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, studentIndex) => (
                    <tr key={student.id}>
                    <td>{student.studentNumber || 'Guest'}</td>
                    <td>
                      {student.studentLastName || ''}, {student.studentFirstName || ''} {student.studentMiddleName || ''}
                    </td>

                    {/* Midterm Grade */}
                    <td>
                      {isNaN(Number(calculateMidtermGrade(studentIndex))) || calculateMidtermGrade(studentIndex) === null || calculateMidtermGrade(studentIndex) === 0
                        ? ''
                        : `${Number(calculateMidtermGrade(studentIndex)).toFixed(2)}`}
                    </td>

                    {/* Final Grade */}
                    <td>
                      {isNaN(Number(calculateFinalsGrade(studentIndex))) || calculateFinalsGrade(studentIndex) === null || calculateFinalsGrade(studentIndex) === 0
                        ? ''
                        : `${Number(calculateFinalsGrade(studentIndex)).toFixed(2)}`}
                    </td>

                    {/* Semestral Grade */}
                    <td>
                      {isNaN(Number(calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)))) || 
                      calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)) === null || 
                      calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)) === 0
                        ? ''
                        : `${Number(calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex))).toFixed(2)}`}
                    </td>

                    {/* Numerical Grade */}
                    <td>
                      <strong>
                      {(() => {
                        const { numEq } = getSemestralNumericalEquivalentAndRemarks(
                          student.id,
                          calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                          MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                        );
                        return isNaN(Number(numEq)) || numEq === null || numEq === 0 ? '' : numEq;
                      })()}
                      </strong>
                    </td>

                    {/* Remarks */}
                    <td>
                      <strong>
                      {(() => {
                        const { remarks } = getSemestralNumericalEquivalentAndRemarks(
                          student.id,
                          calculateSemestralGrade(calculateMidtermGrade(studentIndex), calculateFinalsGrade(studentIndex)),
                          MidtermhasBlankScores(studentIndex) || FinalshasBlankScores(studentIndex)
                        );
                        return remarks || '';
                      })()}
                      </strong>
                    </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            
        default:
          return <p>Please select a period.</p>;
      }
    };

    return (
      <Container fluid className="bg-white pt-4 px-3 pb-3 rounded">
        <div class="mt-4 mx-auto alert alert-warning text-center px-auto" role="alert">
    <span className='fw-bold fs-6'>Note: </span> The class details page enables professors to record student performance, including attendance, quizzes, PBAs, midterms, and finals, with an automated grade sheet and summary.
</div>

        <div
          className="buttons-container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Left Section: Period Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              className={`period-button bg-custom-color-green-btn   ${selectedPeriod === 'midterm' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('midterm')}
            >
              Midterm
            </Button>
            <Button
              className={`period-button bg-custom-color-green-btn  ${selectedPeriod === 'finals' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('finals')}
            >
              Finals
            </Button>
            <Button
              className={`period-button bg-custom-color-green-btn  ${selectedPeriod === 'summary' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('summary')}
            >
              Summary
            </Button>
            <Button
              className={`period-button bg-custom-color-green-btn  ${selectedPeriod === 'gradeSheet' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('gradeSheet')}
            >
              Grade Sheet
            </Button>
          </div>
    
          {/* Right Section: Menu Dropdown */}
          <div>
          <Dropdown className="custom-dropdown">
            <Dropdown.Toggle
              variant="link"
              id="dropdown-basic"
              style={{
                background: 'none',
                border: 'none',
                color: '#004d00',
              }}
            >
              <FontAwesomeIcon icon={faBars} size="lg" />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {selectedPeriod === 'midterm' || selectedPeriod === 'finals' ? (
                <>
                  <Dropdown.Item onClick={handleImport}>IMPORT</Dropdown.Item>
                  <Dropdown.Item onClick={handleExport}>EXPORT</Dropdown.Item>
                </>
              ) : selectedPeriod === 'summary' || selectedPeriod === 'gradeSheet' ? (
                <>
                  <Dropdown.Item onClick={handleExport}>EXPORT</Dropdown.Item>
                  <Dropdown.Item onClick={handlePrint}>PRINT</Dropdown.Item>
                </>
              ) : null}
            </Dropdown.Menu>
          </Dropdown>
          </div>
        </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
      <div className="table-container">
        {renderTableContent()}
      </div>

      {/* Button Container */}
      <div className='d-flex justify-content-end mt-4 me-3 w-100'>
        {currentAcademicYear && currentAcademicYear.academicYear === classInfo.academicYear && (
          <Button 
          disabled={pendingStatus || currentSemester !== classInfo.semester}
          style={{
            backgroundColor: '#004d00',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
          onClick={() => handleSave('save')} // Attach handler for Saving changes made in grades
        >
          SAVE
        </Button>
        )}
        
        <Button
          disabled={pendingStatus || currentSemester !== classInfo.semester}
          style={{
            backgroundColor: '#004d00',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
            marginLeft: '10px',
          }}
          onClick={handleSubmit} // Attach handler for Submit to ProgramHead
        >
          SUBMIT
        </Button>
        
        
        {/*<Button
          className="post-button"
          disabled={!pendingStatus}
          style={{
            backgroundColor: '#004d00',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
            marginLeft: '10px',
          }}
          onClick={handlePost} // Attach handler for Post to Students
        >
          POST
        </Button>*/}
      </div>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleModalClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClassDetails;
