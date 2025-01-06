export default class StudentModel {
    constructor(id, studentNumber, studentPassword, studentType,
                studentNameFirst,studentNameMiddle, studentNameLast,
                studentSex, studentEmail, 
                studentBirthDate, studentPccEmail, studentAdmissionYr, 
                studentYrLevel, studentProgramNumber,
                studentContact, studentAddress, isABMgraduate, grNumber,
                specialOrderNumber, numberOfSemesterAttended, dateGraduated, 
                studentBirthPlace, studentNationality, admissionCredentials, 
                schoolLastAttended, categoryStrand, dateSemesterAdmitted) {
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
        this.studentContact = studentContact;
        this.studentAddress = studentAddress;
        this.isABMgraduate = isABMgraduate;
        this.grNumber = grNumber;
        this.specialOrderNumber = specialOrderNumber;
        this.numberOfSemesterAttended = numberOfSemesterAttended;
        this.dateGraduated = dateGraduated; 
        this.studentBirthPlace = studentBirthPlace;
        this.studentNationality = studentNationality;
        this.admissionCredentials = admissionCredentials;
        this.schoolLastAttended = schoolLastAttended;
        this.categoryStrand = categoryStrand;
        this.dateSemesterAdmitted = dateSemesterAdmitted;
    }
  
    // Convert Excel date format to JavaScript Date
    static excelDateToJSDate(serial) {
      const date = new Date((serial - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0]; // Return in 'YYYY-MM-DD' format
    }
  
    // Function to fetch student data (Read only)
    static async fetchStudentData(studentNumber, password) {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/student/login`,{
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ studentNumber, password }), // Send credentials
            });
            if (!response.ok) {
                throw new Error('Error fetching student data');
            }
            const data = await response.json();
            
            // Return data
            return new StudentModel(
                null,
                data.studentNumber,
                null,
                data.studentType,
                data.studentNameFirst,
                data.studentNameMiddle,
                data.studentNameLast,
                null,
                null,
                null,
                null,
                null,
                null,
                data.studentProgramNumber,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            );
        } catch (error) {
            console.error('Error fetching student data:', error);
            throw error;
        }
    }
  
    // Function to fetch all existing students
    static async fetchExistingStudents() {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/student/all`); // Adjust the endpoint if necessary
            if (!response.ok) {
                throw new Error('Error fetching existing students');
            }
            const data = await response.json();
  
            // Map the received data to an array of StudentModel instances
            return data;
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

          const apiUrl = process.env.REACT_APP_API_URL;
  
          const response = await fetch(`${apiUrl}/student/upload`, {
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

    static async updateStudent(studentNumber, updatedFields) {
      const apiUrl = process.env.REACT_APP_API_URL;
        try {

          const response = await fetch(`${apiUrl}/student/${studentNumber}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFields),
          });
    
          if (!response.ok) {
            throw new Error('Failed to update student data');
          }
    
          return await response.json();
        } catch (error) {
          console.error('Error updating student:', error);
          throw error;
        }
      }
  }
  