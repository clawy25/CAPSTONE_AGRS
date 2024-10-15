export default class SectionModel {
    constructor(id, sectionNumber, sectionName) {
        this.id = id;
        this.sectionNumber = sectionNumber;
        this.sectionName = sectionName;
    }

    // Function to fetch all sections
    static async fetchExistingSections() {
        try {
            const response = await fetch('http://localhost:5000/section');
            if (!response.ok) {
                throw new Error('Error fetching sections');
            }
            const data = await response.json();

            console.log('Fetched Sections Data:', data); // Debugging log

            return data.map(section => new SectionModel(
                section.id,
                section.sectionNumber,
                section.sectionName
            ));
        } catch (error) {
            console.error('Error fetching sections:', error);
            throw error;
        }
    }

    // New method to create and insert a section
    static async createAndInsertSection(sectionNumber, sectionName) {
        const sectionData = {
            sectionNumber,
            sectionName
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
