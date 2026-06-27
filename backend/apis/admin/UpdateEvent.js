const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function UpdateEvent(req, res) {
  try {
    const { id, category_id, event_name, artist_name, price_per_seat, total_seats, address, lattitute, longitude, datetime, status } = req.body;

    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Valid event ID is required" });

    const db = await connectDB();
    const updateFields = { updated_at: new Date() };

    if (category_id && ObjectId.isValid(category_id)) updateFields.category_id = new ObjectId(category_id);
    if (event_name) updateFields.event_name = event_name;
    if (artist_name) updateFields.artist_name = artist_name;
    if (price_per_seat) updateFields.price_per_seat = parseFloat(price_per_seat);
    if (total_seats) updateFields.total_seats = parseInt(total_seats);
    if (address) updateFields.address = address;
    if (lattitute) updateFields.lattitute = lattitute;
    if (longitude) updateFields.longitude = longitude;
    if (datetime) updateFields.datetime = new Date(datetime);
    if (status) updateFields.status = status;
    if (req.files && req.files["event_img"]) updateFields.event_img = `/uploads/events/${req.files["event_img"][0].filename}`;
    if (req.files && req.files["artist_image"]) updateFields.artist_image = `/uploads/artists/${req.files["artist_image"][0].filename}`;

    const result = await db.collection("events").updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    if (result.matchedCount === 0) return res.status(404).json({ success: false, message: "Event not found" });

    return res.status(200).json({ success: true, message: "Event updated successfully" });
  } catch (error) {
    console.error("UpdateEvent.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { UpdateEvent };
