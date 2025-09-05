import { Webhook } from "svix";
import User from "../models/User.js";
import mongoose from "mongoose";
import connectDB from "../configs/mongodb.js";

//API Controller Function to Manage Clerk User with db

export const clerkWebhooks = async (req, res) => {
  try {
    // Parse the raw body since we're using express.raw()
    const payload = req.body.toString();
    let parsedBody;

    try {
      parsedBody = JSON.parse(payload);
    } catch (parseError) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid JSON payload" });
    }

    // Check if required environment variable exists
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "Webhook secret not configured" });
    }

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verify webhook signature using raw payload
    try {
      const headers = {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      };

      await whook.verify(payload, headers);
    } catch (verifyError) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const { data, type } = parsedBody;

    // Check database connection before processing
    if (mongoose.connection.readyState !== 1) {
      try {
        await connectDB();
      } catch (dbError) {
        return res
          .status(500)
          .json({ success: false, message: "Database connection failed" });
      }
    }

    switch (type) {
      case "user.created": {
        // Check if required data exists
        if (!data.id) {
          return res
            .status(400)
            .json({ success: false, message: "User ID is required" });
        }

        const userData = {
          _id: data.id,
          email:
            data.email_addresses?.[0]?.email_address || "no-email@example.com",
          name:
            ((data.first_name || "") + " " + (data.last_name || "")).trim() ||
            "No Name",
          imageUrl: data.image_url || "",
        };

        try {
          const createdUser = await User.create(userData);
          res.json({ success: true, user: createdUser });
        } catch (dbError) {
          throw dbError;
        }
        break;
      }

      case "user.updated": {
        const userData = {
          email:
            data.email_addresses?.[0]?.email_address || "no-email@example.com",
          name:
            ((data.first_name || "") + " " + (data.last_name || "")).trim() ||
            "No Name",
          imageUrl: data.image_url || "",
        };

        const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
          new: true,
        });

        res.json({ success: true, user: updatedUser });
        break;
      }

      case "user.deleted": {
        const deletedUser = await User.findByIdAndDelete(data.id);
        res.json({ success: true, user: deletedUser });
        break;
      }

      default:
        res.json({
          success: true,
          message: `Event type '${type}' not handled`,
        });
        break;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
