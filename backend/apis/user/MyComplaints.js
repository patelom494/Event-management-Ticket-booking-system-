const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function MyComplaints(req, res) {
  try {
    const db = await connectDB();
    const complaints = await db.collection("complaints").aggregate([
      { $match: { user_id: new ObjectId(req.user._id) } },
      { $lookup: { from: "event_bookings", localField: "booking_id", foreignField: "_id", as: "booking" } },
      { $unwind: { path: "$booking", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "events", localField: "booking.event_id", foreignField: "_id", as: "event" } },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      { $sort: { timestamp: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Complaints fetched successfully", data: complaints });
  } catch (error) {
    console.error("MyComplaints.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { MyComplaints };
