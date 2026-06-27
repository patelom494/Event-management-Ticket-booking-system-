/**
 * seed.js  —  Event Platform MongoDB Seed
 *
 * Images are fetched from the Wikipedia REST API (open, no auth needed).
 * Each Wikipedia page summary returns a `thumbnail.source` URL pointing to
 * a freely-licensed Wikimedia Commons image that is directly relevant to the
 * entity being seeded (artist, venue, category, etc.).
 *
 * Stored path format in MongoDB: "uploads/<folder>/<filename>.jpg"
 * Serve them in Express with:
 *   app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 */

const { MongoClient } = require("mongodb");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "event_platform";
const UPLOAD_BASE = path.join(__dirname, "uploads");

// ─────────────────────────────────────────────────────────────────────────────
// Wikipedia REST API image map
// wiki  → Wikipedia article title whose lead/infobox image will be downloaded
// ─────────────────────────────────────────────────────────────────────────────
const IMAGE_MAP = {
  // ── Artist portraits ──────────────────────────────────────────────────────
  arijit_artist: { wiki: "Arijit_Singh", folder: "artists", file: "arijit_singh.jpg" },
  shreya_artist: { wiki: "Shreya_Ghoshal", folder: "artists", file: "shreya_ghoshal.jpg" },
  zakir_artist: { wiki: "Zakir_Khan_(comedian)", folder: "artists", file: "zakir_khan.jpg" },
  falguni_artist: { wiki: "Falguni_Pathak", folder: "artists", file: "falguni_pathak.jpg" },
  ipl_artist: { wiki: "Indian_Premier_League", folder: "artists", file: "ipl_team.jpg" },
  chef_artist: { wiki: "Street_food", folder: "artists", file: "street_food_chef.jpg" },

  // ── Event banners ─────────────────────────────────────────────────────────
  arijit_event: { wiki: "Arijit_Singh", folder: "events", file: "arijit_concert.jpg" },
  shreya_event: { wiki: "Shreya_Ghoshal", folder: "events", file: "shreya_concert.jpg" },
  zakir_event: { wiki: "Zakir_Khan_(comedian)", folder: "events", file: "comedy_night.jpg" },
  garba_event: { wiki: "Garba_(dance)", folder: "events", file: "garba_mahotsav.jpg" },
  ipl_event: { wiki: "Narendra_Modi_Stadium", folder: "events", file: "ipl_gt_mi.jpg" },
  food_event: { wiki: "Law_Garden", folder: "events", file: "street_food_fest.jpg" },

  // ── Category icons ────────────────────────────────────────────────────────
  cat_singing: { wiki: "Singing", folder: "categories", file: "singing.jpg" },
  cat_comedy: { wiki: "Stand-up_comedy", folder: "categories", file: "standup_comedy.jpg" },
  cat_dance: { wiki: "Dance", folder: "categories", file: "dance.jpg" },
  cat_sports: { wiki: "Sport", folder: "categories", file: "sports.jpg" },
  cat_theatre: { wiki: "Theatre", folder: "categories", file: "theatre.jpg" },
  cat_food: { wiki: "Food_festival", folder: "categories", file: "food_festival.jpg" },
};

