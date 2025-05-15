/**
 * userRoutes.js
 *
 * This file defines the API routes for user-related operations in the HealthVision backend.
 * It includes routes for user registration, login, profile updates, and other user management tasks.
 */

const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const upload = require("../utils/multerConfig");
const uploadConfig = require("../utils/multerConfig");
const multer = require("multer");

const router = express.Router();

const avatarUpload = multer({
  storage: uploadConfig.avatar.storage,
  fileFilter: uploadConfig.avatar.fileFilter,
  limits: uploadConfig.avatar.limits,
}).single("avatar");

// Public routes - no authentication required
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/verifyOTP", authController.verifyOTP);
// router.get("/verifyResetSession", authController.verifyResetSession);
router.patch("/resetPassword", authController.resetPassword);
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

// Protected routes - authentication required
router.use(authController.protect);

// Routes accessible to all authenticated users
router.post("/logout", authController.logout);
router.delete("/delete-account", authController.deleteUserAndContents);
router.patch("/completeProfile", authController.completeProfile);
router.patch("/updatePassword", authController.updatePassword);

// Route to update avatar only
router.patch(
  "/updateAvatar",
  avatarUpload,
  uploadConfig.avatar.compressMiddleware,
  userController.uploadAvatar
);

router.patch(
  "/updateMe",
  avatarUpload, // Add the avatar upload middleware here
  uploadConfig.avatar.compressMiddleware, // Add image compression
  userController.updateMe
);

router.delete("/deleteAvatar", userController.deleteAvatar);
router.get("/me", userController.getMe);

// Admin only routes
router.use(authController.restrictTo("Admin"));
router.get("/", userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
