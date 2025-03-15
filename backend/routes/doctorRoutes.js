const express = require("express");
const doctorController = require("../controllers/doctorController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protected routes
router.use(authController.protect);

// Routes restricted to doctors
router
  .route("/profile")
  .get(authController.restrictTo("Doctor"), doctorController.getMyProfile)
  .patch(authController.restrictTo("Doctor"), doctorController.updateProfile);

// Public routes
router.get("/nearby", doctorController.getNearbyDoctors);

// IMPORTANT: This route must be last because it uses a parameter
// that would catch any other routes defined after it
router.get("/:id", doctorController.getDoctorById);

module.exports = router;