// Profile pics — DiceBear initials avatars (free, open-source, no download needed)
const PROFILE_PICS = {
  admin_profile: "https://api.dicebear.com/7.x/initials/svg?seed=Admin+User&backgroundColor=4f46e5",
  rohan_profile: "https://api.dicebear.com/7.x/initials/svg?seed=Rohan+Mehta&backgroundColor=0891b2",
  pooja_profile: "https://api.dicebear.com/7.x/initials/svg?seed=Pooja+Shah&backgroundColor=db2777",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   📁 Created: ${path.relative(__dirname, dirPath)}`);
  }
}

/** Call Wikipedia REST API to get the article's thumbnail URL */
function getWikiThumbnailUrl(title) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    https.get(apiUrl, { headers: { "User-Agent": "EventPlatformSeed/1.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.thumbnail && json.thumbnail.source) {
            resolve(json.thumbnail.source);
          } else {
            reject(new Error(`No thumbnail for: ${title}`));
          }
        } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

/** Download an image URL to disk, following redirects. Skips if file exists. */
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      console.log(`   ⏭️  Exists:     ${path.relative(__dirname, destPath)}`);
      return resolve(destPath);
    }

    const doDownload = (targetUrl, hops = 5) => {
      const proto = targetUrl.startsWith("https") ? https : http;
      const file = fs.createWriteStream(destPath);

      proto.get(targetUrl, { headers: { "User-Agent": "EventPlatformSeed/1.0" } }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && hops > 0) {
          file.close(); fs.unlink(destPath, () => { });
          return doDownload(res.headers.location, hops - 1);
        }
        if (res.statusCode !== 200) {
          file.close(); fs.unlink(destPath, () => { });
          return reject(new Error(`HTTP ${res.statusCode} — ${targetUrl}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`   ✅ Saved:      ${path.relative(__dirname, destPath)}`);
          resolve(destPath);
        });
      }).on("error", err => { fs.unlink(destPath, () => { }); reject(err); });
    };

    doDownload(url);
  });
}

