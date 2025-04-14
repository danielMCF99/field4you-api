import mongoose from "mongoose";
import config from "../../config/env";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
