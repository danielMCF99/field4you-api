import mongoose from "mongoose";
import dotenv from "dotenv";
import config from "../../config/env";

dotenv.config();

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