function toStoredPath(folder, file) {
  return `uploads/${folder}/${file}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main seed
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  // 1. Ensure upload directories
  ["artists", "events", "categories", "profiles"].forEach(sub =>
    ensureDir(path.join(UPLOAD_BASE, sub))
  );

  // 2. Download relevant Wikipedia images
  console.log("\n🖼️  Downloading real Wikipedia images...\n");
  const imgPaths = { ...PROFILE_PICS };

  for (const [key, { wiki, folder, file }] of Object.entries(IMAGE_MAP)) {
    const destPath = path.join(UPLOAD_BASE, folder, file);
    const storedPath = toStoredPath(folder, file);

    if (fs.existsSync(destPath)) {
      imgPaths[key] = storedPath;
      console.log(`   ⏭️  Exists:     ${storedPath}`);
      continue;
    }

    try {
      process.stdout.write(`   🔍 Wikipedia [${wiki}] ... `);
      const thumbUrl = await getWikiThumbnailUrl(wiki);
      process.stdout.write("found → ");
      await downloadImage(thumbUrl, destPath);
      imgPaths[key] = storedPath;
    } catch (err) {
      console.warn(`\n   ⚠️  (${key}) ${err.message} — using picsum fallback`);
      const fallback = `https://picsum.photos/seed/${encodeURIComponent(wiki)}/600/400`;
      try {
        await downloadImage(fallback, destPath);
        imgPaths[key] = storedPath;
      } catch {
        imgPaths[key] = "";
      }
    }
  }

  // 3. MongoDB
  console.log("\n🌱 Seeding MongoDB...\n");
  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db(DB_NAME);

  // Clear
  for (const col of ["users", "categories", "events", "event_bookings", "event_payments", "reviews", "complaints"])
    await db.collection(col).deleteMany({});
  console.log("🗑️  Cleared existing collections");

  // ── Users ─────────────────────────────────────────────────────────────────
  const usersResult = await db.collection("users").insertMany([
    {
      name: "Admin User", email: "admin@events.com", phone_no: "9900000001",
      address: "101, Event Hub, Ahmedabad", password: "Admin@123",
      profile_pic: imgPaths["admin_profile"], role: "Admin", status: "Active", created_at: new Date(),
    },
    {
      name: "Rohan Mehta", email: "rohan@gmail.com", phone_no: "9900000002",
      address: "22, Satellite Road, Ahmedabad", password: "Rohan@123",
      profile_pic: imgPaths["rohan_profile"], role: "User", status: "Active", created_at: new Date(),
    },
    {
      name: "Pooja Shah", email: "pooja@gmail.com", phone_no: "9900000003",
      address: "45, Vastrapur, Ahmedabad", password: "Pooja@123",
      profile_pic: imgPaths["pooja_profile"], role: "User", status: "Active", created_at: new Date(),
    },
  ]);
  const userIds = Object.values(usersResult.insertedIds);
  console.log("✅ Users seeded");

  // ── Categories ────────────────────────────────────────────────────────────
  const categoriesResult = await db.collection("categories").insertMany([
    { name: "Singing", image: imgPaths["cat_singing"], created_at: new Date() },
    { name: "Stand-Up Comedy", image: imgPaths["cat_comedy"], created_at: new Date() },
    { name: "Dance", image: imgPaths["cat_dance"], created_at: new Date() },
    { name: "Sports", image: imgPaths["cat_sports"], created_at: new Date() },
    { name: "Theatre", image: imgPaths["cat_theatre"], created_at: new Date() },
    { name: "Food Festival", image: imgPaths["cat_food"], created_at: new Date() },
  ]);
  const categoryIds = Object.values(categoriesResult.insertedIds);
  console.log("✅ Categories seeded");

  // ── Events ────────────────────────────────────────────────────────────────
  const eventsResult = await db.collection("events").insertMany([
    {
      category_id: categoryIds[0], event_name: "Arijit Singh Live Concert",
      event_img: imgPaths["arijit_event"], artist_name: "Arijit Singh",
      artist_image: imgPaths["arijit_artist"], price_per_seat: 1500,
      total_seats: 500, available_seats: 498,
      address: "GMDC Ground, Ahmedabad, Gujarat", lattitute: "23.0562", longitude: "72.5922",
      datetime: new Date("2025-12-20T19:00:00"), status: "Active", created_at: new Date(),
    },
    {
      category_id: categoryIds[0], event_name: "Shreya Ghoshal Musical Night",
      event_img: imgPaths["shreya_event"], artist_name: "Shreya Ghoshal",
      artist_image: imgPaths["shreya_artist"], price_per_seat: 1200,
      total_seats: 300, available_seats: 300,
      address: "Tagore Hall, Ahmedabad, Gujarat", lattitute: "23.0330", longitude: "72.5830",
      datetime: new Date("2026-01-15T18:30:00"), status: "Active", created_at: new Date(),
    },
    {
      category_id: categoryIds[1], event_name: "Fun Friday - Comedy Night",
      event_img: imgPaths["zakir_event"], artist_name: "Zakir Khan",
      artist_image: imgPaths["zakir_artist"], price_per_seat: 800,
      total_seats: 200, available_seats: 199,
      address: "Rajpath Club, Ahmedabad, Gujarat", lattitute: "23.0204", longitude: "72.5067",
      datetime: new Date("2025-12-27T20:00:00"), status: "Active", created_at: new Date(),
    },
    {
      category_id: categoryIds[2], event_name: "Garba Mahotsav 2025",
      event_img: imgPaths["garba_event"], artist_name: "Falguni Pathak",
      artist_image: imgPaths["falguni_artist"], price_per_seat: 500,
      total_seats: 1000, available_seats: 1000,
      address: "Sardar Patel Stadium, Ahmedabad, Gujarat", lattitute: "23.0395", longitude: "72.5847",
      datetime: new Date("2026-02-05T17:00:00"), status: "Active", created_at: new Date(),
    },
    {
      category_id: categoryIds[3], event_name: "IPL 2026 — GT vs MI",
      event_img: imgPaths["ipl_event"], artist_name: "Gujarat Titans vs Mumbai Indians",
      artist_image: imgPaths["ipl_artist"], price_per_seat: 2500,
      total_seats: 5000, available_seats: 5000,
      address: "Narendra Modi Stadium, Ahmedabad, Gujarat", lattitute: "23.0907", longitude: "72.5960",
      datetime: new Date("2026-03-10T19:30:00"), status: "Active", created_at: new Date(),
    },
    {
      category_id: categoryIds[5], event_name: "Ahmedabad Street Food Festival",
      event_img: imgPaths["food_event"], artist_name: "Various Local Chefs",
      artist_image: imgPaths["chef_artist"], price_per_seat: 250,
      total_seats: 800, available_seats: 800,
      address: "Law Garden, Ahmedabad, Gujarat", lattitute: "23.0251", longitude: "72.5619",
      datetime: new Date("2026-01-20T11:00:00"), status: "Active", created_at: new Date(),
    },
  ]);
  const eventIds = Object.values(eventsResult.insertedIds);
  console.log("✅ Events seeded");

  // ── Bookings ──────────────────────────────────────────────────────────────
  const bookingsResult = await db.collection("event_bookings").insertMany([
    {
      event_id: eventIds[0], user_id: userIds[1], seats: 2, total_price: 3000,
      date: new Date("2025-12-10T10:30:00"), status: "Booked", payment_status: "Success"
    },
    {
      event_id: eventIds[2], user_id: userIds[2], seats: 1, total_price: 800,
      date: new Date("2025-12-15T14:00:00"), status: "Booked", payment_status: "Success"
    },
    {
      event_id: eventIds[1], user_id: userIds[1], seats: 3, total_price: 3600,
      date: new Date(), status: "Booked", payment_status: "Pending"
    },
  ]);
  const bookingIds = Object.values(bookingsResult.insertedIds);
  console.log("✅ Bookings seeded");

  // ── Payments ──────────────────────────────────────────────────────────────
  await db.collection("event_payments").insertMany([
    {
      booking_id: bookingIds[0], user_id: userIds[1], payment: 3000,
      date: new Date("2025-12-10T10:35:00"), razorpay_order_id: "order_demo_001",
      razorpay_payment_id: "pay_demo_001", razorpay_signature: "sig_demo_001", status: "Success"
    },
    {
      booking_id: bookingIds[1], user_id: userIds[2], payment: 800,
      date: new Date("2025-12-15T14:05:00"), razorpay_order_id: "order_demo_002",
      razorpay_payment_id: "pay_demo_002", razorpay_signature: "sig_demo_002", status: "Success"
    },
  ]);
  console.log("✅ Payments seeded");

  // ── Reviews ───────────────────────────────────────────────────────────────
  await db.collection("reviews").insertMany([
    {
      user_id: userIds[1], booking_id: bookingIds[0], rating: 5.0, created_at: new Date("2025-12-21"),
      review: "Absolutely amazing concert! Arijit Singh's voice was magical. Loved every moment!"
    },
    {
      user_id: userIds[2], booking_id: bookingIds[1], rating: 4.5, created_at: new Date("2025-12-28"),
      review: "Zakir Khan was hilarious! Great venue and well-managed event. Will attend again."
    },
  ]);
  console.log("✅ Reviews seeded");

  // ── Complaints ────────────────────────────────────────────────────────────
  await db.collection("complaints").insertMany([
    {
      booking_id: bookingIds[0], user_id: userIds[1], status: "Pending",
      subject: "Seat Allocation Issue", timestamp: new Date("2025-12-21"),
      message: "We were assigned seats in the back row despite booking premium category tickets."
    },
  ]);
  console.log("✅ Complaints seeded");

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed completed successfully!");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("👤 Admin   → admin@events.com   / Admin@123");
  console.log("👤 User 1  → rohan@gmail.com    / Rohan@123");
  console.log("👤 User 2  → pooja@gmail.com    / Pooja@123");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("\n📁 Images saved to:  ./uploads/{artists,events,categories}/");
  console.log("🌐 Profile pics:     DiceBear avatar URLs (stored as URLs, no file needed)");
  console.log("🚀 Express static:   app.use('/uploads', express.static('uploads'))");
  await client.close();
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });