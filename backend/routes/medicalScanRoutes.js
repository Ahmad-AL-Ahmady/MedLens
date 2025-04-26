const express = require("express");
const medicalScanController = require("../controllers/medicalScanController");
const authController = require("../controllers/authController");
const upload = require("../utils/multerConfig");
const uploadConfig = require("../utils/multerConfig");
const multer = require("multer");

// Configure the upload with Multer
const scanUpload = multer({
  storage: uploadConfig.medicalScan.storage,
  fileFilter: uploadConfig.medicalScan.fileFilter,
  limits: uploadConfig.medicalScan.limits,
}).single("image");

const router = express.Router();

/**
 * GET /api/medical-scans/body-parts
 * Frontend: Used to get common body parts for dropdown menus
 * Public endpoint to get available body parts
 * Returns a list of all body parts in the system
 * Used in scan upload form and filter dropdowns
 */
router.get("/body-parts", medicalScanController.getBodyParts);

// All other routes require authentication
router.use(authController.protect);

/**
 * GET /api/medical-scans
 * Frontend: Used to view all medical scans created by the current user
 * Returns only the scans that were created by the current user
 * Accessible to all authenticated users regardless of user type
 * Used in "My Medical Scans" section of user dashboard
 */
router.get("/", medicalScanController.getMyScans);

/**
 * POST /api/medical-scans
 * Frontend: Used to upload a new medical scan
 * Creates a new scan record and returns upload URL for the image
 * Any user type can upload scans for themselves
 * Used in "Upload New Scan" form
 */
router.post("/", medicalScanController.uploadScan);

/**
 * GET /api/medical-scans/:id
 * Frontend: Used to view details of a specific medical scan
 * Returns complete information about the scan including any AI analysis
 * Only accessible to the user who created the scan
 * Used when clicking on a specific scan in the list
 */
router.get("/:id", medicalScanController.getScanById);

/**
 * DELETE /api/medical-scans/:id
 * Frontend: Used to delete a medical scan
 * Removes the scan and associated images
 * Only accessible to the user who created the scan
 * Used in medical scan detail view
 */
router.delete("/:id", medicalScanController.deleteScan);

/**
 * POST /api/medical-scans/:id/upload-image
 * Frontend: Used to upload an image for an existing scan record
 * Adds the image to the scan and processes it with AI analysis
 * Only accessible to the user who created the scan
 * Used after creating a scan record to add the actual image
 */
router.post(
  "/:id/upload-image",
  scanUpload,
  uploadConfig.medicalScan.compressMiddleware,
  medicalScanController.uploadScanImage
);

module.exports = router;
