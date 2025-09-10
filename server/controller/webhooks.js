import { Webhook } from "svix";
import User from "../models/User.js";
import mongoose from "mongoose";
import connectDB from "../configs/mongodb.js";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";

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

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  //Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId);
      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(
        purchaseData.courseId.toString()
      );

      courseData.enrolledStudents.push(userData);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      purchaseData.status = "completed";
      await purchaseData.save();

      break;
    case "payment_intent.payment_failed":
      paymentIntent = event.data.object;
      paymentIntentId = paymentIntent.id;

      session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      purchaseId = session.data[0].metadata;
      purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = "failed";
      await purchaseData.save();
      break;
    //..handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }

  //Return a response to acknowledge receipt of the event
  response.json({ received: true });
};
