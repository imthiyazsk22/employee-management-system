const mongoose = require("mongoose");

const DEFAULT_URI = "mongodb://127.0.0.1:27017/employee_salary_hike_db";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || DEFAULT_URI;

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("\n--- MongoDB connection failed ---");
    console.error(error.message);
    console.error("\nFix:");
    console.error("  1. Start MongoDB (Windows: Services → MongoDB, or run mongod)");
    console.error("  2. Check MONGO_URI in .env (project root):");
    console.error(`     ${mongoUri}`);
    console.error("  3. Run again: npm start\n");
    throw error;
  }
};

module.exports = connectDB;
