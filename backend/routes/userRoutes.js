const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Existing routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// New Google Auth routes
router.get("/google", authController.googleLogin); // Initiate Google OAuth
router.get(
  "/google/callback",
  authController.googleLogin, // Handles OAuth callback
  authController.googleCallback // Send JWT after success
);
router.get("/google/failure", authController.googleAuthFailure); // Handle failures

module.exports = router;
