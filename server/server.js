import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controller/webhooks.js";

//Initialize Express
const app = express();

//Middlewares
app.use(cors());

//Routes
app.get("/", (req, res) => res.send("API Working"));
app.get("/test-db", async (req, res) => {
  try {
    const mongoose = await import("mongoose");
    const dbState = mongoose.default.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];

    res.json({
      success: true,
      database: {
        state: states[dbState],
        name: mongoose.default.connection.name,
        host: mongoose.default.connection.host,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
app.post("/clerk", express.json(), clerkWebhooks);

//Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

// For Vercel, we don't need to listen on a port
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Initialize database connection
startServer();

export default app;
