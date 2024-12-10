export default class AttendanceModel {
    constructor(id, scheduleNumber, period, instanceNumber, attendanceLabel) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.period = period;
        this.instanceNumber = instanceNumber;
        this.attendanceLabel = attendanceLabel;
    }
    
  static async fetchAttendanceData(scheduleNumber) {
    try {
        const response = await fetch('http://localhost:5000/attendance', {
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
        return data.map(data => new AttendanceModel(
            data.id,
            data.scheduleNumber,
            data.period,
            data.instanceNumber,
            data.attendanceLabel
        ));
    } catch (error) {
        console.error('Error fetching grade:', error);
        throw error;
    }
  }

  static async updateAttendanceData(attendanceData) {
    try {
      const response = await fetch(`http://localhost:5000/attendance/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceData })
      });
  
      if (!response.ok) {
        throw new Error('Error updating attendance data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }
}
