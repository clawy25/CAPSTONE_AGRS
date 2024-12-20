export default class PBAModel {
    constructor(id, scheduleNumber, period, instanceNumber, pbaLabel) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.period = period;
        this.instanceNumber = instanceNumber;
        this.pbaLabel = pbaLabel;
    }
    
  static async fetchPBAData(scheduleNumber) {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/pba/all`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduleNumber }),
        });
        if (!response.ok) {
            throw new Error('Error fetching PBA data');
        }
        const data = await response.json();

        // Assuming data is an array of quiz objects
        return data.map(data => new PBAModel(
            data.id,
            data.scheduleNumber,
            data.period,
            data.instanceNumber,
            data.pbaLabel
        ));
    } catch (error) {
        console.error('Error fetching pba:', error);
        throw error;
    }
  }

  static async updatePBAData(pbaData) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/pba/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pbaData })
      });
  
      if (!response.ok) {
        throw new Error('Error updating pba data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating pba:', error);
      throw error;
    }
  }
}
