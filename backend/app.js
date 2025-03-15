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
const appointmentRouter = require("./routes/appointmentRoutes"); // Add this line
// const medicalScanRouter = require("./routes/medicalScanRoutes");
// const medicationRouter = require("./routes/medicationRoutes");
// const pharmacyInventoryRouter = require("./routes/pharmacyInventoryRoutes");
// const reviewRouter = require("./routes/reviewRoutes");

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
app.use("/public", express.static(path.join(__dirname, "public")));

// Debug route to test base URL
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Router Mounting
app.use("/api/users", userRouter);
app.use("/api/profiles", profileRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter); // Add this line
// app.use("/api/scans", medicalScanRouter);
// app.use("/api/medications", medicationRouter);
// app.use("/api/inventory", pharmacyInventoryRouter);
// app.use("/api/reviews", reviewRouter);

// Debug 404 handler
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
