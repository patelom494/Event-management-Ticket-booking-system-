const multer = require("multer");
const path = require("path");

// ── Storage for Category Images ───────────────────────────────────────────────
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/categories"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

// ── Storage for Event Images ──────────────────────────────────────────────────
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/events"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

// ── Storage for Artist Images ─────────────────────────────────────────────────
const artistStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/artists"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

// ── Storage for Profile Images ────────────────────────────────────────────────
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profiles"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

// ── File Filter (images only) ─────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
  }
};

const categoryUpload = multer({ storage: categoryStorage, fileFilter: imageFilter });
const profileUpload = multer({ storage: profileStorage, fileFilter: imageFilter });

// Event upload handles both event_img and artist_image fields
const eventUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "artist_image") {
        cb(null, "uploads/artists");
      } else {
        cb(null, "uploads/events");
      }
    },
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
  }),
  fileFilter: imageFilter,
});

module.exports = { categoryUpload, eventUpload, profileUpload };
