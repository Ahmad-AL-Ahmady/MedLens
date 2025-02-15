const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");

const router = express.Router();

console.log("Setting up user routes");

// Test route
router.get("/test", (req, res) => {
  res.send("User routes are working");
});

// Auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Google authentication routes
console.log("Setting up Google auth routes");
router.get(
  "/auth/google",
  (req, res, next) => {
    console.log("Hitting Google auth route");
    next();
  },
  authController.googleLogin
);

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("Hitting Google callback route");
    next();
  },
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  authController.googleCallback
);

router.get("/auth/google/failure", authController.googleAuthFailure);

// Other routes
// router.patch(
//   "/completeProfile",
//   authController.protect,
//   authController.completeProfile
// );

router.post("/forgotPassword", authController.forgotPassword);
router.post("/verifyOTP", authController.verifyOTP);
router.patch("/resetPassword", authController.resetPassword);

module.exports = router;
