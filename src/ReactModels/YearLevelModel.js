export default class YearLevelModel {
    constructor(id, yearNumber, yearName) {
        this.id = id;
        this.yearNumber = yearNumber;
        this.yearName = yearName;
    }

    // Function to fetch all year levels
    static async fetchExistingYearLevels() {
        try {
            const response = await fetch('http://localhost:5000/yearlevel');
            if (!response.ok) {
                throw new Error('Error fetching year levels');
            }
            const data = await response.json();
            
            console.log('Year Levels Data:', data); // Add this line for debugging
    
            return data.map(yearLevel => new YearLevelModel(
                yearLevel.id,
                yearLevel.yearNumber,
                yearLevel.yearName
            ));
        } catch (error) {
            console.error('Error fetching year levels:', error);
            throw error;
        }
    }
    

    // New method to create and insert a year level
    static async createAndInsertYearLevel(yearNumber, yearName) {
        const yearLevelData = {
            yearNumber,
            yearName
        };

        try {
            const response = await fetch(`http://localhost:5000/yearlevel/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: yearLevelData }),
            });
            if (!response.ok) {
                throw new Error('Error inserting year level data');
            }
            return await response.json(); // Return the response if needed
        } catch (error) {
            console.error('Error inserting year level data:', error);
            throw error;
        }
    }
}
