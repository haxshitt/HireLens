const mongoose = require("mongoose");

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database");

    // Automatically drop legacy password_1 index if it exists in MongoDB collection
    try {
      const db = mongoose.connection.db;
      await db.collection("users").dropIndex("password_1");
      console.log("Successfully dropped legacy password_1 index");
    } catch (indexErr) {
      // Index does not exist or already dropped
    }
  } catch (err) {
    console.error("Database Connection Error:", err);
  }
}

module.exports = connectToDB;
