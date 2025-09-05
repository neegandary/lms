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
app.get("/test-user", async (req, res) => {
  try {
    const { default: User } = await import("./models/User.js");

    // Try to create a test user
    const testUser = {
      _id: "test-" + Date.now(),
      name: "Test User",
      email: "test@example.com",
      imageUrl: "",
    };

    console.log("🧪 Testing user creation with:", testUser);

    const createdUser = await User.create(testUser);
    console.log("✅ Test user created successfully:", createdUser);

    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log("🧹 Test user cleaned up");

    res.json({
      success: true,
      message: "User creation test passed",
      testUser: createdUser,
    });
  } catch (error) {
    console.error("❌ User creation test failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.name,
    });
  }
});
// Special middleware for Clerk webhooks - capture raw body
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

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
