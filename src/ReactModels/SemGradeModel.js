export default class SemGradeModel {
    constructor(id, scheduleNumber, studentNumber,
                midtermCS, midtermPBA, midtermExam, midtermGrade,
                finalCS, finalPBA, finalExam, finalGrade,
                semGrade, numEq, remarks) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.studentNumber = studentNumber;
        this.midtermCS = midtermCS;
        this.midtermPBA = midtermPBA;
        this.midtermExam = midtermExam;
        this.midtermGrade = midtermGrade;
        this.finalCS = finalCS;
        this.finalPBA = finalPBA;
        this.finalExam = finalExam;
        this.finalGrade = finalGrade;
        this.semGrade = semGrade;
        this.numEq = numEq;
        this.remarks = remarks;
    }
    
  static async fetchSemGradeData(scheduleNumber) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/semgrade/all`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduleNumber }),
        });
        if (!response.ok) {
            throw new Error('Error fetching semgrades data');
        }
        const data = await response.json();

        // Assuming data is an array of quiz objects
        return data.map(data => new SemGradeModel(
            data.id,
            data.scheduleNumber,
            data.studentNumber,
            data.midtermCS,
            data.midtermPBA,
            data.midtermExam,
            data.midtermGrade,
            data.finalCS,
            data.finalPBA,
            data.finalExam,
            data.finalGrade,
            data.semGrade,
            data.numEq,
            data.remarks
        ));
    } catch (error) {
        console.error('Error fetching semgrades:', error);
        throw error;
    }
  }

  static async updateSemGradeData(semgradeData) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/semgrade/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ semgradeData })
      });
  
      if (!response.ok) {
        throw new Error('Error updating exam data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating semgrade:', error);
      throw error;
    }
  }
}
