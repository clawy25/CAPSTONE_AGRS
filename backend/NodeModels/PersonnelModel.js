// Import Supabase client
const supabase = require('../supabaseServer'); // Adjust path to supabaseServer.js

// Function to create a new personnel entry
const createPersonnel = async (personnelData) => {
  const { personnelNumber, personnelPassword, personnelType, personnelName, personnelGender, personnelEmail, personnelBirthDate } = personnelData;
  
  const { data, error } = await supabase
    .from('personnel') // Assuming the table is named 'personnel'
    .insert([{
      personnelNumber,
      personnelPassword,
      personnelType,
      personnelName,
      personnelGender,
      personnelEmail,
      personnelBirthDate
    }]);

  if (error) {
    console.error('Error creating personnel:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
};

// Function to fetch personnel by personnelNumber
const getPersonnelByNumber = async (personnelNumber) => {
  const { data, error } = await supabase
    .from('personnel')
    .select('*')
    .eq('personnelNumber', personnelNumber)
    .single(); // Assumes personnelNumber is unique

  if (error) {
    console.error('Error fetching personnel:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
};

// Function to update personnel details
const updatePersonnel = async (personnelId, updateData) => {
  const { data, error } = await supabase
    .from('personnel')
    .update(updateData) // Pass an object with fields to update
    .eq('id', personnelId);

  if (error) {
    console.error('Error updating personnel:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

// Function to delete personnel by ID
const deletePersonnel = async (personnelId) => {
  const { data, error } = await supabase
    .from('personnel')
    .delete()
    .eq('id', personnelId);

  if (error) {
    console.error('Error deleting personnel:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

// Export functions
module.exports = {
  createPersonnel,
  getPersonnelByNumber,
  updatePersonnel,
  deletePersonnel
};
