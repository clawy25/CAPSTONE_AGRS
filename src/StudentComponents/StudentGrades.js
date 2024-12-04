import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import StudentModel from '../ReactModels/StudentModel';
import './Grades.css';
import '../App.css';


export default function Grades(){
  const { user } = useContext(UserContext); // Get the logged-in user from context
  const [studentName, setStudentName] = useState(""); // To store the student's full name
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!user || !user.studentNumber) {
          throw new Error("No student information available.");
        }
        // Fetch the student details based on studentNumber
        const students = await StudentModel.fetchExistingStudents();
        const currentStudent = students.find(student => student.studentNumber === user.studentNumber);

        if (currentStudent) {
          // Set the student's full name
          const fullName = `${currentStudent.studentNameLast}, ${currentStudent.studentNameFirst} ${currentStudent.studentNameMiddle || ''} ${currentStudent.studentNameLast}`;
          setStudentName(fullName.trim());
        } else {
          throw new Error("Student not found.");
        }
    }catch (error) {
      setError(error.message);
      console.error("Error fetching student data:", error);
    }}
    fetchStudentData();
  })
  return (

        <div className='card bg-white'>
          <div className='card-header bg-white d-flex'>
            <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>{studentName}</p>
            <p className='custom-color-green-font mt-3 ms-1 fs-6 custom-color-green-font fw-bold'>  ({user.studentNumber})</p>
          </div>
          <div className='card-body card-success border-success rounded'>
            <table className="table">
              <thead className='table-success'>
                <tr>
                  <th className='text-success custom-font'>Code</th>
                  <th className='text-success custom-font'>Subject</th>
                  <th className='text-success custom-font'>Total Units</th>
                  <th className='text-success custom-font'>Grade</th>
                  <th className='text-success custom-font'>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='custom-font'>IT101</td>
                  <td className='custom-font'>Introduction to Information Technology</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.5</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>CS102</td>
                  <td className='custom-font'>Computer Programming</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.2</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>DM103</td>
                  <td className='custom-font'>Discrete Mathematics</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.0</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>DB104</td>
                  <td className='custom-font'>Database Systems</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.7</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>OS105</td>
                  <td className='custom-font'>Operating Systems</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>2.0</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>WN106</td>
                  <td className='custom-font'>Web Development</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.3</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>SE107</td>
                  <td className='custom-font'>Software Engineering</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.4</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>AE108</td>
                  <td className='custom-font'>Advanced Algorithms</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.6</td>
                  <td className='custom-font'>P</td>
                </tr>
              </tbody>
            </table>
            
        
          </div>
        </div>
       
  );
};

