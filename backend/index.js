const express = require("express");
const cors = require("cors");
const connectDB = require("./db/dbConnect");
const authMiddleware = require("./middleware/auth");
require("dotenv").config();

// ── Multer Instances ──────────────────────────────────────────────────────────
const { categoryUpload, eventUpload, profileUpload } = require("./multer/multer");

// ── Common APIs ───────────────────────────────────────────────────────────────
const Logout = require("./apis/common/logout");
const Session = require("./apis/common/session");
const { Login } = require("./apis/common/login");
const { Signup } = require("./apis/common/signup");
const { ChangePassword } = require("./apis/common/changePassword");

// ── Public APIs ───────────────────────────────────────────────────────────────
const { GetCategories } = require("./apis/user/GetCategories");
const { GetEvents } = require("./apis/user/GetEvents");
const { GetEventDetails } = require("./apis/user/GetEventDetails");
const { GetReviews } = require("./apis/user/GetReviews");

// ── User APIs ─────────────────────────────────────────────────────────────────
const { GetProfile } = require("./apis/user/GetProfile");
const { UpdateProfile } = require("./apis/user/UpdateProfile");
const { BookEvent } = require("./apis/user/BookEvent");
const { MyBookings } = require("./apis/user/MyBookings");
const { CancelBooking } = require("./apis/user/CancelBooking");
const { GenOrderId } = require("./apis/user/GenOrderId");
const { VerifyPayment } = require("./apis/user/VerifyPayment");
const { AddReview } = require("./apis/user/AddReview");
const { AddComplaint } = require("./apis/user/AddComplaint");
const { MyComplaints } = require("./apis/user/MyComplaints");

// ── Admin APIs ────────────────────────────────────────────────────────────────
const { GetUsers } = require("./apis/admin/GetUsers");
const { UpdateUserStatus } = require("./apis/admin/UpdateUserStatus");
const { AddCategory } = require("./apis/admin/AddCategory");
const { UpdateCategory } = require("./apis/admin/UpdateCategory");
const { DeleteCategory } = require("./apis/admin/DeleteCategory");
const { GetAdminCategories } = require("./apis/admin/GetCategories");
const { AddEvent } = require("./apis/admin/AddEvent");
const { UpdateEvent } = require("./apis/admin/UpdateEvent");
const { DeleteEvent } = require("./apis/admin/DeleteEvent");
const { GetAdminEvents } = require("./apis/admin/GetEvents");
const { GetBookings } = require("./apis/admin/GetBookings");
const { UpdateBooking } = require("./apis/admin/UpdateBooking");
const { GetPayments } = require("./apis/admin/GetPayments");
const { GetAdminReviews } = require("./apis/admin/GetReviews");
const { GetComplaints } = require("./apis/admin/GetComplaints");
const { ResolveComplaint } = require("./apis/admin/ResolveComplaint");
const { DashboardStats } = require("./apis/admin/DashboardStats");

// ─────────────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "https://event-management-ticket-booking-sys-three.vercel.app",
    "https://event-management-ticket-booking-sys-one.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://your-frontend.onrender.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ── Static File Serving ───────────────────────────────────────────────────────
app.use("/uploads/categories", express.static("uploads/categories"));
app.use("/uploads/events", express.static("uploads/events"));
app.use("/uploads/artists", express.static("uploads/artists"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

// ── DB Connect ────────────────────────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────────────────────────────────────
//  COMMON APIs
// ─────────────────────────────────────────────────────────────────────────────
app.post("/signup", Signup);
app.post("/login", Login);
app.get("/logout", Logout);
app.get("/session", Session);
app.post("/changePassword", ChangePassword);

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC APIs (no auth required)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/categories", GetCategories);
app.get("/events", GetEvents);
app.get("/events/:id", GetEventDetails);
app.get("/reviews", GetReviews);

// ─────────────────────────────────────────────────────────────────────────────
//  USER APIs (JWT required)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/user/profile", authMiddleware, GetProfile);
app.post("/user/updateProfile", authMiddleware, profileUpload.single("profile_pic"), UpdateProfile);
app.post("/user/bookEvent", authMiddleware, BookEvent);
app.get("/user/myBookings", authMiddleware, MyBookings);
app.post("/user/cancelBooking", authMiddleware, CancelBooking);
app.post("/user/genOrderId", authMiddleware, GenOrderId);
app.post("/user/verifyPayment", authMiddleware, VerifyPayment);
app.post("/user/addReview", authMiddleware, AddReview);
app.post("/user/addComplaint", authMiddleware, AddComplaint);
app.get("/user/myComplaints", authMiddleware, MyComplaints);

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN APIs (JWT required)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/admin/users", authMiddleware, GetUsers);
app.post("/admin/updateUserStatus", authMiddleware, UpdateUserStatus);
app.post("/admin/addCategory", authMiddleware, categoryUpload.single("image"), AddCategory);
app.post("/admin/updateCategory", authMiddleware, categoryUpload.single("image"), UpdateCategory);
app.get("/admin/deleteCategory/:id", authMiddleware, DeleteCategory);
app.get("/admin/categories", authMiddleware, GetAdminCategories);
app.post("/admin/addEvent", authMiddleware, eventUpload.fields([{ name: "event_img", maxCount: 1 }, { name: "artist_image", maxCount: 1 }]), AddEvent);
app.post("/admin/updateEvent", authMiddleware, eventUpload.fields([{ name: "event_img", maxCount: 1 }, { name: "artist_image", maxCount: 1 }]), UpdateEvent);
app.get("/admin/deleteEvent/:id", authMiddleware, DeleteEvent);
app.get("/admin/events", authMiddleware, GetAdminEvents);
app.get("/admin/bookings", authMiddleware, GetBookings);
app.post("/admin/updateBooking", authMiddleware, UpdateBooking);
app.get("/admin/payments", authMiddleware, GetPayments);
app.get("/admin/reviews", authMiddleware, GetAdminReviews);
app.get("/admin/complaints", authMiddleware, GetComplaints);
app.post("/admin/resolveComplaint/:id", authMiddleware, ResolveComplaint);
app.get("/admin/dashboardStats", authMiddleware, DashboardStats);

app.get("/", (req, res) => {
  res.send("Welcome to Events Service Platform API!");
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`✅ Event & Ticket Reservation server started on PORT ${PORT}!`)
);
