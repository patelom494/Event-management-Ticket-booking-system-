const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function MyBookings(req, res) {
  try {
    const db = await connectDB();
    const bookings = await db.collection("event_bookings").aggregate([
      { $match: { user_id: new ObjectId(req.user._id) } },
      { $lookup: { from: "events", localField: "event_id", foreignField: "_id", as: "event" } },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "categories", localField: "event.category_id", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $sort: { date: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Bookings fetched successfully", data: bookings });
  } catch (error) {
    console.error("MyBookings.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { MyBookings };
