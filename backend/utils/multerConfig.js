/**
 * multerConfig.js
 *
 * This file configures Multer for file uploads in the HealthVision backend.
 * It provides configurations for different types of file uploads (avatars, medical scans)
 * including storage settings, file filters, and post-upload processing.
 *
 * Features:
 * - Separate storage configurations for avatars and medical scans
 * - File type validation (images and PDFs for scans)
 * - Automatic directory creation
 * - File size limits
 * - Post-upload image compression
 * - Custom filename generation
 */

const multer = require("multer");
const AppError = require("./appError");
const fs = require("fs");
const path = require("path");
const { processAvatar, processMedicalScan } = require("./imageProcessor");

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

// Middleware to compress images after upload
const compressAvatar = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filePath = req.file.path;
    const filename = path.basename(filePath);

    // Skip compression for default.jpg
    if (filename === "default.jpg") {
      console.log("Skipping compression for default avatar");
      return next();
    }

    const processedPath = await processAvatar(filePath);

    // Update file information in the request
    if (processedPath !== filePath) {
      req.file.path = processedPath;
      req.file.filename = path.basename(processedPath);
    }

    next();
  } catch (error) {
    console.error("Error compressing avatar:", error);
    next(); // Continue without compression if there's an error
  }
};

// Middleware to compress medical scan images after upload
const compressMedicalScan = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Only compress image files, not PDFs
    if (req.file.mimetype.startsWith("image/")) {
      const filePath = req.file.path;
      const processedPath = await processMedicalScan(filePath);

      // Update file information in the request
      if (processedPath !== filePath) {
        req.file.path = processedPath;
        req.file.filename = path.basename(processedPath);
      }
    }

    next();
  } catch (error) {
    console.error("Error compressing medical scan:", error);
    next(); // Continue without compression if there's an error
  }
};

// Export configurations for different upload types
module.exports = {
  // For user avatars with compression
  avatar: {
    storage: userAvatarStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    compressMiddleware: compressAvatar,
  },

  // For medical scans with compression
  medicalScan: {
    storage: medicalScanStorage,
    fileFilter: scanFileFilter,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB limit for scans
    },
    compressMiddleware: compressMedicalScan,
  },
};
