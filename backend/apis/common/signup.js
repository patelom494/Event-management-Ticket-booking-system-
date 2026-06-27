const connectDB = require("../../db/dbConnect");

async function Signup(req, res) {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");

    const { name, email, phone_no, address, password } = req.body;

    if (!name || !email || !phone_no || !address || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if email or phone already exists
    const userExist = await userCollection.findOne({
      $or: [{ email }, { phone_no }],
    });

    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already exists",
      });
    }

    await userCollection.insertOne({
      name,
      email,
      phone_no,
      address,
      password,
      profile_pic: "",
      role: "User",
      status: "Active",
      created_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
    });
  } catch (error) {
    console.error("signup.js: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { Signup };
