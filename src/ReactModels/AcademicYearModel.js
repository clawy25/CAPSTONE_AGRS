export default class AcademicYearModel {
    constructor(id, academicYear, isCurrent) {
        this.id = id;
        this.academicYear = academicYear;
        this.isCurrent = isCurrent;
    }

    // Function to fetch all academic years
    static async fetchExistingAcademicYears() {
        try {
          const response = await fetch('http://localhost:5000/academicYear');
          if (!response.ok) {
            throw new Error('Error fetching academic years');
          }
          const data = await response.json();
          return data.map(year => new AcademicYearModel(
            year.id,
            year.academicYear,
            year.isCurrent
          ));
        } catch (error) {
          console.error('Error fetching academic years:', error);
          throw error;
        }
      }
      

    // Function to insert a new academic year
    static async createAndInsertAcademicYear(academicYearData) {
      try {
          const response = await fetch('http://localhost:5000/academicYear/upload', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ academicYearData }) // Ensure key matches backend expectation
          });
  
          if (!response.ok) {
              throw new Error('Error inserting academic year data');
          }
          return await response.json();
      } catch (error) {
          console.error('Error inserting academic year data:', error);
          throw error;
      }
  }
  

    // Function to update an academic year by ID
    static async updateAcademicYear(id, updatedData) {
        try {
          const response = await fetch(`http://localhost:5000/academicYear/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
          });
      
          if (!response.ok) {
            throw new Error('Error updating academic year');
          }
      
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error updating academic year:', error);
          throw error;
        }
      }
      
}
