/**
 * profileRoutes.js
 *
 * This file defines the API routes for profile-related operations in the HealthVision backend.
 * It includes routes for creating, updating, and retrieving user profiles.
 */

const express = require("express");
const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");

const router = express.Router();

// Protect all profile routes - require authentication
router.use(authController.protect);

// Main profile routes available to all authenticated users
router.get("/", profileController.getProfile);
router.patch("/", profileController.updateProfile);

// Ensure profile exists (middleware)
router.use(profileController.ensureProfileExists);

// Type-specific routes with appropriate restrictions
// Doctor profile routes
router
  .route("/doctor")
  .get(authController.restrictTo("Doctor", "Admin"), (req, res, next) => {
    return profileController.getProfile(req, res, next);
  })
  .patch(authController.restrictTo("Doctor"), (req, res, next) => {
    return profileController.updateProfile(req, res, next);
  });

// Pharmacy profile routes
router
  .route("/pharmacy")
  .get(authController.restrictTo("Pharmacy", "Admin"), (req, res, next) => {
    return profileController.getProfile(req, res, next);
  })
  .patch(authController.restrictTo("Pharmacy"), (req, res, next) => {
    return profileController.updateProfile(req, res, next);
  });

// Patient profile routes
router
  .route("/patient")
  .get(
    authController.restrictTo("Patient", "Admin", "Doctor"),
    (req, res, next) => {
      return profileController.getProfile(req, res, next);
    }
  )
  .patch(authController.restrictTo("Patient"), (req, res, next) => {
    return profileController.updateProfile(req, res, next);
  });

router.get("/test-all-profiles", profileController.testAllProfileTypes);

module.exports = router;
