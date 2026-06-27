const connectDB = require("../../db/dbConnect");

async function DashboardStats(req, res) {
  try {
    const db = await connectDB();

    const totalUsers = await db.collection("users").countDocuments({ role: "User" });
    const totalCategories = await db.collection("categories").countDocuments({});
    const totalEvents = await db.collection("events").countDocuments({});
    const activeEvents = await db.collection("events").countDocuments({ status: "Active" });
    const totalBookings = await db.collection("event_bookings").countDocuments({});
    const bookedCount = await db.collection("event_bookings").countDocuments({ status: "Booked" });
    const cancelledCount = await db.collection("event_bookings").countDocuments({ status: "Cancelled" });
    const totalComplaints = await db.collection("complaints").countDocuments({});
    const pendingComplaints = await db.collection("complaints").countDocuments({ status: "Pending" });

    const revenueResult = await db.collection("event_payments").aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$payment" } } },
    ]).toArray();
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const ratingResult = await db.collection("reviews").aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]).toArray();
    const avgRating = ratingResult.length > 0 ? Math.round(ratingResult[0].avg * 10) / 10 : 0;

    const recentBookings = await db.collection("event_bookings").aggregate([
      { $sort: { date: -1 } }, { $limit: 5 },
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "events", localField: "event_id", foreignField: "_id", as: "event" } },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      { $project: { "user.password": 0 } },
    ]).toArray();

    const recentPayments = await db.collection("event_payments").aggregate([
      { $sort: { date: -1 } }, { $limit: 5 },
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { "user.password": 0 } },
    ]).toArray();

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: { totalUsers, totalCategories, totalEvents, activeEvents, totalBookings, bookedCount, cancelledCount, totalComplaints, pendingComplaints, totalRevenue, avgRating, recentBookings, recentPayments },
    });
  } catch (error) {
    console.error("DashboardStats.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { DashboardStats };
