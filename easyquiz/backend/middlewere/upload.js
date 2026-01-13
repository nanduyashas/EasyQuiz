// backend/middlewere/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.toLowerCase().replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

// Allow only image files
const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = allowed.test(ext);
  const isValidMime = allowed.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed!"));
  }
};

module.exports = require("multer")({ storage, fileFilter });
