export default class TimelineModel {
    constructor(id, academicYear, studentNumber, yearLevel, semester, startEnroll, 
                endEnroll, isRepeating, isLeaving, admissionYear) {
        this.id = id;
        this.academicYear = academicYear;
        this.studentNumber = studentNumber;
        this.yearLevel = yearLevel;
        this.semester = semester;
        this.startEnroll = startEnroll;
        this.endEnroll = endEnroll;
        this.isRepeating = isRepeating;
        this.isLeaving = isLeaving;
        this.admissionYear = admissionYear;
    }

    // Function to fetch timeline data (Read only)
    static async fetchTimelineData(academicYear, studentNumber) {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/timeline/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ academicYear, studentNumber }), // Send credentials
              });
            if (!response.ok) {
                throw new Error('Error fetching timeline data');
            }
            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error fetching timeline data:', error);
            throw error;
        }
    }
    
    // New method to create and insert timeline data
    static async createAndInsertTimeline(timelineData) {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/timeline/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: timelineData })
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
