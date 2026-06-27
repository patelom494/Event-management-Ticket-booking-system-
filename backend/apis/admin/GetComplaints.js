const connectDB = require("../../db/dbConnect");

async function GetComplaints(req, res) {
  try {
    const db = await connectDB();
    const complaints = await db.collection("complaints").aggregate([
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "event_bookings", localField: "booking_id", foreignField: "_id", as: "booking" } },
      { $unwind: { path: "$booking", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "events", localField: "booking.event_id", foreignField: "_id", as: "event" } },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      { $project: { "user.password": 0 } },
      { $sort: { timestamp: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Complaints fetched successfully", data: complaints });
  } catch (error) {
    console.error("GetComplaints.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { GetComplaints };
