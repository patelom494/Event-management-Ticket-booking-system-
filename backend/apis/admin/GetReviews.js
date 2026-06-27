const connectDB = require("../../db/dbConnect");

async function GetAdminReviews(req, res) {
  try {
    const db = await connectDB();
    const reviews = await db.collection("reviews").aggregate([
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "event_bookings", localField: "booking_id", foreignField: "_id", as: "booking" } },
      { $unwind: { path: "$booking", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "events", localField: "booking.event_id", foreignField: "_id", as: "event" } },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      { $project: { "user.password": 0 } },
      { $sort: { created_at: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Reviews fetched successfully", data: reviews });
  } catch (error) {
    console.error("admin/GetReviews.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { GetAdminReviews };
