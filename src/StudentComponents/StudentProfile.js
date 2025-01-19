import React, { useContext, useState, useEffect } from 'react';
import { Form, Table, Button, Card } from 'react-bootstrap';

import '../App.css';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import StudentModel from '../ReactModels/StudentModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';

export default function StudentProfile() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isUnchanged, setIsUnchanged] = useState(true); // To track changes
  const [studentInfo, setStudentInfo] = useState({});
  const [editableStudentInfo, setEditableStudentInfo] = useState({});

  //On loading the page
  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if user is not present
    }
  }, [user, navigate]);

  const fetchStudentData = async () => {
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

      // Fetch student data using studentNumber
      const studentData = await StudentModel.fetchExistingStudents();
      console.log("Student data:", studentData);

      const findStudent = studentData.find(student => student.studentNumber === user.studentNumber);
      console.log("Student matched", findStudent);

      if (findStudent) {
        setStudentInfo(findStudent);
        setEditableStudentInfo(findStudent); // Set the editable info
      } else {
        console.error("Cannot fetch the student data");
      }

    } catch (error) {
      console.error("Error in fetchStudentData:", error);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user.studentNumber]);

  const handleInputChange = (field, value) => {
    setEditableStudentInfo({
      ...editableStudentInfo,
      [field]: value,
    });
    setIsUnchanged(false); // Mark as changed
  };

  const getUpdatedFields = () => {
    const updatedFields = {};
    // Only track changes for editable fields
    if (editableStudentInfo.studentAddress !== studentInfo.studentAddress) {
      updatedFields.studentAddress = editableStudentInfo.studentAddress;
    }
    if (editableStudentInfo.studentEmail !== studentInfo.studentEmail) {
      updatedFields.studentEmail = editableStudentInfo.studentEmail;
    }
    if (editableStudentInfo.studentContact !== studentInfo.studentContact) {
      updatedFields.studentContact = editableStudentInfo.studentContact;
    }
    return updatedFields;
  };

  const validateStudentInfo = (updatedFields) => {
    // Ensure that there are changes before allowing save
    return Object.keys(updatedFields).length > 0;
  };

  const updateStudentData = async (updatedFields) => {
    setIsSaving(true);
    try {
      await StudentModel.updateStudent(user.studentNumber, updatedFields);
      console.log('Student data updated successfully:', updatedFields);
      setStudentInfo(editableStudentInfo); // Update with the latest data
      setIsUnchanged(true); // Reset to unchanged state
    } catch (error) {
      console.error('Error in updateStudentData:', error);
    } finally {
      setIsSaving(false);
    }
  }; 

  return (
    <Card className="bg-white rounded">
      <Card.Header className="bg-white">
        <p className="fs-5 fw-semibold my-2">
          {user.studentNameLast}, {user.studentNameFirst} {user.studentNameMiddle} ({user.studentNumber})
        </p>
      </Card.Header>
      <Card.Body>
        <Table>
          <tbody>
            <tr>
              <td>Student Number</td>
              <td className='fs-6 fw-semibold'>{user.studentNumber}</td>
            </tr>
            <tr>
              <td>Full Name</td>
              <td className='fs-6 fw-semibold'>
                {user.studentNameFirst} {user.studentNameMiddle} {user.studentNameLast}
              </td>
            </tr>
            <tr>
              <td>Gender</td>
              <td className='fs-6 fw-semibold'>{editableStudentInfo.studentSex}</td>
            </tr>
            <tr>
              <td>Date of Birth</td>
              <td className='fs-6 fw-semibold'>{editableStudentInfo.studentBirthDate}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td className='fs-6 fw-semibold'>
                <Form.Control
                  type="text"
                  value={editableStudentInfo.studentAddress || ''}
                  onChange={(e) => handleInputChange('studentAddress', e.target.value)}
                  className='fs-6 fw-semibold'
                />
              </td>
            </tr>
            <tr>
              <td>Email Address</td>
              <td>
                <Form.Control
                  type="text"
                  value={editableStudentInfo.studentEmail || ''}
                  onChange={(e) => handleInputChange('studentEmail', e.target.value)}
                  className='fs-6 fw-semibold'
                />
              </td>
            </tr>
            <tr>
              <td>Mobile No.</td>
              <td>
                <Form.Control
                  type="text"
                  value={editableStudentInfo.studentContact || ''}
                  onChange={(e) => handleInputChange('studentContact', e.target.value)}
                  className='fs-6 fw-semibold'
                />
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
      <Card.Footer className="p-2 bg-white">
        <Button
          variant="success"
          disabled={isUnchanged}
          onClick={() => {
            const updatedFields = getUpdatedFields();
            if (validateStudentInfo(updatedFields)) {
              updateStudentData(updatedFields);
            }
          }}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </Card.Footer>
    </Card>
  );
}
