export default class PersonnelModel {
  constructor(id, personnelNumber, personnelPassword, personnelType,
              personnelName, personnelSex, personnelEmail, 
              personnelBirthDate, programNumber, programName) {
    this.id = id;
    this.personnelNumber = personnelNumber;
    this.personnelPassword = personnelPassword;
    this.personnelType = personnelType;
    this.personnelName = personnelName;
    this.personnelSex = personnelSex;
    this.personnelEmail = personnelEmail;
    this.personnelBirthDate = personnelBirthDate;
    this.programNumber = programNumber;
    this.programName = programName;
  }

  // Fetch specific personnel data by personnelNumber
  static async fetchPersonnelData(personnelNumber) {
    try {
      const response = await fetch(`http://localhost:5000/personnel/${personnelNumber}`);
      if (!response.ok) {
        throw new Error('Error fetching personnel data');
      }
      const data = await response.json();
      
      return new PersonnelModel(
        data.id,
        data.personnelNumber,
        data.personnelPassword,
        data.personnelType,
        data.personnelName,
        data.personnelSex,
        data.personnelEmail,
        data.personnelBirthDate,
        data.programNumber,
        data.programName
      );
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      throw error;
    }
  }

  // Fetch all professors
  static async getProfessors() {
    try {
      const response = await fetch(`http://localhost:5000/personnel?personnelType=professor`);
      if (!response.ok) {
        throw new Error('Error fetching professors data');
      }
      const data = await response.json();

      // Map the data to an array of PersonnelModel instances
      return data.map((prof) => new PersonnelModel(
        prof.id,
        prof.personnelNumber,
        prof.personnelPassword,
        prof.personnelType,
        prof.personnelName,
        prof.personnelSex,
        prof.personnelEmail,
        prof.personnelBirthDate,
        prof.programNumber,
        prof.programName
      ));
    } catch (error) {
      console.error('Error fetching professors:', error);
      throw error;
    }
  }

  // Insert personnel (if needed)
static async insertPersonnel(personnelData) {
  try {
      // Wrap personnelData in an array
      const response = await fetch('http://localhost:5000/personnel/upload', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: [personnelData] }), // Send data as an array
      });

      if (!response.ok) {
          throw new Error('Error creating personnel');
      }

      const data = await response.json();
      return data; // Return the response or any necessary data
  } catch (error) {
      console.error('Error creating personnel:', error);
      throw error;
  }
}


  // Update personnel data
static async updatePersonnel(personnelNumber, updatedData) {
  try {
    const response = await fetch(`http://localhost:5000/personnel/${personnelNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Error updating personnel data');
    }

    const data = await response.json();
    return data; // Return updated personnel data
  } catch (error) {
    console.error('Error updating personnel:', error);
    throw error;
  }
}
// Delete personnel data
static async deletePersonnel(personnelNumber) {
  try {
    const response = await fetch(`http://localhost:5000/personnel/${personnelNumber}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error deleting personnel');
    }

    const data = await response.json();
    return data; // Return response or success message
  } catch (error) {
    console.error('Error deleting personnel:', error);
    throw error;
  }
}

}
