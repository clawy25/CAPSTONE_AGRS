export default class SectionModel {
    constructor(id, sectionNumber, programNumber, studentNumber) {
        this.id = id;
        this.sectionNumber = sectionNumber;
        this.programNumber = programNumber;
        this.studentNumber = studentNumber;
    }

    // Function to fetch all programs
    static async fetchExistingSections() {
        try {
            const response = await fetch('http://localhost:5000/section');
            if (!response.ok) {
                throw new Error('Error fetching programs');
            }
            const data = await response.json();

            // Assuming data is an array of program objects
            return data.map(section => new SectionModel(
                section.id,
                section.sectionNumber,
                section.programNumber,
                section.studentNumber
            ));
        } catch (error) {
            console.error('Error fetching sections:', error);
            throw error;
        }
    }

    // New method to create and insert a program
    static async createAndInsertSection(sectionNumber, programNumber, studentNumber) {
        const sectionData = {
            sectionNumber,
            programNumber,
            studentNumber
        };

        try {
            const response = await fetch(`http://localhost:5000/section/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: sectionData }),
            });
            if (!response.ok) {
                throw new Error('Error inserting section data');
            }
            return await response.json(); // Return the response if needed
        } catch (error) {
            console.error('Error inserting section data:', error);
            throw error;
        }
    }
}
