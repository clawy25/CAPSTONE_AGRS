export default class ScheduleModel {
    constructor(id, scheduleNumber, courseCode, courseDescriptiveTitle, courseLecture, courseLaboratory, personnelNumber, professorName, scheduleDay, startTime, endTime, numberOfHours, units, yearNumber, sectionNumber) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.courseCode = courseCode;
        this.courseDescriptiveTitle = courseDescriptiveTitle;
        this.courseLecture = courseLecture;
        this.courseLaboratory = courseLaboratory;
        this.personnelNumber = personnelNumber;
        this.professorName = professorName;
        this.scheduleDay = scheduleDay;
        this.startTime = startTime;
        this.endTime = endTime;
        this.numberOfHours = numberOfHours;
        this.units = units;
        this.yearNumber = yearNumber;
        this.sectionNumber = sectionNumber;
    }


    // Function to fetch all subjects
  static async fetchExistingschedule() {
    try {
        const response = await fetch('http://localhost:5000/schedule');
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


static async deleteSchedule(id) {
    try {
      const response = await fetch(`http://localhost:5000/schedule/${id}`, {
        method: 'DELETE',
      });
  
      console.log('Delete response status:', response.status); // Log response status
      console.log('Delete response body:', await response.text()); // Log the raw response body
  
      if (!response.ok) {
        throw new Error('Error deleting schedule');
      }
  
      const data = await response.json(); // Attempt to parse JSON
      return data; // Return response or success message
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
  
  


   

    // Create and insert multiple schedules
    static async createAndInsertSchedules(scheduleData) {
        try {
            const response = await fetch(`http://localhost:5000/schedule/upload`, {
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
}
