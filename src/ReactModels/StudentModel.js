export default class StudentModel {
  constructor(id, studentNumber, studentPassword, studentType,
              studentNameFirst,studentNameMiddle, studentNameLast,
              studentSex, studentEmail, 
              studentBirthDate, studentPccEmail, studentAdmissionYr, 
              studentYrLevel, studentProgramNumber, studentProgramName,
              studentContact, studentAddress, isABMgraduate) {
      this.id = id;
      this.studentNumber = studentNumber;
      this.studentPassword = studentPassword;
      this.studentType = studentType;
      this.studentNameFirst = studentNameFirst;
      this.studentNameMiddle = studentNameMiddle;
      this.studentNameLast = studentNameLast;
      this.studentSex = studentSex;
      this.studentEmail = studentEmail;
      this.studentBirthDate = studentBirthDate;
      this.studentPccEmail = studentPccEmail;
      this.studentAdmissionYr = studentAdmissionYr;
      this.studentYrLevel = studentYrLevel;
      this.studentProgramNumber = studentProgramNumber;
      this.studentProgramName = studentProgramName;
      this.studentContact = studentContact;
      this.studentAddress = studentAddress;
      this.isABMgraduate = isABMgraduate;

      // Add more here if needed
  }

  // Convert Excel date format to JavaScript Date
  static excelDateToJSDate(serial) {
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0]; // Return in 'YYYY-MM-DD' format
  }

  // Function to fetch student data (Read only)
  static async fetchStudentData(studentNumber) {
      try {
          // Example API call to your backend (Node.js)
          const response = await fetch(`http://localhost:5000/student/${studentNumber}`);
          if (!response.ok) {
              throw new Error('Error fetching student data');
          }
          const data = await response.json();
          
          // Return data
          return new StudentModel(
              data.id,
              data.studentNumber,
              data.studentPassword,
              data.studentType,
              data.studentNameFirst,
              data.studentNameMiddle,
              data.studentNameLast,
              data.studentSex,
              data.studentEmail,
              data.studentBirthDate,
              data.studentPccEmail,
              data.studentAdmissionYr,
              data.studentYrLevel,
              data.studentProgramNumber,
              data.studentProgramName,
              data.studentContact,
              data.studentAddress,
              data.isABMgraduate
          );
      } catch (error) {
          console.error('Error fetching student data:', error);
          throw error;
      }
  }

  // Function to fetch all existing students
  static async fetchExistingStudents() {
      try {
          // Example API call to your backend (Node.js)
          const response = await fetch(`http://localhost:5000/student`); // Adjust the endpoint if necessary
          if (!response.ok) {
              throw new Error('Error fetching existing students');
          }
          const data = await response.json();

          // Map the received data to an array of StudentModel instances
          return data.map(student => new StudentModel(
              student.id,
              student.studentNumber,
              student.studentPassword,
              student.studentType,
              student.studentNameFirst,
              student.studentNameMiddle,
              student.studentNameLast,
              student.studentSex,
              student.studentEmail,
              student.studentBirthDate,
              student.studentPccEmail,
              student.studentAdmissionYr,
              student.studentYrLevel,
              student.studentProgramNumber,
              student.studentProgramName,
              student.isABMgraduate
          ));
      } catch (error) {
          console.error('Error fetching existing students:', error);
          throw error;
      }
  }

  //Function to insert students (import from RegistrarStudents.js)
  static async insertStudent(studentsData) {
    try {
        // Map studentsData to exclude studentProgramName and convert studentBirthDate
        const updatedStudentsData = studentsData.map(student => ({
            studentNumber: student.studentNumber,
            studentPassword: student.studentPassword,
            studentType: student.studentType,
            studentNameFirst: student.studentNameFirst,
            studentNameMiddle: student.studentNameMiddle,
            studentNameLast: student.studentNameLast,
            studentSex: student.studentSex,
            studentEmail: student.studentEmail,
            studentBirthDate: 
              typeof student.studentBirthDate === 'number' 
              ? StudentModel.excelDateToJSDate(student.studentBirthDate) 
              : student.studentBirthDate, // Use as is if already formatted
            studentPccEmail: student.studentPccEmail,
            studentAdmissionYr: student.studentAdmissionYr,
            studentYrLevel: student.studentYrLevel,
            studentProgramNumber: student.studentProgramNumber,
            studentContact: student.studentContact,
            studentAddress: student.studentAddress,
            isABMgraduate: student.isABMgraduate
        }));

        const response = await fetch('http://localhost:5000/student/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: updatedStudentsData }), // Pass the updated array of students
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Error inserting student data: ${errorResponse.message || 'Unknown error'}`);
        }

        const result = await response.json();
        return result; // Return the result from the server
    } catch (error) {
        console.error('Error inserting student data:', error);
        throw error; // Rethrow the error for further handling
    }
  }
}
