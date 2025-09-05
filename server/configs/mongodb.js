import mongoose from "mongoose";

//Connect to the MongoDB database

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    mongoose.connection.on("connected", () => {
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
    });

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: "lms",
    });

    isConnected = true;
  } catch (error) {
    isConnected = false;
    throw error;
  }
};

export default connectDB;
