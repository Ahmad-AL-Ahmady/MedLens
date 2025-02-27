const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const upload = require("../utils/multerConfig");

const router = express.Router();

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
router.patch("/completeProfile", authController.completeProfile);
router.patch("/updatePassword", authController.updatePassword);
router.patch(
  "/updateAvatar",
  upload.avatar.single("avatar"),
  userController.uploadAvatar
);
router.delete("/deleteAvatar", userController.deleteAvatar);
router.get("/me", userController.getMe);
router.patch("/updateMe", userController.updateMe);

// Admin only routes
router.use(authController.restrictTo("Admin"));
router.get("/", userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
