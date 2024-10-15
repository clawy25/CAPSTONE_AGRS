export default class ScheduleModel {
    constructor(id, scheduleNumber, subjectCode, subjectName, personnelName, scheduleDay, startTime, endTime, subjectUnits, yearNumber, sectionNumber) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.personnelName = personnelName;
        this.scheduleDay = scheduleDay;
        this.startTime = startTime;
        this.endTime = endTime;
        this.subjectUnits = subjectUnits;
        this.yearNumber = yearNumber;          // New property for year number
        this.sectionNumber = sectionNumber;    // New property for section number
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
                schedule.personnelName,
                schedule.scheduleDay,
                schedule.startTime,
                schedule.endTime,
                schedule.subjectUnits,
                schedule.yearNumber,           // Fetching year number from data
                schedule.sectionNumber         // Fetching section number from data
            ));
        } catch (error) {
            console.error('Error fetching schedules:', error);
            throw error;
        }
    }

    // New method to create and insert a schedule
    static async createAndInsertSchedule(scheduleNumber, subjectCode, subjectName, personnelName, scheduleDay, startTime, endTime, subjectUnits, yearNumber, sectionNumber) {
        const scheduleData = {
            scheduleNumber,
            subjectCode,
            subjectName,
            personnelName,
            scheduleDay,
            startTime,
            endTime,
            subjectUnits,
            yearNumber,           // Including year number in schedule data
            sectionNumber         // Including section number in schedule data
        };

        try {
            const response = await fetch(`http://localhost:5000/schedule/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: scheduleData }),
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
