import { Webhook } from "svix";
import User from "../models/User.js";
import mongoose from "mongoose";
import connectDB from "../configs/mongodb.js";

//API Controller Function to Manage Clerk User with db

export const clerkWebhooks = async (req, res) => {
  console.log("🔔 Webhook endpoint hit!", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  try {
    // Parse the raw body since we're using express.raw()
    const payload = req.body.toString();
    let parsedBody;

    try {
      parsedBody = JSON.parse(payload);
    } catch (parseError) {
      console.error("❌ Failed to parse webhook payload:", parseError.message);
      return res
        .status(400)
        .json({ success: false, message: "Invalid JSON payload" });
    }

    console.log("📋 Raw request data:", {
      headers: Object.keys(req.headers),
      payloadLength: payload.length,
      bodyContent: parsedBody,
      hasSignature: !!req.headers["svix-signature"],
    });

    // Check if required environment variable exists
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.error("❌ CLERK_WEBHOOK_SECRET is not defined");
      return res
        .status(500)
        .json({ success: false, message: "Webhook secret not configured" });
    }

    console.log("🔑 Webhook secret found, creating Webhook instance...");
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verify webhook signature using raw payload
    try {
      const headers = {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      };

      console.log("🔐 Verifying webhook with:", {
        payloadLength: payload.length,
        headers: headers,
      });

      // Use raw payload for verification (this is the key fix!)
      await whook.verify(payload, headers);
      console.log("✅ Webhook signature verified successfully");
    } catch (verifyError) {
      console.error("❌ Webhook verification failed:", {
        error: verifyError.message,
        stack: verifyError.stack,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const { data, type } = parsedBody;
    console.log("📨 Processing webhook event:", {
      type: type,
      userId: data?.id,
      dataKeys: data ? Object.keys(data) : "no data",
    });

    // Check database connection before processing
    console.log(
      "🗄️ Database connection state:",
      mongoose.connection.readyState
    );
    if (mongoose.connection.readyState !== 1) {
      console.log("⚡ Database not connected, attempting to connect...");
      try {
        await connectDB();
        console.log("✅ Database connected successfully");
      } catch (dbError) {
        console.error("❌ Failed to connect to database:", dbError.message);
        return res
          .status(500)
          .json({ success: false, message: "Database connection failed" });
      }
    }

    switch (type) {
      case "user.created": {
        console.log("👤 Creating new user with data:", {
          id: data.id,
          email_addresses: data.email_addresses,
          first_name: data.first_name,
          last_name: data.last_name,
          image_url: data.image_url,
        });

        // Check if required data exists
        if (!data.id) {
          console.error("❌ User ID is missing from webhook data");
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

        console.log("💾 Attempting to save user data:", userData);

        try {
          const createdUser = await User.create(userData);
          console.log("🎉 User created successfully in MongoDB:", {
            id: createdUser._id,
            email: createdUser.email,
            name: createdUser.name,
          });

          res.json({ success: true, user: createdUser });
        } catch (dbError) {
          console.error("❌ Database error creating user:", {
            error: dbError.message,
            code: dbError.code,
            stack: dbError.stack,
          });
          throw dbError;
        }
        break;
      }

      case "user.updated": {
        console.log("🔄 Updating user:", data.id);

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
        console.log("✅ User updated successfully:", updatedUser);

        res.json({ success: true, user: updatedUser });
        break;
      }

      case "user.deleted": {
        console.log("🗑️ Deleting user:", data.id);

        const deletedUser = await User.findByIdAndDelete(data.id);
        console.log("✅ User deleted successfully:", deletedUser);

        res.json({ success: true, user: deletedUser });
        break;
      }

      default:
        console.log("ℹ️ Unhandled event type:", type);
        res.json({
          success: true,
          message: `Event type '${type}' not handled`,
        });
        break;
    }
  } catch (error) {
    console.error("💥 Webhook processing error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    res
      .status(500)
      .json({ success: false, message: error.message, error: error.name });
  }
};
