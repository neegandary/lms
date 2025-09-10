import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks, stripeWebhooks } from "./controller/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoute.js";

//Initialize Express
const app = express();

//Middlewares
app.use(cors());
app.use(clerkMiddleware());

//Routes
app.get("/", (req, res) => res.send("API Working"));

// Special middleware for Clerk webhooks - capture raw body
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

app.use("/api/educator", express.json(), educatorRouter);

app.use("/api/course", express.json(), courseRouter);

app.use("/api/user", express.json(), userRouter);

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

//Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    // Database connection failed, but continue running
  }
};
await connectCloudinary();

// For Vercel, we don't need to listen on a port
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT);
}

// Initialize database connection
startServer();

export default app;
