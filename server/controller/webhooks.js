import { Webhook } from "svix";
import User from "../models/User.js";
import mongoose from "mongoose";

//API Controller Function to Manage Clerk User with db

export const clerkWebhooks = async (req, res) => {
  try {
    console.log("Webhook received:", {
      headers: req.headers,
      body: req.body,
      method: req.method,
    });

    // Check if required environment variable exists
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.error("CLERK_WEBHOOK_SECRET is not defined");
      return res
        .status(500)
        .json({ success: false, message: "Webhook secret not configured" });
    }

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verify webhook signature
    try {
      await whook.verify(JSON.stringify(req.body), {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      });
      console.log("Webhook signature verified successfully");
    } catch (verifyError) {
      console.error("Webhook verification failed:", verifyError.message);
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const { data, type } = req.body;
    console.log("Processing webhook event:", { type, userId: data?.id });

    switch (type) {
      case "user.created": {
        console.log("Creating new user:", data);

        // Check if required data exists
        if (!data.id) {
          console.error("User ID is missing from webhook data");
          return res
            .status(400)
            .json({ success: false, message: "User ID is required" });
        }

        const userData = {
          _id: data.id,
          email:
            data.email_addresses?.[0]?.email_address || "No email provided",
          name: (data.first_name || "") + " " + (data.last_name || ""),
          imageUrl: data.image_url || "",
        };

        console.log("User data to create:", userData);

        const createdUser = await User.create(userData);
        console.log("User created successfully:", createdUser);

        res.json({ success: true, user: createdUser });
        break;
      }

      case "user.updated": {
        console.log("Updating user:", data.id);

        const userData = {
          email:
            data.email_addresses?.[0]?.email_address || "No email provided",
          name: (data.first_name || "") + " " + (data.last_name || ""),
          imageUrl: data.image_url || "",
        };

        const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
          new: true,
        });
        console.log("User updated successfully:", updatedUser);

        res.json({ success: true, user: updatedUser });
        break;
      }

      case "user.deleted": {
        console.log("Deleting user:", data.id);

        const deletedUser = await User.findByIdAndDelete(data.id);
        console.log("User deleted successfully:", deletedUser);

        res.json({ success: true, user: deletedUser });
        break;
      }

      default:
        console.log("Unhandled event type:", type);
        res.json({ success: true, message: "Event type not handled" });
        break;
    }
  } catch (error) {
    console.error("Webhook error:", {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
    });
    res.status(500).json({ success: false, message: error.message });
  }
};
