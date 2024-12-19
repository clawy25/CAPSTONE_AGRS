export default class ComponentModel {
    constructor(id, scheduleNumber, period, componentNumber, weight) {
        this.id = id;
        this.scheduleNumber = scheduleNumber;
        this.period = period;
        this.componentNumber = componentNumber;
        this.weight = weight;
    }
    
  static async fetchComponentData(scheduleNumber) {
    try {
        const response = await fetch('http://localhost:5000/component', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduleNumber }),
        });
        if (!response.ok) {
            throw new Error('Error fetching component data');
        }
        const data = await response.json();

        // Assuming data is an array of quiz objects
        return data.map(data => new ComponentModel(
            data.id,
            data.scheduleNumber,
            data.period,
            data.componentNumber,
            data.weight
        ));
    } catch (error) {
        console.error('Error fetching component:', error);
        throw error;
    }
  }

  static async updateComponentData(compData) {
    try {
      const response = await fetch(`http://localhost:5000/component/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ compData })
      });
  
      if (!response.ok) {
        throw new Error('Error updating component data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating component:', error);
      throw error;
    }
  }
}
