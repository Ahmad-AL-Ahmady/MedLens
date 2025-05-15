/**
 * doctorRoutes.js
 *
 * This file defines the API routes for doctor-related operations in the HealthVision backend.
 * It includes routes for creating, updating, and retrieving doctor profiles, as well as managing doctor availability.
 */

const express = require("express");
const doctorController = require("../controllers/doctorController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes

/**
 * GET /api/doctors/specializations
 * Frontend: Used on initial doctor search screen to populate the specialization dropdown/filter
 * Returns list of all specializations with count of doctors in each
 */
router.get("/specializations", doctorController.getSpecializations);

/**
 * GET /api/doctors/all
 * Frontend: Used for browsing all doctors with pagination, searching by name, and filtering
 * Parameters: page, limit, specialization, name
 * Used on doctors listing page when not using location-based search
 */
router.get("/all", doctorController.getAllDoctors);

/**
 * GET /api/doctors/nearby
 * Frontend: Main doctor search functionality - finds doctors near user's location
 * Parameters: longitude, latitude, distance, specialization
 * Used when user searches for doctors with location access enabled
 */
router.get("/nearby", doctorController.getNearbyDoctors);

// Protected routes
router.use(authController.protect);

/**
 * Update a doctor's availability schedule
 * Can be used by the doctor to update their own schedule
 * or by an admin to update any doctor's schedule
 */
router.patch("/:id/availability", doctorController.updateAvailability);

/**
 * GET /api/doctors/profile
 * Frontend: Used in doctor's dashboard to view own profile
 * Only accessible to doctors - shows their profile with appointments and reviews
 * Used in doctor's "My Profile" section
 */
router
  .route("/profile")
  .get(authController.restrictTo("Doctor"), doctorController.getMyProfile)
  /**
   * PATCH /api/doctors/profile
   * Frontend: Used in doctor's profile settings for updating personal information
   * Updates fees, availability, location, etc.
   * Used in the "Edit Profile" form in doctor's dashboard
   */
  .patch(authController.restrictTo("Doctor"), doctorController.updateProfile);

// IMPORTANT: This route must be last because it uses a parameter that would catch other routes

/**
 * GET /api/doctors/:id
 * Frontend: Used to view a specific doctor's details page
 * Shows complete information about one doctor including reviews and availability
 * Used when user clicks on a doctor from search results
 */
router.get("/:id", doctorController.getDoctorById);

module.exports = router;
