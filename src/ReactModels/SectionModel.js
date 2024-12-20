export default class SectionModel {
    constructor(id, sectionNumber, programNumber,
                yearLevel, sectionSemester, academicYear) {
        this.id = id;
        this.sectionNumber = sectionNumber;
        this.programNumber = programNumber;
        this.yearLevel = yearLevel;
        this.sectionSemester = sectionSemester;
        this.academicYear = academicYear;
    }


     // Function to fetch all sections (without filtering)
     static async fetchAllSections() {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/section/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}) // Empty body, since no filters are applied
            });

            // Check if the response was successful
            if (!response.ok) {
                throw new Error('Error fetching sections');
            }

            const data = await response.json(); // Parse the JSON response
            console.log('Fetched Sections Data:', data); // Debugging log

            return data; // Return the array of all sections
        } catch (error) {
            console.error('Error fetching sections:', error);
            throw error; // Propagate the error if something goes wrong
        }
    }

    // Function to fetch all sections filtered by ff:
    static async fetchExistingSections(academicYear, yearLevel, semester, programNumber) {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/section/filter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ academicYear, yearLevel, semester, programNumber }), // Send credentials
              });
            if (!response.ok) {
                throw new Error('Error fetching sections');
            }
            const data = await response.json();

            //console.log('Fetched Sections Data:', data); // Debugging log

            return data;
        } catch (error) {
            console.error('Error fetching sections:', error);
            throw error;
        }
    }

    // New method to create and insert a section
    static async createAndInsertSection(sectionData) {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/section/upload`, {
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
