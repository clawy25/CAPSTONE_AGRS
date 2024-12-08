export default class SubmissionModel {
    constructor(id, scheduleNumber, created_at, submissionStatus) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.created_at = created_at;
        this.submissionStatus = submissionStatus;
    }
    
  static async fetchSubmissionData(scheduleNumber) {
    try {
        const response = await fetch('http://localhost:5000/submission', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduleNumber }),
        });
        if (!response.ok) {
            throw new Error('Error fetching submission data');
        }
        const data = await response.json();

        // Assuming data is an array of schedules objects
        return data.map(data => new SubmissionModel(
            data.id,
            data.scheduleNumber,
            data.created_at,
            data.submissionStatus
        ));
    } catch (error) {
        console.error('Error fetching submission:', error);
        throw error;
    }
  }
    // Create and insert multiple schedules
  static async createAndInsertSubmission(submissionData) {
        try {
            const response = await fetch(`http://localhost:5000/submission/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ submissionData }) // Send array of submission
            });

            if (!response.ok) {
                throw new Error('Error inserting submission data');
            }

            const data = await response.json();

            return data;
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
