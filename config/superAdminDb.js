const mongoose = require("mongoose");

const connectSuperAdminDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_SUPERADMIN);
    console.log("Connected to SuperAdmin database");
  } catch (error) {
    console.error("SuperAdmin DB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectSuperAdminDB;
