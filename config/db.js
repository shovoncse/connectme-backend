const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
let MONGO = process.env.MONGO_ATLAS;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log("Connected to Database");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
