export default class ScheduleModel {
    constructor(id, scheduleNumber, subjectCode, subjectName, subjectUnits, personnelName, scheduleDay, startTime, endTime,  yearNumber, sectionNumber) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.subjectUnits = subjectUnits;
        this.personnelName = personnelName;
        this.scheduleDay = scheduleDay;
        this.startTime = startTime;
        this.endTime = endTime;
        this.yearNumber = yearNumber;          
        this.sectionNumber = sectionNumber;    
    }

    // Function to fetch all schedules
    static async fetchExistingSchedules() {
        try {
            const response = await fetch('http://localhost:5000/schedule');
            if (!response.ok) {
                throw new Error('Error fetching schedules');
            }
            const data = await response.json();

            // Assuming data is an array of schedule objects
            return data.map(schedule => new ScheduleModel(
                schedule.id,
                schedule.scheduleNumber,
                schedule.subjectCode,
                schedule.subjectName,
                schedule.subjectUnits,
                schedule.personnelName,
                schedule.scheduleDay,
                schedule.startTime,
                schedule.endTime,
                schedule.yearNumber,           // Fetching year number from data
                schedule.sectionNumber         // Fetching section number from data
            ));
        } catch (error) {
            console.error('Error fetching schedules:', error);
            throw error;
        }
    }

    // New method to create and insert a schedule
// New method to create and insert schedules
static async createAndInsertSchedules(schedule) {
    try {
        const response = await fetch(`http://localhost:5000/schedule/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: schedule }), // Send the array of schedules
        });

        if (!response.ok) {
            throw new Error('Error inserting schedule data');
        }
        return await response.json(); // Return the response if needed
    } catch (error) {
        console.error('Error inserting schedule data:', error);
        throw error;
    }
}



}
