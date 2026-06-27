const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function ResolveComplaint(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid complaint ID" });

    const db = await connectDB();
    const result = await db.collection("complaints").updateOne({ _id: new ObjectId(id) }, { $set: { status: "Resolved", updated_at: new Date() } });

    if (result.matchedCount === 0) return res.status(404).json({ success: false, message: "Complaint not found" });

    return res.status(200).json({ success: true, message: "Complaint resolved successfully" });
  } catch (error) {
    console.error("ResolveComplaint.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { ResolveComplaint };
