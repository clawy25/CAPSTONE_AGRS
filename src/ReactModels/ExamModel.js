export default class ExamModel {
    constructor(id, scheduleNumber, period, instanceNumber, maxScore) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.period = period;
        this.instanceNumber = instanceNumber;
        this.maxScore = maxScore;
    }
    
  static async fetchExamData(scheduleNumber) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/exam/all`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduleNumber }),
        });
        if (!response.ok) {
            throw new Error('Error fetching exam data');
        }
        const data = await response.json();

        // Assuming data is an array of quiz objects
        return data.map(data => new ExamModel(
            data.id,
            data.scheduleNumber,
            data.period,
            data.instanceNumber,
            data.maxScore
        ));
    } catch (error) {
        console.error('Error fetching exam:', error);
        throw error;
    }
  }

  static async updateExamData(examData) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/exam/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examData })
      });
  
      if (!response.ok) {
        throw new Error('Error updating exam data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }
}
