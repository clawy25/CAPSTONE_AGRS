import React, {useContext, useState, useEffect } from 'react';
import '../App.css';
import { UserContext } from '../Context/UserContext';
import StudentModel from '../ReactModels/StudentModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';

export default function StudentProfile() {
const { user } = useContext(UserContext); 

const [studentInfo, setStudentInfo] = useState([]);

const fetchStudentdata = async () => {
    try {
        // Fetch all academic years
        const academicYearData = await AcademicYearModel.fetchExistingAcademicYears();
        console.log("Academic years:", academicYearData);

        // Find the current academic year
        const currentAcademicYear = academicYearData.find(year => year.isCurrent);
        if (!currentAcademicYear) {
            console.error("No current academic year found");
            return;
        }
        console.log("Current academic year:", currentAcademicYear.academicYear);

        // Fetch personnel data using programNumber and current academic year
        const studentData = await StudentModel.fetchExistingStudents();
        console.log("Student data:", studentData);

        const findStudent = studentData.find(student => student.studentNumber === user.studentNumber);
        console.log("student matched",findStudent)

        if (findStudent) {
            setStudentInfo(findStudent);
        } else {
            console.error("Cannot fetch the student data");
        }


    } catch (error) {
        console.error("Error in fetchPersonnelData:", error);
    }
};

useEffect(() => {
    fetchStudentdata()
  }, [user.studentNumber]) 

    return(
        <div className="card bg-white rounded">
                 <div className="card-header bg-white">
                     <p className="fs-5 fw-semibold my-2">{user.studentNameLast}, {user.studentNameFirst} {user.studentNameMiddle} ({user.studentNumber})</p>
                 </div>
                 <div className="card-body">
                     <div className="row d-flex justify-content-center align-items-center">
                         <div className="col">
                             <p className="fs-6">Student Number: </p>
                             <p className="fs-6">Student Name: </p>
                             <p className="fs-6">Gender: </p>
                             <p className="fs-6">Date of Birth: </p>                    
                         </div>
                         <div className="col">
                             <p className="fs-6 mb-2 fw-semibold">{user.studentNumber}</p>
                             <p className="fs-6 mb-3 fw-semibold">{user.studentNameFirst} {user.studentNameMiddle} {user.studentNameLast}</p>
                             <p className="fs-6 mb-2 fw-semibold">{studentInfo.studentSex}</p>
                             <p className="fs-6 mb-2 fw-semibold">{studentInfo.studentBirthDate}</p>
                         </div>
                         <div className="col">
                             <p className="fs-6">Student Type: </p>
                             <p className="fs-6">Mobile No.: </p>
                             <p className="fs-6">Email Address: </p>
                             <p className="fs-6">Home Address: </p>
                         </div>
                         <div className="col">
                             <p className="fs-6 mb-3 fw-semibold">{studentInfo.studentType}</p>
                             <input 
                                 type="text" 
                                 className="fs-6 mb-3 fw-semibold" 
                                 value={studentInfo.studentContact || ''} 
                                 readOnly
                             />
                             <input 
                                 type="text" 
                                 className="fs-6 mb-3 fw-semibold d-block" 
                                 value={studentInfo.studentEmail || ''} 
                                 readOnly
                             />
                             <input 
                                 type="text" 
                                 className="fs-6 mb-2 fw-semibold" 
                                 value={studentInfo.studentAddress || ''} 
                                 readOnly
                             />
                         </div>
                     </div>
                 </div>
                 <div className="card-footer p-2 bg-white">
                     <button className="btn btn-success">Save</button>
                 </div>
             </div>
    )
}