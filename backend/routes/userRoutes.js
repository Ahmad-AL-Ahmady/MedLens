const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");

const router = express.Router();

// Auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Password reset flow
router.post("/forgotPassword", authController.forgotPassword);
router.post("/verifyOTP", authController.verifyOTP);
router.get("/verifyResetSession", authController.verifyResetSession);
router.patch("/resetPassword", authController.resetPassword);

// Email verification
router.get("/verifyEmail/:token", authController.verifyEmail);

// Google authentication
router.get("/auth/google", authController.googleLogin);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  authController.googleCallback
);
router.patch("/completeProfile", authController.completeProfile);

// Protected routes
router.use(authController.protect); // Protect all routes after this middleware

router.patch("/updatePassword", authController.updatePassword);

module.exports = router;
