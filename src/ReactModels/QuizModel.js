export default class QuizModel {
    constructor(id, scheduleNumber, period, instanceNumber, maxScore) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.period = period;
        this.instanceNumber = instanceNumber;
        this.maxScore = maxScore;
    }
    
  static async fetchQuizData(scheduleNumber) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/quiz/all`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduleNumber }),
        });
        if (!response.ok) {
            throw new Error('Error fetching quiz data');
        }
        const data = await response.json();

        // Assuming data is an array of quiz objects
        return data.map(data => new QuizModel(
            data.id,
            data.scheduleNumber,
            data.period,
            data.instanceNumber,
            data.maxScore
        ));
    } catch (error) {
        console.error('Error fetching grade:', error);
        throw error;
    }
  }

  static async updateQuizData(quizData) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/quiz/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizData })
      });
  
      if (!response.ok) {
        throw new Error('Error updating quiz data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }
}
