export default class DeadlineModel {
  constructor(id, created_at, scheduleNumber, deadlineDate) {
    this.id = id;
    this.created_at = created_at;
    this.scheduleNumber = scheduleNumber;
    this.deadlineDate = deadlineDate;
  }

  static async fetchDeadlinesBySchedule(scheduleNumber) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL; // Make sure this environment variable is set correctly
      const response = await fetch(`${apiUrl}/deadline/bySchedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleNumber }),
      });
  
      if (!response.ok) {
        throw new Error('Error fetching deadlines');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      throw error;
    }
  }
  

  static async createAndInsertDeadline(newDeadlineData) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const payload = { data: Array.isArray(newDeadlineData) ? newDeadlineData : [newDeadlineData] };

      const response = await fetch(`${apiUrl}/deadline/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error inserting deadlines: ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error inserting deadlines:', error);
      throw error;
    }
  }

  static async updateDeadlines(updatedDeadlines) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/deadline/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updatedDeadlines }),
      });

      if (!response.ok) {
        throw new Error('Error updating deadlines');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating deadlines:', error);
      throw error;
    }
  }
}
