export default class PersonnelModel {
  constructor(id, personnelNumber, personnelPassword, personnelType,
              personnelName, personnelGender, personnelEmail, 
              personnelBirthDate) {
    this.id = id;
    this.personnelNumber = personnelNumber;
    this.personnelPassword = personnelPassword;
    this.personnelType = personnelType;
    this.personnelName = personnelName;
    this.personnelGender = personnelGender;
    this.personnelEmail = personnelEmail;
    this.personnelBirthDate = personnelBirthDate;
  }

  // Function to fetch personnel data (Read only)
  static async fetchPersonnelData(personnelNumber) {
    try {
      // Example API call to your backend (Node.js)
      const response = await fetch(`http://localhost:5000/faculty/${personnelNumber}`);
      if (!response.ok) {
        throw new Error('Error fetching personnel data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      throw error;
    }
  }
}
