const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function AddReview(req, res) {
  try {
    const { booking_id, review, rating } = req.body;

    if (!booking_id || !review || !rating) return res.status(400).json({ success: false, message: "Booking ID, review and rating are required" });
    if (!ObjectId.isValid(booking_id)) return res.status(400).json({ success: false, message: "Invalid booking ID" });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });

    const db = await connectDB();
    const booking = await db.collection("event_bookings").findOne({
      _id: new ObjectId(booking_id),
      user_id: new ObjectId(req.user._id),
    });

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    await db.collection("reviews").insertOne({
      user_id: new ObjectId(req.user._id),
      booking_id: new ObjectId(booking_id),
      review,
      rating: parseFloat(rating),
      created_at: new Date(),
    });

    return res.status(201).json({ success: true, message: "Review submitted successfully" });
  } catch (error) {
    console.error("AddReview.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { AddReview };
