export default class ProgramModel {
    constructor(id, programName, programNumber, programNumOfYear,
                programYrLvlSummer, academicYear) {
        this.id = id;
        this.programName = programName;
        this.programNumber = programNumber;
        this.programNumOfYear =programNumOfYear;
        this.programYrLvlSummer = programYrLvlSummer;
        this.academicYear = academicYear;
    }

    // Function to fetch program data by programNumber UNUSED???
    static async fetchProgramData(programNumber) {
        try {
            const response = await fetch(`http://localhost:5000/program/${programNumber}`);
            if (!response.ok) {
                throw new Error('Error fetching program data');
            }
            const data = await response.json();

            // Return a new ProgramModel instance with the fetched data
            return new ProgramModel(
                data.id,
                data.programName,
                data.programNumber,
                data.programNumOfYear,
                data.programYrLvlSummer,
                data.academicYear
            );
        } catch (error) {
            console.error('Error fetching program data:', error);
            throw error;
        }
    }

    // Function to fetch all programs
    static async fetchAllPrograms() {
        try {
            const response = await fetch('http://localhost:5000/program');
            if (!response.ok) {
                throw new Error('Error fetching programs');
            }
            const data = await response.json();

            // Assuming data is an array of program objects
            return data.map(program => new ProgramModel(
                program.id,
                program.programName,
                program.programNumber,
                program.noOfYears,
                program.yearLevelwithSummer,
                program.academicYear
            ));
        } catch (error) {
            console.error('Error fetching programs:', error);
            throw error;
        }
    }

    // New method to create and insert a program
    static async createAndInsertProgram(newProgramsData) {
    
    console.log(newProgramsData);
        try {
            const response = await fetch('http://localhost:5000/program/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: newProgramsData }),
            });
            if (!response.ok) {
                throw new Error('Error inserting program');
            }
            return await response.json(); // Return the created program data if needed
        } catch (error) {
            console.error('Error inserting program:', error);
            throw error;
        }
    }

    static async deletePrograms(programNumber) {
        try {
          const response = await fetch(`http://localhost:5000/program/${programNumber}`, {
            method: 'DELETE',
        });
      
          if (!response.ok) {
            throw new Error('Error deleting personnel');
          }
      
          const data = await response.json();
          return data; // Return response or success message
        } catch (error) {
          console.error('Error deleting program:', error);
          throw error;
        }
    }
}
