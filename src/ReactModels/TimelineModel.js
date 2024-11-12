export default class TimelineModel {
    constructor(id, academicYear, studentNumber, yearLevel, semester, startEnroll, endEnroll) {
        this.id = id;
        this.academicYear = academicYear;
        this.studentNumber = studentNumber;
        this.yearLevel = yearLevel;
        this.semester = semester;
        this.startEnroll = startEnroll;
        this.endEnroll = endEnroll;
    }

    // Function to fetch timeline data (Read only)
    static async fetchTimelineData(academicYear) {
        try {
            const response = await fetch(`http://localhost:5000/timeline/${academicYear}`);
            if (!response.ok) {
                throw new Error('Error fetching timeline data');
            }
            const data = await response.json();
            return new TimelineModel(
                data.id,
                data.academicYear,
                data.studentNumber,
                data.yearLevel,
                data.semester,
                data.startEnroll,
                data.endEnroll
            );
        } catch (error) {
            console.error('Error fetching timeline data:', error);
            throw error;
        }
    }
    
    // New method to create and insert timeline data
    static async createAndInsertTimeline(academicYear, studentNumber, yearLevel, semester, startEnroll, endEnroll, isRepeating, isLeaving, admissionYear) {
        const timelineData = {
            academicYear,
            studentNumber,
            yearLevel,
            semester,
            startEnroll,
            endEnroll,
            isRepeating,
            isLeaving,
            admissionYear
        };

        try {
            const response = await fetch(`http://localhost:5000/timeline/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: timelineData }),
            });
            if (!response.ok) {
                throw new Error('Error inserting timeline data');
            }
            return await response.json(); // Return the response if needed
        } catch (error) {
            console.error('Error inserting timeline data:', error);
            throw error;
        }
    }
}
