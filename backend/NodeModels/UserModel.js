const mongoose = require('mongoose'); // or your database library

const UserSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  // Add other fields as necessary
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
