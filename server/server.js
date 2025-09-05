import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controller/webhooks.js";

//Initialize Express
const app = express();

//Connect to database
await connectDB();

//Middlewares
app.use(cors());

//Routes
app.get("/", (req, res) => res.send("API Working"));
// Use raw body for Clerk webhook so signature verification works
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

export default app;
