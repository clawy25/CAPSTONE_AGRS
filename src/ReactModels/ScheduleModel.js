export default class ScheduleModel {
    constructor(id, scheduleNumber, scheduleDay, startTime, endTime,
                sectionNumber, personnelNumber, courseCode,
                yearLevel, semester, academicYear) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.scheduleDay = scheduleDay;
        this.startTime = startTime;
        this.endTime = endTime;
        this.sectionNumber = sectionNumber;
        this.personnelNumber = personnelNumber;
        this.courseCode = courseCode;
        this.yearLevel = yearLevel;
        this.semester = semester;
        this.academicYear = academicYear;
    }

    
    static async fetchSchedules() {
      try {
          const apiUrl = process.env.REACT_APP_API_URL;
          const response = await fetch(`${apiUrl}/schedule/all`);
          if (!response.ok) {
              throw new Error('Error fetching schedules');
          }
          const data = await response.json();

          // Assuming data is an array of schedules objects
          return data;
      } catch (error) {
          console.error('Error fetching schedules:', error);
          throw error;
      }
  }

    
  static async fetchExistingschedule(section) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/schedule/section`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ section }), // Send credentials
        });
        if (!response.ok) {
            throw new Error('Error fetching schedules');
        }
        const data = await response.json();

        // Assuming data is an array of schedules objects
        return data;
    } catch (error) {
        console.error('Error fetching schedules:', error);
        throw error;
    }
  }

  static async fetchAllSchedules(academicYear) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/schedule/byAcadYear`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ academicYear }), // Send credentials
        });
        if (!response.ok) {
            throw new Error('Error fetching schedules');
        }
        const data = await response.json();

        // Assuming data is an array of schedules objects
        return data;
    } catch (error) {
        console.error('Error fetching schedules:', error);
        throw error;
    }
  }
    // Create and insert multiple schedules
  static async createAndInsertSchedules(scheduleData) {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/schedule/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: scheduleData }) // Send array of schedules
            });

            if (!response.ok) {
                throw new Error('Error inserting schedule data');
            }
            return await response.json(); // Return the response (newly inserted schedules or status)
        } catch (error) {
            console.error('Error inserting schedule data:', error);
            throw error;
        }
  }

  static async updateSchedules(updatedSchedules) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/schedule/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updatedSchedules }),
      });
  
      if (!response.ok) {
        throw new Error('Error updating schedule data');
      }
  
      const data = await response.json();
      return data; // Return updated schedules data
    } catch (error) {
      console.error('Error updating schedules:', error);
      throw error;
    }
  }
}
