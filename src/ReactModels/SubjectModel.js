export default class SubjectModel {
  constructor(id, subjectCode, subjectName, programNumber, subjectUnits) {
      this.id = id;
      this.subjectCode = subjectCode;
      this.subjectName = subjectName;
      this.programNumber = programNumber;
      this.subjectUnits = subjectUnits;
      
  }

  // Function to fetch all subjects
  static async fetchExistingSubjects() {
      try {
          const response = await fetch('http://localhost:5000/subject');
          if (!response.ok) {
              throw new Error('Error fetching subjects');
          }
          const data = await response.json();

          // Assuming data is an array of subject objects
          return data.map(subject => new SubjectModel(
              subject.id,
              subject.subjectCode,
              subject.subjectName,
              subject.programNumber,
              subject.subjectUnits
              
          ));
      } catch (error) {
          console.error('Error fetching subjects:', error);
          throw error;
      }
  }

  // Method to create and insert a subject
  static async createAndInsertSubject(subjectCode, subjectName, programNumber, subjectUnits) {
    const subjectData = {
      subjectCode,
      subjectName,
      programNumber,
      subjectUnits
    };
  
    try {
      const response = await fetch('http://localhost:5000/subject/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [subjectData] }), // Send data as an array
      });
  
      if (!response.ok) {
        throw new Error('Error creating subject');
      }
  
      const data = await response.json();
      return data; // Return the response or any necessary data
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }
  


    // Update personnel data
static async updateSubject(subjectCode, updatedData) {
  try {
    const response = await fetch(`http://localhost:5000/subject/${subjectCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Error updating subject data');
    }

    const data = await response.json();
    return data; // Return updated subject data
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
}

// Delete subject by ID
static async deleteSubject(subjectCode) { // Change parameter name to subjectId for clarity
  try {
    const response = await fetch(`http://localhost:5000/subject/${subjectCode}`, { // Update URL to reference subjects
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error deleting subject');
    }

    const data = await response.json();
    return data; // Return response or success message
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
}

}
