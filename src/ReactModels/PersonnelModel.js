export default class PersonnelModel {
  constructor(id, personnelNumber, personnelPassword, personnelType,
              personnelNameFirst, personnelNameMiddle,personnelNameLast,
              personnelSex, personnelEmail, 
              personnelBirthDate, programNumber, programName,
              personnelContact, personnelAddress, academicYear) {
    this.id = id;
    this.personnelNumber = personnelNumber;
    this.personnelPassword = personnelPassword;
    this.personnelType = personnelType;
    this.personnelNameFirst = personnelNameFirst;
    this.personnelNameMiddle = personnelNameMiddle;
    this.personnelNameLast = personnelNameLast;
    this.personnelSex = personnelSex;
    this.personnelEmail = personnelEmail;
    this.personnelBirthDate = personnelBirthDate;
    this.programNumber = programNumber;
    this.programName = programName;
    this.personnelContact = personnelContact;
    this.personnelAddress = personnelAddress;
    this.academicYear = academicYear;
  }

  


  // Add this function to fetch a professor by personnel number
  static async getProfessorByPersonnelNumber(personnelNumber) {
    try {

      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await fetch(`${apiUrl}/personnel/${personnelNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching professor data for personnelNumber: ${personnelNumber}`);
      }
  
      const professor = await response.json();
  
      if (!professor || !professor.personnelNameFirst || !professor.personnelNameLast) {
        // Handle case where professor data is missing or incomplete
        console.warn(`No valid professor data found for personnelNumber: ${personnelNumber}`);
        return {
          firstName: 'No professor assigned',
          lastName: '',
        };
      }
  
      // Return the professor's name if data is valid
      return {
        firstName: professor.personnelNameFirst,
        lastName: professor.personnelNameLast,
      };
    } catch (error) {
      console.error('Error fetching professor:', error.message);
      // Return default values in case of an error or missing data
      return {
        firstName: 'No professor assigned',
        lastName: '',
      };
    }
  }
  
  

  // Fetch specific personnel's credentials
  static async LoginPersonnelData(personnelNumber, password) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await fetch(`${apiUrl}/personnel/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personnelNumber, password }), // Send credentials
      });
  
      if (!response.ok) {
        throw new Error('Error fetching personnel data');
      }
  
      const data = await response.json();
  
      // Store the academic year in sessionStorage
      sessionStorage.setItem('currentAcadYear', data.academicYear);
  
      // Return a new instance of PersonnelModel with the additional fields
      return new PersonnelModel( // Filtering the sensitive info
        null,
        data.personnelNumber,
        null,
        data.personnelType,
        data.personnelNameFirst,
        data.personnelNameMiddle,
        data.personnelNameLast,
        null,
        null,
        null,
        data.programNumber,
        null,
        null,
        null,
        null
      );
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      throw error;
    }
  }
  
  // Fetch list of professors by program
  static async getProfessorsbyProgram(programNumber, currentAcadYear) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await fetch(`${apiUrl}/personnel/byProgram`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programNumber, currentAcadYear }), // Send credentials
      });
      if (!response.ok) {
        throw new Error('Error fetching professors data');
      }
      const data = await response.json();

      // Map the data to an array of PersonnelModel instances
      return data.map((prof) => new PersonnelModel(
        prof.id,
        prof.personnelNumber,
        prof.personnelPassword,
        prof.personnelType,
        prof.personnelNameFirst,
        prof.personnelNameMiddle,
        prof.personnelNameLast,
        prof.personnelSex,
        prof.personnelEmail,
        prof.personnelBirthDate,
        prof.programNumber,
        prof.programName,
        prof.personnelContact,
        prof.personnelAddress,
        prof.academicYear
      ));
    } catch (error) {
      console.error('Error fetching professors:', error);
      throw error;
    }
  }

  static async fetchAllPersonnel(currentAcadYear) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await fetch(`${apiUrl}/personnel/all`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentAcadYear }), // Send credentials
      });

      if (!response.ok) {
        throw new Error('Error fetching personnel details');
      }

      const data = await response.json();

      // Map the data to an array of PersonnelModel instances
      return data.map((person) => new PersonnelModel(
        person.id,
        person.personnelNumber,
        person.personnelPassword,
        person.personnelType,
        person.personnelNameFirst,
        person.personnelNameMiddle,
        person.personnelNameLast,
        person.personnelSex,
        person.personnelEmail,
        person.personnelBirthDate,
        person.programNumber,
        person.programName,
        person.personnelContact,
        person.personnelAddress,
        person.academicYear
      ));
    } catch (error) {
      console.error('Error fetching personnel details:', error);
      throw error;
    }
  }


  static async insertPersonnel(personnelData) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/personnel/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: personnelData }), // Expecting an array
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('Error details:', errorDetails);
            throw new Error(errorDetails || 'Error inserting personnel');
        }

        return await response.json();
    } catch (error) {
        console.error('Error inserting personnel:', error);
        throw error;
    }
}


  // Update personnel data
static async updatePersonnel(personnelNumber, updatedData) {
  try {

    const apiUrl = process.env.REACT_APP_API_URL;

    const response = await fetch(`${apiUrl}/personnel/${personnelNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Error updating personnel data');
    }

    const data = await response.json();
    return data; // Return updated personnel data
  } catch (error) {
    console.error('Error updating personnel:', error);
    throw error;
  }
}
// Delete personnel data
static async deletePersonnel(personnelNumber) {
  try {
    const apiUrl = process.env.REACT_APP_API_URL;
    const response = await fetch(`${apiUrl}/personnel/${personnelNumber}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error deleting personnel');
    }

    const data = await response.json();
    return data; // Return response or success message
  } catch (error) {
    console.error('Error deleting personnel:', error);
    throw error;
  }
}

}
