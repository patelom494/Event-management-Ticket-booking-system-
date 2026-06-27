const connectDB = require("../../db/dbConnect");

async function GetAdminEvents(req, res) {
  try {
    const db = await connectDB();
    const events = await db.collection("events").aggregate([
      { $lookup: { from: "categories", localField: "category_id", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $sort: { created_at: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Events fetched successfully", data: events });
  } catch (error) {
    console.error("admin/GetEvents.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { GetAdminEvents };
