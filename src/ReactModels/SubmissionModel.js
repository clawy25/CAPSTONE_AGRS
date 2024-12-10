export default class SubmissionModel {
  constructor(id, created_at, scheduleNumber, submissionStatus) {
      this.id = id;
      this.created_at = created_at;
      this.scheduleNumber = scheduleNumber;
      this.submissionStatus = submissionStatus;
}


  static async fetchSubmissionBySchedule(scheduleNumber) {
  try {
      console.log("try...")
      const response = await fetch('http://localhost:5000/submission/bySchedule', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({scheduleNumber}) // Empty body, since no filters are applied
      });

      if (!response.ok) {
          throw new Error('Error fetching submissions');
      }
      const data = await response.json();

      // Assuming data is an array of program objects
      return data.map(submission => new SubmissionModel(
          submission.id,
          submission.created_at,
          submission.scheduleNumber,
          submission.submissionStatus,

      ));
  } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
  }
}

static async createAndInsertSubmission(newSubmissionData) {
  try {
      const response = await fetch(`http://localhost:5000/submission/upload`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: newSubmissionData }),
      });
      if (!response.ok) {
          throw new Error('Error inserting submission data');
      }
      return await response.json(); // Return the response if needed
  } catch (error) {
      console.error('Error inserting submission data:', error);
      throw error;
  }
}

static async updateSchedules(updatedSubmission) {
  try {
    const response = await fetch(`http://localhost:5000/submission/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updatedSubmission })
    });

    if (!response.ok) {
      throw new Error('Error updating submission data');
    }

    const data = await response.json();
    return data; // Return updated submission data
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
}

}

      
    