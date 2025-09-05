import { Webhook } from "svix";
import User from "../models/User.js";

//API Controller Function to Manage Clerk User with db

export const clerkWebhooks = async (req, res) => {
  try {
    const svixHeaders = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    if (
      !svixHeaders["svix-id"] ||
      !svixHeaders["svix-timestamp"] ||
      !svixHeaders["svix-signature"]
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Svix headers" });
    }

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const payloadString = req.body?.toString?.() ?? "";
    const evt = webhook.verify(payloadString, svixHeaders);

    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        const primaryEmail = (
          data.email_addresses?.find?.(
            (e) => e.id === data.primary_email_address_id
          ) || data.email_addresses?.[0]
        )?.email_address;
        const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const fullName =
          `${firstName} ${lastName}`.trim() ||
          data.username ||
          primaryEmail ||
          "Unknown";

        const userData = {
          _id: data.id,
          email: primaryEmail || "",
          name: fullName,
          imageUrl: data.image_url || "",
        };
        await User.findByIdAndUpdate(data.id, userData, {
          upsert: true,
          new: true,
        });
        return res.status(200).json({ success: true });
      }

      case "user.updated": {
        const primaryEmail = (
          data.email_addresses?.find?.(
            (e) => e.id === data.primary_email_address_id
          ) || data.email_addresses?.[0]
        )?.email_address;
        const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const fullName =
          `${firstName} ${lastName}`.trim() ||
          data.username ||
          primaryEmail ||
          "Unknown";
        const userData = {
          email: primaryEmail || "",
          name: fullName,
          imageUrl: data.image_url || "",
        };
        await User.findByIdAndUpdate(data.id, userData, { new: true });
        return res.status(200).json({ success: true });
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        return res.status(200).json({ success: true });
      }

      default: {
        return res
          .status(200)
          .json({ success: true, message: "Event ignored" });
      }
    }
  } catch (error) {
    console.error("Clerk webhook error:", error?.message || error);
    return res
      .status(400)
      .json({ success: false, message: error?.message || "Invalid webhook" });
  }
};
