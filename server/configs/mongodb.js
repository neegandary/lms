import mongoose from "mongoose";

//Connect to the MongoDB database

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    mongoose.connection.on("connected", () => {
      console.log("Database Connected");
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.log("Database Error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Database Disconnected");
      isConnected = false;
    });

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(`${process.env.MONGODB_URI}/lms`, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("MongoDB connection established");
  } catch (error) {
    console.error("Database connection error:", error.message);
    isConnected = false;
    throw error;
  }
};

export default connectDB;
