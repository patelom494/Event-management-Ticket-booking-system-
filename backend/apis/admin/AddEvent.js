const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function AddEvent(req, res) {
  try {
    const { category_id, event_name, artist_name, price_per_seat, total_seats, address, lattitute, longitude, datetime } = req.body;

    if (!category_id || !event_name || !artist_name || !price_per_seat || !total_seats || !address || !lattitute || !longitude || !datetime) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!ObjectId.isValid(category_id)) return res.status(400).json({ success: false, message: "Invalid category ID" });

    const db = await connectDB();
    const categoryExists = await db.collection("categories").findOne({ _id: new ObjectId(category_id) });
    if (!categoryExists) return res.status(404).json({ success: false, message: "Category not found" });

    const event_img = req.files && req.files["event_img"] ? `/uploads/events/${req.files["event_img"][0].filename}` : "";
    const artist_image = req.files && req.files["artist_image"] ? `/uploads/artists/${req.files["artist_image"][0].filename}` : "";
    const totalSeats = parseInt(total_seats);

    await db.collection("events").insertOne({
      category_id: new ObjectId(category_id),
      event_name, event_img, artist_name, artist_image,
      price_per_seat: parseFloat(price_per_seat),
      total_seats: totalSeats,
      available_seats: totalSeats,
      address, lattitute, longitude,
      datetime: new Date(datetime),
      status: "Active",
      created_at: new Date(),
    });

    return res.status(201).json({ success: true, message: "Event added successfully" });
  } catch (error) {
    console.error("AddEvent.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { AddEvent };
