const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function GetEvents(req, res) {
  try {
    const { category_id, min_price, max_price } = req.query;

    const db = await connectDB();
    const collection = db.collection("events");

    const matchStage = { status: "Active" };

    if (category_id && ObjectId.isValid(category_id)) {
      matchStage.category_id = new ObjectId(category_id);
    }

    if (min_price || max_price) {
      matchStage.price_per_seat = {};
      if (min_price) matchStage.price_per_seat.$gte = parseFloat(min_price);
      if (max_price) matchStage.price_per_seat.$lte = parseFloat(max_price);
    }

    const events = await collection
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "categories",
            localField: "category_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $sort: { datetime: 1 } },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("GetEvents.js: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { GetEvents };
