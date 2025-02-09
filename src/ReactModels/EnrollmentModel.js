export default class EnrollmentModel {
    constructor(id, studentNumber, scheduleNumber, courseCode, status) {
        this.id = id;
        this.studentNumber = studentNumber;
        this.scheduleNumber = scheduleNumber;
        this.courseCode = courseCode;
        this.status = status;
    }

    // Function to fetch enrollment data by studentNumber
    static async fetchEnrollmentData(studentNumber) {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/enrollment/byStudent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentNumber }), // Send credentials
              });
            if (!response.ok) {
                throw new Error('Error fetching enrollment data');
            }
            const data = await response.json();

            return data;
        } catch (error) {
            console.error('Error fetching enrollment data:', error);
            throw error;
        }
    }

    // Function to fetch all enrollments
    static async fetchAllEnrollment() {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/enrollment/all`);
            if (!response.ok) {
                throw new Error('Error fetching enrollments');
            }
            const data = await response.json();

            // Assuming data is an array of enrollments objects
            return data;
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            throw error;
        }
    }

    // New method to create and insert a enrollment
    static async createAndInsertEnrollment(newEnrollmentData) {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/enrollment/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: newEnrollmentData }),
            });
            if (!response.ok) {
                throw new Error('Error inserting enrollment');
            }
            return await response.json(); // Return the created enrollment data if needed
        } catch (error) {
            console.error('Error inserting enrollment:', error);
            throw error;
        }
    }

    static async updateEnrollment(updatedEnrollmentData) {
        const apiUrl = process.env.REACT_APP_API_URL;
          try {
  
            const response = await fetch(`${apiUrl}/enrollment/update`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedEnrollmentData),
            });
      
            if (!response.ok) {
              throw new Error('Failed to update enrollment data');
            }
      
            return await response.json();
          } catch (error) {
            console.error('Error updating enrollment:', error);
            throw error;
          }
    }
}
