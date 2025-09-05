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

// Special middleware for Clerk webhooks - capture raw body
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

//Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    // Database connection failed, but continue running
  }
};

// For Vercel, we don't need to listen on a port
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT);
}

// Initialize database connection
startServer();

export default app;
