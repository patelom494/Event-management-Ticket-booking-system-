const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function DeleteEvent(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid event ID" });

    const db = await connectDB();
    const result = await db.collection("events").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Event not found" });

    return res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("DeleteEvent.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { DeleteEvent };
