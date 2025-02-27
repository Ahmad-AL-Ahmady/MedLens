const multer = require("multer");
const AppError = require("./appError");
const fs = require("fs");
const path = require("path");

// Ensure directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage for user avatars
const userAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads/users";
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // user-userId-timestamp.extension
    const extension = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
  },
});

// Configure storage for medical scans
const medicalScanStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads/scans";
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // scan-userId-timestamp.extension
    const extension = file.mimetype.split("/")[1];
    cb(null, `scan-${req.user.id}-${Date.now()}.${extension}`);
  },
});

// Removed medication image storage configuration as per request

// Image file filter
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

// Medical scan file filter (accepts images and PDFs)
const scanFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError("Invalid file! Please upload images or PDF files.", 400),
      false
    );
  }
};

// Export configurations for different upload types
module.exports = {
  // For user avatars (existing functionality)
  avatar: multer({
    storage: userAvatarStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }),

  // For medical scans
  medicalScan: multer({
    storage: medicalScanStorage,
    fileFilter: scanFileFilter,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB limit for scans
    },
  }),
};
