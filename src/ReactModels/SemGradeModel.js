export default class SemGradeModel {
    constructor(id, scheduleNumber, studentNumber, grade) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.studentNumber = studentNumber;
        this.grade = grade;
    }
    
  static async fetchSemGradeData(scheduleNumber) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/semgrade/all`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduleNumber }),
        });
        if (!response.ok) {
            throw new Error('Error fetching semgrades data');
        }
        const data = await response.json();

        // Assuming data is an array of quiz objects
        return data.map(data => new SemGradeModel(
            data.id,
            data.scheduleNumber,
            data.studentNumber,
            data.grade
        ));
    } catch (error) {
        console.error('Error fetching semgrades:', error);
        throw error;
    }
  }

  static async updateSemGradeData(semgradeData) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/semgrade/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ semgradeData })
      });
  
      if (!response.ok) {
        throw new Error('Error updating exam data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating semgrade:', error);
      throw error;
    }
  }
}
