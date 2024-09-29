export default class StudentModel {
    constructor(id, studentNumber, studentPassword, studentType,
                studentName, studentGender, studentEmail, 
                studentBirthDate, studentPccEmail, studentAdmissionYr, 
                studentYrLevel, studentProgramNumber, studentProgramName ) {
      this.id = id;
      this.studentNumber = studentNumber;
      this.studentPassword = studentPassword;
      this.studentType = studentType;
      this.studentName = studentName;
      this.studentGender = studentGender;
      this.studentEmail = studentEmail;
      this.studentBirthDate = studentBirthDate;
      this.studentPccEmail = studentPccEmail;
      this.studentAdmissionYr = studentAdmissionYr;
      this.studentYrLevel = studentYrLevel;
      this.studentProgramNumber = studentProgramNumber;
      this.studentProgramName = studentProgramName;

      //Add more here if needed
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
          data.studentName,
          data.studentGender,
          data.studentEmail,
          data.studentBirthDate,
          data.studentPccEmail,
          data.studentAdmissionYr,
          data.studentYrLevel,
          data.studentProgramNumber,
          data.studentProgramName
        );
      } catch (error) {
        console.error('Error fetching personnel data:', error);
        throw error;
      }
    }
  }
  