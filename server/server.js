import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controller/webhooks.js";

const app = express();

// Kết nối DB
await connectDB();

// Middlewares
app.use(cors());

// Routes
app.get("/", (req, res) => res.send("API Working"));

// Webhook route (dùng raw để verify chữ ký)
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
