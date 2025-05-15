/**
 * app.js
 *
 * This file configures the Express application for the HealthVision backend.
 * It sets up middleware (JSON parsing, logging, CORS, cookie parsing, passport),
 * serves static files, and mounts API routes for users, profiles, doctors, appointments,
 * medications, pharmacies, patients, medical scans, and reviews.
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
require("./config/passport");

require("./models"); // This will load the index.js file that registers all models
const userRouter = require("./routes/userRoutes");
const profileRouter = require("./routes/profileRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointmentRouter = require("./routes/appointmentRoutes");
const medicationRouter = require("./routes/medicationRoutes");
const pharmacyRouter = require("./routes/pharmacyRoutes");
const patientRouter = require("./routes/patientRoutes");
const medicalScanRouter = require("./routes/medicalScanRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev")); // This will log all requests
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Your React app URL
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
  })
);
app.use(passport.initialize());

// Serve static files - Add this line
app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, path) => {
      if (
        path.endsWith(".jpg") ||
        path.endsWith(".jpeg") ||
        path.endsWith(".png") ||
        path.endsWith(".gif")
      ) {
        // Prevent caching for image files
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
    },
  })
);
// Debug route to test base URL
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Router Mounting
app.use("/api/users", userRouter);
app.use("/api/profiles", profileRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/medications", medicationRouter);
app.use("/api/pharmacies", pharmacyRouter);
app.use("/api/patients", patientRouter);
app.use("/api/medical-scans", medicalScanRouter);
app.use("/api/reviews", reviewRouter);

// Debug 404 handler
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
