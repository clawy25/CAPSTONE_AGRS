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
