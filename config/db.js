require('dotenv').config();
const mongoose = require('mongoose'); 

// Connecting to MongoDB
const url = process.env.MONGO_URL; // Updated to match your .env file

const conDB = async () => {
  try {
    const connectDB = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (connectDB) {
      console.log("Connected to the database");
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

module.exports = conDB;
