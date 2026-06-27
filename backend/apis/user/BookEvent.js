const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function BookEvent(req, res) {
  try {
    const { event_id, seats } = req.body;

    if (!event_id || !seats) return res.status(400).json({ success: false, message: "Event ID and number of seats are required" });
    if (!ObjectId.isValid(event_id)) return res.status(400).json({ success: false, message: "Invalid event ID" });

    const seatsRequested = parseInt(seats);
    if (seatsRequested < 1) return res.status(400).json({ success: false, message: "At least 1 seat must be booked" });

    const db = await connectDB();
    const event = await db.collection("events").findOne({ _id: new ObjectId(event_id), status: "Active" });

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.available_seats < seatsRequested) return res.status(400).json({ success: false, message: `Only ${event.available_seats} seat(s) available` });

    const total_price = event.price_per_seat * seatsRequested;

    await db.collection("event_bookings").insertOne({
      event_id: new ObjectId(event_id),
      user_id: new ObjectId(req.user._id),
      seats: seatsRequested,
      total_price,
      date: new Date(),
      status: "Booked",
      payment_status: "Pending",
    });

    await db.collection("events").updateOne({ _id: new ObjectId(event_id) }, { $inc: { available_seats: -seatsRequested } });

    return res.status(201).json({ success: true, message: "Event booked successfully" });
  } catch (error) {
    console.error("BookEvent.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { BookEvent };
