const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function AddComplaint(req, res) {
  try {
    const { booking_id, subject, message } = req.body;

    if (!booking_id || !subject || !message) return res.status(400).json({ success: false, message: "Booking ID, subject and message are required" });
    if (!ObjectId.isValid(booking_id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });

    const db = await connectDB();
    const booking = await db.collection("event_bookings").findOne({
      _id: new ObjectId(booking_id),
      user_id: new ObjectId(req.user._id),
    });

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    await db.collection("complaints").insertOne({
      booking_id: new ObjectId(booking_id),
      user_id: new ObjectId(req.user._id),
      subject,
      message,
      status: "Pending",
      timestamp: new Date(),
    });

    return res.status(201).json({ success: true, message: "Complaint submitted successfully" });
  } catch (error) {
    console.error("AddComplaint.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { AddComplaint };
