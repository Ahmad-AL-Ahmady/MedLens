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

module.exports = router;
