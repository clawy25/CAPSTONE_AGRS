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

  // Function to fetch personnel data (Read only)
  static async fetchPersonnelData(personnelNumber) {
    try {
      // Example API call to your backend (Node.js)
      const response = await fetch(`http://localhost:5000/personnel/${personnelNumber}`);
      if (!response.ok) {
        throw new Error('Error fetching personnel data');
      }
      const data = await response.json();
      
      // Return data including programName
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
  // NO FRONTEND FOR INSERTING PERSONNEL YET
  static async insertPersonnel(personnelData) {
    try {
      const response = await fetch('http://localhost:5000/personnel/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personnelData),
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
}
