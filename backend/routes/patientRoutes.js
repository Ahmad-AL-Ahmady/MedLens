const express = require("express");
const patientController = require("../controllers/patientController");
const authController = require("../controllers/authController");

const router = express.Router();

// All routes require authentication
router.use(authController.protect);

/**
 * GET /api/patients/profile
 * Frontend: Used in patient's dashboard to view own profile
 * Returns the patient's profile data with related information
 * Only accessible to the patient themselves
 * Used in the "My Profile" section of patient dashboard
 */
router
  .route("/profile")
  .get(authController.restrictTo("Patient"), patientController.getMyProfile)
  /**
   * PATCH /api/patients/profile
   * Frontend: Used to update patient profile information
   * Updates basic profile details
   * Only accessible to the patient themselves
   * Used in "Edit Profile" form in patient dashboard
   */
  .patch(authController.restrictTo("Patient"), patientController.updateProfile);

/**
 * GET /api/patients/dashboard
 * Frontend: Used for the patient's main dashboard screen
 * Returns aggregated data including appointments, medical scans
 * Only accessible to the patient themselves
 * Used to populate the patient's dashboard home page
 */
router.get(
  "/dashboard",
  authController.restrictTo("Patient"),
  patientController.getDashboardData
);

/**
 * GET /api/patients/medical-scans
 * Frontend: Used to view all medical scans uploaded by the patient
 * Returns paginated list of medical scans
 * Only accessible to the patient themselves
 * Used in "My Medical Scans" section of patient dashboard
 */
router.get(
  "/medical-scans",
  authController.restrictTo("Patient"),
  patientController.getMyMedicalScans
);

/**
 * GET /api/patients/medical-scans/:id
 * Frontend: Used to view details of a specific medical scan
 * Returns complete information about the scan including any AI analysis
 * Only accessible to the patient themselves or their doctors
 * Used when clicking on a specific scan in the list
 */
router.get("/medical-scans/:id", patientController.getMedicalScanById);

/**
 * POST /api/patients/medical-scans
 * Frontend: Used to upload a new medical scan
 * Creates a new scan record and returns upload URL for the image
 * Only accessible to the patient themselves
 * Used in "Upload New Scan" form
 */
router.post(
  "/medical-scans",
  authController.restrictTo("Patient"),
  patientController.uploadMedicalScan
);

/**
 * DELETE /api/patients/medical-scans/:id
 * Frontend: Used to delete a medical scan
 * Removes the scan and associated images
 * Only accessible to the patient themselves
 * Used in medical scan detail view
 */
router.delete("/medical-scans/:id", patientController.deleteMedicalScan);

module.exports = router;
