export default class GradeModel {
    constructor(id, scheduleNumber, studentNumber, period,
                componentNumber, instanceNumber, value) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.studentNumber = studentNumber;
        this.period = period;
        this.componentNumber = componentNumber;
        this.instanceNumber = instanceNumber;
        this.value = value;
    }
    
  static async fetchGradeData(scheduleNumber) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;      
        const response = await fetch(`${apiUrl}/grade/all`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduleNumber }),
        });
        if (!response.ok) {
            throw new Error('Error fetching grade data');
        }
        const data = await response.json();

        // Assuming data is an array of grade objects
        return data.map(data => new GradeModel(
            data.id,
            data.scheduleNumber,
            data.studentNumber,
            data.period,
            data.componentNumber,
            data.instanceNumber,
            data.value
        ));
    } catch (error) {
        console.error('Error fetching grade:', error);
        throw error;
    }
  }

  static async updateGradeData(updatedGrade) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/grade/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeData: updatedGrade })
      });
  
      if (!response.ok) {
        throw new Error('Error updating grade data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  }
}
